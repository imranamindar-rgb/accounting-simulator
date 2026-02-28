import { describe, it, expect } from 'vitest'
import {
  computeMA,
  computeHealthMetrics,
  computeDCF,
  computeComps,
  isFinancingMixValid,
  buildMACompanyInput,
} from '../MAEngine'
import type { MACompanyInput, MADealInput, DCFInput, CompInput } from '../MAEngine'
import { SAMPLE_COMPANIES } from '../../data/sampleCompanies'
import { CHART_OF_ACCOUNTS } from '../../data/chartOfAccounts'

// ── Test Helpers ─────────────────────────────────────────────────────

/** Create a default MACompanyInput with overrides */
function makeCompanyInput(overrides: Partial<MACompanyInput> = {}): MACompanyInput {
  return {
    name: 'TestCo',
    sharePrice: 100,
    sharesOut: 1000,
    netIncome: 50000,
    totalAssets: 500000,
    totalLiabilities: 200000,
    totalEquity: 300000,
    currentAssets: 100000,
    currentLiabilities: 50000,
    cash: 40000,
    inventory: 20000,
    accountsReceivable: 30000,
    longTermDebt: 150000,
    revenue: 300000,
    cogs: 150000,
    operatingIncome: 80000,
    ebitda: 100000,
    interestExpense: 10000,
    freeCashFlow: 60000,
    grossProfit: 150000,
    ...overrides,
  }
}

/** Create a default MADealInput with overrides */
function makeDealInput(overrides: Partial<MADealInput> = {}): MADealInput {
  return {
    premiumPct: 20,
    cashPct: 50,
    stockPct: 30,
    debtPct: 20,
    debtRate: 5,
    taxRate: 0.25,
    synergies: 5000,
    ...overrides,
  }
}

// ── computeMA ────────────────────────────────────────────────────────

describe('computeMA', () => {
  const acquirer: MACompanyInput = {
    name: 'BigCo',
    sharePrice: 100,
    sharesOut: 1000,
    netIncome: 50000,
    totalAssets: 500000,
    totalLiabilities: 200000,
    totalEquity: 300000,
    currentAssets: 100000,
    currentLiabilities: 50000,
    cash: 40000,
    inventory: 20000,
    accountsReceivable: 30000,
    longTermDebt: 150000,
    revenue: 300000,
    cogs: 150000,
    operatingIncome: 80000,
    ebitda: 100000,
    interestExpense: 10000,
    freeCashFlow: 60000,
    grossProfit: 150000,
  }

  const target: MACompanyInput = {
    name: 'SmallCo',
    sharePrice: 50,
    sharesOut: 200,
    netIncome: 10000,
    totalAssets: 100000,
    totalLiabilities: 40000,
    totalEquity: 60000,
    currentAssets: 30000,
    currentLiabilities: 15000,
    cash: 10000,
    inventory: 8000,
    accountsReceivable: 10000,
    longTermDebt: 25000,
    revenue: 80000,
    cogs: 40000,
    operatingIncome: 20000,
    ebitda: 25000,
    interestExpense: 2000,
    freeCashFlow: 15000,
    grossProfit: 40000,
  }

  const deal: MADealInput = {
    premiumPct: 20,
    cashPct: 50,
    stockPct: 30,
    debtPct: 20,
    debtRate: 5,
    taxRate: 0.25,
    synergies: 5000,
  }

  it('computes basic merger arithmetic', () => {
    const result = computeMA(acquirer, target, deal)!
    expect(result).not.toBeNull()
    // offer = 50 * 1.2 = 60
    expect(result.offerPrice).toBe(60)
    // purchasePrice = 60 * 200 = 12000
    expect(result.purchasePrice).toBe(12000)
    // goodwill = max(0, 12000 - 60000) = 0 (purchase < equity)
    expect(result.goodwill).toBe(0)
  })

  it('computes cash/stock/debt split correctly', () => {
    const result = computeMA(acquirer, target, deal)!
    // cashUsed = 12000 * 0.50 = 6000
    expect(result.cashUsed).toBe(6000)
    // stockUsed = 12000 * 0.30 = 3600
    expect(result.stockUsed).toBe(3600)
    // debtUsed = 12000 * 0.20 = 2400
    expect(result.debtUsed).toBe(2400)
  })

  it('computes new shares issued for stock consideration', () => {
    const result = computeMA(acquirer, target, deal)!
    // newShares = stockUsed / acquirer.sharePrice = 3600 / 100 = 36
    expect(result.newShares).toBe(36)
  })

  it('computes new interest expense on deal debt', () => {
    const result = computeMA(acquirer, target, deal)!
    // newInterest = debtUsed * debtRate / 100 = 2400 * 5 / 100 = 120
    expect(result.newInterest).toBe(120)
  })

  it('computes tax shield and after-tax interest', () => {
    const result = computeMA(acquirer, target, deal)!
    // taxShield = 120 * 0.25 = 30
    expect(result.taxShield).toBe(30)
    // afterTaxInterest = 120 - 30 = 90
    expect(result.afterTaxInterest).toBe(90)
  })

  it('computes accretion/dilution correctly', () => {
    const result = computeMA(acquirer, target, deal)!
    // acquirerEPS = 50000 / 1000 = 50
    expect(result.acquirerEPS).toBe(50)
    // combinedShares = 1000 + 36 = 1036
    expect(result.combinedShares).toBe(1036)
    // combinedNI = 50000 + 10000 + 5000 - 120*(1-0.25) = 65000 - 90 = 64910
    expect(result.combinedNetIncome).toBe(64910)
    // combinedEPS = 64910 / 1036 ~= 62.654
    expect(result.combinedEPS).toBeCloseTo(64910 / 1036, 2)
    // accretive since combinedEPS > acquirerEPS
    expect(result.isAccretive).toBe(true)
    expect(result.accretionPct).toBeGreaterThan(0)
  })

  it('computes break-even synergies', () => {
    const result = computeMA(acquirer, target, deal)!
    // breakEven = max(0, acquirerEPS * combinedShares - acqNI - tgtNI + newInterest*(1-taxRate))
    // = max(0, 50 * 1036 - 50000 - 10000 + 120 * 0.75)
    // = max(0, 51800 - 60000 + 90) = max(0, -8110) = 0
    expect(result.breakEvenSynergies).toBe(0)
  })

  it('computes pro-forma balance sheet', () => {
    const result = computeMA(acquirer, target, deal)!
    // combinedAssets = 500000 + 100000 - 6000 + 0(goodwill) = 594000
    expect(result.combinedAssets).toBe(594000)
    // combinedLiabilities = 200000 + 40000 + 2400 = 242400
    expect(result.combinedLiabilities).toBe(242400)
    // combinedEquity = 300000 + 3600 = 303600
    expect(result.combinedEquity).toBe(303600)
  })

  it('produces goodwill when purchase price exceeds equity', () => {
    // High premium to make purchasePrice > targetEquity
    const highPremium = makeDealInput({ premiumPct: 300 })
    const tgt = makeCompanyInput({
      name: 'SmallTarget',
      sharePrice: 50,
      sharesOut: 200,
      netIncome: 5000,
      totalEquity: 10000,
    })
    const result = computeMA(acquirer, tgt, highPremium)!
    // offer = 50 * 4 = 200, purchase = 200 * 200 = 40000
    // goodwill = max(0, 40000 - 10000) = 30000
    expect(result.offerPrice).toBe(200)
    expect(result.purchasePrice).toBe(40000)
    expect(result.goodwill).toBe(30000)
  })

  it('uses explicit netIncome, not retained earnings (bug B2 fix)', () => {
    // netIncome is different from what retained earnings would imply
    const acq = makeCompanyInput({ netIncome: 50000 })
    const tgt = makeCompanyInput({
      name: 'Target',
      sharePrice: 50,
      sharesOut: 200,
      netIncome: 10000,
    })
    const d = makeDealInput({})
    const result = computeMA(acq, tgt, d)!
    // combinedNetIncome should use netIncome fields directly
    expect(result.acquirerNetIncome).toBe(50000)
    expect(result.targetNetIncome).toBe(10000)
    // verify combined net income incorporates explicit netIncome
    expect(result.combinedNetIncome).toBeGreaterThan(50000 + 10000 - 1000)
  })

  it('returns null when acquirer has no share price', () => {
    const noPrice = makeCompanyInput({ sharePrice: 0 })
    const tgt = makeCompanyInput({ name: 'T', sharePrice: 50, sharesOut: 100 })
    expect(computeMA(noPrice, tgt, makeDealInput())).toBeNull()
  })

  it('returns null when target has no shares outstanding', () => {
    const acq = makeCompanyInput({})
    const noShares = makeCompanyInput({ name: 'T', sharePrice: 50, sharesOut: 0 })
    expect(computeMA(acq, noShares, makeDealInput())).toBeNull()
  })

  it('returns null when financing mix does not sum to 100%', () => {
    const acq = makeCompanyInput({})
    const tgt = makeCompanyInput({ name: 'Target' })
    const invalidDeal = makeDealInput({ cashPct: 50, stockPct: 30, debtPct: 10 })
    expect(computeMA(acq, tgt, invalidDeal)).toBeNull()
  })

  it('handles dilutive deal correctly', () => {
    // Very expensive target with low synergies
    const acq = makeCompanyInput({ netIncome: 50000, sharesOut: 1000, sharePrice: 100 })
    const tgt = makeCompanyInput({
      name: 'Expensive',
      sharePrice: 200,
      sharesOut: 500,
      netIncome: 1000, // tiny income
      totalEquity: 5000,
    })
    const expensiveDeal = makeDealInput({
      premiumPct: 50,
      stockPct: 100,
      cashPct: 0,
      debtPct: 0,
      synergies: 0,
    })
    const result = computeMA(acq, tgt, expensiveDeal)!
    // purchasePrice = 300 * 500 = 150000 all in stock
    // newShares = 150000 / 100 = 1500
    // combinedShares = 1000 + 1500 = 2500
    // combinedNI = 50000 + 1000 + 0 - 0 = 51000
    // combinedEPS = 51000 / 2500 = 20.4
    // acquirerEPS = 50000 / 1000 = 50
    // dilutive
    expect(result.isAccretive).toBe(false)
    expect(result.accretionPct).toBeLessThan(0)
  })

  it('computes pro-forma P/E', () => {
    const result = computeMA(acquirer, target, deal)!
    // proFormaPE = acquirer.sharePrice / combinedEPS
    const expectedPE = 100 / result.combinedEPS
    expect(result.proFormaPE).toBeCloseTo(expectedPE, 4)
  })

  it('returns null proFormaPE when combinedEPS <= 0', () => {
    const acq = makeCompanyInput({ netIncome: -100000 })
    const tgt = makeCompanyInput({
      name: 'T',
      sharePrice: 50,
      sharesOut: 100,
      netIncome: -50000,
    })
    const d = makeDealInput({ synergies: 0 })
    const result = computeMA(acq, tgt, d)!
    expect(result.proFormaPE).toBeNull()
  })
})

describe('isFinancingMixValid', () => {
  it('returns true when financing mix sums to 100%', () => {
    expect(isFinancingMixValid({ cashPct: 50, stockPct: 30, debtPct: 20 })).toBe(true)
  })

  it('returns false when financing mix does not sum to 100%', () => {
    expect(isFinancingMixValid({ cashPct: 50, stockPct: 30, debtPct: 10 })).toBe(false)
  })
})

// ── computeHealthMetrics ─────────────────────────────────────────────

describe('computeHealthMetrics', () => {
  it('uses explicit currentLiabilities, not 40% heuristic (bug B4 fix)', () => {
    const company = makeCompanyInput({
      currentAssets: 100000,
      currentLiabilities: 30000, // actual value, not totalLiab * 0.4
      totalLiabilities: 200000,
    })
    const health = computeHealthMetrics(company)
    // Current ratio should use actual currentLiabilities
    expect(health.liquidity.currentRatio).toBeCloseTo(100000 / 30000)
    // NOT 100000 / (200000 * 0.4) = 100000 / 80000 = 1.25
    expect(health.liquidity.currentRatio).not.toBeCloseTo(100000 / 80000)
  })

  it('computes profitability metrics', () => {
    const company = makeCompanyInput({
      grossProfit: 150000,
      operatingIncome: 80000,
      netIncome: 50000,
      revenue: 300000,
      totalEquity: 300000,
      totalAssets: 500000,
    })
    const health = computeHealthMetrics(company)
    expect(health.profitability.grossMargin).toBeCloseTo(0.5)
    expect(health.profitability.operatingMargin).toBeCloseTo(80000 / 300000)
    expect(health.profitability.netMargin).toBeCloseTo(50000 / 300000)
    expect(health.profitability.roe).toBeCloseTo(50000 / 300000)
    expect(health.profitability.roa).toBeCloseTo(50000 / 500000)
  })

  it('computes leverage metrics', () => {
    const company = makeCompanyInput({
      totalLiabilities: 200000,
      totalEquity: 300000,
      totalAssets: 500000,
      longTermDebt: 150000,
      operatingIncome: 80000,
      interestExpense: 10000,
    })
    const health = computeHealthMetrics(company)
    expect(health.leverage.debtToEquity).toBeCloseTo(200000 / 300000)
    expect(health.leverage.debtToAssets).toBeCloseTo(200000 / 500000)
    expect(health.leverage.longTermDebtToEquity).toBeCloseTo(150000 / 300000)
    expect(health.leverage.interestCoverage).toBeCloseTo(80000 / 10000)
  })

  it('computes liquidity metrics with actual current liabilities', () => {
    const company = makeCompanyInput({
      currentAssets: 100000,
      currentLiabilities: 50000,
      cash: 40000,
      inventory: 20000,
    })
    const health = computeHealthMetrics(company)
    expect(health.liquidity.currentRatio).toBeCloseTo(100000 / 50000)
    expect(health.liquidity.quickRatio).toBeCloseTo((100000 - 20000) / 50000)
    expect(health.liquidity.cashRatio).toBeCloseTo(40000 / 50000)
  })

  it('computes efficiency metrics', () => {
    const company = makeCompanyInput({
      revenue: 300000,
      totalAssets: 500000,
      totalEquity: 300000,
    })
    const health = computeHealthMetrics(company)
    expect(health.efficiency.assetTurnover).toBeCloseTo(300000 / 500000)
    expect(health.efficiency.equityTurnover).toBeCloseTo(300000 / 300000)
  })

  it('returns null for division by zero cases', () => {
    const company = makeCompanyInput({
      revenue: 0,
      totalAssets: 0,
      totalEquity: 0,
      currentLiabilities: 0,
      interestExpense: 0,
    })
    const health = computeHealthMetrics(company)
    expect(health.profitability.grossMargin).toBeNull()
    expect(health.profitability.roe).toBeNull()
    expect(health.profitability.roa).toBeNull()
    expect(health.liquidity.currentRatio).toBeNull()
    expect(health.leverage.interestCoverage).toBeNull()
    expect(health.efficiency.assetTurnover).toBeNull()
  })
})

// ── computeDCF ───────────────────────────────────────────────────────

describe('computeDCF', () => {
  const baseDCFInput: DCFInput = {
    baseFCF: 100,
    growthRate: 0.08,
    wacc: 0.10,
    terminalGrowth: 0.025,
    sharesOutstanding: 10,
    longTermDebt: 200,
    cash: 50,
  }

  it('projects 5 years of cash flows and computes enterprise value', () => {
    const result = computeDCF(baseDCFInput)!
    expect(result).not.toBeNull()
    expect(result.projections).toHaveLength(5)
    expect(result.enterpriseValue).toBeGreaterThan(0)
    expect(result.impliedSharePrice).toBeGreaterThan(0)
  })

  it('returns null when wacc <= terminal growth', () => {
    const result = computeDCF({
      ...baseDCFInput,
      wacc: 0.02,
      terminalGrowth: 0.025,
    })
    expect(result).toBeNull()
  })

  it('returns null when wacc equals terminal growth', () => {
    const result = computeDCF({
      ...baseDCFInput,
      wacc: 0.025,
      terminalGrowth: 0.025,
    })
    expect(result).toBeNull()
  })

  it('computes year 1 FCF = baseFCF * (1 + g)', () => {
    const result = computeDCF(baseDCFInput)!
    expect(result.projections[0].year).toBe(1)
    expect(result.projections[0].fcf).toBeCloseTo(100 * 1.08)
  })

  it('computes compound growth for subsequent years', () => {
    const result = computeDCF(baseDCFInput)!
    // Year 2 FCF = year1 * (1+g) = 108 * 1.08 = 116.64
    expect(result.projections[1].fcf).toBeCloseTo(100 * 1.08 * 1.08)
    // Year 3 FCF = year2 * (1+g) = 116.64 * 1.08
    expect(result.projections[2].fcf).toBeCloseTo(100 * Math.pow(1.08, 3))
  })

  it('computes PV factors correctly', () => {
    const result = computeDCF(baseDCFInput)!
    expect(result.projections[0].pvFactor).toBeCloseTo(1 / 1.10)
    expect(result.projections[1].pvFactor).toBeCloseTo(1 / Math.pow(1.10, 2))
    expect(result.projections[4].pvFactor).toBeCloseTo(1 / Math.pow(1.10, 5))
  })

  it('computes pvOfCashFlows as sum of all PVs', () => {
    const result = computeDCF(baseDCFInput)!
    const sumPV = result.projections.reduce((sum, p) => sum + p.pv, 0)
    expect(result.pvOfCashFlows).toBeCloseTo(sumPV)
  })

  it('computes terminal value using perpetuity growth formula', () => {
    const result = computeDCF(baseDCFInput)!
    const lastFCF = result.projections[4].fcf
    const expectedTV = (lastFCF * (1 + 0.025)) / (0.10 - 0.025)
    expect(result.terminalValue).toBeCloseTo(expectedTV)
  })

  it('computes pvTerminal by discounting terminal value', () => {
    const result = computeDCF(baseDCFInput)!
    const expectedPVT = result.terminalValue / Math.pow(1.10, 5)
    expect(result.pvTerminal).toBeCloseTo(expectedPVT)
  })

  it('computes enterpriseValue = pvOfCashFlows + pvTerminal', () => {
    const result = computeDCF(baseDCFInput)!
    expect(result.enterpriseValue).toBeCloseTo(result.pvOfCashFlows + result.pvTerminal)
  })

  it('computes equityValue = EV - debt + cash', () => {
    const result = computeDCF(baseDCFInput)!
    expect(result.equityValue).toBeCloseTo(result.enterpriseValue - 200 + 50)
  })

  it('computes implied share price = equityValue / sharesOutstanding', () => {
    const result = computeDCF(baseDCFInput)!
    expect(result.impliedSharePrice).toBeCloseTo(result.equityValue / 10)
  })

  it('returns 0 implied share price when sharesOutstanding is 0', () => {
    const result = computeDCF({ ...baseDCFInput, sharesOutstanding: 0 })!
    expect(result.impliedSharePrice).toBe(0)
  })

  it('supports custom year count', () => {
    const result = computeDCF({ ...baseDCFInput, years: 10 })!
    expect(result.projections).toHaveLength(10)
  })

  it('defaults years to 5', () => {
    const result = computeDCF(baseDCFInput)!
    expect(result.projections).toHaveLength(5)
  })
})

// ── computeComps ─────────────────────────────────────────────────────

describe('computeComps', () => {
  // Build CompInput[] from SAMPLE_COMPANIES
  const allComps: CompInput[] = SAMPLE_COMPANIES.map(c => ({
    name: c.name,
    stockPrice: c.stockPrice,
    sharesOutstanding: c.sharesOutstanding,
    balances: c.balances,
  }))

  // Amazon has revenue data, so use it as subject
  const amazonComp = allComps.find(c => c.name.includes('Amazon'))!

  it('computes median multiples from comparable companies', () => {
    const result = computeComps(amazonComp, allComps)
    // Should have comps (excluding Amazon and companies with <= 100 shares)
    expect(result.comps.length).toBeGreaterThan(0)
    // Medians should be non-null if comps have revenue data
    // Not all comps will have revenue data, so check that at least one median is computed
  })

  it('excludes subject company from comps', () => {
    const result = computeComps(amazonComp, allComps)
    const names = result.comps.map(c => c.name)
    expect(names).not.toContain(amazonComp.name)
  })

  it('excludes companies with <= 100 shares outstanding', () => {
    const result = computeComps(amazonComp, allComps)
    const names = result.comps.map(c => c.name)
    // Sound & Light has 10 shares
    expect(names).not.toContain('Sound & Light Pty Ltd')
  })

  it('computes P/E only for companies with positive net income', () => {
    const result = computeComps(amazonComp, allComps)
    for (const c of result.comps) {
      // P/E should be null or positive (never negative or 0)
      if (c.pe !== null) {
        expect(c.pe).toBeGreaterThan(0)
      }
    }
  })

  it('computes EV/Revenue for companies with revenue', () => {
    const result = computeComps(amazonComp, allComps)
    // Amazon has revenue data in balances, so comps that also have revenue should have evRev
    for (const c of result.comps) {
      if (c.evRev !== null) {
        expect(c.evRev).toBeGreaterThan(0)
      }
    }
  })

  it('computes P/Book for companies with positive equity', () => {
    const result = computeComps(amazonComp, allComps)
    for (const c of result.comps) {
      if (c.pBook !== null) {
        expect(c.pBook).toBeGreaterThan(0)
      }
    }
  })

  it('computes medians using floor-index method', () => {
    // Test with a known set
    const subject: CompInput = {
      name: 'Subject',
      stockPrice: 100,
      sharesOutstanding: 1000,
      balances: {},
    }
    const companies: CompInput[] = [
      subject,
      // Three comps with known revenue/income data
      {
        name: 'CompA',
        stockPrice: 50,
        sharesOutstanding: 200,
        balances: {
          'Cash': 100,
          'Sales Revenue': 1000,
          'Cost of Goods Sold': 400,
          'Salaries Expense': 100,
          'Depreciation Expense': 50,
          'Tax Expense': 50,
          'Common Stock': 500,
          'Retained Earnings': 200,
          'Notes Payable - Long Term': 300,
        },
      },
      {
        name: 'CompB',
        stockPrice: 80,
        sharesOutstanding: 300,
        balances: {
          'Cash': 200,
          'Sales Revenue': 2000,
          'Cost of Goods Sold': 800,
          'Salaries Expense': 200,
          'Depreciation Expense': 100,
          'Tax Expense': 100,
          'Common Stock': 1000,
          'Retained Earnings': 500,
          'Notes Payable - Long Term': 500,
        },
      },
      {
        name: 'CompC',
        stockPrice: 120,
        sharesOutstanding: 500,
        balances: {
          'Cash': 500,
          'Sales Revenue': 5000,
          'Cost of Goods Sold': 2000,
          'Salaries Expense': 500,
          'Depreciation Expense': 200,
          'Tax Expense': 200,
          'Common Stock': 2000,
          'Retained Earnings': 1000,
          'Notes Payable - Long Term': 1000,
        },
      },
    ]

    const result = computeComps(subject, companies)
    expect(result.comps).toHaveLength(3)
    // Verify medians are computed
    expect(result.medianPE).not.toBeNull()
    expect(result.medianEVEbitda).not.toBeNull()
    expect(result.medianEVRevenue).not.toBeNull()
    expect(result.medianPBook).not.toBeNull()
  })

  it('returns null medians when no valid comps exist', () => {
    const subject: CompInput = {
      name: 'Only',
      stockPrice: 100,
      sharesOutstanding: 1000,
      balances: {},
    }
    // All companies are either the subject or have <= 100 shares
    const result = computeComps(subject, [
      subject,
      { name: 'Tiny', stockPrice: 10, sharesOutstanding: 50, balances: {} },
    ])
    expect(result.comps).toHaveLength(0)
    expect(result.medianPE).toBeNull()
    expect(result.medianEVEbitda).toBeNull()
    expect(result.medianEVRevenue).toBeNull()
    expect(result.medianPBook).toBeNull()
  })

  it('uses Interest Expense (not Interest Payable) when deriving net income for P/E', () => {
    const subject: CompInput = {
      name: 'Subject',
      stockPrice: 100,
      sharesOutstanding: 1000,
      balances: {},
    }

    const companies: CompInput[] = [
      subject,
      {
        name: 'CompWithInterest',
        stockPrice: 10,
        sharesOutstanding: 200,
        balances: {
          'Cash': 100,
          'Sales Revenue': 1000,
          'Cost of Goods Sold': 100,
          'Salaries Expense': 100,
          'Depreciation Expense': 50,
          'Interest Expense': 40,
          'Interest Payable': 4000,
          'Tax Expense': 50,
          'Common Stock': 500,
          'Retained Earnings': 200,
        },
      },
    ]

    const result = computeComps(subject, companies)
    expect(result.comps).toHaveLength(1)

    const pe = result.comps[0].pe
    expect(pe).not.toBeNull()
    // MC = 10 * 200 = 2000
    // NI = 1000 - 100 - 100 - 50 - 40 - 50 = 660
    expect(pe).toBeCloseTo(2000 / 660, 6)
  })
})

// ── buildMACompanyInput ──────────────────────────────────────────────

describe('buildMACompanyInput', () => {
  it('computes actual current liabilities from chart of accounts (bug B4 fix)', () => {
    const sl = SAMPLE_COMPANIES.find(c => c.name === 'Sound & Light Pty Ltd')!
    const input = buildMACompanyInput(sl, CHART_OF_ACCOUNTS)

    // Sound & Light current liabilities: AP=28000, SP=4500, Unearned=6000
    expect(input.currentLiabilities).toBe(28000 + 4500 + 6000)

    // Total liabilities: current + noncurrent (Notes Payable LT = 50000)
    expect(input.totalLiabilities).toBe(28000 + 4500 + 6000 + 50000)

    // The 40% heuristic would give: totalLiab * 0.4 = 88500 * 0.4 = 35400
    // Our actual value is 38500, proving we use real data
    expect(input.currentLiabilities).not.toBe(input.totalLiabilities * 0.4)
  })

  it('computes current assets from chart of accounts', () => {
    const sl = SAMPLE_COMPANIES.find(c => c.name === 'Sound & Light Pty Ltd')!
    const input = buildMACompanyInput(sl, CHART_OF_ACCOUNTS)

    // Current assets: Cash=45000, AR=32000, ADA=-1600, Inventory=58000, Prepaid=3000
    expect(input.currentAssets).toBe(45000 + 32000 + (-1600) + 58000 + 3000)
    expect(input.cash).toBe(45000)
    expect(input.inventory).toBe(58000)
    expect(input.accountsReceivable).toBe(32000)
  })

  it('computes total assets correctly', () => {
    const sl = SAMPLE_COMPANIES.find(c => c.name === 'Sound & Light Pty Ltd')!
    const input = buildMACompanyInput(sl, CHART_OF_ACCOUNTS)

    // current assets: 45000 + 32000 - 1600 + 58000 + 3000 = 136400
    // noncurrent: Equipment=120000, AccDepr=-24000 => 96000
    // total = 136400 + 96000 = 232400
    expect(input.totalAssets).toBe(136400 + 96000)
  })

  it('computes total equity correctly', () => {
    const sl = SAMPLE_COMPANIES.find(c => c.name === 'Sound & Light Pty Ltd')!
    const input = buildMACompanyInput(sl, CHART_OF_ACCOUNTS)

    // Common Stock=100000, Retained Earnings=43900
    expect(input.totalEquity).toBe(100000 + 43900)
  })

  it('computes long-term debt correctly', () => {
    const sl = SAMPLE_COMPANIES.find(c => c.name === 'Sound & Light Pty Ltd')!
    const input = buildMACompanyInput(sl, CHART_OF_ACCOUNTS)

    // Notes Payable - Long Term = 50000
    expect(input.longTermDebt).toBe(50000)
  })

  it('sets share price and shares from company data', () => {
    const sl = SAMPLE_COMPANIES.find(c => c.name === 'Sound & Light Pty Ltd')!
    const input = buildMACompanyInput(sl, CHART_OF_ACCOUNTS)

    expect(input.sharePrice).toBe(25)
    expect(input.sharesOut).toBe(10)
    expect(input.name).toBe('Sound & Light Pty Ltd')
  })

  it('computes income data from revenue/expense balances', () => {
    // Amazon has revenue and expense data in balances
    const amz = SAMPLE_COMPANIES.find(c => c.name.includes('Amazon'))!
    const input = buildMACompanyInput(amz, CHART_OF_ACCOUNTS)

    expect(input.revenue).toBe(575000)
    expect(input.cogs).toBe(304000)
    expect(input.grossProfit).toBe(575000 - 304000)
  })

  it('sets netIncome to 0 when no revenue data exists', () => {
    // Sound & Light has no Revenue/Expense in balances
    const sl = SAMPLE_COMPANIES.find(c => c.name === 'Sound & Light Pty Ltd')!
    const input = buildMACompanyInput(sl, CHART_OF_ACCOUNTS)

    expect(input.revenue).toBe(0)
    expect(input.netIncome).toBe(0)
  })

  it('handles companies with multiple long-term debt types', () => {
    const jnj = SAMPLE_COMPANIES.find(c => c.name.includes('Johnson'))!
    const input = buildMACompanyInput(jnj, CHART_OF_ACCOUNTS)

    // JNJ: Notes Payable LT=30000, Bonds Payable=5000
    expect(input.longTermDebt).toBe(30000 + 5000)
  })

  it('handles companies with lease liabilities', () => {
    const googl = SAMPLE_COMPANIES.find(c => c.name.includes('Alphabet'))!
    const input = buildMACompanyInput(googl, CHART_OF_ACCOUNTS)

    // Alphabet: Notes Payable LT=13000, Lease Liability=14000
    expect(input.longTermDebt).toBe(13000 + 14000)
  })

  it('computes current liabilities for companies with Current Portion of LT Debt', () => {
    const amz = SAMPLE_COMPANIES.find(c => c.name.includes('Amazon'))!
    const input = buildMACompanyInput(amz, CHART_OF_ACCOUNTS)

    // Amazon current liabilities: AP=80000, SP=10000, Tax=3000, Unearned=14000, CPLTD=8000
    expect(input.currentLiabilities).toBe(80000 + 10000 + 3000 + 14000 + 8000)
  })
})
