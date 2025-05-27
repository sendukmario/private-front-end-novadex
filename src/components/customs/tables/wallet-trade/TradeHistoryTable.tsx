"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useTradeHistoryTableSettingStore } from "@/stores/table/wallet-trade/use-trade-history-table-setting.store";
// ######## Components 🧩 ########
import TradeHistoryCard from "@/components/customs/cards/wallet-trade/TradeHistoryCard";
import HeadCol from "@/components/customs/tables/HeadCol";
// ######## Utils & Helpers 🤝 ########
import {
  getTokenWallets,
  Timeframe,
  TokenWalletsResponse,
  TransactionData,
} from "@/apis/rest/wallet-trade";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/libraries/utils";
import { usePopupStore } from "@/stores/use-popup-state";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { formatAmountDollar } from "@/utils/formatAmount";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import SortButton from "../../SortButton";

export type CommonTableProps = {
  isModalContent?: boolean;
};

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

export default function TradeHistoryTable({
  isModalContent = true,
}: CommonTableProps) {
  const {
    ageOrder,
    type,
    mcOrPrice,
    totalSOL,
    setAgeOrder,
    setType,
    setMCOrPrice,
    setTotalSOLCurrency,
  } = useTradeHistoryTableSettingStore();
  const { width } = useWindowSizeStore();
  const { remainingScreenWidth } = usePopupStore();
  const walletAddress = "GiwAGiwBiWZvi8Lrd7HmsfjYA6YgjJgXWR26z6ffTykJ"; // Hardcoded wallet address

  const listRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(0);
  const [tradesValue, setTradesValue] = useState("SOL");
  const [totalValue, setTotalValue] = useState("SOL"); // New state for Total column

  // Memoize the conversion rate to prevent unnecessary recalculations
  const solToUsdRate = useMemo(() => {
    // You should replace this with actual SOL/USD rate from your API or state management
    return 100; // Example rate: 1 SOL = $100
  }, []);

  // Memoize the formatted value to prevent unnecessary recalculations
  const formatValue = useMemo(() => {
    return (value: string) => {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue)) return "0";

      if (tradesValue === "SOL") {
        // Convert USD to SOL
        const solValue = numericValue / solToUsdRate;
        return solValue.toFixed(4);
      }
      // Keep as USD
      return formatAmountDollar(value);
    };
  }, [tradesValue, solToUsdRate]);

  // Separate formatter for Total column
  const formatTotal = useMemo(() => {
    return (value: string) => {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue)) return "0";

      if (totalValue === "SOL") {
        // Convert USD to SOL
        const solValue = numericValue / solToUsdRate;
        return solValue.toFixed(4);
      }
      // Keep as USD
      return formatAmountDollar(value);
    };
  }, [totalValue, solToUsdRate]);

  const { data: tokenWalletsData, isLoading } = useQuery<TokenWalletsResponse>({
    queryKey: ["token-wallets", walletAddress, "1y"],
    queryFn: async () => {
      const res = await getTokenWallets(walletAddress, "1y" as Timeframe);
      return res;
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const transactions = useMemo(() => {
    if (!tokenWalletsData?.data?.results) return [];

    // First map the data
    const mappedTransactions = tokenWalletsData.data.results.map(
      (token: TransactionData): Transaction => ({
        token: token.token_data,
        amountBought: token.tokenAmountBought1y,
        amountSold: token.tokenAmountSold1y,
        profitLoss: token.realizedProfitUsd1y,
        profitLossPercentage: token.realizedProfitPercentage1y,
        volume: token.amountBoughtUsd1y,
      }),
    );

    // Then apply type filtering
    if (type !== "ALL") {
      return mappedTransactions.filter((transaction) => {
        const bought = parseFloat(transaction.amountBought);
        const sold = parseFloat(transaction.amountSold);
        const isBuy = bought > sold;
        return type === "BUY" ? isBuy : !isBuy;
      });
    }

    return mappedTransactions;
  }, [tokenWalletsData, type]);

  // Handlers
  const handleAgeOrderChange = () => {
    if (ageOrder === "ASC") {
      setAgeOrder("DESC");
    } else {
      setAgeOrder("ASC");
    }
  };

  const HeaderData = [
    {
      label: "Age",
      tooltipContent:
        "The date the transaction was made or the time passed since token creation.",
      className: `${!isModalContent && "lg:min-w-[168px]"} ${remainingScreenWidth < 1280 && !isModalContent && "lg:min-w-[72px]"} min-w-[72px] px-0 ml-4 w-auto`,
      labelClassName: "md:text-xs lg:text-sm uppercase font-geistSemiBold",
    },
    {
      label: "Type",
      labelClassName: "md:text-xs lg:text-sm uppercase font-geistSemiBold",
      sortButton: (
        <div className="flex h-[20px] w-auto items-center justify-center rounded-[10px] bg-secondary p-1">
          <button
            onClick={() => setType(type === "BUY" ? "ALL" : "BUY")}
            className={cn(
              "inline-block cursor-pointer rounded-[12px] px-1.5 font-geistSemiBold text-xs leading-[14px] text-success duration-300",
              type === "BUY" && "bg-white/10",
            )}
          >
            B
          </button>
          <button
            onClick={() => setType(type === "SELL" ? "ALL" : "SELL")}
            className={cn(
              "inline-block cursor-pointer rounded-[12px] px-1.5 font-geistSemiBold text-xs leading-[14px] text-destructive duration-300",
              type === "SELL" && "bg-white/10",
            )}
          >
            S
          </button>
        </div>
      ),
      tooltipContent: "The type of transaction made.",
      className: "min-w-[200px] lg:min-w-[220px] px-0",
    },
    {
      label: "Value",
      labelClassName: "md:text-xs lg:text-sm uppercase font-geistSemiBold",
      sortButton: (
        <SortButton
          type="usdc-or-sol"
          value={tradesValue}
          setValue={setTradesValue}
        />
      ),
      tooltipContent: "The total value of the transaction made in SOL/USD.",
      className: "min-w-[115px] lg:min-w-[125px] px-0",
    },
    {
      label:
        width! < 1280 || remainingScreenWidth < 1280
          ? "AOT"
          : "Amount of tokens",
      labelClassName: "md:text-xs lg:text-sm uppercase font-geistSemiBold",
      tooltipContent: "The amount of tokens bought/sold.",
      className: `min-w-[70px] px-0 lg:min-w-[155px] ${remainingScreenWidth < 1280 && "lg:min-w-[70px]"}`,
    },
    {
      label: "Total",
      labelClassName: "md:text-xs lg:text-sm uppercase font-geistSemiBold",
      sortButton: (
        <SortButton
          type="usdc-or-sol"
          value={totalValue}
          setValue={setTotalValue}
        />
      ),
      tooltipContent: "The total value of the transaction made in SOL/USD.",
      className: "min-w-[125px] px-0 lg:min-w-[175px]",
    },
    {
      label: "Share",
      labelClassName: "md:text-xs lg:text-sm uppercase font-geistSemiBold",
      tooltipContent: "The percentage of the total value of the transaction.",
      className: "min-w-[120px] lg:min-w-[140px] px-0",
    },
  ];

  // Update height calculation
  useEffect(() => {
    const updateHeight = () => {
      if (listRef.current) {
        const height = listRef.current.clientHeight;
        if (height > 0 && height !== listHeight) {
          setListHeight(height);
        }
      }
    };

    // Initial height calculation
    updateHeight();

    // Set up resize observer for more reliable height updates
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newHeight = entry.contentRect.height;
        if (newHeight > 0 && newHeight !== listHeight) {
          setListHeight(newHeight);
        }
      }
    });

    if (listRef.current) {
      resizeObserver.observe(listRef.current);
    }

    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, [isLoading]); // Only depend on isLoading to prevent unnecessary updates

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col gap-y-2 p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex h-[72px] w-full items-center justify-between gap-x-4 rounded-[8px] border border-border bg-white/[4%] p-4"
          >
            <div className="flex items-center gap-x-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-col gap-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="flex items-center gap-x-4">
              <div className="flex flex-col items-end gap-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex flex-col items-end gap-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-grow flex-col">
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
          "relative flex h-full w-full flex-grow flex-col border-t border-border max-md:p-3",
          remainingScreenWidth < 700 && !isModalContent && "md:p-3",
          !isModalContent && "pb-32",
        )}
      >
        {transactions.length > 0 && (
          <Virtuoso
            style={{ height: `${listHeight}px` }}
            totalCount={transactions.length}
            overscan={100}
            itemContent={(index: number) => {
              const transaction = transactions[index];
              if (!transaction) return null;
              return (
                <div
                  key={`trades-card-${index}`}
                  className={cn(
                    "mr-2 bg-card max-md:mb-2",
                    index % 2 === 0 ? "bg-white/[4%]" : "",
                    index === transactions.length - 1 && "mb-16",
                  )}
                >
                  <TradeHistoryCard
                    key={index}
                    isModalContent={isModalContent}
                    transaction={transaction}
                    tradesValue={tradesValue}
                    totalValue={totalValue}
                    formatValue={formatValue}
                    formatTotal={formatTotal}
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
