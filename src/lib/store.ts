import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ZARA } from './data'
import type { Profile, Progress } from './types'

export const STAGE_COUNT = 6
const EMPTY: Profile = { skills: [], courses: [], projects: [], interests: [] }

type App = {
  stage: number
  pan: number
  hover: number | null
  profile: Profile
  progress: Progress
  unknown: string[]
  go: (n: number) => void
  setPan: (n: number) => void
  setHover: (n: number | null) => void
  patchProfile: (p: Partial<Profile>) => void
  setUnknown: (u: string[]) => void
  tick: (id: string, on: boolean) => void
  loadZara: () => void
  reset: () => void
}

export const useApp = create<App>()(
  persist(
    (set, get) => ({
      stage: 0,
      pan: 0,
      hover: null,
      profile: EMPTY,
      progress: { done: [] },
      unknown: [],
      go: (n) => set({ stage: Math.max(0, Math.min(STAGE_COUNT - 1, n)), pan: 0, hover: null }),
      setPan: (pan) => set({ pan }),
      setHover: (hover) => set({ hover }),
      patchProfile: (p) => set({ profile: { ...get().profile, ...p } }),
      setUnknown: (unknown) => set({ unknown }),
      tick: (id, on) => {
        const done = get().progress.done.filter((x) => x !== id)
        set({ progress: { done: on ? [...done, id] : done } })
      },
      loadZara: () => set({ profile: { ...ZARA.profile, roleId: get().profile.roleId }, progress: { done: [] }, unknown: [] }),
      reset: () => {
        get().loadZara()
        get().go(0)
      },
    }),
    { name: 'meridian-v1', partialize: (s) => ({ stage: s.stage, profile: s.profile, progress: s.progress, unknown: s.unknown }) },
  ),
)
