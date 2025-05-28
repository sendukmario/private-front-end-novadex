import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type HiddenTokensState = {
  hiddenTokens: string[];
  setHiddenTokens: (tokens: string[]) => void;
  isTokenHidden: (tokenMint: string) => boolean;
  hideToken: (tokenMint: string) => void;
  unhideToken: (tokenMint: string) => void;
};

export const useHiddenTokensStore = create<HiddenTokensState>()(
  persist(
    (set, get) => ({
      hiddenTokens: [],
      setHiddenTokens: (tokens) => set({ hiddenTokens: tokens }),
      isTokenHidden: (tokenMint) => get().hiddenTokens.includes(tokenMint),
      hideToken: (tokenMint) =>
        set((state) => {
          if (state.hiddenTokens.includes(tokenMint)) return state;
          return { hiddenTokens: [...state.hiddenTokens, tokenMint] };
        }),
      unhideToken: (tokenMint) =>
        set((state) => ({
          hiddenTokens: state.hiddenTokens.filter((t: any) => t !== tokenMint),
        })),
    }),
    {
      name: "cosmo-hidden-tokens",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
