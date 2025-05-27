import { getServerTime } from "@/apis/rest/settings/server-time";
import sentryLogger from "@/utils/sentry/SentryLogger";
import * as Sentry from "@sentry/nextjs";

type OpenHandler = () => void;
type MessageHandler = (data: any) => void;
type CloseHandler = (event: CloseEvent) => void;
type ErrorHandler = (event: Event) => void;
type ConnectionStateHandler = (isConnected: boolean) => void;
type WebSocketStatus = "connected" | "connecting" | "closing" | "disconnected" | "unknown";

const getSocketStatus = (socket: WebSocket | null): WebSocketStatus => {
  if (!socket) return "disconnected";
  switch (socket.readyState) {
    case WebSocket.CONNECTING:
      return "connecting";
    case WebSocket.OPEN:
      return "connected";
    case WebSocket.CLOSING:
      return "closing";
    case WebSocket.CLOSED:
      return "disconnected";
    default:
      return "unknown";
  }
};

class WebSocketManager {
  private static instance: WebSocketManager;
  private socket: WebSocket | null = null;
  private openHandlers = new Set<OpenHandler>();
  private messageHandlers = new Set<MessageHandler>();
  private closeHandlers = new Set<CloseHandler>();
  private errorHandlers = new Set<ErrorHandler>();
  private connectionStateHandlers = new Set<ConnectionStateHandler>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private url: string = "";
  private shouldReconnect = true;
  private isConnected: boolean = false;
  private heartbeatTimeout: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: number = 4000;
  private messageQueue: any[] = [];
  private isConnecting: boolean = false;
  private lastMessageTimestamp: number = Date.now();
  private staleConnectionTimeout: number = 16000;
  private token?: string;

  private constructor() { }

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  private cleanUp(): void {
    // clearing heartbeat timeouts
    if (this.heartbeatTimeout) {
      clearInterval(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }

    // remove websocket
    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.close();
      }
      this.socket = null;
    }
  }

  private startHeartbeat(): void {
    console.log("ws manager start heartbeat...")
    if (this.heartbeatTimeout) clearInterval(this.heartbeatTimeout);

    this.heartbeatTimeout = setInterval(async () => {
      const now = Date.now();
      const diff = now - this.lastMessageTimestamp;

      const shouldReconnect = diff > this.staleConnectionTimeout;

      if (shouldReconnect) {
        const healthy = await this.isServerHealthy();
        if (healthy) {
          console.warn("💓 Heartbeat detected stale connection — reconnecting...");
          this.internalConnect();
        } else {
          console.warn("💓 Heartbeat detected stale connection but server is unhealthy — skipping reconnect.");
        }
      }
    }, this.heartbeatInterval);
  }

  private updateConnectionState(connected: boolean): void {
    if (this.isConnected !== connected) {
      this.isConnected = connected;
      this.connectionStateHandlers.forEach((handler) => handler(connected));
    }
  }

  public connect({ url, token }: { url: string, token?: string }): void {
    this.url = url;
    this.token = token;
    this.shouldReconnect = true;
    this.internalConnect();
  }

  private async isServerHealthy(): Promise<boolean> {
    try {
      const response = await getServerTime();
      return !!response;
    } catch {
      return false;
    }
  }

  private internalConnect(): void {
    if (this.url === "" || this.isConnecting || this.isConnected || this.socket?.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.isConnecting = true;
    this.disconnect();
    this.updateConnectionState(false);

    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.isConnected = true;
      this.updateConnectionState(true);
      this.startHeartbeat();
      this.openHandlers.forEach((handler) => handler());
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      while (this.messageQueue.length > 0) {
        const msg = this.messageQueue.shift();
        const msgWithToken = {
          ...msg,
          token: this.token,
        };
        console.warn("WebSocket not connected. Queuing message.", this.messageQueue);
        this.socket?.send(JSON.stringify(msgWithToken));
      }
    };

    this.socket.onmessage = (event) => {
      try {
        this.lastMessageTimestamp = Date.now();
        const data = JSON.parse(event.data);
        if (data.event === "server_shutdown" && data.code === 1012) {
          console.warn("⚠️ Server shutdown detected, closing socket to trigger reconnect.");
          this.shouldReconnect = true;
          this.socket?.close();
          return;
        }
        this.messageHandlers.forEach((handler) => handler(data));
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    this.socket.onclose = async (event) => {
      this.isConnecting = false;
      this.updateConnectionState(false);

      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      if (this.shouldReconnect) {
        const tryReconnect = async () => {
          this.reconnectAttempts++;
          const delay = this.reconnectDelay * this.reconnectAttempts;

          const healthy = await this.isServerHealthy();
          console.warn("💓 HEALTHY ✅", healthy, this.reconnectAttempts, delay);

          if (healthy) {
            this.internalConnect();
          } else {
            this.reconnectTimeout = setTimeout(tryReconnect, delay);
          }
        };

        tryReconnect(); // Start the first reconnect attempt
      }

      sentryLogger({
        title: "WebSocket closed",
        context: {
          details: {
            ...event,
          },
          time: new Date().toLocaleTimeString(),
        },
        level: "error",
      })
      this.closeHandlers.forEach((handler) => handler(event));
    };

    this.socket.onerror = (error) => {
      sentryLogger({
        title: "WebSocket error",
        context: {
          details: {
            ...event,
          },
          time: new Date().toLocaleTimeString(),
        },
        level: "error",
      })

      console.log("ws manager onerror...")
      this.isConnecting = false;
      this.errorHandlers.forEach((handler) => handler(error));
      console.error("WebSocket error:", error);
    };
  }

  public onOpen(handler: OpenHandler): () => void {
    this.openHandlers.add(handler);
    return () => this.openHandlers.delete(handler);
  }

  public onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  public onClose(handler: CloseHandler): () => void {
    this.closeHandlers.add(handler);
    return () => this.closeHandlers.delete(handler);
  }

  public onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  public onConnectionStateChange(handler: ConnectionStateHandler): () => void {
    this.connectionStateHandlers.add(handler);
    handler(this.isConnected); // Initial state
    return () => this.connectionStateHandlers.delete(handler);
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    this.cleanUp();
    this.updateConnectionState(false);
  }

  public send(message: any): void {
    const messageWithToken = {
      ...message,
      token: this.token,
    };
    console.log("message with token", messageWithToken);
    if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(messageWithToken));
    } else {
      this.messageQueue.push(messageWithToken);
      this.internalConnect();
    }
  }

  public getConnectionStatus(): WebSocketStatus {
    const { socket } = this
    return getSocketStatus(socket);
  }
}

export const webSocketManager = WebSocketManager.getInstance();
