"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useTradeHistoryTableSettingStore } from "@/stores/table/wallet-trade/use-trade-history-table-setting.store";
// ######## Components 🧩 ########
import TradeHistoryCard from "@/components/customs/cards/wallet-trade/TradeHistoryCard";
import HeadCol from "@/components/customs/tables/HeadCol";
// ######## Utils & Helpers 🤝 ########
import {
  getWalletTradeHistory,
  type TradeHistoryItem,
} from "@/apis/rest/wallet-trade";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/libraries/utils";
import { usePopupStore } from "@/stores/use-popup-state";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { formatAmountDollar } from "@/utils/formatAmount";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import SortButton from "../../SortButton";
import { useTradesWalletModalStore } from "@/stores/token/use-trades-wallet-modal.store";

export type CommonTableProps = {
  isModalContent?: boolean;
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
      No trade history found for this wallet address.
    </p>
  </div>
);

// Utility function to convert USD to SOL using token price
const convertUsdToSol = (usdValue: number, tokenPriceUsd: string): string => {
  const price = parseFloat(tokenPriceUsd);
  if (isNaN(price) || price === 0) return "0";
  const solValue = usdValue / price;
  return solValue.toFixed(4);
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
  const { wallet: walletAddressState } = useTradesWalletModalStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const params = useParams();

  // State for data fetching and windowing
  const [isLoading, setIsLoading] = useState(true);
  const [tradeHistoryData, setTradeHistoryData] = useState<TradeHistoryItem[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [tradesValue, setTradesValue] = useState("SOL");
  const [totalValue, setTotalValue] = useState("SOL");

  // Get wallet address from path params
  const walletAddress = useMemo(() => {
    if (!params) return null;
    if (isModalContent) return walletAddressState;
    return params["wallet-address"] as string;
  }, [params, isModalContent, walletAddressState]);

  // Memoize the formatted value to prevent unnecessary recalculations
  const formatValue = useMemo(() => {
    return (value: number, tokenPriceUsd: string) => {
      if (isNaN(value)) return "0";

      if (tradesValue === "SOL") {
        return convertUsdToSol(value, tokenPriceUsd);
      }
      // Keep as USD
      return formatAmountDollar(value.toString());
    };
  }, [tradesValue]);

  // Separate formatter for Total column
  const formatTotal = useMemo(() => {
    return (value: number, tokenPriceUsd: string) => {
      if (isNaN(value)) return "0";

      if (totalValue === "SOL") {
        return convertUsdToSol(value, tokenPriceUsd);
      }
      // Keep as USD
      return formatAmountDollar(value.toString());
    };
  }, [totalValue]);

  // Fetch trade history data
  useEffect(() => {
    let isMounted = true;

    const fetchTradeHistory = async () => {
      if (!walletAddress) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await getWalletTradeHistory(walletAddress);
        if (isMounted && response.data.results) {
          setTradeHistoryData(response.data.results);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to fetch trade history",
          );
          setTradeHistoryData([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTradeHistory();

    return () => {
      isMounted = false;
    };
  }, [walletAddress]);

  // Handle scroll for windowing
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const itemHeight = 56; // Height of each item in pixels
      const containerHeight = container.clientHeight;

      const start = Math.floor(scrollTop / itemHeight);
      const visibleItems = Math.ceil(containerHeight / itemHeight);
      const end = start + visibleItems + 2; // Add buffer

      setVisibleRange({ start, end });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      handleScroll(); // Initial calculation
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Get visible items
  const visibleItems = useMemo(() => {
    if (!tradeHistoryData?.length) return [];
    return tradeHistoryData.slice(visibleRange.start, visibleRange.end);
  }, [tradeHistoryData, visibleRange]);

  // Filter transactions based on type
  const filteredTransactions = useMemo(() => {
    if (type === "ALL") return tradeHistoryData;
    return tradeHistoryData.filter(
      (item) => item.direction === type.toLowerCase(),
    );
  }, [tradeHistoryData, type]);

  const HeaderData = [
    {
      label: "Age",
      tooltipContent: "The time passed since the trade was made.",
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
      label: "Amount",
      labelClassName: "md:text-xs lg:text-sm uppercase font-geistSemiBold",
      tooltipContent: "The amount of tokens traded.",
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
  ];

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
        ref={containerRef}
        className={cn(
          "relative flex h-full w-full flex-grow flex-col overflow-auto max-md:p-3",
          remainingScreenWidth < 700 && !isModalContent && "md:p-3",
        )}
      >
        {isLoading ? (
          <div className="flex h-full w-full flex-col gap-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`loading-skeleton-${index}`}
                className={cn(
                  "bg-card max-md:mb-2",
                  index % 2 === 0 ? "bg-white/[4%]" : "",
                )}
              >
                <LoadingSkeleton />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-center font-geistRegular text-sm text-destructive">
              {error}
            </p>
          </div>
        ) : !filteredTransactions?.length ? (
          <EmptyState />
        ) : (
          <div
            style={{
              height: `${filteredTransactions.length * 56}px`,
              position: "relative",
            }}
          >
            {visibleItems.map((item, index) => {
              const actualIndex = visibleRange.start + index;

              return (
                <div
                  key={`trade-history-${actualIndex}`}
                  className={cn(
                    "absolute w-full bg-card max-md:mb-2",
                    actualIndex % 2 === 0 ? "bg-white/[4%]" : "",
                  )}
                  style={{ top: `${actualIndex * 56}px` }}
                >
                  <TradeHistoryCard
                    isModalContent={isModalContent}
                    data={item}
                    tradesValue={tradesValue}
                    totalValue={totalValue}
                    formatValue={(value) =>
                      formatValue(value, item.token0SwapValueUsd)
                    }
                    formatTotal={(value) =>
                      formatTotal(value, item.token0SwapValueUsd)
                    }
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
