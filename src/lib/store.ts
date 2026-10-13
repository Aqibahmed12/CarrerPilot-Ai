import { create } from 'zustand'

export const STAGE_COUNT = 6

type App = { stage: number; go: (n: number) => void }

export const useApp = create<App>((set) => ({
  stage: 0,
  go: (n) => set({ stage: Math.max(0, Math.min(STAGE_COUNT - 1, n)) }),
}))
