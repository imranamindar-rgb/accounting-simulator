import type { Prediction } from '../store/masteryStore'

export interface Misconception {
  id: string
  title: string
  description: string
}

export const MISCONCEPTIONS: Record<string, Misconception> = {
  cash_is_revenue: {
    id: 'cash_is_revenue',
    title: 'Confusing cash with revenue',
    description:
      'Revenue is recognized when earned (performance), not when cash is received. Cash timing lives on the cash flow statement and working capital accounts.',
  },
  collection_creates_profit: {
    id: 'collection_creates_profit',
    title: 'Treating collection as profit',
    description:
      'Collecting A/R swaps one asset (A/R) for another (cash). It affects cash, not revenue or net income (because revenue was recognized earlier).',
  },
  capex_is_expense: {
    id: 'capex_is_expense',
    title: 'Treating capex like an expense',
    description:
      'Capex is a balance sheet investment (asset). The P&L impact shows up later via depreciation/amortization, not at purchase.',
  },
  depreciation_uses_cash: {
    id: 'depreciation_uses_cash',
    title: 'Thinking depreciation uses cash',
    description:
      'Depreciation reduces accounting profit but is non-cash. In the indirect cash flow statement it is added back in CFO.',
  },
  unearned_is_revenue: {
    id: 'unearned_is_revenue',
    title: 'Recognizing revenue before it is earned',
    description:
      'Unearned revenue is a liability: you have cash but still owe performance. Revenue is recognized when the service/product is delivered.',
  },
  writeoff_creates_expense: {
    id: 'writeoff_creates_expense',
    title: 'Treating write-offs as new expense',
    description:
      'Under the allowance method, the expense is recorded when estimated. Writing off specific A/R reduces both A/R and the allowance (no new P&L hit).',
  },
}

export function diagnoseMisconceptions(args: {
  templateId: string
  prediction: Prediction
  actual: Prediction
}): string[] {
  const { templateId, prediction, actual } = args
  const tags: string[] = []

  const predictedNetIncomeMoves = prediction.netIncome !== 'flat'
  const actualNetIncomeMoves = actual.netIncome !== 'flat'
  const predictedCashMoves = prediction.cash !== 'flat'
  const actualCashMoves = actual.cash !== 'flat'

  if (templateId === 'credit-sale' && predictedCashMoves && !actualCashMoves) {
    tags.push('cash_is_revenue')
  }

  if (templateId === 'collect-receivable' && predictedNetIncomeMoves && !actualNetIncomeMoves) {
    tags.push('collection_creates_profit')
  }

  if (templateId === 'unearned-revenue-received' && predictedNetIncomeMoves && !actualNetIncomeMoves) {
    tags.push('unearned_is_revenue')
  }

  if (templateId === 'purchase-equipment-cash' && predictedNetIncomeMoves && !actualNetIncomeMoves) {
    tags.push('capex_is_expense')
  }

  if (templateId === 'record-depreciation' && predictedCashMoves && !actualCashMoves) {
    tags.push('depreciation_uses_cash')
  }

  if (templateId === 'write-off-ar' && predictedNetIncomeMoves && !actualNetIncomeMoves) {
    tags.push('writeoff_creates_expense')
  }

  // Generic fallbacks when the learner misses the accrual/cash axis.
  if (!tags.includes('cash_is_revenue') && predictedCashMoves !== actualCashMoves) {
    tags.push('cash_is_revenue')
  }

  // If they got net income direction wrong, highlight accrual vs cash.
  if (!tags.includes('cash_is_revenue') && predictedNetIncomeMoves !== actualNetIncomeMoves) {
    tags.push('cash_is_revenue')
  }

  return [...new Set(tags)]
}

