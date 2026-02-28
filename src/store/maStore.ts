import { create } from 'zustand'
import type { MACompanyInput, MADealInput, DCFInput } from '../engines/MAEngine.ts'

interface MAState {
  workbenchStep: 0 | 1 | 2 | 3
  targetCompany: MACompanyInput | null
  acquirerCompany: MACompanyInput | null
  dcfInputs: DCFInput | null
  dealTerms: MADealInput

  // Actions
  setWorkbenchStep: (step: 0 | 1 | 2 | 3) => void
  setTargetCompany: (company: MACompanyInput | null) => void
  setAcquirerCompany: (company: MACompanyInput | null) => void
  setDCFInputs: (inputs: DCFInput) => void
  setDealTerms: (terms: Partial<MADealInput>) => void
  resetWorkbench: () => void
}

const DEFAULT_DEAL_TERMS: MADealInput = {
  premiumPct: 25,
  cashPct: 50,
  stockPct: 30,
  debtPct: 20,
  debtRate: 5,
  taxRate: 0.25,
  synergies: 0,
}

export const useMAStore = create<MAState>()((set, get) => ({
  workbenchStep: 0,
  targetCompany: null,
  acquirerCompany: null,
  dcfInputs: null,
  dealTerms: { ...DEFAULT_DEAL_TERMS },

  setWorkbenchStep: (step) => set({ workbenchStep: step }),

  setTargetCompany: (company) => set({ targetCompany: company }),

  setAcquirerCompany: (company) => set({ acquirerCompany: company }),

  setDCFInputs: (inputs) => set({ dcfInputs: inputs }),

  setDealTerms: (terms) =>
    set({
      dealTerms: { ...get().dealTerms, ...terms },
    }),

  resetWorkbench: () =>
    set({
      workbenchStep: 0,
      targetCompany: null,
      acquirerCompany: null,
      dcfInputs: null,
      dealTerms: { ...DEFAULT_DEAL_TERMS },
    }),
}))
