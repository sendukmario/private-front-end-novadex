"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLatestTransactionMessageStore } from "@/stores/use-latest-transactions.store";
import { useTokenHoldingStore } from "@/stores/token/use-token-holding.store";
// ######## Components 🧩 ########
import Image from "next/image";
import BaseButton from "@/components/customs/buttons/BaseButton";
import BuyForm from "@/components/customs/forms/token/BuyForm";
import SellForm from "@/components/customs/forms/token/SellForm";
import SnipePopUp, {
  SnipePopUpContent,
} from "@/components/customs/popups/token/SnipePopup";
import BuySellTabSelector from "@/components/customs/BuySellTabSelector";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
// ######## Types 🗨️ ########
import { TradeActionType } from "@/types/global";
import { usePopupStore } from "@/stores/use-popup-state";
import { useTokenMessageStore } from "@/stores/token/use-token-messages.store";

type Tab = {
  label: TradeActionType;
  icons: {
    active: string;
    inactive: string;
  };
  // tooltipMessage: string;
  content: React.ComponentType<any>;
};

const tabList: Tab[] = [
  {
    label: "Buy",
    icons: {
      active: "/icons/token/active-buy.png",
      inactive: "/icons/token/inactive-buy.png",
    },
    content: BuyForm,
  },
  {
    label: "Sell",
    icons: {
      active: "/icons/token/active-sell.png",
      inactive: "/icons/token/inactive-sell.png",
    },
    content: SellForm,
  },
];

export default React.memo(function TokenBuyAndSell({
  isMobile = false,
  tokenSymbol,
  isMigrating,
  loading = false,
  // initHoldings,
}: {
  isMobile?: boolean;
  tokenSymbol?: string;
  isMigrating?: boolean;
  loading?: boolean;
  // initHoldings?: HoldingsConvertedMessageType[] | null;
}) {
  const latestTransactionMessages = useLatestTransactionMessageStore(
    (state) => state.messages,
  );

  const isLoading = useTokenHoldingStore((state) => state.isLoading);
  const holdingsMessages = useTokenHoldingStore((state) => state.messages);

  const finalHoldings = useMemo(() => {
    if (!holdingsMessages || !latestTransactionMessages)
      return holdingsMessages;

    if (isLoading) {
      const updatedFinalHoldings = holdingsMessages.map((holding) => {
        const updatedTokens = holding.tokens.map((token) => {
          const matchingTx = latestTransactionMessages.find(
            (tx) =>
              tx.wallet === holding.wallet && tx.mint === token.token.mint,
          );

          if (matchingTx) {
            return {
              ...token,
              balance: matchingTx.balance,
              balanceStr: matchingTx.balanceStr,
            };
          }

          return token;
        });

        return {
          ...holding,
          tokens: updatedTokens,
        };
      });

      console.warn("BALANCE ✨ - Token Buy And Sell", {
        updatedFinalHoldings,
        latestTransactionMessages,
      });

      return updatedFinalHoldings;
    } else {
      return holdingsMessages;
    }
  }, [holdingsMessages, latestTransactionMessages, isLoading]);

  const [activeTab, setActiveTab] = useState<TradeActionType>("Buy");
  const [openSnipeModal, setOpenSnipeModal] = useState<boolean>(false);
  const handleCloseOpenSnipeModal = () => {
    setOpenSnipeModal(false);
  };
  const { remainingScreenWidth } = usePopupStore();
  const solPrice = useTokenMessageStore(
    (state) => state.priceMessage.price_sol,
  );

  return (
    <>
      {!isMobile || !(isMobile && isMigrating) ? (
        <>
          <div
            className={cn(
              "relative hidden h-auto w-full rounded-[8px] border border-border md:inline-block",
              remainingScreenWidth <= 768 && "xl:block",
              isMobile &&
                "nova-scroller hide block overflow-y-scroll rounded-none border-none xl:hidden",
              loading && "!block xl:!block",
            )}
          >
            <div>
              <BuySellTabSelector
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tabList={tabList}
                isInverted
              />
            </div>

            {tabList.map((tab) => {
              const isActive = activeTab === tab.label;
              const FormComponent = tab.content;

              return isActive ? (
                <FormComponent
                  key={tab.label}
                  {...(tab.label === "Sell"
                    ? {
                        holdingsMessages: finalHoldings,
                        solPrice: solPrice,
                      }
                    : {})}
                />
              ) : null;
            })}

            {/* Migrating */}
            <AnimatePresence>
              {isMigrating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center gap-y-5 bg-black/10 px-6 backdrop-blur-[12px]"
                >
                  <div className="flex flex-col items-center gap-y-1">
                    <h3 className="text-nowrap text-center font-geistSemiBold text-base text-fontColorPrimary">
                      {tokenSymbol} is migrating...
                    </h3>
                    <p className="text-center text-sm leading-[18px] text-fontColorSecondary">
                      {`Bonding curve has reached 100% and the token LP is currently
                being migrated to Raydium (May take up to 30 min).`}
                    </p>
                  </div>
                  <BaseButton
                    id="snipe-button"
                    variant="primary"
                    onClick={() => setOpenSnipeModal((prev) => !prev)}
                    className="w-full"
                    prefixIcon={
                      <div className="relative aspect-square h-[18px] w-[18px] focus:border-none focus:outline-none focus:ring-0">
                        <Image
                          src="/icons/black-snipe.png"
                          alt="Black Snipe Icon"
                          fill
                          quality={50}
                          className="object-contain"
                        />
                      </div>
                    }
                  >
                    <span className="inline-block text-nowrap font-geistSemiBold text-base text-[#080811]">
                      Snipe
                    </span>
                  </BaseButton>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {isMigrating && openSnipeModal && (
              <SnipePopUp
                handleCloseOpenSnipeModal={handleCloseOpenSnipeModal}
              />
            )}
          </AnimatePresence>
        </>
      ) : null}

      {isMobile && isMigrating ? (
        <SnipePopUpContent
          handleCloseOpenSnipeModal={handleCloseOpenSnipeModal}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          dragging={false}
          isWithLabel={false}
        />
      ) : null}
    </>
  );
});
