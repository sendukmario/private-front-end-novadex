"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useQuickAmountStore } from "@/stores/dex-setting/use-quick-amount.store";
import { useQuickBuySettingsStore } from "@/stores/setting/use-quick-buy-settings.store";
import { useSnapStateStore } from "@/stores/use-snap-state";
import { useDebouncedQuickBuy } from "@/hooks/use-debounced-quickbuy";
// ######## Components 🧩 ########
import WalletSelectionButton from "@/components/customs/WalletSelectionButton";
import PresetSelectionButtons from "@/components/customs/PresetSelectionButtons";
import QuickAmountInput from "@/components/customs/QuickAmountInput";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

export default function CosmoBuySettings() {
  const { debouncedUpdateQuickBuyAmount } = useDebouncedQuickBuy();

  const width = useWindowSizeStore((state) => state.width);

  const isFetchedSettings = !!useQuickBuySettingsStore((state) => state.presets)
    ?.preset1;

  const cosmoWallets = useQuickAmountStore((state) => state.cosmoWallets);
  const setCosmoWallets = useQuickAmountStore((state) => state.setCosmoWallets);
  const cosmoQuickBuyAmount = useQuickAmountStore(
    (state) => state.cosmoQuickBuyAmount,
  );
  const setCosmoQuickBuyAmount = useQuickAmountStore(
    (state) => state.setCosmoQuickBuyAmount,
  );

  const currentSnapped = useSnapStateStore((state) => state.currentSnapped);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-2 min-[1340px]:gap-x-2",
        currentSnapped.side === "none" ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={`flex w-full flex-col items-center gap-x-2 gap-y-2 md:flex-row xl:w-fit xl:flex-shrink-0`}
      >
        <div className="flex flex-nowrap gap-x-2 gap-y-2 max-md:w-full">
          <QuickAmountInput
            isLoading={!isFetchedSettings}
            value={cosmoQuickBuyAmount}
            onChange={(val) => {
              if (Number(val) >= 0.00001) {
                setCosmoQuickBuyAmount(val);
                debouncedUpdateQuickBuyAmount({
                  amount: val,
                  type: "cosmo",
                });
              }
            }}
            width={width! >= 1280 ? undefined : 170}
            className="flex flex-shrink flex-grow max-lg:!w-full max-lg:max-w-[150px]"
            classNameChildren="!w-full"
          />

          <div className="w-fit">
            <PresetSelectionButtons isWithLabel isWithSetting />
          </div>
        </div>

        {/* Desktop */}
        {width! >= 1280 && (
          <div className="hidden h-[32px] flex-shrink-0 items-center xl:flex">
            <WalletSelectionButton
              value={cosmoWallets}
              setValue={setCosmoWallets}
              isReplaceWhenEmpty={false}
              maxWalletShow={10}
              displayVariant="name"
              className="h-[32px]"
            />
          </div>
        )}
        {/* Mobile */}
        {width! < 1280 && (
          <div className="w-full">
            <div className="flex h-[32px] w-full min-w-[300px] flex-shrink-0 items-center md:w-fit xl:hidden">
              <WalletSelectionButton
                className="w-full"
                value={cosmoWallets}
                setValue={setCosmoWallets}
                maxWalletShow={10}
                isReplaceWhenEmpty={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
