import { create } from "zustand";

export type Preset = "preset1" | "preset2" | "preset3";

type PresetState = {
  presetOptions: Preset[];

  cosmoActivePreset: Preset;
  setCosmoActivePreset: (preset: Preset) => void;
};

const presetOptions: Preset[] = ["preset1", "preset2", "preset3"];

export const useActivePresetStore = create<PresetState>()((set) => ({
  presetOptions,

  cosmoActivePreset: "preset1",
  setCosmoActivePreset: (newActivePreset) =>
    set(() => ({ cosmoActivePreset: newActivePreset })),
}));
