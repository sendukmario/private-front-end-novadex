"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useMostProfitableTableStore } from "@/stores/table/wallet-trade/use-most-profitable-table.store";
// ######## Components 🧩 ########
import MostProfitableCard from "@/components/customs/cards/wallet-trade/MostProfitableCard";
import HeadCol from "@/components/customs/tables/HeadCol";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/libraries/utils";
import { usePopupStore } from "@/stores/use-popup-state";
import { useEffect, useRef, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { CommonTableProps } from "./TradeHistoryTable";

export default function MostProfitableTable({
  isModalContent = true,
}: CommonTableProps) {
  const { data, isLoading, fetchData } = useMostProfitableTableStore();
  const { remainingScreenWidth } = usePopupStore();

  const listRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(0);
  const headerData = [
    {
      label: "Token",
      tooltipContent: "Token Information",
      className: "ml-4 min-w-[220px]",
    },
    {
      label: "Bought",
      tooltipContent: "Invested Information",
      className: "min-w-[80px]",
    },
    {
      label: "Sold",
      tooltipContent: "Sold Information",
      className: "min-w-[80px]",
    },
    {
      label: "P&L",
      tooltipContent: "P&L Information",
      className: "min-w-[120px]",
    },
    {
      label: "P&L %",
      tooltipContent: "P&L % Information",
      className: "min-w-[90px]",
    },
    {
      label: "Share",
      tooltipContent: "Share Information",
      className: "min-w-[140px]",
    },
  ];

  useEffect(() => {
    fetchData("1y"); // Default to 1 year timeframe
  }, [fetchData]);

  useEffect(() => {
    const updateHeight = () => {
      if (listRef.current) {
        const height = listRef.current.clientHeight;
        if (height > 0) {
          setListHeight(height);
        } else {
          setTimeout(updateHeight, 100);
        }
      }
    };
    const timerId = setTimeout(updateHeight, 0);
    window.addEventListener("resize", updateHeight);
    return () => {
      clearTimeout(timerId);
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const LoadingSkeleton = () => (
    <div className="flex h-[56px] w-full items-center gap-4 px-4">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="ml-auto flex gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );

  return (
    <div className="flex w-full flex-grow flex-col">
      {/* Table headers */}
      <div
        className={cn(
          "z-[9] hidden h-[40px] flex-shrink-0 items-center bg-card md:flex",
          remainingScreenWidth < 700 && !isModalContent && "md:hidden",
        )}
      >
        {headerData.map((item, index) => (
          <HeadCol isWithBorder={false} key={index} {...item} />
        ))}
      </div>
      <div
        ref={listRef}
        className={cn(
          "relative flex h-full w-full flex-grow flex-col border-t border-border max-md:p-3",
          remainingScreenWidth < 700 && !isModalContent && "md:p-3",
        )}
      >
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <LoadingSkeleton key={index} />
            ))}
          </div>
        ) : (
          <Virtuoso
            style={{ height: `${listHeight}px` }}
            totalCount={data.length}
            overscan={100}
            itemContent={(index: number) => {
              const transaction = data[index];
              if (!transaction) return null;
              return (
                <div
                  key={`trades-card-${index}`}
                  className={cn(
                    "bg-card max-md:mb-2",
                    index % 2 === 0 ? "bg-white/[4%]" : "",
                  )}
                >
                  <MostProfitableCard
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
