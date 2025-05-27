"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { cn } from "@/libraries/utils";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { usePopupStore } from "@/stores/use-popup-state";
import {
  availableTimeframe,
  getWalletPnLChart,
  Timeframe,
} from "@/apis/rest/wallet-trade";
import { useQuery } from "@tanstack/react-query";
import { useTradesWalletModalStore } from "@/stores/token/use-trades-wallet-modal.store";
import { formatAmountDollarPnL } from "@/utils/formatAmount";
import { ChartLine, Loader2, LoaderCircle } from "lucide-react";

// Sample data
const data = [
  { name: "1", value: 120 },
  { name: "2", value: 250 },
  { name: "3", value: 380 },
  { name: "4", value: 450 },
  { name: "5", value: 520 },
  { name: "6", value: 670 },
  { name: "7", value: 730 },
  { name: "8", value: 810 },
  { name: "9", value: 890 },
  { name: "10", value: 950 },
  { name: "11", value: 1020 },
  { name: "12", value: 1150 },
  { name: "13", value: 1230 },
  { name: "14", value: 1320 },
  { name: "15", value: 1440 },
  { name: "16", value: 1560 },
  { name: "17", value: 1630 },
  { name: "18", value: 1720 },
  { name: "19", value: 1810 },
  { name: "20", value: 1890 },
  { name: "21", value: 1940 },
  { name: "22", value: 1980 },
  { name: "23", value: 2010 },
  { name: "24", value: 2050 },
  { name: "25", value: 2120 },
  { name: "26", value: 2180 },
  { name: "27", value: 2240 },
  { name: "28", value: 2310 },
  { name: "29", value: 2370 },
  { name: "30", value: 2450 },
];

// const timePresetOptions = ["All", "7D", "24H", "12H", "6H", "1H"];

export default function AllRealizedPLChart({
  isModalContent = true,
}: {
  isModalContent?: boolean;
}) {
  const { width } = useWindowSizeStore();
  const { remainingScreenWidth } = usePopupStore();
  const { selectedTimeframe, setSelectedTimeframe } =
    useTradesWalletModalStore();
  // const walletAddress = useTradesWalletModalStore((state) => state.wallet);
  const walletAddress = "GiwAGiwBiWZvi8Lrd7HmsfjYA6YgjJgXWR26z6ffTykJ"; // use hardcoded wallet address from docs
  const {
    data: chartData,
    refetch,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: ["wallet-pnl-chart", walletAddress],
    queryFn: async () => {
      const res = await getWalletPnLChart(walletAddress, selectedTimeframe);

      return res;
    },
  });

  const dataMax = useMemo(() => {
    if (!chartData) return 0;

    const max = Math.max(
      ...chartData?.data.data.map((item) => Number(item.volumeUsdAll)),
    );
    if (max === 0) {
      return 10_000;
    }

    return Math.ceil(max * 1.1);
  }, [chartData]);

  const allRealizedPnL = useMemo(() => {
    if (!chartData)
      return {
        formattedPercentage: 0,
        formattedProfit: 0,
        percentageRealizedPnl: 0,
      };
    let totalRealizedProfit = 0;
    let totalVolume = 0;

    chartData.data.data.forEach((entry) => {
      totalRealizedProfit += parseFloat(String(entry.realizedProfitUsd));
      totalVolume += parseFloat(String(entry.volumeUsdAll));
    });

    let formattedProfit = formatAmountDollarPnL(totalRealizedProfit);

    let percentageRealizedPnl =
      totalVolume !== 0 ? (totalRealizedProfit / totalVolume) * 100 : 0;

    let formattedPercentage =
      percentageRealizedPnl > 0
        ? `(+${percentageRealizedPnl.toFixed(2)}%)`
        : `(${percentageRealizedPnl.toFixed(2)}%)`;
    return {
      formattedProfit,
      formattedPercentage,
      percentageRealizedPnl,
    };
  }, [chartData]);

  useEffect(() => {
    if (selectedTimeframe) {
      refetch();
    }
  }, [selectedTimeframe]);

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col gap-y-3 rounded-t-[20px] bg-[#080811] p-3 md:gap-y-3 md:p-[12px]",
        !isModalContent && "rounded-[8px]",
      )}
    >
      <div
        className={cn(
          "flex h-fit w-full flex-col justify-between gap-[8px] md:flex-row md:items-center md:gap-0",
          remainingScreenWidth < 800 &&
            !isModalContent &&
            "md:flex-col md:items-start md:gap-2",
        )}
      >
        <div className="flex items-center gap-x-2">
          <h4 className="line-clamp-1 font-geistSemiBold text-base text-fontColorPrimary">
            All Realized P&L
          </h4>
          <span
            className={cn(
              "font-geistSemiBold text-sm",
              allRealizedPnL.percentageRealizedPnl > 0
                ? "text-success"
                : "text-destructive",
            )}
          >
            {allRealizedPnL.formattedProfit}
            {allRealizedPnL.formattedPercentage}
          </span>
        </div>

        <div className="flex h-[32px] w-fit flex-shrink-0 items-center overflow-hidden rounded-[8px] border border-border">
          <div className="flex h-full items-center justify-center pl-4 pr-3.5">
            <span
              className={cn(
                "inline-block text-nowrap font-geistSemiBold text-sm text-fontColorSecondary",
                width! < 400 && "text-xs",
              )}
            >
              Presets
            </span>
          </div>
          <div className="h-full p-[2px]">
            <div className="flex h-full flex-row-reverse items-center rounded-[6px] bg-white/[8%]">
              {availableTimeframe?.map((option, index) => {
                const isActive = selectedTimeframe === option;

                return (
                  <button
                    key={index + option}
                    onClick={() => setSelectedTimeframe(option as Timeframe)}
                    className={cn(
                      "h-full rounded-[6px] px-3 font-geistSemiBold text-sm uppercase text-fontColorPrimary duration-300",
                      isActive ? "bg-white/[8%]" : "bg-transparent",
                      width! < 400 && "text-xs",
                    )}
                  >
                    {option === "30d" ? "1M" : option}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        {isLoading ||
          (isRefetching && (
            <div className="absolute inset-0 z-10 flex w-full items-center justify-center bg-white/[4%] backdrop-blur-md">
              <span className="flex items-center gap-2 text-sm text-fontColorSecondary">
                <LoaderCircle className="size-4 animate-spin" />
                <span>Loading chart ...</span>
              </span>
            </div>
          ))}

        <ResponsiveContainer
          width="100%"
          height={
            !isModalContent && width! > 768 && remainingScreenWidth > 800
              ? 155
              : 100
          }
        >
          <AreaChart data={chartData?.data.data}>
            {/* Gradient and Glow Filter */}
            <defs>
              {/* Gradient for the area */}
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F65B93" stopOpacity={1} />
                <stop offset="20%" stopColor="#F65B93" stopOpacity={1} />
                <stop offset="50%" stopColor="#F65B93" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#F65B93" stopOpacity={0.2} />
              </linearGradient>

              <linearGradient
                id="areaGradientSuccess"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#00C9B3" stopOpacity={1} />
                <stop offset="20%" stopColor="#00C9B3" stopOpacity={1} />
                <stop offset="50%" stopColor="#00C9B3" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#006358" stopOpacity={0.2} />
              </linearGradient>

              {/* Additional "Plus Lighter" Gradient */}
              {/*         <linearGradient
              id="plusLighterGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="rgba(255, 255, 255, 0.7)"
                stopOpacity={0.8}
              />
              <stop
                offset="50%"
                stopColor="rgba(255, 255, 255, 0.4)"
                stopOpacity={0.4}
              />
              <stop
                offset="100%"
                stopColor="rgba(255, 255, 255, 0)"
                stopOpacity={0}
              />
            </linearGradient> */}

              {/* Glow Effect */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur
                  in="SourceGraphic"
                  stdDeviation="3"
                  result="blur"
                />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* <Tooltip /> */}

            {/* Grid */}
            <CartesianGrid
              horizontal={true}
              vertical={false}
              strokeDasharray="7 5"
              stroke="#202037"
            />

            {/* Axes */}
            <XAxis
              hide={true}
              dataKey="timestamp"
              stroke="#8884d8"
              tick={{ fill: "#aaa", fontSize: 13 }}
              tickFormatter={(value) =>
                new Date(value * 1000).toLocaleDateString()
              }
            />
            <YAxis
              orientation="right"
              dataKey="volumeUsdAll"
              stroke="#FFFFFF"
              tick={{ fill: "#9191A4", fontSize: 13 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                `+${formatAmountDollarPnL(Number(value))}`
              }
              tickCount={6}
              domain={[0, dataMax]} // Start Y-Axis from 0 and max value
              padding={{ bottom: 17 }}
            />

            {/* Area with Gradient */}
            <Area
              type="linear"
              dataKey="volumeUsd"
              stroke={
                allRealizedPnL.percentageRealizedPnl > 0
                  ? "url(#areaGradientSuccess)"
                  : "url(#areaGradient)"
              }
              strokeWidth={2}
              fillOpacity={0.08}
              fill={
                allRealizedPnL.percentageRealizedPnl > 0
                  ? "url(#areaGradientSuccess)"
                  : "url(#areaGradient)"
              }
              style={{ filter: "url(#glow)" }}
              dot={false}
              isAnimationActive={false}
            />

            {/* "Plus Lighter" Effect */}
            <Area
              type="linear"
              dataKey="volumeUsd"
              // stroke="#8CD9B6"
              stroke={
                allRealizedPnL.percentageRealizedPnl > 0 ? "#8CD9B6" : "#F65B93"
              }
              strokeWidth={2}
              fillOpacity={0}
              style={{
                mixBlendMode: "lighten",
              }}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
