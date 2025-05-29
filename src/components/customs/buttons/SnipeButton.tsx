"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
// ######## Components 🧩 ########
import Image from "next/image";
import { CosmoDataMessageType } from "@/types/ws-general";
import { useSniperFooterStore } from "@/stores/footer/use-sniper-footer.store";
import { cn } from "@/libraries/utils";

export default function SnipeButton({ data, className }: { data: CosmoDataMessageType, className?: string | undefined }) {
  const setSniperState = useSniperFooterStore(
    (state) => state.setTokenInfoState,
  );
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSniperState({
          name: data.name,
          dex: data.dex,
          image: data.image,
          symbol: data.symbol,
          mint: data.mint,
        });
      }}
      className={cn("relative -bottom-6 flex h-[28px] w-[82px] items-center justify-center gap-x-1.5 overflow-hidden rounded-[40px] bg-white/[8%] pl-2.5 pr-3 duration-300 hover:bg-white/[12%] min-[490px]:bottom-0 xl:-bottom-6 min-[1490px]:bottom-0", className)}
    >
      <>
        <div className="relative -ml-[1.5px] aspect-square h-3.5 w-3.5 flex-shrink-0 lg:h-4 lg:w-4">
          <Image
            src="/icons/snipe.png"
            alt="Snipe Icon"
            fill
            quality={100}
            className="object-contain"
          />
        </div>
        <span className="block font-geistSemiBold text-sm text-fontColorPrimary">
          Snipe
        </span>
      </>
    </button>
  );
}
