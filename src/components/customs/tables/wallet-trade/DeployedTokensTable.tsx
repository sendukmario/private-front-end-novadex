"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
// ######## Components 🧩 ########
import DeployedTokensCard from "@/components/customs/cards/wallet-trade/DeployedTokensCard";
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
  name: (a: any, b: any, order: SortOrder) =>
    order === "ASC"
      ? a.token_data.name.localeCompare(b.token_data.name)
      : b.token_data.name.localeCompare(a.token_data.name),
  
  symbol: (a: any, b: any, order: SortOrder) =>
    order === "ASC"
      ? a.token_data.symbol.localeCompare(b.token_data.symbol)
      : b.token_data.symbol.localeCompare(a.token_data.symbol),
  
  supply: (a: any, b: any, order: SortOrder) =>
    order === "ASC"
      ? Number(a.token_data.totalSupply) - Number(b.token_data.totalSupply)
      : Number(b.token_data.totalSupply) - Number(a.token_data.totalSupply),
  
  holders: (a: any, b: any, order: SortOrder) =>
    order === "ASC"
      ? Number(a.token_data.circulatingSupply) - Number(b.token_data.circulatingSupply)
      : Number(b.token_data.circulatingSupply) - Number(a.token_data.circulatingSupply),
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
      No deployed tokens found for this wallet address.
    </p>
  </div>
);

export default function DeployedTokensTable({
  isModalContent = true,
}: CommonTableProps) {
  const { remainingScreenWidth } = usePopupStore();
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "name", order: "ASC" });
  const listRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(0);
  const params = useParams();

  // Fetch token wallets data
  const { data: tokenWalletsData, isLoading } = useQuery({
    queryKey: ["tokenWallets", params.walletAddress, "1y"],
    queryFn: () => getTokenWallets(params.walletAddress as string, "1y"),
    enabled: !!params.walletAddress,
    staleTime: 60000, // Cache for 1 minute
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
      label: "Symbol",
      tooltipContent: "Token symbol",
      className: "min-w-[100px]",
      sortButton: (
        <button
          onClick={() => handleSort("symbol")}
          className="flex cursor-pointer items-center -space-x-[7.5px]"
        >
          <HiArrowNarrowUp
            className={cn(
              "text-sm duration-300",
              sortConfig.key === "symbol" && sortConfig.order === "ASC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
          <HiArrowNarrowDown
            className={cn(
              "text-sm duration-300",
              sortConfig.key === "symbol" && sortConfig.order === "DESC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
        </button>
      ),
    },
    {
      label: "Supply",
      tooltipContent: "Total supply",
      className: "min-w-[110px]",
      sortButton: (
        <button
          onClick={() => handleSort("supply")}
          className="flex cursor-pointer items-center -space-x-[7.5px]"
        >
          <HiArrowNarrowUp
            className={cn(
              "text-sm duration-300",
              sortConfig.key === "supply" && sortConfig.order === "ASC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
          <HiArrowNarrowDown
            className={cn(
              "text-sm duration-300",
              sortConfig.key === "supply" && sortConfig.order === "DESC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
        </button>
      ),
    },
    {
      label: "Holders",
      tooltipContent: "Number of holders",
      className: "min-w-[155px]",
      sortButton: (
        <button
          onClick={() => handleSort("holders")}
          className="flex cursor-pointer items-center -space-x-[7.5px]"
        >
          <HiArrowNarrowUp
            className={cn(
              "text-sm duration-300",
              sortConfig.key === "holders" && sortConfig.order === "ASC"
                ? "text-[#DF74FF]"
                : "text-fontColorSecondary",
            )}
          />
          <HiArrowNarrowDown
            className={cn(
              "text-sm duration-300",
              sortConfig.key === "holders" && sortConfig.order === "DESC"
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
        ) : !tokenWalletsData?.data.results || tokenWalletsData.data.results.length === 0 ? (
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
                  <DeployedTokensCard
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
