/**
 * M&A Analysis Engine
 *
 * Pure computation functions extracted from the monolith for:
 *   - Merger accretion/dilution analysis
 *   - Financial health metrics
 *   - Discounted Cash Flow (DCF) valuation
 *   - Comparable company analysis
 *
 * Bug B2 fix: Uses explicit `netIncome` field instead of deriving income
 *             from Retained Earnings (which is a cumulative balance, not annual income).
 *
 * Bug B4 fix: Uses explicit `currentLiabilities` instead of the 40% heuristic
 *             (monolith line 8730: `totalLiabilities * 0.4`).
 */

import type { SampleCompany } from '../data/sampleCompanies'
import type { AccountDefinition } from '../data/chartOfAccounts'

// ── Types ────────────────────────────────────────────────────────────

export interface MACompanyInput {
  name: string
  sharePrice: number
  sharesOut: number
  netIncome: number          // BUG B2 FIX: explicit, not derived from RE
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  currentAssets: number      // BUG B4 FIX: explicit
  currentLiabilities: number // BUG B4 FIX: explicit, not 40% heuristic
  cash: number
  inventory: number
  accountsReceivable: number
  longTermDebt: number
  revenue: number
  cogs: number
  operatingIncome: number
  ebitda: number
  interestExpense: number
  freeCashFlow: number
  grossProfit: number
}

export interface MADealInput {
  premiumPct: number   // e.g. 30 for 30%
  cashPct: number      // e.g. 50 for 50%
  stockPct: number     // e.g. 30
  debtPct: number      // e.g. 20
  debtRate: number     // e.g. 5 for 5%
  taxRate: number      // e.g. 0.25 for 25%
  synergies: number    // dollar amount
}

export interface MAResult {
  offerPrice: number
  purchasePrice: number
  cashUsed: number
  stockUsed: number
  debtUsed: number
  newShares: number
  newInterest: number
  goodwill: number
  taxRate: number
  taxShield: number
  afterTaxInterest: number
  acquirerEPS: number
  combinedNetIncome: number
  combinedShares: number
  combinedEPS: number
  accretionPct: number
  isAccretive: boolean
  breakEvenSynergies: number
  proFormaPE: number | null
  combinedAssets: number
  combinedLiabilities: number
  combinedEquity: number
  acquirerNetIncome: number
  targetNetIncome: number
  synergies: number
  acquirerShares: number
}

export interface DCFInput {
  baseFCF: number
  growthRate: number     // e.g. 0.08 for 8%
  wacc: number           // e.g. 0.10 for 10%
  terminalGrowth: number // e.g. 0.025 for 2.5%
  years?: number         // default 5
  sharesOutstanding: number
  longTermDebt: number
  cash: number
}

export interface DCFResult {
  projections: { year: number; fcf: number; pvFactor: number; pv: number }[]
  pvOfCashFlows: number
  terminalValue: number
  pvTerminal: number
  enterpriseValue: number
  equityValue: number
  impliedSharePrice: number
}

export interface CompInput {
  name: string
  stockPrice: number
  sharesOutstanding: number
  balances: Record<string, number>
}

export interface CompResult {
  name: string
  industry: string
  pe: number | null
  evEbitda: number | null
  evRev: number | null
  pBook: number | null
}

export interface CompsAnalysis {
  comps: CompResult[]
  medianPE: number | null
  medianEVEbitda: number | null
  medianEVRevenue: number | null
  medianPBook: number | null
}

export interface HealthMetrics {
  profitability: {
    grossMargin: number | null
    operatingMargin: number | null
    netMargin: number | null
    roe: number | null
    roa: number | null
  }
  leverage: {
    debtToEquity: number | null
    debtToAssets: number | null
    longTermDebtToEquity: number | null
    interestCoverage: number | null
  }
  liquidity: {
    currentRatio: number | null    // BUG B4 FIX: uses actual currentLiabilities
    quickRatio: number | null      // BUG B4 FIX: uses actual currentLiabilities
    cashRatio: number | null       // BUG B4 FIX: uses actual currentLiabilities
  }
  efficiency: {
    assetTurnover: number | null
    equityTurnover: number | null
  }
}

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Safe division: returns null when the denominator is 0, null, or undefined.
 */
function safeDiv(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null
  return numerator / denominator
}

/**
 * Financing mix must sum to 100%.
 */
export function isFinancingMixValid(
  deal: Pick<MADealInput, 'cashPct' | 'stockPct' | 'debtPct'>,
): boolean {
  const mixSum = deal.cashPct + deal.stockPct + deal.debtPct
  return Number.isFinite(mixSum) && Math.abs(mixSum - 100) < 0.01
}

/**
 * Computes the median of a numeric array. Filters out null, NaN, non-positive
 * values. Uses floor-index median matching monolith line 8961.
 */
function median(arr: (number | null)[]): number | null {
  const sorted = arr
    .filter((v): v is number => v !== null && isFinite(v) && v > 0)
    .sort((a, b) => a - b)
  return sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : null
}

// ── Core Functions ───────────────────────────────────────────────────

/**
 * Compute M&A accretion/dilution analysis.
 *
 * Faithfully extracted from monolith lines 9536-9584.
 * BUG B2 FIX: uses explicit `netIncome` from MACompanyInput
 * (not derived from Retained Earnings).
 */
export function computeMA(
  acquirer: MACompanyInput,
  target: MACompanyInput,
  deal: MADealInput,
): MAResult | null {
  if (
    !acquirer.sharePrice || !acquirer.sharesOut ||
    !target.sharePrice || !target.sharesOut
  ) {
    return null
  }

  if (!isFinancingMixValid(deal)) {
    return null
  }

  const offerPrice = target.sharePrice * (1 + deal.premiumPct / 100)
  const purchasePrice = offerPrice * target.sharesOut
  const cashUsed = purchasePrice * deal.cashPct / 100
  const stockUsed = purchasePrice * deal.stockPct / 100
  const debtUsed = purchasePrice * deal.debtPct / 100
  const newShares = acquirer.sharePrice > 0 ? stockUsed / acquirer.sharePrice : 0
  const newInterest = debtUsed * deal.debtRate / 100
  const goodwill = Math.max(0, purchasePrice - target.totalEquity)

  // BUG B2 FIX: uses explicit netIncome, not retained earnings
  const acquirerEPS = acquirer.sharesOut > 0 ? acquirer.netIncome / acquirer.sharesOut : 0
  const combinedNetIncome =
    acquirer.netIncome + target.netIncome + deal.synergies - newInterest * (1 - deal.taxRate)
  const combinedShares = acquirer.sharesOut + newShares
  const combinedEPS = combinedShares > 0 ? combinedNetIncome / combinedShares : 0
  const accretionPct = acquirerEPS !== 0
    ? (combinedEPS - acquirerEPS) / Math.abs(acquirerEPS) * 100
    : 0
  const isAccretive = accretionPct > 0

  // Break-even synergies
  const breakEvenSynergies = Math.max(
    0,
    acquirerEPS * combinedShares - acquirer.netIncome - target.netIncome + newInterest * (1 - deal.taxRate),
  )

  const proFormaPE = combinedEPS > 0 ? acquirer.sharePrice / combinedEPS : null

  const taxShield = newInterest * deal.taxRate
  const afterTaxInterest = newInterest - taxShield

  return {
    offerPrice,
    purchasePrice,
    cashUsed,
    stockUsed,
    debtUsed,
    newShares,
    newInterest,
    goodwill,
    taxRate: deal.taxRate,
    taxShield,
    afterTaxInterest,
    acquirerEPS,
    combinedNetIncome,
    combinedShares,
    combinedEPS,
    accretionPct,
    isAccretive,
    breakEvenSynergies,
    proFormaPE,
    // Pro-forma balance sheet
    combinedAssets: acquirer.totalAssets + target.totalAssets - cashUsed + goodwill,
    combinedLiabilities: acquirer.totalLiabilities + target.totalLiabilities + debtUsed,
    combinedEquity: acquirer.totalEquity + stockUsed,
    // Input pass-through for rendering
    acquirerNetIncome: acquirer.netIncome,
    targetNetIncome: target.netIncome,
    synergies: deal.synergies,
    acquirerShares: acquirer.sharesOut,
  }
}

/**
 * Compute financial health metrics for a company.
 *
 * Extracted from monolith lines 8723-8760 (renderHealthDashboard).
 * BUG B4 FIX: uses actual `currentLiabilities` from input
 * instead of the 40% heuristic (`totalLiabilities * 0.4`).
 */
export function computeHealthMetrics(company: MACompanyInput): HealthMetrics {
  const rev = company.revenue
  const assets = company.totalAssets
  const equity = company.totalEquity
  const currentLiab = company.currentLiabilities // BUG B4 FIX

  return {
    profitability: {
      grossMargin: safeDiv(company.grossProfit, rev),
      operatingMargin: safeDiv(company.operatingIncome, rev),
      netMargin: safeDiv(company.netIncome, rev),
      roe: safeDiv(company.netIncome, equity),
      roa: safeDiv(company.netIncome, assets),
    },
    leverage: {
      debtToEquity: safeDiv(company.totalLiabilities, equity),
      debtToAssets: safeDiv(company.totalLiabilities, assets),
      longTermDebtToEquity: safeDiv(company.longTermDebt, equity),
      interestCoverage: safeDiv(company.operatingIncome, company.interestExpense),
    },
    liquidity: {
      currentRatio: safeDiv(company.currentAssets, currentLiab),
      quickRatio: safeDiv(company.currentAssets - company.inventory, currentLiab),
      cashRatio: safeDiv(company.cash, currentLiab),
    },
    efficiency: {
      assetTurnover: safeDiv(rev, assets),
      equityTurnover: safeDiv(rev, equity),
    },
  }
}

/**
 * Compute a 5-year (default) Discounted Cash Flow valuation model.
 *
 * Extracted from monolith lines 8802-8864 (renderDCFModel computation).
 * Returns null if wacc <= terminalGrowth (invalid).
 */
export function computeDCF(input: DCFInput): DCFResult | null {
  const { baseFCF, growthRate, wacc, terminalGrowth, sharesOutstanding, longTermDebt, cash } = input
  const years = input.years ?? 5

  if (wacc <= terminalGrowth) {
    return null
  }

  const projections: DCFResult['projections'] = []
  let pvSum = 0
  let lastFCF = baseFCF

  for (let y = 1; y <= years; y++) {
    lastFCF = y === 1 ? baseFCF * (1 + growthRate) : lastFCF * (1 + growthRate)
    const pvFactor = 1 / Math.pow(1 + wacc, y)
    const pv = lastFCF * pvFactor
    pvSum += pv
    projections.push({ year: y, fcf: lastFCF, pvFactor, pv })
  }

  const terminalValue = (lastFCF * (1 + terminalGrowth)) / (wacc - terminalGrowth)
  const pvTerminal = terminalValue / Math.pow(1 + wacc, years)
  const enterpriseValue = pvSum + pvTerminal
  const equityValue = enterpriseValue - longTermDebt + cash
  const impliedSharePrice = sharesOutstanding > 0 ? equityValue / sharesOutstanding : 0

  return {
    projections,
    pvOfCashFlows: pvSum,
    terminalValue,
    pvTerminal,
    enterpriseValue,
    equityValue,
    impliedSharePrice,
  }
}

/**
 * Compute comparable company analysis.
 *
 * Extracted from monolith lines 8905-8998 (renderCompsAnalysis).
 * Filters out the subject company, computes multiples for each comp,
 * and calculates medians using the monolith's floor-index median.
 */
export function computeComps(subject: CompInput, allCompanies: CompInput[]): CompsAnalysis {
  // Filter out the subject and companies with very small share counts (< 100)
  const comps: CompResult[] = allCompanies
    .filter(c => c.name !== subject.name && c.sharesOutstanding > 100)
    .map(c => {
      const b = c.balances || {}
      const mc = (c.stockPrice || 0) * (c.sharesOutstanding || 0)
      const longTermDebt =
        (b['Notes Payable - Long Term'] || 0) +
        (b['Bonds Payable'] || 0) +
        (b['Lease Liability'] || 0)
      const cashVal = b['Cash'] || 0
      const cEV = mc + longTermDebt - cashVal

      // Compute revenue and income from verbose account names
      const revenue = b['Sales Revenue'] || 0
      const cogs = b['Cost of Goods Sold'] || 0
      const salariesExp = b['Salaries Expense'] || 0
      const depreciationExp = b['Depreciation Expense'] || 0
      const taxExp = b['Tax Expense'] || 0
      const operatingIncome = revenue > 0
        ? revenue - cogs - salariesExp - depreciationExp
        : 0
      const ebitda = operatingIncome + depreciationExp
      const interestExp = b['Interest Expense'] || 0
      const netIncome = revenue > 0
        ? revenue - cogs - salariesExp - depreciationExp - interestExp - taxExp
        : 0

      // Equity from verbose account names
      const commonStock = b['Common Stock'] || 0
      const sharePremium = b['Share Premium'] || 0
      const retainedEarnings = b['Retained Earnings'] || 0
      const bookEquity = commonStock + sharePremium + retainedEarnings

      return {
        name: c.name,
        industry: '',
        pe: netIncome > 0 ? mc / netIncome : null,
        evEbitda: ebitda > 0 ? cEV / ebitda : null,
        evRev: revenue > 0 ? cEV / revenue : null,
        pBook: bookEquity > 0 ? mc / bookEquity : null,
      }
    })

  return {
    comps,
    medianPE: median(comps.map(c => c.pe)),
    medianEVEbitda: median(comps.map(c => c.evEbitda)),
    medianEVRevenue: median(comps.map(c => c.evRev)),
    medianPBook: median(comps.map(c => c.pBook)),
  }
}

/**
 * Convert a SampleCompany into an MACompanyInput by computing derived fields
 * from the balances map and the chart of accounts.
 *
 * BUG B4 FIX: Computes actual current liabilities by summing Liability
 * accounts with `subtype: 'current'`, instead of using the 40% heuristic.
 *
 * BUG B2 note: `netIncome` is computed from revenue - expenses in the
 * balances map. Callers using this for real M&A analysis should supply
 * an explicit netIncome if the balances do not include income statement data.
 */
export function buildMACompanyInput(
  company: SampleCompany,
  chartOfAccounts: AccountDefinition[],
): MACompanyInput {
  const b = company.balances

  // Build a lookup map from account name to definition
  const acctDef = new Map<string, AccountDefinition>()
  for (const def of chartOfAccounts) {
    acctDef.set(def.name, def)
  }

  // Accumulate totals by walking balances
  let totalAssets = 0
  let totalLiabilities = 0
  let totalEquity = 0
  let currentAssets = 0
  let currentLiabilities = 0 // BUG B4 FIX: compute actual current liabilities
  let cash = 0
  let inventory = 0
  let accountsReceivable = 0
  let longTermDebt = 0
  let revenue = 0
  let cogs = 0
  let totalExpenses = 0
  let salariesExpense = 0
  let depreciationExpense = 0
  let interestExpense = 0

  for (const [name, value] of Object.entries(b)) {
    const def = acctDef.get(name)
    if (!def) continue

    switch (def.type) {
      case 'Asset': {
        // Contra assets have negative values in the balances map already
        totalAssets += value
        if (def.subtype === 'current') {
          currentAssets += value
        }
        // Specific accounts
        if (name === 'Cash') cash = value
        if (name === 'Inventory') inventory = value
        if (name === 'Accounts Receivable') accountsReceivable = value
        break
      }
      case 'Liability': {
        totalLiabilities += value
        if (def.subtype === 'current') {
          currentLiabilities += value // BUG B4 FIX
        }
        // Long-term debt components
        if (
          name === 'Notes Payable - Long Term' ||
          name === 'Bonds Payable' ||
          name === 'Lease Liability'
        ) {
          longTermDebt += value
        }
        break
      }
      case 'Equity': {
        // Contra equity (like Treasury Stock, Dividends Declared) already negative
        totalEquity += value
        break
      }
      case 'Revenue': {
        revenue += value
        break
      }
      case 'Expense': {
        totalExpenses += value
        if (def.subtype === 'cogs') cogs += value
        if (name === 'Salaries Expense') salariesExpense = value
        if (name === 'Depreciation Expense') depreciationExpense = value
        if (name === 'Interest Expense') interestExpense = value
        // Tax Expense is included in totalExpenses
        break
      }
    }
  }

  const grossProfit = revenue - cogs
  const operatingIncome = revenue > 0
    ? revenue - cogs - salariesExpense - depreciationExpense
    : 0
  const ebitda = operatingIncome + depreciationExpense
  const netIncome = revenue > 0
    ? revenue - totalExpenses
    : 0
  // Approximate free cash flow as net income + depreciation - capex (no capex in balances)
  const freeCashFlow = netIncome + depreciationExpense

  return {
    name: company.name,
    sharePrice: company.stockPrice,
    sharesOut: company.sharesOutstanding,
    netIncome,
    totalAssets,
    totalLiabilities,
    totalEquity,
    currentAssets,
    currentLiabilities,
    cash,
    inventory,
    accountsReceivable,
    longTermDebt,
    revenue,
    cogs,
    operatingIncome,
    ebitda,
    interestExpense,
    freeCashFlow,
    grossProfit,
  }
}
