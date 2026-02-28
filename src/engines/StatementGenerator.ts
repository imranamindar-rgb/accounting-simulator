/**
 * Financial Statement Generators
 *
 * Pure functions that generate Balance Sheet, Income Statement,
 * Cash Flow Statement, and Equity Statement from a Ledger instance.
 *
 * Converted from the monolithic Financial-Accounting-Simulator.html (lines 3012-3491).
 */

import type { Ledger } from './Ledger.ts'
import type { Account } from './Account.ts'
import type {
  AccountLine,
  BalanceSheet,
  IncomeStatement,
  CashFlowStatement,
  EquityStatement,
} from './types.ts'

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Groups an array of accounts by their subtype.
 * Accounts without a subtype are placed under 'unclassified'.
 */
function groupBySubtype(accounts: Account[]): Record<string, AccountLine[]> {
  const groups: Record<string, AccountLine[]> = {}
  for (const account of accounts) {
    const key = account.subtype || 'unclassified'
    if (!groups[key]) groups[key] = []
    groups[key].push({ name: account.name, balance: account.balance, contra: account.contra })
  }
  return groups
}

/**
 * Flattens a grouped-by-subtype object into a single AccountLine array.
 */
function flattenGroups(groups: Record<string, AccountLine[]>): AccountLine[] {
  const result: AccountLine[] = []
  for (const key of Object.keys(groups)) {
    for (const line of groups[key]) {
      result.push(line)
    }
  }
  return result
}

// ── Balance Sheet ───────────────────────────────────────────────────

/**
 * Generate a classified Balance Sheet from the ledger.
 *
 * Groups assets and liabilities into current/noncurrent sections,
 * computes section totals, and verifies the accounting equation.
 */
export function generateBalanceSheet(ledger: Ledger): BalanceSheet {
  const assets = ledger.getAccountsByType('Asset')
  const liabilities = ledger.getAccountsByType('Liability')
  const equityAccounts = ledger.getAccountsByType('Equity')

  const currentAssetGroups = groupBySubtype(assets.filter(a => a.subtype === 'current'))
  const noncurrentAssetGroups = groupBySubtype(assets.filter(a => a.subtype === 'noncurrent'))

  const currentLiabilityGroups = groupBySubtype(liabilities.filter(a => a.subtype === 'current'))
  const noncurrentLiabilityGroups = groupBySubtype(liabilities.filter(a => a.subtype === 'noncurrent'))

  const equity: AccountLine[] = equityAccounts.map(a => ({
    name: a.name,
    balance: a.balance,
    contra: a.contra,
  }))

  // Include current-period net income in equity.
  // Revenue and Expense accounts hold balances until the period is closed,
  // at which point they are zeroed and transferred to Retained Earnings.
  // During an open period the Balance Sheet must include this net income
  // so that Assets = Liabilities + Equity stays balanced.
  const revenues = ledger.getAccountsByType('Revenue')
  const expenses = ledger.getAccountsByType('Expense')
  const currentPeriodRevenue = revenues.reduce((sum, a) => sum + a.balance, 0)
  const currentPeriodExpenses = expenses.reduce((sum, a) => sum + a.balance, 0)
  const currentPeriodNetIncome = currentPeriodRevenue - currentPeriodExpenses

  if (currentPeriodNetIncome !== 0) {
    equity.push({
      name: 'Current Period Net Income',
      balance: currentPeriodNetIncome,
      contra: false,
    })
  }

  const currentAssets = flattenGroups(currentAssetGroups)
  const noncurrentAssets = flattenGroups(noncurrentAssetGroups)
  const currentLiabilities = flattenGroups(currentLiabilityGroups)
  const noncurrentLiabilities = flattenGroups(noncurrentLiabilityGroups)

  const totalCurrentAssets = assets
    .filter(a => a.subtype === 'current')
    .reduce((sum, a) => sum + a.balance, 0)

  const totalNoncurrentAssets = assets
    .filter(a => a.subtype === 'noncurrent')
    .reduce((sum, a) => sum + a.balance, 0)

  const totalAssets = totalCurrentAssets + totalNoncurrentAssets

  const totalCurrentLiabilities = liabilities
    .filter(a => a.subtype === 'current')
    .reduce((sum, a) => sum + a.balance, 0)

  const totalNoncurrentLiabilities = liabilities
    .filter(a => a.subtype === 'noncurrent')
    .reduce((sum, a) => sum + a.balance, 0)

  const totalLiabilities = totalCurrentLiabilities + totalNoncurrentLiabilities

  const totalEquity = equityAccounts.reduce((sum, a) => sum + a.balance, 0) + currentPeriodNetIncome

  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity
  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01

  return {
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
    totalLiabilitiesAndEquity,
    isBalanced,
  }
}

// ── Income Statement ────────────────────────────────────────────────

/**
 * Generate a multi-step Income Statement from the ledger.
 *
 * Structure:
 *   Operating Revenue
 * - Cost of Goods Sold
 * = Gross Profit
 * - Operating Expenses
 * = Operating Income
 * + Other Income
 * - Other Expenses
 * = Income Before Tax
 * - Tax Expense
 * = Net Income
 */
export function generateIncomeStatement(ledger: Ledger): IncomeStatement {
  const revenues = ledger.getAccountsByType('Revenue')
  const expenses = ledger.getAccountsByType('Expense')

  // Revenue sections
  const operatingRevenue = revenues.filter(a => a.subtype === 'operating')
  const otherRevenueAccounts = revenues.filter(a => a.subtype === 'other')

  const totalRevenue = operatingRevenue.reduce((sum, a) => sum + a.balance, 0)
  const otherIncome = otherRevenueAccounts.reduce((sum, a) => sum + a.balance, 0)

  // Expense sections
  const cogsAccounts = expenses.filter(a => a.subtype === 'cogs')
  const operatingExpenseAccounts = expenses.filter(a => a.subtype === 'operating')
  const otherExpenseAccounts = expenses.filter(a => a.subtype === 'other')
  const taxAccounts = expenses.filter(a => a.subtype === 'tax')

  const totalCOGS = cogsAccounts.reduce((sum, a) => sum + a.balance, 0)
  const totalOperatingExpenses = operatingExpenseAccounts.reduce((sum, a) => sum + a.balance, 0)
  const otherExpenses = otherExpenseAccounts.reduce((sum, a) => sum + a.balance, 0)
  const taxExpense = taxAccounts.reduce((sum, a) => sum + a.balance, 0)

  // Computed line items
  const grossProfit = totalRevenue - totalCOGS
  const operatingIncome = grossProfit - totalOperatingExpenses
  const totalOther = otherIncome - otherExpenses
  const incomeBeforeTax = operatingIncome + totalOther
  const netIncome = incomeBeforeTax - taxExpense

  // EPS: look for a common stock account to estimate shares
  // Default to 1 share if no common stock account found
  const equityAccounts = ledger.getAccountsByType('Equity')
  const commonStock = equityAccounts.find(a => a.name.toLowerCase().includes('common stock'))
  const shares = commonStock ? Math.max(commonStock.balance, 1) : 1
  const eps = netIncome / shares

  return {
    revenue: operatingRevenue.map(a => ({ name: a.name, balance: a.balance })),
    totalRevenue,
    cogs: cogsAccounts.map(a => ({ name: a.name, balance: a.balance })),
    totalCOGS,
    grossProfit,
    operatingExpenses: operatingExpenseAccounts.map(a => ({ name: a.name, balance: a.balance })),
    totalOperatingExpenses,
    operatingIncome,
    otherRevenue: otherRevenueAccounts.map(a => ({ name: a.name, balance: a.balance })),
    otherExpenses: otherExpenseAccounts.map(a => ({ name: a.name, balance: a.balance })),
    totalOther,
    incomeBeforeTax,
    taxExpense,
    netIncome,
    eps,
  }
}

// ── Cash Flow Statement (Indirect Method) ───────────────────────────

/**
 * Generate a Cash Flow Statement using the indirect method.
 *
 * Indirect method logic:
 * - Operating: Start with net income, add back non-cash items (operating-adjustment),
 *   then adjust for changes in operating working capital accounts.
 *   Asset increases reduce cash; liability increases add cash.
 * - Investing: Asset increases are purchases (cash outflows).
 * - Financing: Liability/equity increases are inflows.
 */
export function generateCashFlowStatement(
  ledger: Ledger,
  beginningBalances: Map<string, number>,
  netIncome: number,
): CashFlowStatement {
  const operatingActivities: { label: string; amount: number }[] = [
    { label: 'Net Income', amount: netIncome },
  ]
  const investingActivities: { label: string; amount: number }[] = []
  const financingActivities: { label: string; amount: number }[] = []

  // Only examine balance sheet accounts (Asset, Liability, Equity) with a cashFlowCategory
  const balanceSheetTypes = new Set(['Asset', 'Liability', 'Equity'])
  const accounts = ledger.getAllAccounts()

  for (const [name, account] of accounts) {
    if (!balanceSheetTypes.has(account.type)) continue
    if (!account.cashFlowCategory || account.cashFlowCategory === 'cash') continue

    const beginBalance = beginningBalances.get(name) || 0
    const change = account.balance - beginBalance

    if (change === 0) continue

    if (account.cashFlowCategory === 'operating-adjustment') {
      // Non-cash items (e.g., accumulated depreciation).
      // For assets: negate the change (asset decrease = add back to cash flow).
      const impact = account.type === 'Asset' ? -change : change
      operatingActivities.push({ label: name, amount: impact })
    } else if (account.cashFlowCategory === 'operating') {
      // Working capital changes.
      // Asset increases use cash (negative impact); liability increases provide cash (positive impact).
      const impact = account.type === 'Asset' ? -change : change
      operatingActivities.push({ label: name, amount: impact })
    } else if (account.cashFlowCategory === 'investing') {
      // Asset purchases are outflows (negative), asset sales are inflows (positive).
      const impact = account.type === 'Asset' ? -change : change
      investingActivities.push({ label: name, amount: impact })
    } else if (account.cashFlowCategory === 'financing') {
      // Liability/equity increases are inflows; decreases are outflows.
      const impact = (account.type === 'Liability' || account.type === 'Equity') ? change : -change
      financingActivities.push({ label: name, amount: impact })
    }
  }

  const totalOperating = operatingActivities.reduce((sum, i) => sum + i.amount, 0)
  const totalInvesting = investingActivities.reduce((sum, i) => sum + i.amount, 0)
  const totalFinancing = financingActivities.reduce((sum, i) => sum + i.amount, 0)
  const netChange = totalOperating + totalInvesting + totalFinancing

  // Compute beginning and ending cash
  const cashAccounts = [...accounts.values()].filter(a => a.cashFlowCategory === 'cash')
  const beginningCash = cashAccounts.reduce((sum, a) => sum + (beginningBalances.get(a.name) || 0), 0)
  const endingCash = beginningCash + netChange

  return {
    operatingActivities,
    totalOperating,
    investingActivities,
    totalInvesting,
    financingActivities,
    totalFinancing,
    netChange,
    beginningCash,
    endingCash,
  }
}

// ── Cash Flow Statement (Direct Method) ─────────────────────────────

/**
 * Generate a Cash Flow Statement using the direct method.
 *
 * Direct method logic:
 * - Operating Activities:
 *   Cash received from customers = Sales Revenue - increase in AR + decrease in Unearned Revenue
 *   Cash paid to suppliers = COGS + increase in Inventory - increase in AP
 *   Cash paid for operating expenses = Operating Expenses - increase in accrued liabilities + decrease in prepaids
 * - Investing and Financing sections same as indirect method
 */
export function generateCashFlowDirect(
  ledger: Ledger,
  beginningBalances: Map<string, number>,
): CashFlowStatement {
  const accounts = ledger.getAllAccounts()

  // Helper: get current balance or 0
  function bal(name: string): number {
    const acct = accounts.get(name)
    return acct ? acct.balance : 0
  }

  // Helper: get beginning balance or 0
  function beginBal(name: string): number {
    return beginningBalances.get(name) || 0
  }

  // Helper: change in an account
  function chg(name: string): number {
    return bal(name) - beginBal(name)
  }

  // --- Operating Activities (Direct Method) ---

  // Revenue accounts
  const salesRevenue = bal('Sales Revenue')
  const serviceRevenue = bal('Service Revenue')
  const totalOperatingRevenue = salesRevenue + serviceRevenue

  // Cash received from customers
  const arChange = chg('Accounts Receivable')
  const allowanceChange = chg('Allowance for Doubtful Accounts')
  const unearnedChange = chg('Unearned Revenue')
  const cashFromCustomers = totalOperatingRevenue - arChange - allowanceChange + unearnedChange

  // Cash paid to suppliers
  const cogsBalance = bal('Cost of Goods Sold')
  const inventoryChange = chg('Inventory')
  const apChange = chg('Accounts Payable')
  const cashToSuppliers = -(cogsBalance + inventoryChange - apChange)

  // Cash paid for operating expenses
  // Exclude depreciation and amortisation (non-cash)
  const expenseAccounts = [...accounts.values()].filter(
    a => a.type === 'Expense' && a.subtype === 'operating',
  )
  let totalOpEx = 0
  for (const exp of expenseAccounts) {
    if (exp.name === 'Depreciation Expense' || exp.name === 'Amortisation Expense') continue
    totalOpEx += exp.balance
  }
  const salariesPayableChange = chg('Salaries Payable')
  const interestPayableChange = chg('Interest Payable')
  const taxPayableChange = chg('Tax Payable')
  const gstPayableChange = chg('GST Payable')
  const prepaidChange = chg('Prepaid Expenses')
  const suppliesChange = chg('Supplies')

  const accruedLiabChange =
    salariesPayableChange + interestPayableChange + taxPayableChange + gstPayableChange
  const cashForOpExpenses = -(totalOpEx - accruedLiabChange + prepaidChange + suppliesChange)

  // Other income/expense cash flows
  const otherRevenues = [...accounts.values()].filter(
    a => a.type === 'Revenue' && a.subtype === 'other',
  )
  const otherExpensesList = [...accounts.values()].filter(
    a => a.type === 'Expense' && a.subtype === 'other',
  )
  const taxAccountsList = [...accounts.values()].filter(
    a => a.type === 'Expense' && a.subtype === 'tax',
  )
  const otherRevenueTotal = otherRevenues.reduce((s, a) => s + a.balance, 0)
  const otherExpenseTotal = otherExpensesList.reduce((s, a) => s + a.balance, 0)
  const taxTotal = taxAccountsList.reduce((s, a) => s + a.balance, 0)

  // Interest paid
  const interestExpense = bal('Interest Expense')
  const cashInterest = -(interestExpense - interestPayableChange)

  // Tax paid
  const cashTax = -(taxTotal - taxPayableChange)

  const operatingItems: { label: string; amount: number }[] = [
    { label: 'Cash received from customers', amount: cashFromCustomers },
    { label: 'Cash paid to suppliers', amount: cashToSuppliers },
    { label: 'Cash paid for operating expenses', amount: cashForOpExpenses },
  ]

  if (interestExpense !== 0 || interestPayableChange !== 0) {
    operatingItems.push({ label: 'Interest paid', amount: cashInterest })
  }
  if (taxTotal !== 0 || taxPayableChange !== 0) {
    operatingItems.push({ label: 'Income tax paid', amount: cashTax })
  }
  if (otherRevenueTotal !== 0) {
    operatingItems.push({ label: 'Other income received', amount: otherRevenueTotal })
  }
  if (otherExpenseTotal !== 0 && otherExpenseTotal !== interestExpense) {
    const otherNonInterest = otherExpenseTotal - interestExpense
    if (otherNonInterest !== 0) {
      operatingItems.push({ label: 'Other expenses paid', amount: -otherNonInterest })
    }
  }

  const totalOperating = operatingItems.reduce((sum, i) => sum + i.amount, 0)

  // --- Investing and Financing: same as indirect method ---
  const investingItems: { label: string; amount: number }[] = []
  const financingItems: { label: string; amount: number }[] = []

  const balanceSheetTypes = new Set(['Asset', 'Liability', 'Equity'])

  for (const [name, account] of accounts) {
    if (!balanceSheetTypes.has(account.type)) continue
    if (!account.cashFlowCategory || account.cashFlowCategory === 'cash') continue
    if (
      account.cashFlowCategory === 'operating' ||
      account.cashFlowCategory === 'operating-adjustment'
    )
      continue

    const beginBalance = beginningBalances.get(name) || 0
    const change = account.balance - beginBalance
    if (change === 0) continue

    if (account.cashFlowCategory === 'investing') {
      const impact = account.type === 'Asset' ? -change : change
      investingItems.push({ label: name, amount: impact })
    } else if (account.cashFlowCategory === 'financing') {
      const impact =
        account.type === 'Liability' || account.type === 'Equity' ? change : -change
      financingItems.push({ label: name, amount: impact })
    }
  }

  const totalInvesting = investingItems.reduce((sum, i) => sum + i.amount, 0)
  const totalFinancing = financingItems.reduce((sum, i) => sum + i.amount, 0)
  const netChange = totalOperating + totalInvesting + totalFinancing

  // Compute beginning and ending cash
  const cashAccounts = [...accounts.values()].filter(a => a.cashFlowCategory === 'cash')
  const beginningCash = cashAccounts.reduce((sum, a) => sum + (beginningBalances.get(a.name) || 0), 0)
  const endingCash = beginningCash + netChange

  return {
    operatingActivities: operatingItems,
    totalOperating,
    investingActivities: investingItems,
    totalInvesting,
    financingActivities: financingItems,
    totalFinancing,
    netChange,
    beginningCash,
    endingCash,
  }
}

// ── Statement of Stockholders' Equity ───────────────────────────────

/**
 * Generate a Statement of Stockholders' Equity.
 * Shows beginning balance, changes, and ending balance for each equity account.
 */
export function generateEquityStatement(
  ledger: Ledger,
  beginningBalances: Map<string, number>,
  netIncome: number,
): EquityStatement {
  const equityAccounts = ledger.getAccountsByType('Equity')

  const beginningBals: { account: string; amount: number }[] = []
  const changes: { account: string; description: string; amount: number }[] = []
  const endingBals: { account: string; amount: number }[] = []

  for (const a of equityAccounts) {
    const beginning = beginningBalances.get(a.name) || 0
    const ending = a.balance
    const change = ending - beginning

    beginningBals.push({ account: a.name, amount: beginning })
    endingBals.push({ account: a.name, amount: ending })

    if (change !== 0) {
      changes.push({
        account: a.name,
        description: change > 0 ? 'Increase' : 'Decrease',
        amount: change,
      })
    }
  }

  // Include current-period net income as a change entry
  // (revenue/expense accounts haven't been closed to RE yet)
  if (netIncome !== 0) {
    changes.push({
      account: 'Retained Earnings',
      description: 'Net Income',
      amount: netIncome,
    })
  }

  const totalBeginning = beginningBals.reduce((s, a) => s + a.amount, 0)
  const totalEnding = endingBals.reduce((s, a) => s + a.amount, 0) + netIncome

  return {
    beginningBalances: beginningBals,
    changes,
    endingBalances: endingBals,
    totalBeginning,
    totalEnding,
  }
}
