import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Preset = "preset1" | "preset2" | "preset3";

type PresetState = {
  presetOptions: Preset[];

  cosmoActivePreset: Preset;
  buySellActivePreset: Preset;
  buyPanelActivePreset: Preset;
  sellPanelActivePreset: Preset;
  setBuySellActivePreset: (preset: Preset) => void;
  setBuyPanelActivePreset: (preset: Preset) => void;
  setSellPanelActivePreset: (preset: Preset) => void;
  setCosmoActivePreset: (preset: Preset) => void;
};

const presetOptions: Preset[] = ["preset1", "preset2", "preset3"];

export const useActivePresetStore = create<PresetState>()(
  persist(
    (set) => ({
      presetOptions,

      cosmoActivePreset: "preset1",
      buySellActivePreset: "preset1",
      buyPanelActivePreset: "preset1",
      sellPanelActivePreset: "preset1",
      setBuySellActivePreset: (preset) => set({ buySellActivePreset: preset }),
      setBuyPanelActivePreset: (preset) =>
        set({ buyPanelActivePreset: preset }),
      setSellPanelActivePreset: (preset) =>
        set({ sellPanelActivePreset: preset }),
      setCosmoActivePreset: (newActivePreset) =>
        set(() => ({ cosmoActivePreset: newActivePreset })),
    }),
    {
      name: "preset-settings",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
