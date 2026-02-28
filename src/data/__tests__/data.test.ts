import { describe, it, expect } from 'vitest'
import { CHART_OF_ACCOUNTS } from '../chartOfAccounts'
import { SAMPLE_COMPANIES } from '../sampleCompanies'
import { TRANSACTION_TEMPLATES } from '../transactionTemplates'
import { TOPICS } from '../topics'

describe('Chart of Accounts', () => {
  it('has 55 accounts', () => {
    expect(CHART_OF_ACCOUNTS).toHaveLength(55)
  })

  it('all accounts have valid types', () => {
    const validTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']
    for (const acct of CHART_OF_ACCOUNTS) {
      expect(validTypes).toContain(acct.type)
    }
  })

  it('contra accounts are flagged', () => {
    const contras = CHART_OF_ACCOUNTS.filter(a => a.contra)
    // Allowance for Doubtful Accounts, Accum Depr - Buildings, Accum Depr - Equipment,
    // Accum Depr - Vehicles, Bond Discount, Treasury Stock, Dividends Declared = 7
    expect(contras).toHaveLength(7)
  })

  it('revenue and most expense accounts have no cashFlow', () => {
    const revenues = CHART_OF_ACCOUNTS.filter(a => a.type === 'Revenue')
    for (const r of revenues) {
      expect(r.cashFlow).toBeUndefined()
    }
    // Only Depreciation Expense and Amortisation Expense have cashFlow
    const expensesWithCashFlow = CHART_OF_ACCOUNTS.filter(
      a => a.type === 'Expense' && a.cashFlow !== undefined
    )
    expect(expensesWithCashFlow).toHaveLength(2)
    for (const e of expensesWithCashFlow) {
      expect(e.cashFlow).toBe('operating-adjustment')
    }
  })

  it('has correct distribution across types', () => {
    const counts = { Asset: 0, Liability: 0, Equity: 0, Revenue: 0, Expense: 0 }
    for (const acct of CHART_OF_ACCOUNTS) {
      counts[acct.type]++
    }
    expect(counts.Asset).toBe(17)      // 8 current + 9 noncurrent
    expect(counts.Liability).toBe(13)   // 7 current + 6 noncurrent
    expect(counts.Equity).toBe(7)
    expect(counts.Revenue).toBe(5)
    expect(counts.Expense).toBe(13)
  })
})

describe('Sample Companies', () => {
  it('has 11 companies', () => {
    expect(SAMPLE_COMPANIES).toHaveLength(11)
  })

  it('all balance sheets balance (A = L + E for BS accounts)', () => {
    const typeMap = new Map(CHART_OF_ACCOUNTS.map(a => [a.name, a.type]))

    for (const company of SAMPLE_COMPANIES) {
      let assets = 0, liabilities = 0, equity = 0, revenue = 0, expenses = 0
      for (const [name, bal] of Object.entries(company.balances)) {
        const type = typeMap.get(name)
        if (type === 'Asset') assets += bal
        else if (type === 'Liability') liabilities += bal
        else if (type === 'Equity') equity += bal
        else if (type === 'Revenue') revenue += bal
        else if (type === 'Expense') expenses += bal
      }
      // During an open period: A = L + E + Net Income (revenue - expenses)
      const netIncome = revenue - expenses
      expect(assets).toBeCloseTo(liabilities + equity + netIncome, 0)
    }
  })

  it('Sound & Light has correct totals', () => {
    const sl = SAMPLE_COMPANIES.find(c => c.name.includes('Sound'))!
    expect(sl.scale).toBe('ones')
    // Assets: 45000 + 32000 + (-1600) + 58000 + 3000 + 120000 + (-24000) = 232400
    const typeMap = new Map(CHART_OF_ACCOUNTS.map(a => [a.name, a.type]))
    const assets = Object.entries(sl.balances)
      .filter(([name]) => typeMap.get(name) === 'Asset')
      .reduce((sum, [, bal]) => sum + bal, 0)
    expect(assets).toBe(232400)
  })
})

describe('Transaction Templates', () => {
  it('has 24 templates', () => {
    expect(TRANSACTION_TEMPLATES).toHaveLength(24)
  })

  it('every template has at least one debit and one credit', () => {
    for (const tmpl of TRANSACTION_TEMPLATES) {
      expect(tmpl.debits.length).toBeGreaterThanOrEqual(1)
      expect(tmpl.credits.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('all referenced accounts exist in chart of accounts', () => {
    const accountNames = new Set(CHART_OF_ACCOUNTS.map(a => a.name))
    for (const tmpl of TRANSACTION_TEMPLATES) {
      for (const d of tmpl.debits) {
        expect(accountNames.has(d.account), `Missing debit account "${d.account}" in template "${tmpl.id}"`).toBe(true)
      }
      for (const c of tmpl.credits) {
        expect(accountNames.has(c.account), `Missing credit account "${c.account}" in template "${tmpl.id}"`).toBe(true)
      }
    }
  })

  it('all templates have a tier', () => {
    for (const tmpl of TRANSACTION_TEMPLATES) {
      expect(['starter', 'accruals', 'intermediate', 'advanced']).toContain(tmpl.tier)
    }
  })

  it('tiers are assigned correctly by chapter', () => {
    for (const tmpl of TRANSACTION_TEMPLATES) {
      if (tmpl.chapter <= 3) expect(tmpl.tier).toBe('starter')
      else if (tmpl.chapter === 5) expect(tmpl.tier).toBe('accruals')
      else if (tmpl.chapter <= 9) expect(tmpl.tier).toBe('intermediate')
      else expect(tmpl.tier).toBe('advanced')
    }
  })
})

describe('Topics', () => {
  it('has 15 topics', () => {
    expect(TOPICS).toHaveLength(15)
  })

  it('chapters are sequential from 2 to 16', () => {
    const chapters = TOPICS.map(t => t.chapter)
    expect(Math.min(...chapters)).toBe(2)
    expect(Math.max(...chapters)).toBe(16)
  })

  it('all topics have required fields', () => {
    for (const topic of TOPICS) {
      expect(topic.id).toBeTruthy()
      expect(topic.name).toBeTruthy()
      expect(topic.chapter).toBeGreaterThanOrEqual(2)
      expect(topic.description).toBeTruthy()
    }
  })
})
