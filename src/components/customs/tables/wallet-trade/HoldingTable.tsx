"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useHoldingTableSettingStore } from "@/stores/table/wallet-trade/use-holding-table-setting.store";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
// ######## Components 🧩 ########
import HoldingCard from "@/components/customs/cards/wallet-trade/HoldingCard";
import HeadCol from "@/components/customs/tables/HeadCol";
import { Skeleton } from "@/components/ui/skeleton";
// ######## Utils & Helpers 🤝 ########
import { getTokenWallets } from "@/apis/rest/wallet-trade";
import { cn } from "@/libraries/utils";
import { usePopupStore } from "@/stores/use-popup-state";
import { HiArrowNarrowDown, HiArrowNarrowUp } from "react-icons/hi";
import { Virtuoso } from "react-virtuoso";
import { CommonTableProps } from "./TradeHistoryTable";

type SortOrder = "ASC" | "DESC";

interface SortConfig {
  key: keyof typeof sortFunctions;
  order: SortOrder;
}

const sortFunctions = {
  amountBought: (a: any, b: any, order: SortOrder) => 
    order === "ASC" 
      ? Number(a.amountBoughtUsd1y) - Number(b.amountBoughtUsd1y)
      : Number(b.amountBoughtUsd1y) - Number(a.amountBoughtUsd1y),
  
  amountSold: (a: any, b: any, order: SortOrder) =>
    order === "ASC"
      ? Number(a.amountSoldUsd1y) - Number(b.amountSoldUsd1y)
      : Number(b.amountSoldUsd1y) - Number(a.amountSoldUsd1y),
  
  remaining: (a: any, b: any, order: SortOrder) =>
    order === "ASC"
      ? Number(a.tokenBalance) - Number(b.tokenBalance)
      : Number(b.tokenBalance) - Number(a.tokenBalance),
  
  pl: (a: any, b: any, order: SortOrder) =>
    order === "ASC"
      ? Number(a.realizedProfitPercentage1y) - Number(b.realizedProfitPercentage1y)
      : Number(b.realizedProfitPercentage1y) - Number(a.realizedProfitPercentage1y),
};

const LoadingSkeleton = () => (
  <div className="flex h-[56px] w-full items-center gap-x-4 px-4">
    <div className="flex items-center gap-x-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex flex-col gap-y-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-4 w-20" />
  </div>
);

const EmptyState = () => (
  <div className="flex h-full w-full items-center justify-center">
    <p className="text-center font-geistRegular text-sm text-fontColorSecondary">
      No holdings found for this wallet address.
    </p>
  </div>
);

export default function HoldingTable({
  isModalContent = true,
}: CommonTableProps) {
  const {
    investedOrder,
    soldOrder,
    remainingOrder,
    PLOrder,
    setInvestedOrder,
    setSoldOrder,
    setRemainingOrder,
    setPLOrder,
  } = useHoldingTableSettingStore();
  const { remainingScreenWidth } = usePopupStore();
  const [amountOrRecent, setAmountOrRecent] = useState<"Amount" | "Recent">("Amount");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "amountBought", order: "ASC" });
  const listRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(0);
  const params = useParams();

  // Fetch token wallets data
  const { data: tokenWalletsData, isLoading } = useQuery({
    queryKey: ["tokenWallets", params.walletAddress, "1y"],
    queryFn: () => getTokenWallets(params.walletAddress as string, "1y"),
    enabled: !!params.walletAddress,
  });

  // Calculate list height
  useEffect(() => {
    if (listRef.current) {
      const height = listRef.current.clientHeight;
      setListHeight(height);
    }
  }, [listRef.current]);

  // Sort data based on selected order
  const sortedData = useCallback(() => {
    if (!tokenWalletsData?.data.results) return [];
    
    const data = [...tokenWalletsData.data.results];
    const sortFunction = sortFunctions[sortConfig.key];
    
    return data.sort((a, b) => sortFunction(a, b, sortConfig.order));
  }, [tokenWalletsData?.data.results, sortConfig]);

  const handleSort = (key: keyof typeof sortFunctions) => {
    setSortConfig(prev => ({
      key,
      order: prev.key === key && prev.order === "ASC" ? "DESC" : "ASC"
    }));
  };

  const HeaderData = [
    {
      label: "Token",
      tooltipContent: "Token name",
      className: "min-w-[200px]",
    },
    {
      label: "Bought",
      tooltipContent: "Amount bought",
      className: "min-w-[100px]",
      sortButton: (
        <button
          onClick={() => handleSort("amountBought")}
          className="flex cursor-pointer items-center -space-x-[7.5px]"
        >
          <HiArrowNarrowUp
            className={cn(
              "text-sm duration-300",
              sortConfig.key === "amountBought" && sortConfig.order === "ASC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
          <HiArrowNarrowDown
            className={cn(
              "text-sm duration-300",
              sortConfig.key === "amountBought" && sortConfig.order === "DESC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
        </button>
      ),
    },
    {
      label: "Sold",
      tooltipContent: "Amount sold",
      className: "min-w-[110px]",
      sortButton: (
        <button
          onClick={() => handleSort("amountSold")}
          className="flex cursor-pointer items-center -space-x-[7.5px]"
        >
          <HiArrowNarrowUp
            className={cn(
              "text-sm duration-300",
              sortConfig.key === "amountSold" && sortConfig.order === "ASC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
          <HiArrowNarrowDown
            className={cn(
              "text-sm duration-300",
              sortConfig.key === "amountSold" && sortConfig.order === "DESC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
        </button>
      ),
    },
    {
      label: "Remaining",
      tooltipContent: "Remaining amount",
      className: "min-w-[155px]",
      sortButton: (
        <button
          onClick={() => handleSort("remaining")}
          className="flex cursor-pointer items-center -space-x-[7.5px]"
        >
          <HiArrowNarrowUp
            className={cn(
              "text-sm duration-300",
              sortConfig.key === "remaining" && sortConfig.order === "ASC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
          <HiArrowNarrowDown
            className={cn(
              "text-sm duration-300",
              sortConfig.key === "remaining" && sortConfig.order === "DESC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
        </button>
      ),
    },
    {
      label: "P&L",
      tooltipContent: "Profit and Loss",
      className: "min-w-[175px]",
      sortButton: (
        <button
          onClick={() => handleSort("pl")}
          className="flex cursor-pointer items-center -space-x-[7.5px]"
        >
          <HiArrowNarrowUp
            className={cn(
              "text-sm duration-300",
              sortConfig.key === "pl" && sortConfig.order === "ASC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
          <HiArrowNarrowDown
            className={cn(
              "text-sm duration-300",
              sortConfig.key === "pl" && sortConfig.order === "DESC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
        </button>
      ),
    },
  ];

  return (
    <div className="flex h-full w-full flex-grow flex-col overflow-hidden">
      {/* Table headers */}
      <div
        className={cn(
          "z-[9] hidden h-[40px] flex-shrink-0 items-center bg-card md:flex",
          remainingScreenWidth < 700 && !isModalContent && "md:hidden",
        )}
      >
        {HeaderData.map((item, index) => (
          <HeadCol isWithBorder={false} key={index} {...item} />
        ))}
      </div>
      {/* Amount or Recent on Mobile */}
      <div
        className={cn(
          "p-3.5 pb-0 md:hidden",
          remainingScreenWidth < 700 && !isModalContent && "flex-grow md:flex",
        )}
      >
        <div className="flex w-full h-8 items-center rounded-[8px] border border-border p-[3px]">
          <div className="flex h-full w-full items-center rounded-[6px] bg-white/[6%]">
            <button
              onClick={() => setAmountOrRecent("Amount")}
              className={cn(
                "flex h-[20px] w-full items-center justify-center gap-x-2 rounded-[6px] duration-300",
                amountOrRecent === "Amount" && "bg-white/[6%]",
              )}
            >
              <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                Amount
              </span>
            </button>
            <button
              onClick={() => setAmountOrRecent("Recent")}
              className={cn(
                "flex h-[20px] w-full items-center justify-center gap-x-2 rounded-[6px] bg-transparent duration-300",
                amountOrRecent === "Recent" && "bg-white/[6%]",
              )}
            >
              <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                Recent
              </span>
            </button>
          </div>
        </div>
      </div>

      <div
        ref={listRef}
        className={cn(
          "relative flex h-full w-full flex-grow flex-col max-md:p-3",
          remainingScreenWidth < 700 && !isModalContent && "md:p-3",
        )}
      >
        {isLoading ? (
          <Virtuoso
            style={{ height: `${listHeight}px` }}
            totalCount={5}
            overscan={100}
            itemContent={(index: number) => (
              <div
                key={`loading-skeleton-${index}`}
                className={cn(
                  "bg-card max-md:mb-2",
                  index % 2 === 0 ? "bg-white/[4%]" : "",
                )}
              >
                <LoadingSkeleton />
              </div>
            )}
          />
        ) : sortedData().length === 0 ? (
          <EmptyState />
        ) : (
          <Virtuoso
            style={{ height: `${listHeight}px` }}
            totalCount={sortedData().length}
            overscan={100}
            itemContent={(index: number) => {
              const transaction = sortedData()[index];
              if (!transaction) return null;
              
              return (
                <div
                  key={`trades-card-${index}`}
                  className={cn(
                    "bg-card max-md:mb-2",
                    index % 2 === 0 ? "bg-white/[4%]" : "",
                  )}
                >
                  <HoldingCard
                    key={index}
                    isModalContent={isModalContent}
                    data={transaction}
                  />
                </div>
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
