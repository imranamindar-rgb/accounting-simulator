/**
 * XBRL Tag Mapping
 *
 * Maps semantic financial statement keys to ordered fallback chains of
 * XBRL taxonomy tags. Used by the Live Company Analyzer to resolve
 * real SEC EDGAR XBRL data into the app's BalanceSheet / IncomeStatement types.
 */

import type { BalanceSheet, IncomeStatement, AccountLine } from '../engines/types'
import type { CompanyFacts, XBRLUnit } from '../engines/secClient'
import { extractAnnualValue } from '../engines/secClient'

// ── TAG_MAP ──────────────────────────────────────────────────────────

/**
 * Maps each semantic key to an ordered list of XBRL tags to try.
 * The first tag that has data wins (fallback chain).
 */
export const TAG_MAP: Record<string, string[]> = {
  // Balance Sheet — Assets
  totalAssets: ['Assets'],
  totalCurrentAssets: ['AssetsCurrent'],
  totalNoncurrentAssets: ['AssetsNoncurrent'],
  cash: ['CashAndCashEquivalentsAtCarryingValue', 'Cash'],
  accountsReceivable: ['AccountsReceivableNetCurrent', 'AccountsReceivableNet'],
  inventory: ['InventoryNet', 'InventoryFinishedGoods'],
  goodwill: ['Goodwill'],

  // Balance Sheet — Liabilities
  totalLiabilities: ['Liabilities'],
  totalCurrentLiabilities: ['LiabilitiesCurrent'],
  totalNoncurrentLiabilities: ['LiabilitiesNoncurrent'],
  accountsPayable: ['AccountsPayableCurrent', 'AccountsPayable'],
  longTermDebt: ['LongTermDebt', 'LongTermDebtNoncurrent'],

  // Balance Sheet — Equity
  totalEquity: [
    'StockholdersEquity',
    'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest',
  ],
  retainedEarnings: ['RetainedEarningsAccumulatedDeficit'],

  // Income Statement
  totalRevenue: [
    'Revenues',
    'RevenueFromContractWithCustomerExcludingAssessedTax',
    'SalesRevenueNet',
  ],
  totalCOGS: ['CostOfGoodsSold', 'CostOfGoodsSoldAndServicesCost', 'CostOfRevenue'],
  grossProfit: ['GrossProfit'],
  operatingExpenses: ['OperatingExpenses'],
  operatingIncome: ['OperatingIncomeLoss'],
  interestExpense: ['InterestExpense'],
  taxExpense: ['IncomeTaxExpenseBenefit'],
  netIncome: ['NetIncomeLoss', 'ProfitLoss'],
  depreciation: ['DepreciationDepletionAndAmortization', 'DepreciationAndAmortization'],

  // Shares
  sharesOutstanding: ['CommonStockSharesOutstanding', 'EntityCommonStockSharesOutstanding'],
}

// ── resolve ──────────────────────────────────────────────────────────

/**
 * Iterates the fallback chain for the given semantic key and returns the
 * most recent annual (10-K) value, or null if none is found.
 *
 * For share counts, checks `shares` units; otherwise checks `USD` units.
 */
export function resolve(facts: CompanyFacts, key: string): number | null {
  const chain = TAG_MAP[key]
  if (!chain) return null

  const usGaap = facts.facts['us-gaap']
  if (!usGaap) return null

  const isShares = key === 'sharesOutstanding'

  for (const tag of chain) {
    const concept = usGaap[tag]
    if (!concept) continue

    let units: XBRLUnit[] | undefined
    if (isShares) {
      units = concept.units.shares
    } else {
      units = concept.units.USD
    }

    if (!units || units.length === 0) continue

    const val = extractAnnualValue(units)
    if (val !== null) return val
  }

  return null
}

// ── buildStatementsFromFacts ─────────────────────────────────────────

/**
 * Resolves all XBRL tags and builds BalanceSheet and IncomeStatement
 * objects compatible with the app's engine types.
 *
 * Non-zero single-value items are placed into the appropriate line arrays.
 * Derived totals (grossProfit, operatingIncome) are computed when not directly available.
 */
export function buildStatementsFromFacts(
  facts: CompanyFacts,
): { bs: BalanceSheet; is: IncomeStatement } {
  // ── Resolve all raw values ──
  const r = (key: string): number => resolve(facts, key) ?? 0

  // Balance Sheet values
  const totalAssets = r('totalAssets')
  const totalCurrentAssets = r('totalCurrentAssets')
  const totalNoncurrentAssets = r('totalNoncurrentAssets')
  const totalLiabilities = r('totalLiabilities')
  const totalCurrentLiabilities = r('totalCurrentLiabilities')
  const totalNoncurrentLiabilities = r('totalNoncurrentLiabilities')
  const totalEquity = r('totalEquity')

  const cash = r('cash')
  const accountsReceivable = r('accountsReceivable')
  const inventory = r('inventory')
  const goodwill = r('goodwill')
  const accountsPayable = r('accountsPayable')
  const longTermDebt = r('longTermDebt')
  const retainedEarnings = r('retainedEarnings')

  // Income Statement values
  const totalRevenue = r('totalRevenue')
  const totalCOGS = r('totalCOGS')
  const operatingExpenses = r('operatingExpenses')
  const operatingIncomeRaw = r('operatingIncome')
  const interestExpense = r('interestExpense')
  const taxExpense = r('taxExpense')
  const netIncome = r('netIncome')
  const depreciation = r('depreciation')
  const grossProfitRaw = r('grossProfit')

  // Derive grossProfit and operatingIncome when not directly available
  const grossProfit = grossProfitRaw !== 0 ? grossProfitRaw : totalRevenue - totalCOGS
  const operatingIncome =
    operatingIncomeRaw !== 0 ? operatingIncomeRaw : grossProfit - operatingExpenses

  // ── Helpers ──

  function line(name: string, balance: number): AccountLine {
    return { name, balance }
  }

  function nonZero(name: string, balance: number): AccountLine[] {
    return balance !== 0 ? [line(name, balance)] : []
  }

  // ── Build BalanceSheet ──

  const currentAssets: AccountLine[] = [
    ...nonZero('Cash and Cash Equivalents', cash),
    ...nonZero('Accounts Receivable', accountsReceivable),
    ...nonZero('Inventory', inventory),
  ]

  const noncurrentAssets: AccountLine[] = [
    ...nonZero('Goodwill', goodwill),
  ]

  const currentLiabilities: AccountLine[] = [
    ...nonZero('Accounts Payable', accountsPayable),
  ]

  const noncurrentLiabilities: AccountLine[] = [
    ...nonZero('Long-Term Debt', longTermDebt),
  ]

  const equity: AccountLine[] = [
    ...nonZero('Retained Earnings', retainedEarnings),
  ]

  const bs: BalanceSheet = {
    currentAssets,
    noncurrentAssets,
    totalCurrentAssets,
    totalNoncurrentAssets,
    totalAssets,
    currentLiabilities,
    noncurrentLiabilities,
    totalCurrentLiabilities,
    totalNoncurrentLiabilities,
    totalLiabilities,
    equity,
    totalEquity,
    totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
    isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1,
  }

  // ── Build IncomeStatement ──

  const revenue: AccountLine[] = [
    ...nonZero('Revenue', totalRevenue),
  ]

  const cogs: AccountLine[] = [
    ...nonZero('Cost of Goods Sold', totalCOGS),
  ]

  const opExpenses: AccountLine[] = [
    ...nonZero('Operating Expenses', operatingExpenses),
    ...nonZero('Depreciation and Amortization', depreciation),
  ]

  const otherExpenses: AccountLine[] = [
    ...nonZero('Interest Expense', interestExpense),
  ]

  const totalOperatingExpenses = operatingExpenses + depreciation
  const incomeBeforeTax = operatingIncome - interestExpense
  const eps = 0 // shares data not linked here — consumer can compute separately

  const is: IncomeStatement = {
    revenue,
    totalRevenue,
    cogs,
    totalCOGS,
    grossProfit,
    operatingExpenses: opExpenses,
    totalOperatingExpenses,
    operatingIncome,
    otherRevenue: [],
    otherExpenses,
    totalOther: -interestExpense,
    incomeBeforeTax,
    taxExpense,
    netIncome,
    eps,
  }

  return { bs, is }
}
