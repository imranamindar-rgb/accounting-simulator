import { describe, it, expect } from 'vitest'
import { resolve, buildStatementsFromFacts, TAG_MAP } from '../../data/xbrlTagMap'
import type { CompanyFacts } from '../secClient'

// ── Helper ───────────────────────────────────────────────────────────

function makeFacts(tags: Record<string, number>): CompanyFacts {
  const usGaap: CompanyFacts['facts']['us-gaap'] = {}
  for (const [tag, val] of Object.entries(tags)) {
    usGaap[tag] = {
      units: {
        USD: [{ form: '10-K', end: '2023-12-31', val, filed: '2024-02-01' }],
      },
    }
  }
  return {
    cik: 12345,
    entityName: 'Test Corp',
    facts: { 'us-gaap': usGaap },
  }
}

// ── Tests ────────────────────────────────────────────────────────────

describe('resolve', () => {
  it('resolves a primary tag directly', () => {
    const facts = makeFacts({ Assets: 1_000_000 })
    const val = resolve(facts, 'totalAssets')
    expect(val).toBe(1_000_000)
  })

  it('returns null for a tag that is completely absent', () => {
    const facts = makeFacts({})
    const val = resolve(facts, 'totalAssets')
    expect(val).toBeNull()
  })
})

describe('buildStatementsFromFacts', () => {
  it('maps Assets and Liabilities to BS totals', () => {
    const facts = makeFacts({
      Assets: 5_000_000,
      Liabilities: 2_000_000,
      StockholdersEquity: 3_000_000,
      AssetsCurrent: 1_500_000,
      LiabilitiesCurrent: 800_000,
    })
    const { bs } = buildStatementsFromFacts(facts)
    expect(bs.totalAssets).toBe(5_000_000)
    expect(bs.totalLiabilities).toBe(2_000_000)
    expect(bs.totalEquity).toBe(3_000_000)
    expect(bs.totalCurrentAssets).toBe(1_500_000)
    expect(bs.totalCurrentLiabilities).toBe(800_000)
  })

  it('maps Revenue and COGS to IS', () => {
    const facts = makeFacts({
      Revenues: 10_000_000,
      CostOfGoodsSold: 6_000_000,
      NetIncomeLoss: 1_000_000,
    })
    const { is } = buildStatementsFromFacts(facts)
    expect(is.totalRevenue).toBe(10_000_000)
    expect(is.totalCOGS).toBe(6_000_000)
    expect(is.grossProfit).toBe(4_000_000)
    expect(is.netIncome).toBe(1_000_000)
  })

  it('uses fallback tags when primary tag is absent', () => {
    // Use RevenueFromContractWithCustomerExcludingAssessedTax instead of Revenues
    const facts = makeFacts({
      RevenueFromContractWithCustomerExcludingAssessedTax: 8_000_000,
      CostOfRevenue: 5_000_000,
      StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest: 4_000_000,
    })
    const { is, bs } = buildStatementsFromFacts(facts)
    expect(is.totalRevenue).toBe(8_000_000)
    expect(is.totalCOGS).toBe(5_000_000)
    expect(bs.totalEquity).toBe(4_000_000)
  })

  it('returns zero for missing tags', () => {
    const facts = makeFacts({})
    const { bs, is } = buildStatementsFromFacts(facts)
    expect(bs.totalAssets).toBe(0)
    expect(is.totalRevenue).toBe(0)
    expect(is.netIncome).toBe(0)
  })
})

describe('TAG_MAP', () => {
  it('has entries for all expected semantic keys', () => {
    const expectedKeys = [
      'totalAssets', 'totalCurrentAssets', 'totalLiabilities', 'totalCurrentLiabilities',
      'totalEquity', 'cash', 'accountsReceivable', 'inventory', 'goodwill',
      'totalNoncurrentAssets', 'totalNoncurrentLiabilities', 'accountsPayable',
      'longTermDebt', 'retainedEarnings',
      'totalRevenue', 'totalCOGS', 'operatingExpenses', 'operatingIncome',
      'interestExpense', 'netIncome', 'taxExpense', 'grossProfit', 'depreciation',
      'sharesOutstanding',
    ]
    for (const key of expectedKeys) {
      expect(TAG_MAP).toHaveProperty(key)
    }
  })
})
