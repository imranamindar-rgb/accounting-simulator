import type { Ledger } from './Ledger.ts'
import type { LedgerChange } from './types.ts'

/**
 * Closes all Revenue and Expense accounts to Retained Earnings.
 * - Revenue accounts are debited to zero (reducing their credit balances)
 * - Expense accounts are credited to zero (reducing their debit balances)
 * - Net income (total revenue - total expenses) is credited to Retained Earnings
 * Returns the closing entry changes.
 */
export function closeAccounts(ledger: Ledger): LedgerChange[] {
  const allChanges: LedgerChange[] = []

  // 1. Sum all Revenue account balances
  const revenueAccounts = ledger.getAccountsByType('Revenue')
  let totalRevenue = 0
  for (const acct of revenueAccounts) {
    totalRevenue += acct.balance
  }

  // 2. Sum all Expense account balances
  const expenseAccounts = ledger.getAccountsByType('Expense')
  let totalExpenses = 0
  for (const acct of expenseAccounts) {
    totalExpenses += acct.balance
  }

  // 3. Calculate net income
  const netIncome = totalRevenue - totalExpenses

  // 4. Zero out each Revenue account
  for (const acct of revenueAccounts) {
    if (acct.balance !== 0) {
      const changes = ledger.adjustBalance(acct.name, 0)
      allChanges.push(...changes)
    }
  }

  // 5. Zero out each Expense account
  for (const acct of expenseAccounts) {
    if (acct.balance !== 0) {
      const changes = ledger.adjustBalance(acct.name, 0)
      allChanges.push(...changes)
    }
  }

  // 6. Add net income to Retained Earnings
  if (netIncome !== 0) {
    const retainedEarnings = ledger.getAccount('Retained Earnings')
    const newBalance = retainedEarnings.balance + netIncome
    const changes = ledger.adjustBalance('Retained Earnings', newBalance)
    allChanges.push(...changes)
  }

  return allChanges
}
