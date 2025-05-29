"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useChartSizeStore } from "@/stores/token/use-chart-size";
import { Resizable } from "re-resizable";
import dynamic from "next/dynamic";
// ######## Components 🧩 ########
const TokenWalletSelection = dynamic(
  () => import("@/components/customs/token/TokenWalletSelection"),
  {
    // ssr: false,
    // loading: TokenWalletSelectionLoading,
  },
);
import TVChartContainer from "@/components/TVChartContainer/NovaTradingView";
import { TokenDataMessageType } from "@/types/ws-general";

export default function TokenTradingChart({
  mint,
  tokenData,
}: {
  mint?: string;
  tokenData: TokenDataMessageType | null;
}) {
  const { height, setChartHeight } = useChartSizeStore();

  const handleResize = (_e: any, _direction: any, ref: HTMLElement) => {
    setChartHeight(ref.offsetHeight);
  };

  return (
    <div className="inline-block h-auto w-dvw overflow-hidden rounded-[8px] px-4 md:mt-0 md:w-full md:border md:border-border md:bg-white/[4%] md:px-0">
      <TokenWalletSelection />

      <Resizable
        size={{
          width: "100%",
          height: height,
        }}
        minHeight={408}
        enable={{
          top: false,
          right: false,
          bottom: true,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
        onResizeStop={handleResize}
        handleComponent={{
          bottom: (
            <div className="flex h-10 w-full cursor-row-resize flex-col items-center justify-center transition hover:bg-shadeTable"></div>
          ),
        }}
        className="relative z-10 mt-2 overflow-hidden rounded-[8px] border border-border bg-[#080812] md:mt-0 md:rounded-none md:border-0 md:border-border"
      >
        <TVChartContainer mint={mint} tokenData={tokenData} />
      </Resizable>
    </div>
  );
}
