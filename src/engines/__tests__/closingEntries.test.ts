import { describe, it, expect, beforeEach } from 'vitest'
import { Ledger } from '../Ledger'
import { CHART_OF_ACCOUNTS } from '../../data/chartOfAccounts'
import { closeAccounts } from '../closeAccounts'

describe('closing entries', () => {
  let ledger: Ledger

  beforeEach(() => {
    ledger = new Ledger()
    for (const acct of CHART_OF_ACCOUNTS) {
      ledger.addAccount(acct.name, acct.type, {
        subtype: acct.subtype,
        contra: acct.contra,
        cashFlow: acct.cashFlow,
      })
    }
  })

  it('closes all revenue and expense accounts to Retained Earnings', () => {
    // Manually set balances
    ledger.adjustBalance('Sales Revenue', 10000)
    ledger.adjustBalance('Cost of Goods Sold', 6000)
    ledger.adjustBalance('Salaries Expense', 2000)
    const initialRE = ledger.getAccount('Retained Earnings').balance

    // Execute closing
    closeAccounts(ledger)

    expect(ledger.getAccount('Sales Revenue').balance).toBe(0)
    expect(ledger.getAccount('Cost of Goods Sold').balance).toBe(0)
    expect(ledger.getAccount('Salaries Expense').balance).toBe(0)
    expect(ledger.getAccount('Retained Earnings').balance).toBe(initialRE + 2000)
  })

  it('handles zero balances as a no-op', () => {
    // All accounts start at 0 — closing should not change anything
    const initialRE = ledger.getAccount('Retained Earnings').balance

    const changes = closeAccounts(ledger)

    expect(changes).toHaveLength(0)
    expect(ledger.getAccount('Retained Earnings').balance).toBe(initialRE)

    // All revenue accounts still 0
    for (const acct of ledger.getAccountsByType('Revenue')) {
      expect(acct.balance).toBe(0)
    }

    // All expense accounts still 0
    for (const acct of ledger.getAccountsByType('Expense')) {
      expect(acct.balance).toBe(0)
    }
  })

  it('handles net loss scenario (expenses > revenue)', () => {
    ledger.adjustBalance('Sales Revenue', 3000)
    ledger.adjustBalance('Cost of Goods Sold', 4000)
    ledger.adjustBalance('Salaries Expense', 1000)
    const initialRE = ledger.getAccount('Retained Earnings').balance

    closeAccounts(ledger)

    expect(ledger.getAccount('Sales Revenue').balance).toBe(0)
    expect(ledger.getAccount('Cost of Goods Sold').balance).toBe(0)
    expect(ledger.getAccount('Salaries Expense').balance).toBe(0)
    // Net loss = 3000 - 4000 - 1000 = -2000
    expect(ledger.getAccount('Retained Earnings').balance).toBe(initialRE - 2000)
  })

  it('returns LedgerChange[] for all adjustments', () => {
    ledger.adjustBalance('Sales Revenue', 5000)
    ledger.adjustBalance('Rent Expense', 2000)

    const changes = closeAccounts(ledger)

    // Should have changes for: Sales Revenue -> 0, Rent Expense -> 0, Retained Earnings adjusted
    expect(changes.length).toBeGreaterThanOrEqual(3)

    // Verify Sales Revenue was zeroed
    const revenueChange = changes.find((c) => c.account === 'Sales Revenue')
    expect(revenueChange).toBeDefined()
    expect(revenueChange!.before).toBe(5000)
    expect(revenueChange!.after).toBe(0)

    // Verify Rent Expense was zeroed
    const expenseChange = changes.find((c) => c.account === 'Rent Expense')
    expect(expenseChange).toBeDefined()
    expect(expenseChange!.before).toBe(2000)
    expect(expenseChange!.after).toBe(0)

    // Verify Retained Earnings was adjusted
    const reChange = changes.find((c) => c.account === 'Retained Earnings')
    expect(reChange).toBeDefined()
    expect(reChange!.after).toBe(reChange!.before + 3000) // net income = 5000 - 2000
  })

  it('closes multiple revenue and expense accounts', () => {
    ledger.adjustBalance('Sales Revenue', 8000)
    ledger.adjustBalance('Service Revenue', 4000)
    ledger.adjustBalance('Interest Income', 500)
    ledger.adjustBalance('Cost of Goods Sold', 5000)
    ledger.adjustBalance('Salaries Expense', 3000)
    ledger.adjustBalance('Rent Expense', 1500)
    ledger.adjustBalance('Utilities Expense', 500)
    const initialRE = ledger.getAccount('Retained Earnings').balance

    closeAccounts(ledger)

    // All revenue accounts zeroed
    expect(ledger.getAccount('Sales Revenue').balance).toBe(0)
    expect(ledger.getAccount('Service Revenue').balance).toBe(0)
    expect(ledger.getAccount('Interest Income').balance).toBe(0)

    // All expense accounts zeroed
    expect(ledger.getAccount('Cost of Goods Sold').balance).toBe(0)
    expect(ledger.getAccount('Salaries Expense').balance).toBe(0)
    expect(ledger.getAccount('Rent Expense').balance).toBe(0)
    expect(ledger.getAccount('Utilities Expense').balance).toBe(0)

    // Net income: (8000 + 4000 + 500) - (5000 + 3000 + 1500 + 500) = 12500 - 10000 = 2500
    expect(ledger.getAccount('Retained Earnings').balance).toBe(initialRE + 2500)
  })

  it('preserves existing Retained Earnings balance', () => {
    // Set an initial Retained Earnings balance
    ledger.adjustBalance('Retained Earnings', 50000)
    ledger.adjustBalance('Sales Revenue', 10000)
    ledger.adjustBalance('Cost of Goods Sold', 7000)

    closeAccounts(ledger)

    // Net income = 10000 - 7000 = 3000, added to existing 50000
    expect(ledger.getAccount('Retained Earnings').balance).toBe(53000)
  })
})
