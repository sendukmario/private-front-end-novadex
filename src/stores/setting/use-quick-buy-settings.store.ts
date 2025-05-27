import { QuickPresetData } from "@/apis/rest/settings/settings";
import { PresetKey } from "@/types/preset";
import { mergeDeepLeft } from "ramda";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type QuickBuyAmount = {
  order: number;
  amount: number;
};

type Presets = Record<PresetKey, QuickPresetData> & { autoFeeEnabled: boolean };
type QuickBuyState = {
  activePreset: PresetKey;
  presets: Presets;
  autoFeeEnabled: boolean;
  buyPanelPreset: PresetKey;
  sellPanelPreset: PresetKey;
  setBuyPanelPreset: (preset: PresetKey) => void;
  setSellPanelPreset: (preset: PresetKey) => void;
  setAutoFeeEnabled: (preset: boolean) => void;
  setPresets: (presets: Presets) => void;
  setActivePreset: (preset: PresetKey) => void;
  updatePreset: (preset: PresetKey, data: Partial<QuickPresetData>) => void;
  setAutoFeeEnable: (autoFeeEnabled: boolean) => void;
};

export const useQuickBuySettingsStore = create<QuickBuyState>()(
  persist(
    (set) => ({
      autoFeeEnabled: false,
      setAutoFeeEnabled: (autoFeeEnabled) => set({ autoFeeEnabled }),
      activePreset: "preset1",
      presets: {} as Presets,
      buyPanelPreset: "preset1",
      sellPanelPreset: "preset1",
      setBuyPanelPreset: (preset) => set({ buyPanelPreset: preset }),
      setSellPanelPreset: (preset) => set({ sellPanelPreset: preset }),
      setPresets: (presets) => set({ presets }),
      setActivePreset: (preset) => set({ activePreset: preset }),
      updatePreset: (preset, data) =>
        set((state) => ({
          presets: {
            ...state.presets,
            [preset]: { ...state.presets[preset], ...data },
          },
        })),
      setAutoFeeEnable: (autoFeeEnabled) =>
        set((state) => ({
          presets: {
            ...state.presets,
            autoFeeEnabled,
          },
          autoFeeEnabled: autoFeeEnabled,
        })),
    }),
    {
      name: "quick-buy-settings",
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) =>
        mergeDeepLeft(persistedState as QuickBuyAmount, currentState),
    },
  ),
);
