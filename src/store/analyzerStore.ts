/**
 * Analyzer Store
 *
 * Zustand store for the Live Company Analyzer feature.
 * Holds the resolved SEC EDGAR data, statements, and computed ratios
 * for a searched ticker symbol.
 */

import { create } from 'zustand'
import type { BalanceSheet, IncomeStatement } from '../engines/types'
import type { FinancialRatios } from '../engines/RatioCalculator'
import type { CompanyFacts } from '../engines/secClient'

// ── State Interface ──────────────────────────────────────────────────

interface AnalyzerState {
  ticker: string
  entityName: string | null
  facts: CompanyFacts | null
  bs: BalanceSheet | null
  is: IncomeStatement | null
  ratios: FinancialRatios | null
  loading: boolean
  error: string | null

  // Actions
  setTicker: (t: string) => void
  setResults: (data: {
    entityName: string
    facts: CompanyFacts
    bs: BalanceSheet
    is: IncomeStatement
    ratios: FinancialRatios
  }) => void
  setLoading: (l: boolean) => void
  setError: (e: string | null) => void
  reset: () => void
}

// ── Initial State ────────────────────────────────────────────────────

const initialState = {
  ticker: '',
  entityName: null,
  facts: null,
  bs: null,
  is: null,
  ratios: null,
  loading: false,
  error: null,
}

// ── Store ────────────────────────────────────────────────────────────

export const useAnalyzerStore = create<AnalyzerState>()((set) => ({
  ...initialState,

  setTicker: (t: string) => set({ ticker: t }),

  setResults: (data) =>
    set({
      entityName: data.entityName,
      facts: data.facts,
      bs: data.bs,
      is: data.is,
      ratios: data.ratios,
      error: null,
    }),

  setLoading: (l: boolean) => set({ loading: l }),

  setError: (e: string | null) => set({ error: e }),

  reset: () => set({ ...initialState }),
}))
