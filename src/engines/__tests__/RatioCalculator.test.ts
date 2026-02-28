import { describe, it, expect } from 'vitest'
import { calculateRatios } from '../RatioCalculator'
import type { BalanceSheet, IncomeStatement, CashFlowStatement } from '../types'

// ── Test Fixtures ────────────────────────────────────────────────────

const bs: BalanceSheet = {
  currentAssets: [
    { name: 'Cash', balance: 50 },
    { name: 'Accounts Receivable', balance: 100 },
    { name: 'Inventory', balance: 80 },
  ],
  noncurrentAssets: [
    { name: 'Equipment', balance: 400 },
    { name: 'Accumulated Depreciation - Equipment', balance: -100, contra: true },
  ],
  totalCurrentAssets: 230,
  totalNoncurrentAssets: 300,
  totalAssets: 530,
  currentLiabilities: [
    { name: 'Accounts Payable', balance: 60 },
    { name: 'Salaries Payable', balance: 20 },
  ],
  noncurrentLiabilities: [
    { name: 'Notes Payable - Long Term', balance: 120 },
  ],
  totalCurrentLiabilities: 80,
  totalNoncurrentLiabilities: 120,
  totalLiabilities: 200,
  equity: [
    { name: 'Common Stock', balance: 200 },
    { name: 'Retained Earnings', balance: 130 },
  ],
  totalEquity: 330,
  totalLiabilitiesAndEquity: 530,
  isBalanced: true,
}

const is: IncomeStatement = {
  revenue: [{ name: 'Sales Revenue', balance: 500 }],
  totalRevenue: 500,
  cogs: [{ name: 'Cost of Goods Sold', balance: 200 }],
  totalCOGS: 200,
  grossProfit: 300,
  operatingExpenses: [
    { name: 'Salaries Expense', balance: 100 },
    { name: 'Depreciation Expense', balance: 20 },
    { name: 'Amortisation Expense', balance: 5 },
    { name: 'Rent Expense', balance: 75 },
  ],
  totalOperatingExpenses: 200,
  operatingIncome: 100,
  otherRevenue: [{ name: 'Interest Income', balance: 10 }],
  otherExpenses: [{ name: 'Interest Expense', balance: 15 }],
  totalOther: -5,
  incomeBeforeTax: 95,
  taxExpense: 20,
  netIncome: 75,
  eps: 7.5,
}

const cf: CashFlowStatement = {
  operatingActivities: [{ label: 'Net Income', amount: 75 }],
  totalOperating: 90,
  investingActivities: [{ label: 'Equipment Purchase', amount: -40 }],
  totalInvesting: -40,
  financingActivities: [{ label: 'Dividends', amount: -10 }],
  totalFinancing: -10,
  netChange: 40,
  beginningCash: 10,
  endingCash: 50,
}

// ── Tests ────────────────────────────────────────────────────────────

describe('calculateRatios', () => {
  const ratios = calculateRatios(bs, is, cf)

  // ── Profitability Ratios ──

  describe('Profitability Ratios', () => {
    it('calculates gross profit margin = grossProfit / totalRevenue', () => {
      // 300 / 500 = 0.6
      expect(ratios.grossProfitMargin).toBeCloseTo(0.6, 10)
    })

    it('calculates operating margin = operatingIncome / totalRevenue', () => {
      // 100 / 500 = 0.2
      expect(ratios.operatingMargin).toBeCloseTo(0.2, 10)
    })

    it('calculates EBITDA = operatingIncome + depreciation + amortization (Bug B1 fix)', () => {
      // 100 + 20 + 5 = 125, NOT just 100
      expect(ratios.ebitda).toBe(125)
    })

    it('does NOT use the monolith bug of EBITDA = operatingIncome only', () => {
      // The monolith incorrectly used operatingIncome alone (100).
      // Our corrected value must be 125.
      expect(ratios.ebitda).not.toBe(100)
    })

    it('calculates EBITDA margin = ebitda / totalRevenue', () => {
      // 125 / 500 = 0.25
      expect(ratios.ebitdaMargin).toBeCloseTo(0.25, 10)
    })

    it('calculates net profit margin = netIncome / totalRevenue', () => {
      // 75 / 500 = 0.15
      expect(ratios.netProfitMargin).toBeCloseTo(0.15, 10)
    })

    it('calculates ROA = netIncome / totalAssets', () => {
      // 75 / 530
      expect(ratios.roa).toBeCloseTo(75 / 530, 10)
    })

    it('calculates ROE = netIncome / totalEquity', () => {
      // 75 / 330
      expect(ratios.roe).toBeCloseTo(75 / 330, 10)
    })

    it('calculates ROIC = NOPAT / investedCapital', () => {
      // taxRate = 20 / 95
      // NOPAT = 100 * (1 - 20/95) = 100 * 75/95 = 7500/95
      // investedCapital = 330 + 200 - 50 = 480
      // ROIC = (7500/95) / 480
      const taxRate = 20 / 95
      const nopat = 100 * (1 - taxRate)
      const investedCapital = 330 + 200 - 50
      expect(ratios.roic).toBeCloseTo(nopat / investedCapital, 10)
    })
  })

  // ── Liquidity Ratios ──

  describe('Liquidity Ratios', () => {
    it('calculates current ratio = totalCurrentAssets / totalCurrentLiabilities', () => {
      // 230 / 80 = 2.875
      expect(ratios.currentRatio).toBeCloseTo(2.875, 10)
    })

    it('calculates quick ratio = (totalCurrentAssets - inventory) / totalCurrentLiabilities', () => {
      // (230 - 80) / 80 = 150 / 80 = 1.875
      expect(ratios.quickRatio).toBeCloseTo(1.875, 10)
    })

    it('calculates cash ratio = cash / totalCurrentLiabilities', () => {
      // 50 / 80 = 0.625
      expect(ratios.cashRatio).toBeCloseTo(0.625, 10)
    })
  })

  // ── Solvency Ratios ──

  describe('Solvency Ratios', () => {
    it('calculates debt-to-equity = totalLiabilities / totalEquity', () => {
      // 200 / 330
      expect(ratios.debtToEquity).toBeCloseTo(200 / 330, 10)
    })

    it('calculates debt-to-assets = totalLiabilities / totalAssets', () => {
      // 200 / 530
      expect(ratios.debtToAssets).toBeCloseTo(200 / 530, 10)
    })

    it('calculates interest coverage = operatingIncome / interestExpense', () => {
      // 100 / 15
      expect(ratios.interestCoverage).toBeCloseTo(100 / 15, 10)
    })
  })

  // ── Efficiency Ratios ──

  describe('Efficiency Ratios', () => {
    it('calculates asset turnover = totalRevenue / totalAssets', () => {
      // 500 / 530
      expect(ratios.assetTurnover).toBeCloseTo(500 / 530, 10)
    })

    it('calculates receivables turnover = totalRevenue / AR', () => {
      // 500 / 100 = 5
      expect(ratios.receivablesTurnover).toBeCloseTo(5, 10)
    })

    it('calculates DSO = 365 / receivablesTurnover', () => {
      // 365 / 5 = 73
      expect(ratios.dso).toBeCloseTo(73, 10)
    })

    it('calculates inventory turnover = totalCOGS / inventory', () => {
      // 200 / 80 = 2.5
      expect(ratios.inventoryTurnover).toBeCloseTo(2.5, 10)
    })

    it('calculates DIO = 365 / inventoryTurnover', () => {
      // 365 / 2.5 = 146
      expect(ratios.dio).toBeCloseTo(146, 10)
    })

    it('calculates payables turnover = totalCOGS / AP', () => {
      // 200 / 60 = 3.333...
      expect(ratios.payablesTurnover).toBeCloseTo(200 / 60, 10)
    })

    it('calculates DPO = 365 / payablesTurnover', () => {
      // 365 / (200/60) = 365 * 60 / 200 = 109.5
      expect(ratios.dpo).toBeCloseTo(109.5, 10)
    })
  })

  // ── Analytical Ratios ──

  describe('Analytical Ratios', () => {
    it('calculates cash conversion cycle = DSO + DIO - DPO', () => {
      // 73 + 146 - 109.5 = 109.5
      expect(ratios.cashConversionCycle).toBeCloseTo(109.5, 10)
    })

    it('calculates free cash flow = totalOperating - |totalInvesting|', () => {
      // 90 - |-40| = 90 - 40 = 50
      expect(ratios.freeCashFlow).toBe(50)
    })

    it('provides DuPont decomposition components', () => {
      // netMargin = 75 / 500 = 0.15
      expect(ratios.dupont.netMargin).toBeCloseTo(0.15, 10)
      // assetTurnover = 500 / 530
      expect(ratios.dupont.assetTurnover).toBeCloseTo(500 / 530, 10)
      // equityMultiplier = 530 / 330
      expect(ratios.dupont.equityMultiplier).toBeCloseTo(530 / 330, 10)
    })

    it('DuPont product equals ROE (netMargin * assetTurnover * equityMultiplier)', () => {
      const dupontProduct =
        ratios.dupont.netMargin! *
        ratios.dupont.assetTurnover! *
        ratios.dupont.equityMultiplier!
      // ROE = 75 / 330
      expect(dupontProduct).toBeCloseTo(75 / 330, 10)
      expect(dupontProduct).toBeCloseTo(ratios.roe!, 10)
    })
  })

  // ── Edge Cases ──

  describe('Edge Cases', () => {
    it('returns null for margin ratios when revenue is zero', () => {
      const zeroRevenueIS: IncomeStatement = {
        ...is,
        totalRevenue: 0,
        grossProfit: 0,
        operatingIncome: 0,
        netIncome: 0,
        incomeBeforeTax: 0,
      }
      const r = calculateRatios(bs, zeroRevenueIS)
      expect(r.grossProfitMargin).toBeNull()
      expect(r.operatingMargin).toBeNull()
      expect(r.ebitdaMargin).toBeNull()
      expect(r.netProfitMargin).toBeNull()
    })

    it('returns null for free cash flow when no cash flow statement is provided', () => {
      const r = calculateRatios(bs, is)
      expect(r.freeCashFlow).toBeNull()
    })

    it('returns null for ROE when total equity is zero', () => {
      const zeroEquityBS: BalanceSheet = {
        ...bs,
        totalEquity: 0,
        equity: [],
      }
      const r = calculateRatios(zeroEquityBS, is)
      expect(r.roe).toBeNull()
      expect(r.debtToEquity).toBeNull()
      expect(r.dupont.equityMultiplier).toBeNull()
    })

    it('returns null for liquidity ratios when current liabilities are zero', () => {
      const zeroCurrentLiabBS: BalanceSheet = {
        ...bs,
        totalCurrentLiabilities: 0,
        currentLiabilities: [],
      }
      const r = calculateRatios(zeroCurrentLiabBS, is)
      expect(r.currentRatio).toBeNull()
      expect(r.quickRatio).toBeNull()
      expect(r.cashRatio).toBeNull()
    })

    it('returns null for interest coverage when no interest expense exists', () => {
      const noInterestIS: IncomeStatement = {
        ...is,
        otherExpenses: [],
      }
      const r = calculateRatios(bs, noInterestIS)
      expect(r.interestCoverage).toBeNull()
    })

    it('returns null for receivables turnover when AR is zero', () => {
      const noARBS: BalanceSheet = {
        ...bs,
        currentAssets: [
          { name: 'Cash', balance: 50 },
          { name: 'Inventory', balance: 80 },
        ],
      }
      const r = calculateRatios(noARBS, is)
      expect(r.receivablesTurnover).toBeNull()
      expect(r.dso).toBeNull()
    })

    it('returns null for inventory turnover when inventory is zero', () => {
      const noInvBS: BalanceSheet = {
        ...bs,
        currentAssets: [
          { name: 'Cash', balance: 50 },
          { name: 'Accounts Receivable', balance: 100 },
        ],
      }
      const r = calculateRatios(noInvBS, is)
      expect(r.inventoryTurnover).toBeNull()
      expect(r.dio).toBeNull()
    })

    it('returns null for cash conversion cycle when any component is null', () => {
      const noInvBS: BalanceSheet = {
        ...bs,
        currentAssets: [
          { name: 'Cash', balance: 50 },
          { name: 'Accounts Receivable', balance: 100 },
        ],
      }
      const r = calculateRatios(noInvBS, is)
      // DIO is null because inventory is 0
      expect(r.cashConversionCycle).toBeNull()
    })

    it('uses 0 tax rate when incomeBeforeTax is zero', () => {
      const zeroIncomeIS: IncomeStatement = {
        ...is,
        incomeBeforeTax: 0,
        taxExpense: 0,
        operatingIncome: 0,
        netIncome: 0,
      }
      const r = calculateRatios(bs, zeroIncomeIS)
      // NOPAT = 0 * (1 - 0) = 0, investedCapital = 330 + 200 - 50 = 480
      // ROIC = 0 / 480 = 0
      expect(r.roic).toBeCloseTo(0, 10)
    })

    it('returns null for ROA when total assets is zero', () => {
      const zeroAssetsBS: BalanceSheet = {
        ...bs,
        totalAssets: 0,
      }
      const r = calculateRatios(zeroAssetsBS, is)
      expect(r.roa).toBeNull()
      expect(r.debtToAssets).toBeNull()
      expect(r.assetTurnover).toBeNull()
    })

    it('EBITDA still adds depreciation and amortization even when they are zero', () => {
      const noDAIS: IncomeStatement = {
        ...is,
        operatingExpenses: [
          { name: 'Salaries Expense', balance: 100 },
          { name: 'Rent Expense', balance: 100 },
        ],
      }
      const r = calculateRatios(bs, noDAIS)
      // No depreciation or amortization found, so EBITDA = operatingIncome + 0 + 0
      expect(r.ebitda).toBe(is.operatingIncome)
    })
  })
})
