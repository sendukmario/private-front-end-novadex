"use client";

import { cn } from "@/libraries/utils";
import { usePopupStore } from "@/stores/use-popup-state";
import { useMemo } from "react";
import AddressWithEmojis from "../../AddressWithEmojis";
import AvatarWithBadges from "../../AvatarWithBadges";
import { CachedImage } from "../../CachedImage";
import CircleCount from "../../CircleCount";
import Copy from "../../Copy";
import SellBuyBadge from "../../SellBuyBadge";

type Transaction = {
  token: {
    address: string;
    circulatingSupply: string;
    decimals: number;
    description: string;
    id: string;
    imageLargeUrl: string;
    isScam: boolean | null;
    name: string;
    symbol: string;
    totalSupply: string;
  };
  amountBought: string;
  amountSold: string;
  profitLoss: string;
  profitLossPercentage: number;
  volume: string;
};

type TradeHistoryCardProps = {
  isModalContent?: boolean;
  transaction: Transaction;
  tradesValue: string;
  totalValue: string;
  formatValue: (value: string) => string;
  formatTotal: (value: string) => string;
};

export default function TradeHistoryCard({
  isModalContent = true,
  transaction,
  tradesValue,
  totalValue,
  formatValue,
  formatTotal,
}: TradeHistoryCardProps) {
  const { remainingScreenWidth } = usePopupStore();

  // Determine transaction type based on amounts
  const transactionType = useMemo(() => {
    const bought = parseFloat(transaction.amountBought);
    const sold = parseFloat(transaction.amountSold);
    return bought > sold ? "buy" : "sell";
  }, [transaction.amountBought, transaction.amountSold]);

  const TradeHistoryCardDesktopContent = () => (
    <>
      <div
        className={cn(
          "hidden h-full w-auto min-w-[72px] items-center md:flex",
          !isModalContent && "lg:min-w-[164px]",
          remainingScreenWidth < 1280 && !isModalContent && "lg:min-w-[72px]",
        )}
      >
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
          2m
        </span>
      </div>
      <div
        className={cn(
          "hidden h-full w-full min-w-[240px] items-center md:flex",
          !isModalContent && "min-w-[200px]",
        )}
      >
        <div className="flex items-center gap-x-2">
          <SellBuyBadge type={transactionType} size="sm" />
          <AvatarWithBadges
            classNameParent={`size-8`}
            symbol={transaction.token.symbol}
            src={transaction.token.imageLargeUrl}
            alt={`${transaction.token.name} Image`}
            rightType="moonshot"
          />
          <div className="flex-col">
            <div className="flex gap-2">
              <h1 className="text-nowrap font-geistBold text-xs text-fontColorPrimary">
                {transaction.token.name}
              </h1>
              <h2 className="text-nowrap font-geistLight text-xs text-fontColorSecondary">
                {transaction.token.symbol}
              </h2>
            </div>
            <div className="flex gap-x-2 overflow-hidden">
              <p className="font-geistRegular text-xs text-fontColorSecondary">
                {transaction.token.address.slice(0, 8)}...
                {transaction.token.address.slice(-4)}
              </p>
              <Copy value={transaction.token.address} />
            </div>
          </div>
        </div>
      </div>
      <div className="hidden h-full w-full min-w-[115px] items-center md:flex lg:min-w-[125px]">
        <div className="flex items-center gap-x-[4px]">
          <div className="relative aspect-auto h-[16px] w-[16px] flex-shrink-0">
            <CachedImage
              src={
                tradesValue === "SOL"
                  ? "/icons/solana-sq.svg"
                  : "/icons/usdc.svg"
              }
              alt={`${tradesValue} Icon`}
              fill
              quality={50}
              className="object-contain"
            />
          </div>
          <span className="inline-block text-nowrap font-geistSemiBold text-sm text-success">
            {formatValue(transaction.volume)}
          </span>
        </div>
      </div>
      <div
        className={cn(
          "hidden h-full w-full min-w-[80px] items-center md:flex lg:min-w-[155px]",
          remainingScreenWidth < 1280 && "lg:min-w-[80px]",
        )}
      >
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-success">
          {transaction.amountBought}
        </span>
      </div>
      <div className="hidden h-full w-full min-w-[125px] items-center md:flex lg:min-w-[175px]">
        <div className="flex items-center gap-x-[4px]">
          <div className="relative aspect-auto h-[16px] w-[16px] flex-shrink-0">
            <CachedImage
              src={
                totalValue === "SOL"
                  ? "/icons/solana-sq.svg"
                  : "/icons/usdc.svg"
              }
              alt={`${totalValue} Icon`}
              fill
              quality={50}
              className="object-contain"
            />
          </div>
          <span className="inline-block text-nowrap font-geistSemiBold text-sm text-success">
            {formatTotal(transaction.profitLoss)}
          </span>
        </div>
      </div>
      <div className="hidden h-full w-full min-w-[115px] items-center md:flex">
        <button className="flex items-center gap-x-1 rounded-md bg-success px-2 py-1 font-geistSemiBold text-black">
          P&L
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </>
  );

  const TradeHistoryCardMobileContent = () => (
    <div
      className={cn(
        "flex w-full flex-col md:hidden",
        remainingScreenWidth < 700 && !isModalContent && "md:flex",
      )}
    >
      {/* Header */}
      <div className="relative flex h-12 w-full items-center justify-between overflow-hidden bg-white/[4%] px-3 py-3">
        <div className="flex items-center gap-x-3">
          <SellBuyBadge isExpanded type={transactionType} size="sm" />
          <div className="flex items-center gap-x-2">
            <AvatarWithBadges
              classNameParent={`size-8`}
              symbol={transaction.token.symbol}
              src={transaction.token.imageLargeUrl}
              alt={`${transaction.token.name} Image`}
              leftType="bonk"
            />
            <div className="flex-col">
              <div className="flex gap-2">
                <h1 className="text-nowrap font-geistBold text-xs text-fontColorPrimary">
                  {transaction.token.name}
                </h1>
                <h2 className="text-nowrap font-geistLight text-xs text-fontColorSecondary">
                  {transaction.token.symbol}
                </h2>
              </div>
              <div className="flex gap-x-2 overflow-hidden">
                <p className="font-geistRegular text-xs text-fontColorSecondary">
                  {transaction.token.address.slice(0, 8)}...
                  {transaction.token.address.slice(-4)}
                </p>
                <Copy value={transaction.token.address} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="text-xs text-fontColorSecondary">
            2m
            <span className="ml-1 font-geistSemiBold text-fontColorPrimary">
              Age
            </span>
          </span>
        </div>
      </div>

      {/* Market Data Grid */}
      <div className="flex justify-around gap-2.5 p-3">
        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Market Cap
          </span>
          <div className="flex items-center gap-x-1">
            <div className="relative aspect-auto h-[16px] w-[16px]">
              <CachedImage
                src={
                  tradesValue === "SOL"
                    ? "/icons/solana-sq.svg"
                    : "/icons/usdc.svg"
                }
                alt={`${tradesValue} Icon`}
                fill
                quality={50}
                className="object-contain"
              />
            </div>
            <span className="font-geistSemiBold text-sm text-success">
              {formatValue(transaction.volume)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Price
          </span>
          <span className="font-geistSemiBold text-sm text-success">
            {transaction.amountBought}
          </span>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Tokens
          </span>
          <span className="font-geistSemiBold text-sm text-success">
            {transaction.amountBought}
          </span>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            SOL
          </span>
          <div className="flex items-center gap-x-1">
            <div className="relative aspect-auto h-[16px] w-[16px]">
              <CachedImage
                src={
                  totalValue === "SOL"
                    ? "/icons/solana-sq.svg"
                    : "/icons/usdc.svg"
                }
                alt={`${totalValue} Icon`}
                fill
                quality={50}
                className="object-contain"
              />
            </div>
            <span className="font-geistSemiBold text-sm text-success">
              {formatTotal(transaction.profitLoss)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            USDC
          </span>
          <span className="font-geistSemiBold text-sm text-success">
            {formatValue(transaction.volume)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-x-1 border-t border-border p-3">
        <button className="bg-mint mr-2 flex items-center gap-x-1 rounded-md px-2 py-1 font-geistSemiBold text-sm text-black">
          P&L
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <AddressWithEmojis
          color="success"
          address={
            transaction.token.address.slice(0, 3) +
            "..." +
            transaction.token.address.slice(-3)
          }
          emojis={["whale.png", "dolphin.png"]}
        />
        <CircleCount value={1} />
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
      {remainingScreenWidth < 700 && !isModalContent ? null : (
        <TradeHistoryCardDesktopContent />
      )}
      <TradeHistoryCardMobileContent />
    </div>
  );
}
