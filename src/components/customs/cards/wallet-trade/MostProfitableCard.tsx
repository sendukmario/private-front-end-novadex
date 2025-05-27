"use client";

import { TransactionData } from "@/apis/rest/wallet-trade";
import Separator from "@/components/customs/Separator";
import { cn } from "@/libraries/utils";
import { usePopupStore } from "@/stores/use-popup-state";
import { formatNumber } from "@/utils/formatNumber";
import Image from "next/image";
import AvatarWithBadges from "../../AvatarWithBadges";
import { CachedImage } from "../../CachedImage";
import Copy from "../../Copy";

interface MostProfitableCardProps {
  isModalContent?: boolean;
  data: TransactionData;
}

export default function MostProfitableCard({
  isModalContent = true,
  data,
}: MostProfitableCardProps) {
  const { remainingScreenWidth } = usePopupStore();
  const {
    token_data,
    amountBoughtUsd1y,
    amountSoldUsd1y,
    realizedProfitUsd1y,
    realizedProfitPercentage1y,
  } = data;

  const MostProfitableCardDesktopContent = () => (
    <>
      <div className="hidden h-full w-full min-w-[220px] items-center md:flex">
        <div className="flex items-center gap-x-2">
          <AvatarWithBadges
            classNameParent={`size-8`}
            symbol={token_data.symbol}
            src={token_data.imageLargeUrl}
            alt={`${token_data.name} Image`}
            rightType="moonshot"
          />
          <div className="flex-col">
            <div className="flex gap-2">
              <h1 className="text-nowrap font-geistBold text-xs text-fontColorPrimary">
                {token_data.name}
              </h1>
              <h2 className="text-nowrap font-geistLight text-xs text-fontColorSecondary">
                {token_data.symbol}
              </h2>
            </div>
            <div className="flex gap-x-2 overflow-hidden">
              <p className="font-geistRegular text-xs text-fontColorSecondary">
                {token_data.address.slice(0, 6)}...
                {token_data.address.slice(-4)}
              </p>
              <Copy value={token_data.address} />
            </div>
          </div>
        </div>
      </div>
      <div className="hidden h-full w-full min-w-[95px] items-center md:flex">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-success">
          ${formatNumber(Number(amountBoughtUsd1y))}
        </span>
      </div>
      <div className="hidden h-full w-full min-w-[95px] items-center md:flex">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-destructive">
          ${formatNumber(Number(amountSoldUsd1y))}
        </span>
      </div>
      <div className="hidden h-full w-full min-w-[115px] items-center md:flex">
        <div className="flex items-center gap-x-[4px]">
          <div className="relative aspect-auto h-[16px] w-[16px] flex-shrink-0">
            <Image
              src="/icons/solana-sq.svg"
              alt="Solana SQ Icon"
              fill
              quality={50}
              className="object-contain"
            />
          </div>
          <span
            className={cn(
              "inline-block text-nowrap font-geistSemiBold text-sm",
              Number(realizedProfitUsd1y) >= 0
                ? "text-success"
                : "text-destructive",
            )}
          >
            {formatNumber(Number(realizedProfitUsd1y))}
          </span>
        </div>
      </div>
      <div className="hidden h-full w-full min-w-[104px] items-center md:flex">
        <span
          className={cn(
            "inline-block text-nowrap font-geistSemiBold text-sm",
            Number(realizedProfitPercentage1y) >= 0
              ? "text-success"
              : "text-destructive",
          )}
        >
          {Number(realizedProfitPercentage1y) >= 0 ? "+" : ""}
          {formatNumber(Number(realizedProfitPercentage1y))}%
        </span>
      </div>
      <div className="hidden h-full w-full min-w-[140px] items-center md:flex">
        <button
          className={cn(
            "flex h-[28px] items-center gap-x-1.5 rounded-[4px] px-2 py-1",
            Number(realizedProfitUsd1y) >= 0 ? "bg-success" : "bg-destructive",
          )}
        >
          <span className="inline-block text-nowrap font-geistSemiBold text-sm text-[#10101E]">
            P&L
          </span>

          <Separator
            color="#202037"
            orientation="vertical"
            unit="fixed"
            fixedHeight={20}
            className="opacity-30"
          />

          <div className="relative aspect-square h-5 w-5 flex-shrink-0">
            <Image
              src="/icons/chevron-black.png"
              alt="Chevron Black"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
        </button>
      </div>
    </>
  );

  const MostProfitableCardMobileContent = () => (
    <div
      className={cn(
        "flex w-full flex-col md:hidden",
        remainingScreenWidth < 700 && !isModalContent && "md:flex",
      )}
    >
      {/* Header */}
      <div className="relative flex h-12 w-full items-center justify-between overflow-hidden bg-white/[4%] px-3 py-3">
        <div className="flex items-center gap-x-2">
          <AvatarWithBadges
            classNameParent={`size-8`}
            symbol={token_data.symbol}
            src={token_data.imageLargeUrl}
            alt={`${token_data.name} Image`}
            rightType="moonshot"
          />
          <div className="flex-col">
            <div className="flex gap-2">
              <h1 className="text-nowrap font-geistBold text-xs text-fontColorPrimary">
                {token_data.name}
              </h1>
              <h2 className="text-nowrap font-geistLight text-xs text-fontColorSecondary">
                {token_data.symbol}
              </h2>
            </div>
            <div className="flex gap-x-2 overflow-hidden">
              <p className="font-geistRegular text-xs text-fontColorSecondary">
                {token_data.address.slice(0, 6)}...
                {token_data.address.slice(-4)}
              </p>
              <Copy value={token_data.address} />
            </div>
          </div>
        </div>
      </div>

      {/* Market Data Grid */}
      <div className="flex justify-around gap-2.5 p-3">
        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Bought
          </span>
          <span className="font-geistSemiBold text-sm text-success">
            ${formatNumber(Number(amountBoughtUsd1y))}
          </span>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Sold
          </span>
          <span className="font-geistSemiBold text-sm text-destructive">
            ${formatNumber(Number(amountSoldUsd1y))}
          </span>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            P&L
          </span>
          <div className="flex items-center gap-x-1">
            <div className="relative aspect-auto h-[16px] w-[16px]">
              <CachedImage
                src="/icons/solana-sq.svg"
                alt="Solana SQ Icon"
                fill
                quality={50}
                className="object-contain"
              />
            </div>
            <span
              className={cn(
                "font-geistSemiBold text-sm",
                Number(realizedProfitUsd1y) >= 0
                  ? "text-success"
                  : "text-destructive",
              )}
            >
              {formatNumber(Number(realizedProfitUsd1y))}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            P&L %
          </span>
          <span
            className={cn(
              "font-geistSemiBold text-sm",
              Number(realizedProfitPercentage1y) >= 0
                ? "text-success"
                : "text-destructive",
            )}
          >
            {Number(realizedProfitPercentage1y) >= 0 ? "+" : ""}
            {formatNumber(Number(realizedProfitPercentage1y))}%
          </span>
        </div>

        <div className="flex items-end">
          <button
            className={cn(
              "flex h-[28px] items-center gap-x-1.5 rounded-[4px] px-2 py-1",
              Number(realizedProfitUsd1y) >= 0
                ? "bg-success"
                : "bg-destructive",
            )}
          >
            <span className="inline-block text-nowrap font-geistSemiBold text-sm text-[#10101E]">
              P&L
            </span>
            <Separator
              color="#202037"
              orientation="vertical"
              unit="fixed"
              fixedHeight={20}
              className="opacity-30"
            />
            <div className="relative aspect-square h-5 w-5 flex-shrink-0">
              <Image
                src="/icons/chevron-black.png"
                alt="Chevron Black"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "items-center overflow-hidden",
        "max-md:rounded-[8px] max-md:border max-md:border-border max-md:bg-card",
        "md:flex md:h-[56px] md:min-w-max md:pl-4 md:hover:bg-white/[4%]",
        remainingScreenWidth < 700 &&
          !isModalContent &&
          "mb-2 rounded-[8px] border border-border bg-card md:h-fit md:pl-0",
      )}
    >
      <MostProfitableCardDesktopContent />
      <MostProfitableCardMobileContent />
    </div>
  );
}
