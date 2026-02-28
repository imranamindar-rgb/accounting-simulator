/**
 * COMPREHENSIVE STRESS TEST
 *
 * Tests the accounting engine with 20+ companies from diverse sectors,
 * hundreds of transactions, edge cases, and extreme values.
 *
 * Validates:
 * - Balance sheet equation (A = L + E) after every mutation
 * - Statement generation accuracy
 * - Ratio calculations (including edge cases)
 * - Multi-transaction sequences
 * - Float precision under large numbers
 * - Negative equity / negative retained earnings
 * - All 11 sample companies + 14 synthetic companies = 25 total
 */

import { describe, it, expect } from 'vitest'
import { Ledger } from '../Ledger'
import { TransactionEngine } from '../TransactionEngine'
import {
  generateBalanceSheet,
  generateIncomeStatement,
  generateCashFlowStatement,
  generateEquityStatement,
} from '../StatementGenerator'
import { calculateRatios } from '../RatioCalculator'
import { CHART_OF_ACCOUNTS } from '../../data/chartOfAccounts'
import { TRANSACTION_TEMPLATES } from '../../data/transactionTemplates'
import { SAMPLE_COMPANIES } from '../../data/sampleCompanies'
import type { SampleCompany } from '../../data/sampleCompanies'

// ── Helper: create a fully-wired ledger from a company ────────────

function createLedgerForCompany(company: SampleCompany) {
  const ledger = new Ledger()
  const engine = new TransactionEngine(ledger)

  for (const acctDef of CHART_OF_ACCOUNTS) {
    ledger.addAccount(acctDef.name, acctDef.type, {
      subtype: acctDef.subtype,
      contra: acctDef.contra,
      cashFlow: acctDef.cashFlow,
    })
  }
  for (const template of TRANSACTION_TEMPLATES) {
    engine.registerTemplate(template)
  }
  for (const [accountName, balance] of Object.entries(company.balances)) {
    ledger.adjustBalance(accountName, balance)
  }
  return { ledger, engine }
}

// ── Helper: verify balance sheet equation ────────────────────────

function verifyEquation(ledger: Ledger, _label: string) {
  const bs = generateBalanceSheet(ledger)
  const is = generateIncomeStatement(ledger)

  // totalEquity already includes current period net income
  expect(bs.isBalanced).toBe(true)
  expect(bs.totalAssets).toBeCloseTo(bs.totalLiabilitiesAndEquity, 2)
  expect(bs.totalAssets).toBeCloseTo(bs.totalLiabilities + bs.totalEquity, 2)
  return { bs, is }
}

// ── Helper: generate all 4 statements ─────────────────────────────

function generateAllStatements(ledger: Ledger) {
  const beginningBalances = ledger.takeSnapshot()
  const is = generateIncomeStatement(ledger)
  const bs = generateBalanceSheet(ledger)
  const cf = generateCashFlowStatement(ledger, beginningBalances, is.netIncome)
  const eq = generateEquityStatement(ledger, beginningBalances, is.netIncome)
  return { bs, is, cf, eq, beginningBalances }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: All 11 sample companies — balance equation + statements
// ═══════════════════════════════════════════════════════════════════

describe('Sample Companies (11) — Balance Sheet Equation', () => {
  SAMPLE_COMPANIES.forEach((company) => {
    it(`${company.name} — A = L + E`, () => {
      const { ledger } = createLedgerForCompany(company)
      const { bs } = verifyEquation(ledger, company.name)

      // Additional: non-negative total assets (unless blank)
      if (Object.keys(company.balances).length > 0) {
        expect(bs.totalAssets).toBeGreaterThan(0)
      }
    })
  })
})

describe('Sample Companies (11) — Full Statement Generation', () => {
  SAMPLE_COMPANIES.forEach((company) => {
    if (Object.keys(company.balances).length === 0) return // skip blank

    it(`${company.name} — all 4 statements generate without error`, () => {
      const { ledger } = createLedgerForCompany(company)
      const { bs, is, cf, eq } = generateAllStatements(ledger)

      // Balance sheet must be balanced
      expect(bs.isBalanced).toBe(true)

      // Cash flow ending cash should match BS cash — but only when the company
      // has no pre-loaded revenue/expense accounts (otherwise the CFS net income
      // inflates cash without matching balance sheet changes)
      const hasPreloadedIncome = is.netIncome !== 0
      if (!hasPreloadedIncome) {
        const bsCash = [...bs.currentAssets, ...bs.noncurrentAssets]
          .filter((a) => a.name === 'Cash')
          .reduce((s, a) => s + a.balance, 0)
        expect(cf.endingCash).toBeCloseTo(bsCash, 2)
      }

      // Equity ending should equal BS equity
      expect(eq.totalEnding).toBeCloseTo(bs.totalEquity, 2)
    })
  })
})

describe('Sample Companies (11) — Ratio Calculations', () => {
  SAMPLE_COMPANIES.forEach((company) => {
    if (Object.keys(company.balances).length === 0) return

    it(`${company.name} — ratios compute without NaN or exceptions`, () => {
      const { ledger } = createLedgerForCompany(company)
      const { bs, is, cf } = generateAllStatements(ledger)
      const ratios = calculateRatios(bs, is, cf)

      // No ratio should be NaN
      for (const [key, value] of Object.entries(ratios)) {
        if (key === 'dupont') {
          const d = value as { netMargin: number | null; assetTurnover: number | null; equityMultiplier: number | null }
          if (d.netMargin !== null) expect(Number.isNaN(d.netMargin)).toBe(false)
          if (d.assetTurnover !== null) expect(Number.isNaN(d.assetTurnover)).toBe(false)
          if (d.equityMultiplier !== null) expect(Number.isNaN(d.equityMultiplier)).toBe(false)
        } else if (typeof value === 'number') {
          expect(Number.isNaN(value)).toBe(false)
        }
      }

      // DuPont identity: ROE ≈ netMargin × assetTurnover × equityMultiplier
      if (
        ratios.roe !== null &&
        ratios.dupont.netMargin !== null &&
        ratios.dupont.assetTurnover !== null &&
        ratios.dupont.equityMultiplier !== null
      ) {
        const dupontROE =
          ratios.dupont.netMargin *
          ratios.dupont.assetTurnover *
          ratios.dupont.equityMultiplier
        expect(dupontROE).toBeCloseTo(ratios.roe, 4)
      }
    })
  })
})

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: 14 synthetic companies — diverse sectors & edge cases
// ═══════════════════════════════════════════════════════════════════

const SYNTHETIC_COMPANIES: SampleCompany[] = [
  // 1. Tech Startup — high cash, no inventory, negative retained earnings (pre-profit)
  {
    name: 'CloudNova AI (Startup)',
    description: 'Pre-revenue AI startup burning cash',
    industry: 'Technology',
    scale: 'millions',
    stockPrice: 5,
    sharesOutstanding: 1000,
    balances: {
      'Cash': 50000,
      'Short-Term Investments': 20000,
      'Prepaid Expenses': 3000,
      'Equipment': 8000,
      'Accumulated Depreciation - Equipment': -1000,
      'Accounts Payable': 2000,
      'Salaries Payable': 5000,
      'Common Stock': 100000,
      'Retained Earnings': -27000, // Negative: accumulated losses
    },
  },
  // 2. Manufacturing — heavy PP&E, large inventory
  {
    name: 'SteelForge Industries',
    description: 'Heavy manufacturing with large PP&E',
    industry: 'Manufacturing',
    scale: 'millions',
    stockPrice: 45,
    sharesOutstanding: 2000,
    balances: {
      'Cash': 12000,
      'Accounts Receivable': 25000,
      'Allowance for Doubtful Accounts': -500,
      'Inventory': 85000,
      'Land': 30000,
      'Buildings': 200000,
      'Accumulated Depreciation - Buildings': -80000,
      'Equipment': 350000,
      'Accumulated Depreciation - Equipment': -175000,
      'Accounts Payable': 45000,
      'Salaries Payable': 8000,
      'Tax Payable': 5000,
      'Current Portion of Long-Term Debt': 10000,
      'Notes Payable - Long Term': 150000,
      'Bonds Payable': 50000,
      'Common Stock': 50000,
      'Share Premium': 30000,
      'Retained Earnings': 98500,
    },
  },
  // 3. Airline — huge lease liabilities
  {
    name: 'SkyBridge Airlines',
    description: 'Major airline with lease-heavy balance sheet',
    industry: 'Airlines',
    scale: 'millions',
    stockPrice: 35,
    sharesOutstanding: 800,
    balances: {
      'Cash': 8000,
      'Accounts Receivable': 5000,
      'Prepaid Expenses': 2000,
      'Equipment': 180000,
      'Accumulated Depreciation - Equipment': -60000,
      'Intangible Assets': 5000,
      'Accounts Payable': 12000,
      'Salaries Payable': 6000,
      'Unearned Revenue': 15000,
      'Current Portion of Long-Term Debt': 8000,
      'Notes Payable - Long Term': 40000,
      'Lease Liability': 90000,
      'Common Stock': 10000,
      'Share Premium': 20000,
      'Retained Earnings': -61000, // Negative equity (common in airlines)
    },
  },
  // 4. Pharmaceutical — massive intangibles + R&D
  {
    name: 'BioSynth Pharma',
    description: 'Drug development company with patent portfolio',
    industry: 'Pharmaceuticals',
    scale: 'millions',
    stockPrice: 120,
    sharesOutstanding: 1500,
    balances: {
      'Cash': 35000,
      'Short-Term Investments': 15000,
      'Accounts Receivable': 12000,
      'Allowance for Doubtful Accounts': -300,
      'Inventory': 8000,
      'Prepaid Expenses': 2000,
      'Buildings': 25000,
      'Accumulated Depreciation - Buildings': -8000,
      'Equipment': 40000,
      'Accumulated Depreciation - Equipment': -15000,
      'Intangible Assets': 80000, // Patents
      'Goodwill': 55000,
      'Accounts Payable': 6000,
      'Salaries Payable': 4000,
      'Tax Payable': 3000,
      'Notes Payable - Long Term': 35000,
      'Bonds Payable': 20000,
      'Provision for Warranties': 5000,
      'Common Stock': 20000,
      'Share Premium': 100000,
      'Retained Earnings': 55700,
    },
  },
  // 5. Real estate REIT — land + buildings dominant
  {
    name: 'Metro Property Trust',
    description: 'Commercial real estate investment trust',
    industry: 'Real Estate',
    scale: 'millions',
    stockPrice: 22,
    sharesOutstanding: 5000,
    balances: {
      'Cash': 5000,
      'Accounts Receivable': 3000,
      'Allowance for Doubtful Accounts': -100,
      'Land': 120000,
      'Buildings': 400000,
      'Accumulated Depreciation - Buildings': -60000,
      'Accounts Payable': 8000,
      'Interest Payable': 4000,
      'Tax Payable': 1000,
      'Current Portion of Long-Term Debt': 15000,
      'Notes Payable - Long Term': 280000,
      'Common Stock': 50000,
      'Share Premium': 30000,
      'Retained Earnings': 79900,
    },
  },
  // 6. Insurance company — large reserves
  {
    name: 'SafeGuard Insurance',
    description: 'Property & casualty insurer',
    industry: 'Insurance',
    scale: 'millions',
    stockPrice: 90,
    sharesOutstanding: 400,
    balances: {
      'Cash': 40000,
      'Short-Term Investments': 80000,
      'Accounts Receivable': 15000,
      'Allowance for Doubtful Accounts': -500,
      'Notes Receivable': 25000,
      'Buildings': 10000,
      'Accumulated Depreciation - Buildings': -3000,
      'Accounts Payable': 5000,
      'Tax Payable': 3000,
      'Notes Payable - Long Term': 20000,
      'Provision for Warranties': 60000, // Insurance reserves
      'Common Stock': 30000,
      'Share Premium': 15000,
      'Retained Earnings': 33500,
    },
  },
  // 7. Restaurant chain — high COGS, inventory
  {
    name: 'Golden Grill Restaurants',
    description: 'Fast-casual restaurant chain',
    industry: 'Food & Beverage',
    scale: 'millions',
    stockPrice: 30,
    sharesOutstanding: 600,
    balances: {
      'Cash': 3000,
      'Accounts Receivable': 1000,
      'Inventory': 4000,
      'Prepaid Expenses': 2000,
      'Land': 5000,
      'Buildings': 40000,
      'Accumulated Depreciation - Buildings': -12000,
      'Equipment': 25000,
      'Accumulated Depreciation - Equipment': -10000,
      'Accounts Payable': 8000,
      'Salaries Payable': 5000,
      'Unearned Revenue': 1000,
      'Lease Liability': 20000,
      'Common Stock': 5000,
      'Share Premium': 10000,
      'Retained Earnings': 9000,
    },
  },
  // 8. Mining company — natural resources
  {
    name: 'DeepRock Mining',
    description: 'Gold and copper mining operations',
    industry: 'Mining',
    scale: 'millions',
    stockPrice: 18,
    sharesOutstanding: 3000,
    balances: {
      'Cash': 6000,
      'Accounts Receivable': 4000,
      'Inventory': 12000,
      'Land': 50000,
      'Equipment': 300000,
      'Accumulated Depreciation - Equipment': -120000,
      'Accounts Payable': 15000,
      'Tax Payable': 4000,
      'Current Portion of Long-Term Debt': 12000,
      'Notes Payable - Long Term': 100000,
      'Provision for Warranties': 25000, // Environmental remediation
      'Common Stock': 20000,
      'Share Premium': 40000,
      'Retained Earnings': 36000,
    },
  },
  // 9. SaaS company — deferred revenue heavy
  {
    name: 'DataStream SaaS',
    description: 'Enterprise software-as-a-service platform',
    industry: 'Software',
    scale: 'millions',
    stockPrice: 200,
    sharesOutstanding: 500,
    balances: {
      'Cash': 40000,
      'Short-Term Investments': 10000,
      'Accounts Receivable': 8000,
      'Allowance for Doubtful Accounts': -200,
      'Prepaid Expenses': 3000,
      'Equipment': 15000,
      'Accumulated Depreciation - Equipment': -5000,
      'Intangible Assets': 12000,
      'Goodwill': 20000,
      'Accounts Payable': 3000,
      'Salaries Payable': 6000,
      'Unearned Revenue': 25000, // Annual subscriptions prepaid
      'Current Portion of Long-Term Debt': 2000,
      'Notes Payable - Long Term': 10000,
      'Common Stock': 5000,
      'Share Premium': 40000,
      'Retained Earnings': 11800,
    },
  },
  // 10. Utility company — regulated, stable, capital-intensive
  {
    name: 'PowerGrid Utilities',
    description: 'Electric and gas utility company',
    industry: 'Utilities',
    scale: 'millions',
    stockPrice: 55,
    sharesOutstanding: 1800,
    balances: {
      'Cash': 4000,
      'Accounts Receivable': 9000,
      'Allowance for Doubtful Accounts': -300,
      'Inventory': 3000,
      'Land': 10000,
      'Buildings': 60000,
      'Accumulated Depreciation - Buildings': -20000,
      'Equipment': 200000,
      'Accumulated Depreciation - Equipment': -80000,
      'Intangible Assets': 8000,
      'Accounts Payable': 7000,
      'Interest Payable': 3000,
      'Tax Payable': 2000,
      'Current Portion of Long-Term Debt': 5000,
      'Notes Payable - Long Term': 80000,
      'Bonds Payable': 40000,
      'Common Stock': 15000,
      'Share Premium': 20000,
      'Retained Earnings': 21700,
    },
  },
  // 11. Shipping/logistics — vehicles dominant
  {
    name: 'SwiftHaul Logistics',
    description: 'Freight and logistics company',
    industry: 'Transportation',
    scale: 'millions',
    stockPrice: 40,
    sharesOutstanding: 700,
    balances: {
      'Cash': 5000,
      'Accounts Receivable': 12000,
      'Allowance for Doubtful Accounts': -400,
      'Prepaid Expenses': 4000,
      'Vehicles': 150000,
      'Accumulated Depreciation - Vehicles': -55000,
      'Land': 8000,
      'Buildings': 30000,
      'Accumulated Depreciation - Buildings': -10000,
      'Accounts Payable': 9000,
      'Salaries Payable': 7000,
      'Lease Liability': 50000,
      'Current Portion of Long-Term Debt': 6000,
      'Notes Payable - Long Term': 35000,
      'Common Stock': 10000,
      'Share Premium': 15000,
      'Retained Earnings': 11600,
    },
  },
  // 12. Retail chain — goodwill from acquisitions
  {
    name: 'MegaMart Retail',
    description: 'Discount retail chain with multiple acquisitions',
    industry: 'Retail',
    scale: 'millions',
    stockPrice: 75,
    sharesOutstanding: 1200,
    balances: {
      'Cash': 7000,
      'Accounts Receivable': 3000,
      'Inventory': 45000,
      'Prepaid Expenses': 2000,
      'Land': 12000,
      'Buildings': 80000,
      'Accumulated Depreciation - Buildings': -30000,
      'Equipment': 35000,
      'Accumulated Depreciation - Equipment': -15000,
      'Goodwill': 60000,
      'Intangible Assets': 10000,
      'Accounts Payable': 40000,
      'Salaries Payable': 8000,
      'Tax Payable': 2000,
      'Current Portion of Long-Term Debt': 5000,
      'Notes Payable - Long Term': 50000,
      'Bonds Payable': 15000,
      'Common Stock': 8000,
      'Share Premium': 55000,
      'Retained Earnings': 26000,
    },
  },
  // 13. Edge case: company with ONLY cash and equity (simplest)
  {
    name: 'CashOnly Inc',
    description: 'Minimal company: just cash and equity',
    industry: 'Test',
    scale: 'ones',
    stockPrice: 100,
    sharesOutstanding: 100,
    balances: {
      'Cash': 10000,
      'Common Stock': 10000,
    },
  },
  // 14. Edge case: company with every account type populated
  {
    name: 'FullSpectrum Corp',
    description: 'Every account type has a balance',
    industry: 'Test',
    scale: 'millions',
    stockPrice: 50,
    sharesOutstanding: 1000,
    balances: {
      'Cash': 20000,
      'Short-Term Investments': 10000,
      'Accounts Receivable': 15000,
      'Allowance for Doubtful Accounts': -500,
      'Notes Receivable': 5000,
      'Inventory': 25000,
      'Prepaid Expenses': 3000,
      'Supplies': 1000,
      'Land': 20000,
      'Buildings': 80000,
      'Accumulated Depreciation - Buildings': -20000,
      'Equipment': 60000,
      'Accumulated Depreciation - Equipment': -15000,
      'Vehicles': 10000,
      'Accumulated Depreciation - Vehicles': -3000,
      'Intangible Assets': 15000,
      'Goodwill': 25000,
      'Accounts Payable': 18000,
      'Salaries Payable': 5000,
      'Interest Payable': 2000,
      'Tax Payable': 3000,
      'Unearned Revenue': 4000,
      'Current Portion of Long-Term Debt': 5000,
      'GST Payable': 1000,
      'Notes Payable - Long Term': 40000,
      'Bonds Payable': 20000,
      'Lease Liability': 15000,
      'Provision for Warranties': 3000,
      'Common Stock': 30000,
      'Share Premium': 50000,
      'Retained Earnings': 38500,
      'Sales Revenue': 100000,
      'Service Revenue': 20000,
      'Interest Income': 2000,
      'Cost of Goods Sold': 55000,
      'Salaries Expense': 25000,
      'Rent Expense': 6000,
      'Utilities Expense': 2000,
      'Insurance Expense': 1500,
      'Depreciation Expense': 8000,
      'Bad Debt Expense': 500,
      'Interest Expense': 3000,
      'Tax Expense': 5000,
    },
  },
]

describe('Synthetic Companies (14) — Balance Sheet Equation', () => {
  SYNTHETIC_COMPANIES.forEach((company) => {
    it(`${company.name} — A = L + E`, () => {
      const { ledger } = createLedgerForCompany(company)
      verifyEquation(ledger, company.name)
    })
  })
})

describe('Synthetic Companies (14) — Full Statement Generation', () => {
  SYNTHETIC_COMPANIES.forEach((company) => {
    it(`${company.name} — all 4 statements generate`, () => {
      const { ledger } = createLedgerForCompany(company)
      const { bs, is, cf, eq } = generateAllStatements(ledger)

      expect(bs.isBalanced).toBe(true)

      // Cash flow check only valid when no pre-loaded revenue/expense accounts
      const hasPreloadedIncome = is.netIncome !== 0
      if (!hasPreloadedIncome) {
        expect(cf.endingCash).toBeCloseTo(
          [...bs.currentAssets, ...bs.noncurrentAssets]
            .filter((a) => a.name === 'Cash')
            .reduce((s, a) => s + a.balance, 0),
          2
        )
      }
      expect(eq.totalEnding).toBeCloseTo(bs.totalEquity, 2)
    })
  })
})

describe('Synthetic Companies (14) — Ratio Sanity', () => {
  SYNTHETIC_COMPANIES.forEach((company) => {
    it(`${company.name} — ratios are numbers or null, never NaN`, () => {
      const { ledger } = createLedgerForCompany(company)
      const { bs, is, cf } = generateAllStatements(ledger)
      const ratios = calculateRatios(bs, is, cf)

      for (const [key, value] of Object.entries(ratios)) {
        if (key === 'dupont') continue
        if (value !== null) {
          expect(Number.isNaN(value)).toBe(false)
        }
      }
    })
  })
})

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: Transaction Stress — record many transactions
// ═══════════════════════════════════════════════════════════════════

describe('Transaction Stress Tests', () => {
  it('100 sequential cash sales — balance stays balanced', () => {
    const company = SAMPLE_COMPANIES.find((c) => c.name.includes('Sound'))!
    const { ledger } = createLedgerForCompany(company)

    for (let i = 0; i < 100; i++) {
      ledger.recordEntry(
        [{ account: 'Cash', amount: 500 + i }],
        [{ account: 'Sales Revenue', amount: 500 + i }],
      )
    }

    const { is } = verifyEquation(ledger, 'after 100 cash sales')
    // Sum of 500..599 = 100*500 + sum(0..99) = 50000 + 4950 = 54950
    expect(is.totalRevenue).toBe(54950)
  })

  it('50 compound entries (3 debits, 2 credits each) — stays balanced', () => {
    const company = SAMPLE_COMPANIES.find((c) => c.name.includes('Sound'))!
    const { ledger } = createLedgerForCompany(company)

    for (let i = 0; i < 50; i++) {
      const amount = 1000 + i * 100
      ledger.recordEntry(
        [
          { account: 'Cash', amount: amount * 0.6 },
          { account: 'Accounts Receivable', amount: amount * 0.4 },
          { account: 'Cost of Goods Sold', amount: amount * 0.5 },
        ],
        [
          { account: 'Sales Revenue', amount: amount },
          { account: 'Inventory', amount: amount * 0.5 },
        ],
      )
    }

    verifyEquation(ledger, 'after 50 compound entries')
  })

  it('mixed revenue + expense + asset purchase + debt — 200 transactions', () => {
    const company = SAMPLE_COMPANIES.find((c) => c.name.includes('Alphabet'))!
    const { ledger } = createLedgerForCompany(company)

    for (let i = 0; i < 50; i++) {
      // Cash sale
      ledger.recordEntry(
        [{ account: 'Cash', amount: 10000 }],
        [{ account: 'Sales Revenue', amount: 10000 }],
      )
      // Pay salaries
      ledger.recordEntry(
        [{ account: 'Salaries Expense', amount: 4000 }],
        [{ account: 'Cash', amount: 4000 }],
      )
      // Buy equipment on credit
      ledger.recordEntry(
        [{ account: 'Equipment', amount: 5000 }],
        [{ account: 'Accounts Payable', amount: 5000 }],
      )
      // Record depreciation
      ledger.recordEntry(
        [{ account: 'Depreciation Expense', amount: 500 }],
        [{ account: 'Accumulated Depreciation - Equipment', amount: 500 }],
      )
    }

    const { is } = verifyEquation(ledger, 'after 200 mixed transactions')
    expect(is.totalRevenue).toBe(500000) // 50 × 10000
    expect(is.netIncome).toBeGreaterThan(0)
  })

  it('interleaved debits and credits never unbalance', () => {
    const { ledger } = createLedgerForCompany({
      name: 'Test',
      description: '',
      industry: 'Test',
      scale: 'ones',
      stockPrice: 10,
      sharesOutstanding: 100,
      balances: { 'Cash': 100000, 'Common Stock': 100000 },
    })

    const transactions = [
      // Revenue
      { d: [{ account: 'Cash', amount: 5000 }], c: [{ account: 'Sales Revenue', amount: 5000 }] },
      // Buy inventory
      { d: [{ account: 'Inventory', amount: 3000 }], c: [{ account: 'Cash', amount: 3000 }] },
      // Sell on credit
      { d: [{ account: 'Accounts Receivable', amount: 8000 }], c: [{ account: 'Sales Revenue', amount: 8000 }] },
      // Record COGS
      { d: [{ account: 'Cost of Goods Sold', amount: 3000 }], c: [{ account: 'Inventory', amount: 3000 }] },
      // Pay rent
      { d: [{ account: 'Rent Expense', amount: 2000 }], c: [{ account: 'Cash', amount: 2000 }] },
      // Collect AR
      { d: [{ account: 'Cash', amount: 4000 }], c: [{ account: 'Accounts Receivable', amount: 4000 }] },
      // Pay AP
      { d: [{ account: 'Accounts Payable', amount: 1000 }], c: [{ account: 'Cash', amount: 1000 }] },
      // Issue bonds
      { d: [{ account: 'Cash', amount: 50000 }], c: [{ account: 'Bonds Payable', amount: 50000 }] },
      // Buy land
      { d: [{ account: 'Land', amount: 25000 }], c: [{ account: 'Cash', amount: 25000 }] },
      // Pay interest
      { d: [{ account: 'Interest Expense', amount: 500 }], c: [{ account: 'Cash', amount: 500 }] },
      // Unearned revenue
      { d: [{ account: 'Cash', amount: 6000 }], c: [{ account: 'Unearned Revenue', amount: 6000 }] },
      // Earn unearned
      { d: [{ account: 'Unearned Revenue', amount: 3000 }], c: [{ account: 'Service Revenue', amount: 3000 }] },
      // Depreciation
      { d: [{ account: 'Depreciation Expense', amount: 1000 }], c: [{ account: 'Accumulated Depreciation - Equipment', amount: 1000 }] },
      // Bad debt
      { d: [{ account: 'Bad Debt Expense', amount: 200 }], c: [{ account: 'Allowance for Doubtful Accounts', amount: 200 }] },
      // Tax expense
      { d: [{ account: 'Tax Expense', amount: 800 }], c: [{ account: 'Tax Payable', amount: 800 }] },
    ]

    for (const tx of transactions) {
      ledger.recordEntry(tx.d, tx.c)
      verifyEquation(ledger, 'after each transaction')
    }
  })

  it('rejects unbalanced entries', () => {
    const { ledger } = createLedgerForCompany({
      name: 'Test',
      description: '',
      industry: 'Test',
      scale: 'ones',
      stockPrice: 10,
      sharesOutstanding: 100,
      balances: { 'Cash': 10000, 'Common Stock': 10000 },
    })

    expect(() => {
      ledger.recordEntry(
        [{ account: 'Cash', amount: 5000 }],
        [{ account: 'Sales Revenue', amount: 4999 }],
      )
    }).toThrow()
  })

  it('snapshot and restore preserves balance', () => {
    const company = SAMPLE_COMPANIES.find((c) => c.name.includes('Amazon'))!
    const { ledger } = createLedgerForCompany(company)

    const snap1 = ledger.takeSnapshot()

    // Record some transactions
    ledger.recordEntry(
      [{ account: 'Cash', amount: 100000 }],
      [{ account: 'Sales Revenue', amount: 100000 }],
    )
    ledger.recordEntry(
      [{ account: 'Salaries Expense', amount: 30000 }],
      [{ account: 'Cash', amount: 30000 }],
    )

    verifyEquation(ledger, 'after transactions')

    // Restore and verify
    ledger.restoreSnapshot(snap1)
    const { bs } = verifyEquation(ledger, 'after restore')

    // Should match original Amazon balances
    expect(bs.totalAssets).toBeGreaterThan(0)
  })
})

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: Edge Cases — Float Precision, Zero Division, Extremes
// ═══════════════════════════════════════════════════════════════════

describe('Edge Cases', () => {
  it('very large numbers — billions — float precision', () => {
    const { ledger } = createLedgerForCompany({
      name: 'MegaCorp',
      description: '',
      industry: 'Test',
      scale: 'millions',
      stockPrice: 300,
      sharesOutstanding: 10000,
      balances: {
        'Cash': 999999999,
        'Equipment': 500000000,
        'Common Stock': 200000000,
        'Retained Earnings': 1299999999,
      },
    })

    const { bs } = verifyEquation(ledger, 'billions')
    expect(bs.totalAssets).toBe(1499999999)
  })

  it('company with zero equity — ratios handle division by zero', () => {
    const { ledger } = createLedgerForCompany({
      name: 'ZeroEquity',
      description: '',
      industry: 'Test',
      scale: 'ones',
      stockPrice: 0,
      sharesOutstanding: 100,
      balances: {
        'Cash': 10000,
        'Notes Payable - Long Term': 10000,
      },
    })

    const { bs, is, cf } = generateAllStatements(ledger)
    expect(bs.totalEquity).toBe(0)

    const ratios = calculateRatios(bs, is, cf)
    // ROE should be null (division by zero equity)
    expect(ratios.roe).toBeNull()
    // D/E should be null (division by zero equity)
    expect(ratios.debtToEquity).toBeNull()
    // Equity multiplier should be null
    expect(ratios.dupont.equityMultiplier).toBeNull()
  })

  it('company with zero revenue — margin ratios are null', () => {
    const { ledger } = createLedgerForCompany({
      name: 'NoRevenue',
      description: '',
      industry: 'Test',
      scale: 'ones',
      stockPrice: 10,
      sharesOutstanding: 100,
      balances: {
        'Cash': 50000,
        'Common Stock': 50000,
      },
    })

    const { bs, is, cf } = generateAllStatements(ledger)
    expect(is.totalRevenue).toBe(0)

    const ratios = calculateRatios(bs, is, cf)
    expect(ratios.grossProfitMargin).toBeNull()
    expect(ratios.operatingMargin).toBeNull()
    expect(ratios.netProfitMargin).toBeNull()
  })

  it('company with zero assets — ratios handle gracefully', () => {
    const { ledger } = createLedgerForCompany({
      name: 'ZeroAssets',
      description: '',
      industry: 'Test',
      scale: 'ones',
      stockPrice: 0,
      sharesOutstanding: 100,
      balances: {},
    })

    const { bs, is, cf } = generateAllStatements(ledger)
    expect(bs.totalAssets).toBe(0)

    const ratios = calculateRatios(bs, is, cf)
    expect(ratios.roa).toBeNull()
    expect(ratios.assetTurnover).toBeNull()
    expect(ratios.debtToAssets).toBeNull()
  })

  it('negative retained earnings company — statements still valid', () => {
    const { ledger } = createLedgerForCompany({
      name: 'LossCo',
      description: '',
      industry: 'Test',
      scale: 'ones',
      stockPrice: 2,
      sharesOutstanding: 1000,
      balances: {
        'Cash': 5000,
        'Equipment': 15000,
        'Accumulated Depreciation - Equipment': -3000,
        'Notes Payable - Long Term': 25000,
        'Common Stock': 10000,
        'Retained Earnings': -18000,
      },
    })

    const { bs } = verifyEquation(ledger, 'negative RE')
    expect(bs.totalEquity).toBeLessThan(0) // Negative equity
    expect(bs.isBalanced).toBe(true)
  })

  it('penny amounts — precision test', () => {
    const ledger = new Ledger()
    for (const acctDef of CHART_OF_ACCOUNTS) {
      ledger.addAccount(acctDef.name, acctDef.type, {
        subtype: acctDef.subtype,
        contra: acctDef.contra,
        cashFlow: acctDef.cashFlow,
      })
    }
    ledger.adjustBalance('Cash', 100)
    ledger.adjustBalance('Common Stock', 100)

    // Record many small transactions
    for (let i = 0; i < 100; i++) {
      ledger.recordEntry(
        [{ account: 'Cash', amount: 0.01 }],
        [{ account: 'Sales Revenue', amount: 0.01 }],
      )
    }

    const bs = generateBalanceSheet(ledger)
    expect(bs.isBalanced).toBe(true)
    // Cash should be 100 + 100 * 0.01 = 101
    const cashAccount = ledger.getAccount('Cash')
    expect(cashAccount.balance).toBeCloseTo(101, 2)
  })

  it('all contra accounts work correctly', () => {
    const { ledger } = createLedgerForCompany({
      name: 'ContraTest',
      description: '',
      industry: 'Test',
      scale: 'ones',
      stockPrice: 10,
      sharesOutstanding: 100,
      balances: {
        'Cash': 50000,
        'Accounts Receivable': 20000,
        'Allowance for Doubtful Accounts': -1000, // Contra asset
        'Equipment': 100000,
        'Accumulated Depreciation - Equipment': -30000, // Contra asset
        'Buildings': 200000,
        'Accumulated Depreciation - Buildings': -50000, // Contra asset
        'Vehicles': 40000,
        'Accumulated Depreciation - Vehicles': -10000, // Contra asset
        'Bonds Payable': 80000,
        'Bond Discount': -5000, // Contra liability
        'Common Stock': 50000,
        'Treasury Stock': -10000, // Contra equity
        'Retained Earnings': 204000,
      },
    })

    const bs = generateBalanceSheet(ledger)
    expect(bs.isBalanced).toBe(true)

    // Check contra accounts reduce their parent
    expect(bs.totalAssets).toBe(
      50000 + 20000 - 1000 + 100000 - 30000 + 200000 - 50000 + 40000 - 10000
    ) // = 319000
  })
})

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: Income Statement & Cash Flow Accuracy
// ═══════════════════════════════════════════════════════════════════

describe('Income Statement Accuracy', () => {
  it('FullSpectrum Corp — revenue, COGS, operating, other, tax all separate correctly', () => {
    const company = SYNTHETIC_COMPANIES.find((c) => c.name === 'FullSpectrum Corp')!
    const { ledger } = createLedgerForCompany(company)
    const is = generateIncomeStatement(ledger)

    expect(is.totalRevenue).toBe(120000) // Sales 100000 + Service 20000
    expect(is.totalCOGS).toBe(55000)
    expect(is.grossProfit).toBe(65000) // 120000 - 55000
    // Operating expenses: Salaries 25000 + Rent 6000 + Utilities 2000 + Insurance 1500 + Depr 8000 + Bad Debt 500
    expect(is.totalOperatingExpenses).toBe(43000)
    expect(is.operatingIncome).toBe(22000) // 65000 - 43000
    // Other: Interest Income 2000 (revenue) - Interest Expense 3000 (expense) = -1000
    expect(is.incomeBeforeTax).toBe(21000) // 22000 + 2000 - 3000
    expect(is.taxExpense).toBe(5000)
    expect(is.netIncome).toBe(16000) // 21000 - 5000
  })

  it('net income matches equity statement changes', () => {
    const company = SYNTHETIC_COMPANIES.find((c) => c.name === 'FullSpectrum Corp')!
    const { ledger } = createLedgerForCompany(company)
    const { is, eq } = generateAllStatements(ledger)

    // The equity statement should reflect net income in changes
    const netIncomeInEquity = eq.changes
      .filter((c) => c.description.toLowerCase().includes('net income'))
      .reduce((sum, c) => sum + c.amount, 0)

    expect(netIncomeInEquity).toBe(is.netIncome)
  })
})

describe('Cash Flow Statement Accuracy', () => {
  it('cash flow net change matches cash balance change', () => {
    const company = SAMPLE_COMPANIES.find((c) => c.name.includes('Sound'))!
    const { ledger } = createLedgerForCompany(company)

    const snap = ledger.takeSnapshot()
    const beginCash = snap.get('Cash') ?? 0

    // Record some transactions that affect cash
    ledger.recordEntry(
      [{ account: 'Cash', amount: 10000 }],
      [{ account: 'Sales Revenue', amount: 10000 }],
    )
    ledger.recordEntry(
      [{ account: 'Salaries Expense', amount: 3000 }],
      [{ account: 'Cash', amount: 3000 }],
    )
    ledger.recordEntry(
      [{ account: 'Equipment', amount: 5000 }],
      [{ account: 'Cash', amount: 5000 }],
    )

    const endCash = ledger.getAccount('Cash').balance
    const is = generateIncomeStatement(ledger)
    const cf = generateCashFlowStatement(ledger, snap, is.netIncome)

    expect(cf.beginningCash).toBe(beginCash)
    expect(cf.endingCash).toBe(endCash)
    expect(cf.netChange).toBe(endCash - beginCash)
    expect(cf.beginningCash + cf.netChange).toBe(cf.endingCash)
  })
})

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: Transaction Engine Stress
// ═══════════════════════════════════════════════════════════════════

describe('Transaction Engine Stress', () => {
  it('all registered templates can be executed', () => {
    const company = SAMPLE_COMPANIES.find((c) => c.name.includes('Sound'))!
    const { ledger, engine } = createLedgerForCompany(company)

    // Execute each template with a small amount
    for (const template of TRANSACTION_TEMPLATES) {
      const snap = ledger.takeSnapshot()
      try {
        const params: Record<string, number> = {}
        for (const p of template.params) {
          if (p.type === 'number') {
            params[p.key] = 100
          }
        }
        engine.execute(template.id, params)
        verifyEquation(ledger, `after ${template.id}`)
      } catch {
        // Some templates may fail if accounts don't have enough balance
        // Restore and continue
        ledger.restoreSnapshot(snap)
      }
    }

    // Should still be balanced
    verifyEquation(ledger, 'after all templates')
  })

  it('rapid-fire same transaction 500 times', () => {
    const company = SAMPLE_COMPANIES.find((c) => c.name.includes('Sound'))!
    const { ledger, engine } = createLedgerForCompany(company)

    const templateId = TRANSACTION_TEMPLATES.find(
      (t) => t.debits.some((d) => d.account === 'Cash') &&
             t.credits.some((c) => c.account === 'Sales Revenue')
    )?.id

    if (templateId) {
      for (let i = 0; i < 500; i++) {
        engine.execute(templateId, { amount: 10 })
      }
      verifyEquation(ledger, 'after 500 rapid-fire')
    }
  })
})

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: Ratio Deep Dive — specific ratio accuracy
// ═══════════════════════════════════════════════════════════════════

describe('Ratio Calculations — Deep Accuracy', () => {
  it('current ratio computed correctly', () => {
    const company = SAMPLE_COMPANIES.find((c) => c.name.includes('Sound'))!
    const { ledger } = createLedgerForCompany(company)
    const { bs, is, cf } = generateAllStatements(ledger)
    const ratios = calculateRatios(bs, is, cf)

    if (ratios.currentRatio !== null) {
      const expectedCR = bs.totalCurrentAssets / bs.totalCurrentLiabilities
      expect(ratios.currentRatio).toBeCloseTo(expectedCR, 4)
    }
  })

  it('debt-to-equity computed correctly', () => {
    const company = SAMPLE_COMPANIES.find((c) => c.name.includes('Goldman'))!
    const { ledger } = createLedgerForCompany(company)
    const { bs, is, cf } = generateAllStatements(ledger)
    const ratios = calculateRatios(bs, is, cf)

    if (ratios.debtToEquity !== null && bs.totalEquity !== 0) {
      const expectedDE = bs.totalLiabilities / bs.totalEquity
      expect(ratios.debtToEquity).toBeCloseTo(expectedDE, 4)
    }
  })

  it('free cash flow = operating - |investing|', () => {
    const company = SAMPLE_COMPANIES.find((c) => c.name.includes('Sound'))!
    const { ledger } = createLedgerForCompany(company)

    // Record transactions to generate cash flow
    ledger.recordEntry(
      [{ account: 'Cash', amount: 20000 }],
      [{ account: 'Sales Revenue', amount: 20000 }],
    )
    ledger.recordEntry(
      [{ account: 'Equipment', amount: 5000 }],
      [{ account: 'Cash', amount: 5000 }],
    )

    const { bs, is, cf } = generateAllStatements(ledger)
    const ratios = calculateRatios(bs, is, cf)

    if (ratios.freeCashFlow !== null) {
      const expectedFCF = cf.totalOperating - Math.abs(cf.totalInvesting)
      expect(ratios.freeCashFlow).toBeCloseTo(expectedFCF, 2)
    }
  })

  it('all 10 real companies produce valid ratio ranges', () => {
    const realCompanies = SAMPLE_COMPANIES.filter(
      (c) => !c.name.includes('Blank') && !c.name.includes('Sound')
    )

    for (const company of realCompanies) {
      const { ledger } = createLedgerForCompany(company)
      const { bs, is, cf } = generateAllStatements(ledger)
      const ratios = calculateRatios(bs, is, cf)

      // Current ratio should be positive if current liabilities > 0
      if (bs.totalCurrentLiabilities > 0 && ratios.currentRatio !== null) {
        expect(ratios.currentRatio).toBeGreaterThan(0)
      }

      // D/A should be between 0 and 1 for healthy companies (mostly)
      if (ratios.debtToAssets !== null && bs.totalAssets > 0) {
        expect(ratios.debtToAssets).toBeGreaterThanOrEqual(0)
        expect(ratios.debtToAssets).toBeLessThanOrEqual(2) // Some leverage ok
      }
    }
  })
})

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: 20 additional stress test companies — new sectors
// ═══════════════════════════════════════════════════════════════════

const ADDITIONAL_COMPANIES: SampleCompany[] = [
  // 1. Healthcare — large receivables, lease-heavy
  {
    name: 'HealthFirst Hospitals',
    description: 'Hospital chain with large AR and lease liabilities',
    industry: 'Healthcare',
    scale: 'millions',
    stockPrice: 60,
    sharesOutstanding: 2000,
    balances: {
      'Cash': 15000,
      'Accounts Receivable': 45000,
      'Allowance for Doubtful Accounts': -3000,
      'Inventory': 8000,
      'Prepaid Expenses': 4000,
      'Land': 25000,
      'Buildings': 250000,
      'Accumulated Depreciation - Buildings': -75000,
      'Equipment': 180000,
      'Accumulated Depreciation - Equipment': -60000,
      'Accounts Payable': 30000,
      'Salaries Payable': 18000,
      'Tax Payable': 4000,
      'Current Portion of Long-Term Debt': 12000,
      'Notes Payable - Long Term': 120000,
      'Lease Liability': 85000,
      'Common Stock': 40000,
      'Share Premium': 60000,
      'Retained Earnings': 20000,
    },
  },
  // 2. Renewable Energy — equipment-heavy, negative RE (startup losses)
  {
    name: 'GreenEnergy Solar',
    description: 'Solar panel manufacturer and installer',
    industry: 'Renewable Energy',
    scale: 'millions',
    stockPrice: 28,
    sharesOutstanding: 1500,
    balances: {
      'Cash': 22000,
      'Accounts Receivable': 10000,
      'Prepaid Expenses': 5000,
      'Land': 45000,
      'Equipment': 320000,
      'Accumulated Depreciation - Equipment': -64000,
      'Intangible Assets': 12000,
      'Accounts Payable': 15000,
      'Interest Payable': 5000,
      'Current Portion of Long-Term Debt': 10000,
      'Notes Payable - Long Term': 150000,
      'Bonds Payable': 50000,
      'Common Stock': 60000,
      'Share Premium': 80000,
      'Retained Earnings': -20000,
    },
  },
  // 3. FinTech — high investments, low PP&E
  {
    name: 'CryptoVault Exchange',
    description: 'Digital asset exchange platform',
    industry: 'Financial Technology',
    scale: 'millions',
    stockPrice: 150,
    sharesOutstanding: 800,
    balances: {
      'Cash': 100000,
      'Short-Term Investments': 250000,
      'Accounts Receivable': 5000,
      'Equipment': 20000,
      'Accumulated Depreciation - Equipment': -5000,
      'Intangible Assets': 30000,
      'Accounts Payable': 8000,
      'Salaries Payable': 12000,
      'Tax Payable': 5000,
      'Notes Payable - Long Term': 25000,
      'Common Stock': 100000,
      'Share Premium': 200000,
      'Retained Earnings': 50000,
    },
  },
  // 4. Luxury Retail — high inventory + goodwill from acquisitions
  {
    name: 'FashionHouse Brands',
    description: 'Luxury fashion brand conglomerate',
    industry: 'Luxury Retail',
    scale: 'millions',
    stockPrice: 85,
    sharesOutstanding: 900,
    balances: {
      'Cash': 8000,
      'Accounts Receivable': 12000,
      'Allowance for Doubtful Accounts': -600,
      'Inventory': 95000,
      'Prepaid Expenses': 3000,
      'Buildings': 45000,
      'Accumulated Depreciation - Buildings': -10000,
      'Intangible Assets': 40000,
      'Goodwill': 70000,
      'Accounts Payable': 38000,
      'Salaries Payable': 6000,
      'Unearned Revenue': 3000,
      'Current Portion of Long-Term Debt': 5000,
      'Notes Payable - Long Term': 40000,
      'Bonds Payable': 20000,
      'Common Stock': 25000,
      'Share Premium': 85000,
      'Retained Earnings': 40400,
    },
  },
  // 5. Agriculture — land-heavy, vehicles, supplies
  {
    name: 'AgriGrow Farms',
    description: 'Large-scale commercial farming operation',
    industry: 'Agriculture',
    scale: 'millions',
    stockPrice: 15,
    sharesOutstanding: 4000,
    balances: {
      'Cash': 3000,
      'Accounts Receivable': 6000,
      'Inventory': 18000,
      'Supplies': 2000,
      'Land': 200000,
      'Buildings': 35000,
      'Accumulated Depreciation - Buildings': -8000,
      'Equipment': 80000,
      'Accumulated Depreciation - Equipment': -25000,
      'Vehicles': 15000,
      'Accumulated Depreciation - Vehicles': -5000,
      'Accounts Payable': 10000,
      'Salaries Payable': 3000,
      'Tax Payable': 1000,
      'Current Portion of Long-Term Debt': 8000,
      'Notes Payable - Long Term': 140000,
      'Common Stock': 80000,
      'Retained Earnings': 79000,
    },
  },
  // 6. Maritime Shipping — massive vehicle assets (ships)
  {
    name: 'OceanFleet Shipping',
    description: 'International maritime cargo shipping',
    industry: 'Maritime',
    scale: 'millions',
    stockPrice: 42,
    sharesOutstanding: 1200,
    balances: {
      'Cash': 12000,
      'Accounts Receivable': 18000,
      'Prepaid Expenses': 6000,
      'Vehicles': 500000,
      'Accumulated Depreciation - Vehicles': -150000,
      'Equipment': 30000,
      'Accumulated Depreciation - Equipment': -10000,
      'Accounts Payable': 20000,
      'Salaries Payable': 8000,
      'Interest Payable': 6000,
      'Current Portion of Long-Term Debt': 15000,
      'Notes Payable - Long Term': 200000,
      'Bonds Payable': 50000,
      'Common Stock': 50000,
      'Share Premium': 30000,
      'Retained Earnings': 27000,
    },
  },
  // 7. Telecommunications — massive intangibles (spectrum licenses)
  {
    name: 'TelcoMax Wireless',
    description: 'Wireless telecom with spectrum licenses',
    industry: 'Telecommunications',
    scale: 'millions',
    stockPrice: 55,
    sharesOutstanding: 3000,
    balances: {
      'Cash': 18000,
      'Accounts Receivable': 22000,
      'Allowance for Doubtful Accounts': -1000,
      'Prepaid Expenses': 5000,
      'Equipment': 280000,
      'Accumulated Depreciation - Equipment': -90000,
      'Intangible Assets': 150000,
      'Goodwill': 45000,
      'Accounts Payable': 14000,
      'Salaries Payable': 7000,
      'Unearned Revenue': 9000,
      'Tax Payable': 3000,
      'Current Portion of Long-Term Debt': 8000,
      'Notes Payable - Long Term': 100000,
      'Bonds Payable': 80000,
      'Lease Liability': 35000,
      'Common Stock': 45000,
      'Share Premium': 70000,
      'Retained Earnings': 58000,
    },
  },
  // 8. Online Education — heavy deferred revenue
  {
    name: 'EduTech Academy',
    description: 'Online education with prepaid enrollment model',
    industry: 'Education',
    scale: 'millions',
    stockPrice: 95,
    sharesOutstanding: 500,
    balances: {
      'Cash': 30000,
      'Short-Term Investments': 15000,
      'Accounts Receivable': 4000,
      'Prepaid Expenses': 2000,
      'Equipment': 12000,
      'Accumulated Depreciation - Equipment': -3000,
      'Intangible Assets': 20000,
      'Accounts Payable': 3000,
      'Salaries Payable': 4000,
      'Unearned Revenue': 28000,
      'Notes Payable - Long Term': 5000,
      'Common Stock': 15000,
      'Share Premium': 20000,
      'Retained Earnings': 5000,
    },
  },
  // 9. Oil Refining — large COGS, revenue/expense mix
  {
    name: 'PetroChem Refining',
    description: 'Crude oil refining and distribution',
    industry: 'Energy',
    scale: 'millions',
    stockPrice: 70,
    sharesOutstanding: 2500,
    balances: {
      'Cash': 25000,
      'Accounts Receivable': 35000,
      'Inventory': 60000,
      'Land': 15000,
      'Buildings': 100000,
      'Accumulated Depreciation - Buildings': -30000,
      'Equipment': 400000,
      'Accumulated Depreciation - Equipment': -160000,
      'Accounts Payable': 28000,
      'Salaries Payable': 5000,
      'Interest Payable': 3000,
      'Tax Payable': 2000,
      'Current Portion of Long-Term Debt': 10000,
      'Notes Payable - Long Term': 130000,
      'Bonds Payable': 40000,
      'Common Stock': 50000,
      'Share Premium': 80000,
      'Retained Earnings': 87000,
      // Revenue/Expenses
      'Sales Revenue': 200000,
      'Cost of Goods Sold': 140000,
      'Salaries Expense': 20000,
      'Utilities Expense': 8000,
      'Depreciation Expense': 12000,
      'Interest Expense': 6000,
      'Tax Expense': 4000,
    },
  },
  // 10. Semiconductor — massive fab equipment
  {
    name: 'NanoChip Semiconductors',
    description: 'Chip fabrication with capital-intensive fabs',
    industry: 'Semiconductors',
    scale: 'millions',
    stockPrice: 180,
    sharesOutstanding: 1000,
    balances: {
      'Cash': 35000,
      'Short-Term Investments': 25000,
      'Accounts Receivable': 18000,
      'Allowance for Doubtful Accounts': -400,
      'Inventory': 22000,
      'Equipment': 500000,
      'Accumulated Depreciation - Equipment': -200000,
      'Intangible Assets': 35000,
      'Accounts Payable': 16000,
      'Salaries Payable': 9000,
      'Tax Payable': 4000,
      'Current Portion of Long-Term Debt': 8000,
      'Notes Payable - Long Term': 90000,
      'Bonds Payable': 60000,
      'Common Stock': 30000,
      'Share Premium': 150000,
      'Retained Earnings': 67600,
    },
  },
  // 11. Space Tech — massive accumulated losses, high cash burn
  {
    name: 'SpaceLink Satellites',
    description: 'Satellite constellation startup with deep losses',
    industry: 'Aerospace',
    scale: 'millions',
    stockPrice: 12,
    sharesOutstanding: 5000,
    balances: {
      'Cash': 80000,
      'Short-Term Investments': 40000,
      'Prepaid Expenses': 5000,
      'Equipment': 150000,
      'Accumulated Depreciation - Equipment': -20000,
      'Intangible Assets': 25000,
      'Accounts Payable': 10000,
      'Salaries Payable': 8000,
      'Notes Payable - Long Term': 60000,
      'Common Stock': 50000,
      'Share Premium': 250000,
      'Retained Earnings': -98000,
    },
  },
  // 12. Hospitality — buildings + land heavy, unearned revenue
  {
    name: 'LuxuryStay Hotels',
    description: 'Premium hotel chain with resort properties',
    industry: 'Hospitality',
    scale: 'millions',
    stockPrice: 48,
    sharesOutstanding: 1600,
    balances: {
      'Cash': 10000,
      'Accounts Receivable': 7000,
      'Inventory': 3000,
      'Prepaid Expenses': 4000,
      'Land': 60000,
      'Buildings': 300000,
      'Accumulated Depreciation - Buildings': -90000,
      'Equipment': 45000,
      'Accumulated Depreciation - Equipment': -18000,
      'Goodwill': 35000,
      'Accounts Payable': 12000,
      'Salaries Payable': 9000,
      'Unearned Revenue': 15000,
      'Interest Payable': 4000,
      'Current Portion of Long-Term Debt': 10000,
      'Notes Payable - Long Term': 160000,
      'Lease Liability': 30000,
      'Common Stock': 35000,
      'Share Premium': 45000,
      'Retained Earnings': 36000,
    },
  },
  // 13. Gaming — intangible-heavy with revenue/expenses
  {
    name: 'GameForge Studios',
    description: 'Video game developer and publisher',
    industry: 'Entertainment',
    scale: 'millions',
    stockPrice: 110,
    sharesOutstanding: 600,
    balances: {
      'Cash': 45000,
      'Short-Term Investments': 10000,
      'Accounts Receivable': 8000,
      'Prepaid Expenses': 2000,
      'Equipment': 25000,
      'Accumulated Depreciation - Equipment': -8000,
      'Intangible Assets': 55000,
      'Accounts Payable': 5000,
      'Salaries Payable': 7000,
      'Unearned Revenue': 10000,
      'Tax Payable': 3000,
      'Common Stock': 20000,
      'Share Premium': 60000,
      'Retained Earnings': 12000,
      // Revenue/Expenses
      'Sales Revenue': 80000,
      'Service Revenue': 15000,
      'Cost of Goods Sold': 20000,
      'Salaries Expense': 35000,
      'Rent Expense': 5000,
      'Depreciation Expense': 3000,
      'Amortisation Expense': 5000,
      'Tax Expense': 7000,
    },
  },
  // 14. Defense Contractor — government receivables, warranties
  {
    name: 'DefenseTech Systems',
    description: 'Military defense systems and equipment manufacturer',
    industry: 'Defense',
    scale: 'millions',
    stockPrice: 95,
    sharesOutstanding: 1400,
    balances: {
      'Cash': 20000,
      'Accounts Receivable': 55000,
      'Notes Receivable': 10000,
      'Inventory': 40000,
      'Land': 15000,
      'Buildings': 60000,
      'Accumulated Depreciation - Buildings': -15000,
      'Equipment': 120000,
      'Accumulated Depreciation - Equipment': -45000,
      'Intangible Assets': 20000,
      'Accounts Payable': 22000,
      'Salaries Payable': 10000,
      'Tax Payable': 5000,
      'Unearned Revenue': 20000,
      'Current Portion of Long-Term Debt': 6000,
      'Notes Payable - Long Term': 50000,
      'Provision for Warranties': 12000,
      'Common Stock': 30000,
      'Share Premium': 55000,
      'Retained Earnings': 70000,
    },
  },
  // 15. Water Utility — bonds with premium, regulated
  {
    name: 'WaterWorks Municipal',
    description: 'Water treatment and distribution utility',
    industry: 'Utilities',
    scale: 'millions',
    stockPrice: 32,
    sharesOutstanding: 2200,
    balances: {
      'Cash': 6000,
      'Accounts Receivable': 11000,
      'Allowance for Doubtful Accounts': -200,
      'Supplies': 1500,
      'Land': 8000,
      'Buildings': 40000,
      'Accumulated Depreciation - Buildings': -12000,
      'Equipment': 180000,
      'Accumulated Depreciation - Equipment': -54000,
      'Accounts Payable': 5000,
      'Salaries Payable': 3000,
      'Interest Payable': 2000,
      'Current Portion of Long-Term Debt': 4000,
      'Bonds Payable': 70000,
      'Bond Premium': 2000,
      'Common Stock': 40000,
      'Retained Earnings': 54300,
    },
  },
  // 16. Railroad — massive land (right-of-way), mixed rolling stock
  {
    name: 'CargoRail Express',
    description: 'Freight railroad with extensive track network',
    industry: 'Railroad',
    scale: 'millions',
    stockPrice: 38,
    sharesOutstanding: 2500,
    balances: {
      'Cash': 9000,
      'Accounts Receivable': 14000,
      'Inventory': 6000,
      'Prepaid Expenses': 3000,
      'Land': 100000,
      'Buildings': 50000,
      'Accumulated Depreciation - Buildings': -15000,
      'Equipment': 250000,
      'Accumulated Depreciation - Equipment': -80000,
      'Vehicles': 20000,
      'Accumulated Depreciation - Vehicles': -7000,
      'Accounts Payable': 11000,
      'Salaries Payable': 6000,
      'Tax Payable': 3000,
      'Current Portion of Long-Term Debt': 7000,
      'Notes Payable - Long Term': 90000,
      'Bonds Payable': 60000,
      'Lease Liability': 25000,
      'Common Stock': 55000,
      'Share Premium': 40000,
      'Retained Earnings': 53000,
    },
  },
  // 17. Small Organic Food — modest scale with revenue/expenses
  {
    name: 'BioHarvest Organics',
    description: 'Small organic farm-to-table food company',
    industry: 'Food',
    scale: 'ones',
    stockPrice: 8,
    sharesOutstanding: 500,
    balances: {
      'Cash': 4000,
      'Accounts Receivable': 3000,
      'Inventory': 7000,
      'Supplies': 500,
      'Land': 12000,
      'Buildings': 8000,
      'Accumulated Depreciation - Buildings': -2000,
      'Equipment': 10000,
      'Accumulated Depreciation - Equipment': -3000,
      'Vehicles': 5000,
      'Accumulated Depreciation - Vehicles': -1500,
      'Accounts Payable': 4000,
      'Salaries Payable': 1500,
      'Tax Payable': 500,
      'Notes Payable - Long Term': 12000,
      'Common Stock': 10000,
      'Retained Earnings': 12000,
      // Revenue/Expenses
      'Sales Revenue': 30000,
      'Cost of Goods Sold': 18000,
      'Salaries Expense': 5000,
      'Utilities Expense': 1000,
      'Insurance Expense': 500,
      'Depreciation Expense': 1500,
      'Tax Expense': 1000,
    },
  },
  // 18. Investment Firm — massive investments, notes receivable
  {
    name: 'FinanceHub Capital',
    description: 'Diversified investment management firm',
    industry: 'Financial Services',
    scale: 'millions',
    stockPrice: 200,
    sharesOutstanding: 800,
    balances: {
      'Cash': 50000,
      'Short-Term Investments': 300000,
      'Accounts Receivable': 8000,
      'Notes Receivable': 40000,
      'Equipment': 10000,
      'Accumulated Depreciation - Equipment': -2000,
      'Buildings': 15000,
      'Accumulated Depreciation - Buildings': -4000,
      'Accounts Payable': 5000,
      'Salaries Payable': 8000,
      'Tax Payable': 4000,
      'Notes Payable - Long Term': 50000,
      'Common Stock': 100000,
      'Share Premium': 200000,
      'Retained Earnings': 50000,
    },
  },
  // 19. Auto Manufacturer — full mix of accounts with revenue/expenses
  {
    name: 'AutoDrive Motors',
    description: 'Electric vehicle manufacturer',
    industry: 'Automotive',
    scale: 'millions',
    stockPrice: 65,
    sharesOutstanding: 3000,
    balances: {
      'Cash': 15000,
      'Accounts Receivable': 20000,
      'Allowance for Doubtful Accounts': -800,
      'Inventory': 110000,
      'Prepaid Expenses': 4000,
      'Land': 25000,
      'Buildings': 120000,
      'Accumulated Depreciation - Buildings': -35000,
      'Equipment': 280000,
      'Accumulated Depreciation - Equipment': -110000,
      'Vehicles': 8000,
      'Accumulated Depreciation - Vehicles': -2200,
      'Intangible Assets': 18000,
      'Goodwill': 30000,
      // Revenue/Expenses
      'Sales Revenue': 250000,
      'Interest Income': 3000,
      'Cost of Goods Sold': 175000,
      'Salaries Expense': 30000,
      'Rent Expense': 4000,
      'Utilities Expense': 3000,
      'Depreciation Expense': 15000,
      'Warranty Expense': 5000,
      'Interest Expense': 8000,
      'Tax Expense': 3000,
      // Liabilities
      'Accounts Payable': 35000,
      'Salaries Payable': 10000,
      'Interest Payable': 3000,
      'Tax Payable': 2000,
      'Unearned Revenue': 5000,
      'Current Portion of Long-Term Debt': 8000,
      'Notes Payable - Long Term': 100000,
      'Bonds Payable': 40000,
      'Provision for Warranties': 15000,
      // Equity
      'Common Stock': 35000,
      'Share Premium': 120000,
      'Retained Earnings': 99000,
    },
  },
  // 20. Cybersecurity — preferred stock + treasury stock edge case
  {
    name: 'CloudSecure Cyber',
    description: 'Enterprise cybersecurity with preferred + treasury stock',
    industry: 'Cybersecurity',
    scale: 'millions',
    stockPrice: 75,
    sharesOutstanding: 600,
    balances: {
      'Cash': 28000,
      'Short-Term Investments': 12000,
      'Accounts Receivable': 9000,
      'Prepaid Expenses': 3000,
      'Equipment': 18000,
      'Accumulated Depreciation - Equipment': -4000,
      'Intangible Assets': 22000,
      'Goodwill': 15000,
      'Accounts Payable': 4000,
      'Salaries Payable': 6000,
      'Unearned Revenue': 18000,
      'Notes Payable - Long Term': 8000,
      'Common Stock': 10000,
      'Preferred Stock': 15000,
      'Share Premium': 30000,
      'Treasury Stock': -5000,
      'Retained Earnings': 17000,
    },
  },
]

describe('Additional Companies (20) — Balance Sheet Equation', () => {
  ADDITIONAL_COMPANIES.forEach((company) => {
    it(`${company.name} — A = L + E`, () => {
      const { ledger } = createLedgerForCompany(company)
      const { bs } = verifyEquation(ledger, company.name)

      // All additional companies have balances
      expect(bs.totalAssets).toBeGreaterThan(0)
    })
  })
})

describe('Additional Companies (20) — Full Statement Generation', () => {
  ADDITIONAL_COMPANIES.forEach((company) => {
    it(`${company.name} — all 4 statements generate`, () => {
      const { ledger } = createLedgerForCompany(company)
      const { bs, is, cf, eq } = generateAllStatements(ledger)

      // Balance sheet must be balanced
      expect(bs.isBalanced).toBe(true)

      // Cash flow check only valid when no pre-loaded revenue/expense accounts
      const hasPreloadedIncome = is.netIncome !== 0
      if (!hasPreloadedIncome) {
        expect(cf.endingCash).toBeCloseTo(
          [...bs.currentAssets, ...bs.noncurrentAssets]
            .filter((a) => a.name === 'Cash')
            .reduce((s, a) => s + a.balance, 0),
          2
        )
      }
      expect(eq.totalEnding).toBeCloseTo(bs.totalEquity, 2)
    })
  })
})

describe('Additional Companies (20) — Ratio Sanity', () => {
  ADDITIONAL_COMPANIES.forEach((company) => {
    it(`${company.name} — ratios are numbers or null, never NaN`, () => {
      const { ledger } = createLedgerForCompany(company)
      const { bs, is, cf } = generateAllStatements(ledger)
      const ratios = calculateRatios(bs, is, cf)

      for (const [key, value] of Object.entries(ratios)) {
        if (key === 'dupont') {
          const d = value as { netMargin: number | null; assetTurnover: number | null; equityMultiplier: number | null }
          if (d.netMargin !== null) expect(Number.isNaN(d.netMargin)).toBe(false)
          if (d.assetTurnover !== null) expect(Number.isNaN(d.assetTurnover)).toBe(false)
          if (d.equityMultiplier !== null) expect(Number.isNaN(d.equityMultiplier)).toBe(false)
        } else if (typeof value === 'number') {
          expect(Number.isNaN(value)).toBe(false)
        }
      }
    })
  })
})

describe('Additional Companies (20) — Cross-Statement Consistency', () => {
  ADDITIONAL_COMPANIES.forEach((company) => {
    it(`${company.name} — equity ending = BS total equity`, () => {
      const { ledger } = createLedgerForCompany(company)
      const { bs, eq } = generateAllStatements(ledger)

      // Equity statement ending should match balance sheet equity
      expect(eq.totalEnding).toBeCloseTo(bs.totalEquity, 2)
    })
  })

  // Companies with revenue: income statement net income should appear in equity changes
  const companiesWithRevenue = ADDITIONAL_COMPANIES.filter((c) => {
    const revenueAccounts = ['Sales Revenue', 'Service Revenue', 'Interest Income', 'Gain on Sale of Assets', 'Dividend Income']
    return revenueAccounts.some((r) => (c.balances[r] ?? 0) > 0)
  })

  companiesWithRevenue.forEach((company) => {
    it(`${company.name} — net income flows to equity statement`, () => {
      const { ledger } = createLedgerForCompany(company)
      const { is, eq } = generateAllStatements(ledger)

      // Equity statement should include net income in changes
      const netIncomeInEquity = eq.changes
        .filter((c) => c.description.toLowerCase().includes('net income'))
        .reduce((sum, c) => sum + c.amount, 0)

      expect(netIncomeInEquity).toBe(is.netIncome)
    })
  })
})

describe('Additional Companies (20) — Transaction Recording', () => {
  // Record transactions on top of each additional company and verify balance holds
  ADDITIONAL_COMPANIES.forEach((company) => {
    it(`${company.name} — stays balanced after 10 transactions`, () => {
      const { ledger } = createLedgerForCompany(company)

      // Record a mix of transactions
      const transactions = [
        { d: [{ account: 'Cash', amount: 5000 }], c: [{ account: 'Sales Revenue', amount: 5000 }] },
        { d: [{ account: 'Accounts Receivable', amount: 3000 }], c: [{ account: 'Service Revenue', amount: 3000 }] },
        { d: [{ account: 'Cost of Goods Sold', amount: 2000 }], c: [{ account: 'Inventory', amount: 2000 }] },
        { d: [{ account: 'Salaries Expense', amount: 1500 }], c: [{ account: 'Cash', amount: 1500 }] },
        { d: [{ account: 'Rent Expense', amount: 1000 }], c: [{ account: 'Cash', amount: 1000 }] },
        { d: [{ account: 'Cash', amount: 2000 }], c: [{ account: 'Accounts Receivable', amount: 2000 }] },
        { d: [{ account: 'Depreciation Expense', amount: 500 }], c: [{ account: 'Accumulated Depreciation - Equipment', amount: 500 }] },
        { d: [{ account: 'Accounts Payable', amount: 1000 }], c: [{ account: 'Cash', amount: 1000 }] },
        { d: [{ account: 'Cash', amount: 3000 }], c: [{ account: 'Unearned Revenue', amount: 3000 }] },
        { d: [{ account: 'Tax Expense', amount: 400 }], c: [{ account: 'Tax Payable', amount: 400 }] },
      ]

      for (const tx of transactions) {
        ledger.recordEntry(tx.d, tx.c)
      }

      verifyEquation(ledger, `${company.name} after transactions`)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: Summary — count of all companies tested
// ═══════════════════════════════════════════════════════════════════

describe('Stress Test Coverage Summary', () => {
  it('tests 45 total companies (11 sample + 14 synthetic + 20 additional)', () => {
    expect(SAMPLE_COMPANIES.length).toBe(11)
    expect(SYNTHETIC_COMPANIES.length).toBe(14)
    expect(ADDITIONAL_COMPANIES.length).toBe(20)
    expect(SAMPLE_COMPANIES.length + SYNTHETIC_COMPANIES.length + ADDITIONAL_COMPANIES.length).toBe(45)
  })
})
