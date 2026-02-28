/**
 * Financial Ratio Calculator
 *
 * Computes 23 financial ratios across 5 categories from
 * Balance Sheet, Income Statement, and Cash Flow Statement data.
 *
 * Bug B1 fix: EBITDA is calculated as operatingIncome + depreciation + amortization,
 * not just operatingIncome as in the monolith.
 */

import type { BalanceSheet, IncomeStatement, CashFlowStatement } from './types'

// ── Types ───────────────────────────────────────────────────────────

export interface FinancialRatios {
  // Profitability (7 + EBITDA absolute = 8 fields)
  grossProfitMargin: number | null
  operatingMargin: number | null
  ebitda: number | null
  ebitdaMargin: number | null
  netProfitMargin: number | null
  roa: number | null
  roe: number | null
  roic: number | null

  // Liquidity (3)
  currentRatio: number | null
  quickRatio: number | null
  cashRatio: number | null

  // Solvency (3)
  debtToEquity: number | null
  debtToAssets: number | null
  interestCoverage: number | null

  // Efficiency (7)
  assetTurnover: number | null
  receivablesTurnover: number | null
  dso: number | null
  inventoryTurnover: number | null
  dio: number | null
  payablesTurnover: number | null
  dpo: number | null

  // Analytical (3)
  cashConversionCycle: number | null
  freeCashFlow: number | null
  dupont: {
    netMargin: number | null
    assetTurnover: number | null
    equityMultiplier: number | null
  }
}

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Safe division: returns null when the denominator is 0, null, or undefined.
 */
function safeDiv(numerator: number | null, denominator: number | null | undefined): number | null {
  if (denominator === null || denominator === undefined || denominator === 0) return null
  if (numerator === null) return null
  return numerator / denominator
}

/**
 * Finds a balance by account name from an AccountLine array.
 * Returns 0 if the account is not found.
 */
function findBalance(
  lines: { name: string; balance: number }[],
  name: string,
): number {
  const match = lines.find(l => l.name === name)
  return match ? match.balance : 0
}

/**
 * Finds a balance by a partial, case-insensitive match on account name.
 * Returns 0 if no match is found.
 */
function findBalanceIncludes(
  lines: { name: string; balance: number }[],
  substring: string,
): number {
  const lower = substring.toLowerCase()
  const match = lines.find(l => l.name.toLowerCase().includes(lower))
  return match ? match.balance : 0
}

// ── Main Calculator ─────────────────────────────────────────────────

export function calculateRatios(
  bs: BalanceSheet,
  is: IncomeStatement,
  cf?: CashFlowStatement,
): FinancialRatios {
  // ── Extract key balances from arrays ──

  const cash = findBalance(bs.currentAssets, 'Cash')
  const accountsReceivable = findBalance(bs.currentAssets, 'Accounts Receivable')
  const inventory = findBalance(bs.currentAssets, 'Inventory')
  const accountsPayable = findBalance(bs.currentLiabilities, 'Accounts Payable')
  const interestExpense = findBalance(is.otherExpenses, 'Interest Expense')

  // Depreciation and amortization from operating expenses
  const depreciation = findBalanceIncludes(is.operatingExpenses, 'depreciation')
  const amortization = findBalanceIncludes(is.operatingExpenses, 'amortisation')
    || findBalanceIncludes(is.operatingExpenses, 'amortization')

  // ── Profitability Ratios ──

  // Bug B1 fix: EBITDA = operatingIncome + depreciation + amortization
  const ebitda = is.operatingIncome + depreciation + amortization

  const grossProfitMargin = safeDiv(is.grossProfit, is.totalRevenue)
  const operatingMargin = safeDiv(is.operatingIncome, is.totalRevenue)
  const ebitdaMargin = safeDiv(ebitda, is.totalRevenue)
  const netProfitMargin = safeDiv(is.netIncome, is.totalRevenue)
  const roa = safeDiv(is.netIncome, bs.totalAssets)
  const roe = safeDiv(is.netIncome, bs.totalEquity)

  // ROIC = NOPAT / Invested Capital
  const taxRate = is.incomeBeforeTax !== 0
    ? is.taxExpense / is.incomeBeforeTax
    : 0
  const nopat = is.operatingIncome * (1 - taxRate)
  const investedCapital = bs.totalEquity + bs.totalLiabilities - cash
  const roic = safeDiv(nopat, investedCapital)

  // ── Liquidity Ratios ──

  const currentRatio = safeDiv(bs.totalCurrentAssets, bs.totalCurrentLiabilities)
  const quickRatio = safeDiv(bs.totalCurrentAssets - inventory, bs.totalCurrentLiabilities)
  const cashRatio = safeDiv(cash, bs.totalCurrentLiabilities)

  // ── Solvency Ratios ──

  const debtToEquity = safeDiv(bs.totalLiabilities, bs.totalEquity)
  const debtToAssets = safeDiv(bs.totalLiabilities, bs.totalAssets)
  const interestCoverage = safeDiv(is.operatingIncome, interestExpense)

  // ── Efficiency Ratios ──

  const assetTurnover = safeDiv(is.totalRevenue, bs.totalAssets)
  const receivablesTurnover = safeDiv(is.totalRevenue, accountsReceivable)
  const dso = safeDiv(365, receivablesTurnover)
  const inventoryTurnover = safeDiv(is.totalCOGS, inventory)
  const dio = safeDiv(365, inventoryTurnover)
  const payablesTurnover = safeDiv(is.totalCOGS, accountsPayable)
  const dpo = safeDiv(365, payablesTurnover)

  // ── Analytical Ratios ──

  // Cash Conversion Cycle = DSO + DIO - DPO
  const cashConversionCycle =
    dso !== null && dio !== null && dpo !== null
      ? dso + dio - dpo
      : null

  // Free Cash Flow = totalOperating - |totalInvesting| (capex approximation)
  const freeCashFlow = cf
    ? cf.totalOperating - Math.abs(cf.totalInvesting)
    : null

  // DuPont decomposition: ROE = netMargin * assetTurnover * equityMultiplier
  const dupontNetMargin = safeDiv(is.netIncome, is.totalRevenue)
  const dupontAssetTurnover = safeDiv(is.totalRevenue, bs.totalAssets)
  const dupontEquityMultiplier = safeDiv(bs.totalAssets, bs.totalEquity)

  return {
    // Profitability
    grossProfitMargin,
    operatingMargin,
    ebitda,
    ebitdaMargin,
    netProfitMargin,
    roa,
    roe,
    roic,

    // Liquidity
    currentRatio,
    quickRatio,
    cashRatio,

    // Solvency
    debtToEquity,
    debtToAssets,
    interestCoverage,

    // Efficiency
    assetTurnover,
    receivablesTurnover,
    dso,
    inventoryTurnover,
    dio,
    payablesTurnover,
    dpo,

    // Analytical
    cashConversionCycle,
    freeCashFlow,
    dupont: {
      netMargin: dupontNetMargin,
      assetTurnover: dupontAssetTurnover,
      equityMultiplier: dupontEquityMultiplier,
    },
  }
}
