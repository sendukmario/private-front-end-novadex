"use client";

import { TransactionData } from "@/apis/rest/wallet-trade";
import { cn } from "@/libraries/utils";
import { usePopupStore } from "@/stores/use-popup-state";
import { formatNumber } from "@/utils/formatNumber";
import AvatarWithBadges from "../../AvatarWithBadges";
import Copy from "../../Copy";

interface DeployedTokensCardProps {
  isModalContent?: boolean;
  data: TransactionData;
}

export default function DeployedTokensCard({
  isModalContent = true,
  data,
}: DeployedTokensCardProps) {
  const { remainingScreenWidth } = usePopupStore();
  const { token_data } = data;

  const DeployedTokensCardDesktopContent = () => (
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
              {token_data.address && <Copy value={token_data.address} />}
            </div>
          </div>
        </div>
      </div>
      <div className="hidden h-full w-full min-w-[95px] items-center md:flex">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
          {token_data.symbol}
        </span>
      </div>
      <div className="hidden h-full w-full min-w-[95px] items-center md:flex">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
          {formatNumber(Number(token_data.totalSupply))}
        </span>
      </div>
      <div className="hidden h-full w-full min-w-[115px] items-center md:flex">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
          {formatNumber(Number(token_data.circulatingSupply))}
        </span>
      </div>
    </>
  );

  const DeployedTokensCardMobileContent = () => (
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
              {token_data.address && <Copy value={token_data.address} />}
            </div>
          </div>
        </div>
      </div>

      {/* Market Data Grid */}
      <div className="flex justify-around gap-2.5 p-3">
        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Symbol
          </span>
          <span className="font-geistSemiBold text-sm text-fontColorPrimary">
            {token_data.symbol}
          </span>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Supply
          </span>
          <span className="font-geistSemiBold text-sm text-fontColorPrimary">
            {formatNumber(Number(token_data.totalSupply))}
          </span>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Holders
          </span>
          <span className="font-geistSemiBold text-sm text-fontColorPrimary">
            {formatNumber(Number(token_data.circulatingSupply))}
          </span>
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
      <DeployedTokensCardDesktopContent />
      <DeployedTokensCardMobileContent />
    </div>
  );
}
