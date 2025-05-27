import { create } from "zustand";

type BlacklistedDeveloperFilterState = {
  blacklistedDevelopers: string[];
  isModalOpen: boolean;
  setIsModalOpen: (newState: boolean) => void;
  setBlacklistedDevelopers: (developers: string[]) => void;
  cleanup: () => void;
};

export const useBlacklistedDeveloperFilterStore =
  create<BlacklistedDeveloperFilterState>()((set) => ({
    blacklistedDevelopers: [],
    isModalOpen: false,
    setIsModalOpen: (newState) => set(() => ({ isModalOpen: newState })),
    setBlacklistedDevelopers: (developers) =>
      set(() => ({ blacklistedDevelopers: developers })),
    cleanup: () =>
      set(() => ({
        blacklistedDevelopers: [],
        isModalOpen: false,
      })),
  }));
