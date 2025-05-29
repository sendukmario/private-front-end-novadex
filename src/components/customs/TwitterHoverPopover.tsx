"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/libraries/utils";
import { fetchTwitterUser, TwitterUserData } from "@/apis/rest/twitter";
import { ScrollArea } from "../ui/scroll-area";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";

import {
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  fromUnixTime,
} from "date-fns";
import SocialLinkButton from "./buttons/SocialLinkButton";

function getTimeAgoSuffix(unixTimestamp: number): string {
  const date = fromUnixTime(unixTimestamp);
  const now = new Date();

  const minutes = differenceInMinutes(now, date);
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = differenceInHours(now, date);
  if (hours < 24) {
    return `${hours}h`;
  }

  const days = differenceInDays(now, date);
  if (days < 7) {
    return `${days}d`;
  }

  const weeks = differenceInWeeks(now, date);
  if (weeks < 4) {
    return `${weeks}w`;
  }

  const months = differenceInMonths(now, date);
  if (months < 12) {
    return `${months}mo`;
  }

  const years = differenceInYears(now, date);
  return `${years}y`;
}

const TwitterHoverPopoverContent = React.memo(
  ({
    username,
    data,
    setFinalData,
  }: {
    username: string;
    data: TwitterUserData | undefined;
    setFinalData: React.Dispatch<
      React.SetStateAction<TwitterUserData | undefined>
    >;
  }) => {
    const {
      data: fetchData,
      refetch,
      isLoading,
    } = useQuery({
      queryKey: ["twitter", username],
      queryFn: async () => {
        if (data) return data;
        const res = await fetchTwitterUser(username);
        setFinalData(res);
        return res;
      },
      initialData: data,
      enabled: !data,
    });

    useEffect(() => {
      if (!data) {
        refetch();
      } else if (data) {
        setFinalData(data);
      }
    }, [username, data]);
    return (
      <>
        {isLoading ? (
          <div className="mt-4 flex h-24 items-center justify-center">
            <div className="relative size-6 animate-spin">
              <Image
                src="/icons/search-loading.png"
                alt="Loading"
                fill
                className="object-contain"
              />
            </div>
          </div>
        ) : data || (fetchData && fetchData.success) ? (
          <>
            <ScrollArea className="h-full w-full">
              {(data?.usernames || fetchData?.usernames)!.length! > 0 ? (
                <div className="flex flex-col">
                  {(data?.usernames || fetchData?.usernames)?.map((item) => (
                    <div
                      key={item.username + String(item.time)}
                      className="flex items-center p-1"
                    >
                      <p className="text-xs text-primary">@{item.username}</p>
                      <p className="ml-1 text-xs text-fontColorSecondary/60">
                        {getTimeAgoSuffix(item.time)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState />
              )}
            </ScrollArea>
          </>
        ) : (
          <div className="flex h-24 items-center justify-center">
            <p className="text-sm text-fontColorSecondary/60">
              Failed to load profile
            </p>
          </div>
        )}
      </>
    );
  },
);

const EmptyState = () => {
  return (
    <div className="mt-4 flex h-full flex-col items-center justify-center gap-1">
      <EmptyIlustration />
      <p className="text-xs text-fontColorSecondary">No Past @s Found</p>
    </div>
  );
};

const EmptyIlustration = () => {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        opacity="0.1"
        cx="32"
        cy="62.0794"
        rx="32"
        ry="1.92"
        fill="#9191A4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.8316 45.8344C21.144 46.1468 21.144 46.6533 20.8316 46.9657L16.5649 51.2324C16.2525 51.5448 15.746 51.5448 15.4335 51.2324C15.1211 50.92 15.1211 50.4135 15.4335 50.101L19.7002 45.8344C20.0126 45.5219 20.5192 45.5219 20.8316 45.8344Z"
        fill="#9191A4"
      />
      <path
        d="M53.1029 12.2667L38.2095 29.2059L54.4002 52.2666H42.4882L36.5007 43.7397C37.0278 42.7809 37.4021 41.7265 37.591 40.6095L44.1509 49.7913H49.5722L24.6215 14.8699H19.2015L29.3414 29.0626C28.8171 28.9776 28.2792 28.9334 27.7311 28.9334C27.2063 28.9334 26.6909 28.9739 26.1878 29.052L14.4002 12.2667H26.3122L36.6375 26.9718L49.5749 12.2667H53.1029Z"
        fill="#9191A4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M27.4659 30.1334C22.4585 30.1334 18.3992 34.1927 18.3992 39.2001C18.3992 44.2074 22.4585 48.2667 27.4659 48.2667C32.4732 48.2667 36.5325 44.2074 36.5325 39.2001C36.5325 34.1927 32.4732 30.1334 27.4659 30.1334ZM16.7992 39.2001C16.7992 33.309 21.5748 28.5334 27.4659 28.5334C33.3569 28.5334 38.1325 33.309 38.1325 39.2001C38.1325 45.0911 33.3569 49.8667 27.4659 49.8667C21.5748 49.8667 16.7992 45.0911 16.7992 39.2001Z"
        fill="#9191A4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.3878 25.6283C15.1467 24.7288 14.2222 24.195 13.3227 24.436C12.4232 24.677 11.8894 25.6016 12.1304 26.5011L13.0282 29.8516C13.2692 30.7511 14.1938 31.2849 15.0932 31.0439C15.9927 30.8028 16.5265 29.8783 16.2855 28.9788L15.3878 25.6283ZM13.6424 33.2918C13.4014 32.3923 12.4768 31.8585 11.5773 32.0995L8.22683 32.9972C7.32733 33.2383 6.79354 34.1628 7.03456 35.0623C7.27558 35.9618 8.20014 36.4956 9.09964 36.2546L12.4501 35.3569C13.3496 35.1158 13.8834 34.1913 13.6424 33.2918ZM13.6541 25.6728C13.8708 25.6148 14.0935 25.7434 14.1516 25.96L15.0493 29.3105C15.1074 29.5272 14.9788 29.7499 14.7621 29.8079C14.5455 29.866 14.3228 29.7374 14.2647 29.5207L13.367 26.1702C13.3089 25.9536 13.4375 25.7309 13.6541 25.6728ZM12.4058 33.6227C12.3478 33.406 12.1251 33.2774 11.9084 33.3355L8.55796 34.2332C8.3413 34.2913 8.21273 34.514 8.27078 34.7306C8.32883 34.9473 8.55154 35.0759 8.76819 35.0178L12.1187 34.1201C12.3353 34.062 12.4639 33.8393 12.4058 33.6227Z"
        fill="#9191A4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.9299 35.9537C21.5758 35.7446 21.1623 35.9263 21.0011 36.3072L21.0011 36.3072C20.8432 36.6801 20.9642 37.1464 21.3021 37.346L24.4407 39.1997L21.3021 41.0535C20.9642 41.253 20.8432 41.7193 21.0011 42.0923L21.1237 42.0403L21.0011 42.0923C21.1623 42.4732 21.5758 42.6549 21.9299 42.4458L26.2471 39.8959C26.4804 39.7581 26.6168 39.4854 26.6168 39.1997C26.6168 38.9141 26.4804 38.6413 26.2471 38.5036L21.9299 35.9537ZM33.9302 36.3072C33.769 35.9263 33.3555 35.7446 33.0014 35.9537L28.6841 38.5036C28.4509 38.6413 28.3144 38.9141 28.3144 39.1997C28.3144 39.4854 28.4509 39.7581 28.6841 39.8959L33.0014 42.4458C33.3555 42.6549 33.769 42.4732 33.9302 42.0923C34.0881 41.7194 33.9671 41.253 33.6291 41.0535L30.4906 39.1997L33.6291 37.346C33.9671 37.1464 34.0881 36.6801 33.9302 36.3072Z"
        fill="#9191A4"
      />
    </svg>
  );
};

TwitterHoverPopoverContent.displayName = "TwitterHoverPopoverContent";

const TwitterHoverPopover = React.memo(
  ({
    href,
    // isWithAnimation = false,
    variant = "secondary",
    data,
    containerSize,
    iconSize,
    isTokenPage = false,
  }: {
    href: string;
    isWithAnimation?: boolean;
    variant?: "primary" | "secondary";
    data?: TwitterUserData;
    containerSize?: string;
    iconSize?: string;
    isTokenPage?: boolean;
  }) => {
    const twitterUsernameRegex =
      /^https?:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/([^\/\?\s#]+)/;
    const username = href.match(twitterUsernameRegex)?.[1] || "";

    const [finalData, setFinalData] = useState(data);
    const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false);

    // Convert YouTube URL to embed format
    const embedUrl = useMemo(() => {
      // Handle different YouTube URL formats
      let videoId = "";

      // Match youtube.com/watch?v=VIDEO_ID
      const watchMatch = href.match(/youtube\.com\/watch\?v=([^&]+)/);
      if (watchMatch) videoId = watchMatch[1];

      // Match youtu.be/VIDEO_ID
      const shortMatch = href.match(/youtu\.be\/([^?&]+)/);
      if (shortMatch) videoId = shortMatch[1];

      // Match youtube.com/embed/VIDEO_ID (already in embed format)
      const embedMatch = href.match(/youtube\.com\/embed\/([^?&]+)/);
      if (embedMatch) return href; // Already in embed format

      // Match youtube.com/shorts/VIDEO_ID
      const shortsMatch = href.match(/youtube\.com\/shorts\/([^?&]+)/);
      if (shortsMatch) videoId = shortsMatch[1];

      return videoId ? `https://www.youtube.com/embed/${videoId}` : href;
    }, [href]);

    if (
      !(href.includes("x.com") || href.includes("twitter.com")) &&
      href.includes("youtube.com")
    ) {
      return (
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger>
              <SocialLinkButton
                variant={"primary"}
                size="sm"
                href={href}
                icon="twitter"
                label="Twitter"
                typeImage="svg"
                containerSize={containerSize}
                iconSize={iconSize}
              />
            </TooltipTrigger>
            <TooltipContent className="p-0">
              <iframe
                className="h-[200px] w-full rounded-[6px] border border-border"
                src={embedUrl}
                title="YouTube video player"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                loading="lazy"
              ></iframe>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <>
        {href.includes("search?q=") || href.includes("communities") ? (
          <Link
            href={href}
            target="_blank"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "gb__white__btn_xs relative flex h-[20px] flex-shrink-0 items-center justify-center rounded-[4px] duration-300 hover:bg-white/[12%]",
              variant === "primary" ? "bg-white/[6%]" : "bg-[#272734]",
              !finalData || !data
                ? "aspect-square size-[20px]"
                : "w-auto gap-0.5 p-1.5",
              containerSize,
            )}
          >
            <div
              className={cn(
                "relative aspect-square size-[16px] flex-shrink-0",
                iconSize,
              )}
            >
              <Image
                src="/icons/social/twitter.svg"
                alt="Twitter Social Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
            {!!finalData && (
              <div className="text-xs text-fontColorPrimary">
                {(data || finalData)?.usernames?.length}
              </div>
            )}
          </Link>
        ) : (
          <>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    target="_blank"
                    className={cn(
                      "gb__white__btn_xs relative hidden h-[20px] flex-shrink-0 items-center justify-center rounded-[4px] duration-300 hover:bg-white/[12%] md:flex",
                      variant === "primary" ? "bg-white/[6%]" : "bg-[#272734]",
                      !finalData || !data
                        ? "aspect-square size-[20px]"
                        : "w-auto gap-0.5 p-1.5",
                      containerSize,
                      data || (finalData && "!w-auto pl-1 pr-1.5"),
                    )}
                  >
                    <div
                      className={cn(
                        "relative aspect-square size-[16px] flex-shrink-0",
                        iconSize,
                      )}
                    >
                      <Image
                        src="/icons/social/twitter.svg"
                        alt="Twitter Social Icon"
                        fill
                        className="object-contain"
                      />
                    </div>
                    {!!finalData && (
                      <div className="text-xs text-fontColorPrimary">
                        {(data || finalData)?.usernames?.length}
                      </div>
                    )}
                  </Link>
                </TooltipTrigger>

                <TooltipContent
                  isWithAnimation={false}
                  align="start"
                  side="bottom"
                  className="gb__white__popover z-[1000] h-[160px] w-[178px] rounded-[4px] border border-border bg-card p-3 !transition-none"
                >
                  <TwitterHoverPopoverContent
                    username={username}
                    data={data}
                    setFinalData={setFinalData}
                  />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {isTokenPage ? (
              <Link
                href={href}
                target="_blank"
                className={cn(
                  "gb__white__btn_xs relative flex h-[20px] flex-shrink-0 items-center justify-center rounded-[4px] duration-300 hover:bg-white/[12%] md:hidden",
                  variant === "primary" ? "bg-white/[6%]" : "bg-[#272734]",
                  !finalData || !data
                    ? "aspect-square size-[20px]"
                    : "w-auto gap-0.5 p-1.5",
                  containerSize,
                  data || (finalData && "!w-auto pl-1 pr-1.5"),
                )}
              >
                <div
                  className={cn(
                    "relative aspect-square size-[16px] flex-shrink-0",
                    iconSize,
                  )}
                >
                  <Image
                    src="/icons/social/twitter.svg"
                    alt="Twitter Social Icon"
                    fill
                    className="object-contain"
                  />
                </div>
                {!!finalData && (
                  <div className="text-xs text-fontColorPrimary">
                    {(data || finalData)?.usernames?.length}
                  </div>
                )}
              </Link>
            ) : (
              <Drawer open={isOpenDrawer} onOpenChange={setIsOpenDrawer}>
                <DrawerTrigger
                  asChild
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpenDrawer(!isOpenDrawer);
                  }}
                >
                  <div
                    className={cn(
                      "gb__white__btn_xs relative flex h-[20px] flex-shrink-0 items-center justify-center rounded-[4px] duration-300 hover:bg-white/[12%] md:hidden",
                      variant === "primary" ? "bg-white/[6%]" : "bg-[#272734]",
                      !finalData || !data
                        ? "aspect-square size-[20px]"
                        : "w-auto gap-0.5 p-1.5",
                      containerSize,
                      data || (finalData && "!w-auto pl-1 pr-1.5"),
                    )}
                  >
                    <div
                      className={cn(
                        "relative aspect-square size-[16px] flex-shrink-0",
                        iconSize,
                      )}
                    >
                      <Image
                        src="/icons/social/twitter.svg"
                        alt="Twitter Social Icon"
                        fill
                        className="object-contain"
                      />
                    </div>
                    {!!finalData && (
                      <div className="text-xs text-fontColorPrimary">
                        {(data || finalData)?.usernames?.length}
                      </div>
                    )}
                  </div>
                </DrawerTrigger>
                <DrawerContent className="h-[87dvh] border-0 bg-[#080811] p-0">
                  <DrawerHeader className="flex flex-row items-center justify-between space-y-0 border-b border-[#242436] px-4 py-2.5">
                    <DrawerTitle className="text-fontColorPrimary">
                      Twitter
                    </DrawerTitle>
                    <div
                      className="flex h-6 w-6 cursor-pointer items-center justify-center bg-transparent text-transparent"
                      onClick={() => setIsOpenDrawer(false)}
                    >
                      <div
                        className="relative aspect-square h-6 w-6 flex-shrink-0"
                        aria-label="Close"
                        title="Close"
                      >
                        <Image
                          src="/icons/close.png"
                          alt="Close Icon"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </DrawerHeader>
                  <div className="flex h-full flex-col justify-center">
                    <TwitterHoverPopoverContent
                      username={username}
                      data={data}
                      setFinalData={setFinalData}
                    />
                  </div>
                </DrawerContent>
              </Drawer>
            )}
          </>
        )}
      </>
    );
  },
);

TwitterHoverPopover.displayName = "TwitterHoverPopover";

export default TwitterHoverPopover;
