export interface SimilarToken {
  name: string;
  symbol: string;
  mint: string;
  dex:
    | "Pump.Fun"
    | "Believe"
    | "Bonk"
    | "Moonshot"
    | "LaunchLab"
    | "Boop"
    | "Dynamic Bonding Curve"
    | "Meteora AMM V2"
    | "Meteora AMM"
    | "Raydium"
    | "Pump.Swap";
  image: string;
  marketCap: string;
  createdAt: number;
  lastTrade: number;
}
