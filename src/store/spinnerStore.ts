import { create } from "zustand";

type SpinnerState = {
  visible: boolean;
  text?: string;
  show: (text?: string) => void;
  hide: () => void;
};

export const useSpinnerStore = create<SpinnerState>((set) => ({
  visible: false,
  text: undefined,
  show: (text) => set({ visible: true, text }),
  hide: () => set({ visible: false, text: undefined }),
}));
