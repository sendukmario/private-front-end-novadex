"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useHoldingTableSettingStore } from "@/stores/table/wallet-trade/use-holding-table-setting.store";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
// ######## Components 🧩 ########
import HoldingCard from "@/components/customs/cards/wallet-trade/HoldingCard";
import HeadCol from "@/components/customs/tables/HeadCol";
import { Skeleton } from "@/components/ui/skeleton";
// ######## Utils & Helpers 🤝 ########
import { getWalletHoldings, HoldingData } from "@/apis/rest/wallet-trade";
import { cn } from "@/libraries/utils";
import { usePopupStore } from "@/stores/use-popup-state";
import { HiArrowNarrowDown, HiArrowNarrowUp } from "react-icons/hi";
import { CommonTableProps } from "./TradeHistoryTable";
import { useTradesWalletModalStore } from "@/stores/token/use-trades-wallet-modal.store";

interface Token {
  symbol: string;
  name: string;
  image: string;
  mint: string;
}

export interface TransformedHoldingData {
  token: Token;
  investedUsd: number;
  soldUsd: number;
  balance: number;
  balanceUsd: number;
  lastBought: string;
  investedSol: number;
  soldSol: number;
  price: {
    usd: number;
    sol: number;
  };
}

// Transform API data to match HoldingCard requirements
const transformHoldingData = (data: HoldingData): TransformedHoldingData => ({
  token: {
    symbol: data.symbol,
    name: data.name,
    image: data.image || "",
    mint: data.address,
  },
  investedUsd: data.value,
  soldUsd: 0,
  balance: data.amount,
  balanceUsd: data.value,
  lastBought: new Date().toISOString(),
  investedSol: 0,
  soldSol: 0,
  price: {
    usd: data.price,
    sol: 0,
  },
});

// Types
type SortOrder = "ASC" | "DESC";

interface SortConfig {
  key: keyof typeof sortFunctions;
  order: SortOrder;
}

const sortFunctions = {
  amountBought: (
    a: TransformedHoldingData,
    b: TransformedHoldingData,
    order: SortOrder,
  ) =>
    order === "ASC"
      ? Number(a.investedUsd || 0) - Number(b.investedUsd || 0)
      : Number(b.investedUsd || 0) - Number(a.investedUsd || 0),

  amountSold: (
    a: TransformedHoldingData,
    b: TransformedHoldingData,
    order: SortOrder,
  ) =>
    order === "ASC"
      ? Number(a.soldUsd || 0) - Number(b.soldUsd || 0)
      : Number(b.soldUsd || 0) - Number(a.soldUsd || 0),

  remaining: (
    a: TransformedHoldingData,
    b: TransformedHoldingData,
    order: SortOrder,
  ) =>
    order === "ASC"
      ? Number(a.balance || 0) - Number(b.balance || 0)
      : Number(b.balance || 0) - Number(a.balance || 0),

  pl: (
    a: TransformedHoldingData,
    b: TransformedHoldingData,
    order: SortOrder,
  ) => {
    const aPL =
      ((Number(a.soldUsd || 0) - Number(a.investedUsd || 0)) /
        (Number(a.investedUsd || 0) || 1)) *
      100;
    const bPL =
      ((Number(b.soldUsd || 0) - Number(b.investedUsd || 0)) /
        (Number(b.investedUsd || 0) || 1)) *
      100;
    return order === "ASC" ? aPL - bPL : bPL - aPL;
  },
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

const ITEMS_PER_PAGE = 20;

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
  const [amountOrRecent, setAmountOrRecent] = useState<"Amount" | "Recent">(
    "Amount",
  );
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "amountBought",
    order: "ASC",
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const { wallet: walletAddressState } = useTradesWalletModalStore();

  // State for data fetching
  const [isLoading, setIsLoading] = useState(true);
  const [holdingsData, setHoldingsData] = useState<TransformedHoldingData[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const [visibleRange, setVisibleRange] = useState({
    start: 0,
    end: ITEMS_PER_PAGE,
  });

  // Get wallet address from path params
  const walletAddress = useMemo(() => {
    if (!params) return null;
    if (isModalContent) return walletAddressState;
    return params["wallet-address"] as string;
  }, [params, isModalContent, walletAddressState]);

  // Fetch holdings data
  useEffect(() => {
    let isMounted = true;

    const fetchHoldings = async () => {
      if (!walletAddress) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await getWalletHoldings(walletAddress);
        if (isMounted) {
          // Transform the data to match the expected format
          const transformedData = response.data.map(transformHoldingData);
          setHoldingsData(transformedData);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch holdings",
          );
          setHoldingsData([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchHoldings();

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

  // Memoize sorted data
  const sortedHoldings = useMemo(() => {
    if (!holdingsData.length) return [];

    const data = [...holdingsData];
    const sortFunction = sortFunctions[sortConfig.key];

    return data.sort((a, b) => sortFunction(a, b, sortConfig.order));
  }, [holdingsData, sortConfig]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return sortedHoldings.slice(visibleRange.start, visibleRange.end);
  }, [sortedHoldings, visibleRange]);

  const handleSort = (key: keyof typeof sortFunctions) => {
    setSortConfig((prev) => ({
      key,
      order: prev.key === key && prev.order === "ASC" ? "DESC" : "ASC",
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
        <div className="flex h-8 w-full items-center rounded-[8px] border border-border p-[3px]">
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
        ) : !holdingsData.length ? (
          <EmptyState />
        ) : (
          <div
          style={{
            height: `266px`,
            position: "relative",
            width: "100%",
            overflowX: "hidden",
            overflowY: "auto",
            scrollbarWidth: 'thin',
            scrollbarColor: '#4a4b50 rgba(26, 27, 30, 0.4)',
            borderRadius: '10px'
          }}
          className="scrollbar scrollbar-w-[5px] scrollbar-track-[#1a1b1e]/40 scrollbar-thumb-[#4a4b50] hover:scrollbar-thumb-[#5a5b60] active:scrollbar-thumb-[#6a6b70]"
          >
            {visibleItems.map((holding, index) => {
              const actualIndex = visibleRange.start + index;

              return (
                <div
                  key={`holdings-card-${actualIndex}`}
                  className={cn(
                    "absolute w-full bg-card max-md:mb-2",
                    actualIndex % 2 === 0 ? "bg-white/[4%]" : "",
                  )}
                  style={{ top: `${actualIndex * 56}px` }}
                >
                  <HoldingCard isModalContent={isModalContent} data={holding} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
