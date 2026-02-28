import { create } from 'zustand'

type ViewMode = 'statements' | 'trialBalance' | 'tAccounts' | 'generalLedger'
type CashFlowMethod = 'indirect' | 'direct'
type AppMode = 'transaction' | 'whatif'

interface UIState {
  mode: AppMode
  activeTab: 'statements' | 'ma'
  drawerOpen: boolean
  sensitivityOpen: boolean
  tutorialStep: number | null
  quizzesEnabled: boolean
  unlockedTiers: Set<string>
  cashFlowMethod: CashFlowMethod
  viewMode: ViewMode
  selectedTopic: string | null

  // Actions
  setMode: (mode: AppMode) => void
  setActiveTab: (tab: 'statements' | 'ma') => void
  toggleDrawer: () => void
  toggleSensitivity: () => void
  setViewMode: (mode: ViewMode) => void
  setCashFlowMethod: (method: CashFlowMethod) => void
  setSelectedTopic: (topic: string | null) => void
  unlockTier: (tier: string) => void
  unlockAll: () => void
}

export const useUIStore = create<UIState>()((set) => ({
  mode: 'transaction',
  activeTab: 'statements',
  drawerOpen: false,
  sensitivityOpen: false,
  tutorialStep: null,
  quizzesEnabled: false,
  unlockedTiers: new Set(['starter']),
  cashFlowMethod: 'indirect',
  viewMode: 'statements',
  selectedTopic: null,

  setMode: (mode) => set({ mode }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  toggleDrawer: () => set((state) => ({ drawerOpen: !state.drawerOpen })),

  toggleSensitivity: () => set((state) => ({ sensitivityOpen: !state.sensitivityOpen })),

  setViewMode: (mode) => set({ viewMode: mode }),

  setCashFlowMethod: (method) => set({ cashFlowMethod: method }),

  setSelectedTopic: (topic) => set({ selectedTopic: topic }),

  unlockTier: (tier) =>
    set((state) => {
      const newTiers = new Set(state.unlockedTiers)
      newTiers.add(tier)
      return { unlockedTiers: newTiers }
    }),

  unlockAll: () =>
    set({
      unlockedTiers: new Set(['starter', 'accruals', 'intermediate', 'advanced']),
    }),
}))
