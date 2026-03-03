import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ZoneProgress {
  visited: boolean
  problemsAttempted: number
  problemsSolved: number
  hintsUsed: number
  stars: 0 | 1 | 2 | 3
  lastVisited?: number
}

export interface PredictionEvent {
  id: string
  chapterId: number
  zoneId: number
  prediction: string
  wasCorrect: boolean
  timestamp: number
}

interface ProgressState {
  zones: Record<string, ZoneProgress>
  predictions: PredictionEvent[]

  markVisited: (chapterId: number, zoneId: number) => void
  recordAttempt: (chapterId: number, zoneId: number, solved: boolean, hintsUsed: number) => void
  recordPrediction: (event: PredictionEvent) => void
  getZone: (chapterId: number, zoneId: number) => ZoneProgress
  getChapterStars: (chapterId: number) => number
  getChapterPct: (chapterId: number) => number
  resetAll: () => void
}

const defaultZone = (): ZoneProgress => ({
  visited: false,
  problemsAttempted: 0,
  problemsSolved: 0,
  hintsUsed: 0,
  stars: 0,
})

const key = (chapterId: number, zoneId: number) => `ch${chapterId}-zone${zoneId}`

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      zones: {},
      predictions: [],

      markVisited(chapterId, zoneId) {
        const k = key(chapterId, zoneId)
        set(s => ({
          zones: {
            ...s.zones,
            [k]: { ...(s.zones[k] ?? defaultZone()), visited: true, lastVisited: Date.now() },
          },
        }))
      },

      recordAttempt(chapterId, zoneId, solved, hintsUsed) {
        const k = key(chapterId, zoneId)
        set(s => {
          const prev = s.zones[k] ?? defaultZone()
          const newStars: 0 | 1 | 2 | 3 = solved
            ? hintsUsed === 0 ? 3 : hintsUsed === 1 ? 2 : 1
            : 0
          return {
            zones: {
              ...s.zones,
              [k]: {
                ...prev,
                problemsAttempted: prev.problemsAttempted + 1,
                problemsSolved: solved ? prev.problemsSolved + 1 : prev.problemsSolved,
                hintsUsed: prev.hintsUsed + hintsUsed,
                stars: Math.max(prev.stars, newStars) as 0 | 1 | 2 | 3,
              },
            },
          }
        })
      },

      recordPrediction(event) {
        set(s => ({ predictions: [...s.predictions, event] }))
      },

      getZone(chapterId, zoneId) {
        return get().zones[key(chapterId, zoneId)] ?? defaultZone()
      },

      getChapterStars(chapterId) {
        const zones = get().zones
        let total = 0
        for (let z = 1; z <= 5; z++) total += zones[key(chapterId, z)]?.stars ?? 0
        return total
      },

      getChapterPct(chapterId) {
        const zones = get().zones
        let visited = 0
        for (let z = 1; z <= 5; z++) if (zones[key(chapterId, z)]?.visited) visited++
        return Math.round((visited / 5) * 100)
      },

      resetAll: () => set({ zones: {}, predictions: [] }),
    }),
    { name: 'accounting-progress-v1' }
  )
)
