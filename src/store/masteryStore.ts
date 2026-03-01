import { create } from 'zustand'

export type Direction = 'up' | 'down' | 'flat'
export type CashFlowSection = 'operating' | 'investing' | 'financing' | 'none'

export interface Prediction {
  cash: Direction
  netIncome: Direction
  totalAssets: Direction
  totalLiabilities: Direction
  totalEquity: Direction
  cashFlowSection: CashFlowSection
}

export interface AttemptBreakdown {
  cash: boolean
  netIncome: boolean
  totalAssets: boolean
  totalLiabilities: boolean
  totalEquity: boolean
  cashFlowSection: boolean
}

export interface AttemptRecord {
  id: string
  timestamp: number
  templateId: string
  templateName: string
  concepts: string[]
  prediction: Prediction
  actual: Prediction
  score: number // 0..100
  breakdown: AttemptBreakdown
  misconceptions: string[]
}

export interface MasteryStat {
  attempts: number
  avgScore: number
  lastScore: number
}

interface MasteryState {
  lastAttempt: AttemptRecord | null
  recentAttempts: AttemptRecord[]
  conceptStats: Record<string, MasteryStat>
  templateStats: Record<string, MasteryStat>

  recordAttempt: (attempt: AttemptRecord) => void
  resetMastery: () => void
}

function updateStat(prev: MasteryStat | undefined, nextScore: number): MasteryStat {
  const attempts = (prev?.attempts ?? 0) + 1
  const prevAvg = prev?.avgScore ?? 0
  const avgScore = prev ? (prevAvg * (attempts - 1) + nextScore) / attempts : nextScore
  return { attempts, avgScore, lastScore: nextScore }
}

export const useMasteryStore = create<MasteryState>()((set) => ({
  lastAttempt: null,
  recentAttempts: [],
  conceptStats: {},
  templateStats: {},

  recordAttempt: (attempt) =>
    set((state) => {
      const nextConceptStats = { ...state.conceptStats }
      for (const concept of attempt.concepts) {
        nextConceptStats[concept] = updateStat(nextConceptStats[concept], attempt.score)
      }

      const nextTemplateStats = { ...state.templateStats }
      nextTemplateStats[attempt.templateId] = updateStat(nextTemplateStats[attempt.templateId], attempt.score)

      const recentAttempts = [attempt, ...state.recentAttempts].slice(0, 50)

      return {
        lastAttempt: attempt,
        recentAttempts,
        conceptStats: nextConceptStats,
        templateStats: nextTemplateStats,
      }
    }),

  resetMastery: () =>
    set({
      lastAttempt: null,
      recentAttempts: [],
      conceptStats: {},
      templateStats: {},
    }),
}))

