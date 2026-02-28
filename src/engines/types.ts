export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'
export type DebitCredit = 'debit' | 'credit'
export type CashFlowCategory =
  | 'operating'
  | 'investing'
  | 'financing'
  | 'operating-adjustment'
  | 'cash'

export interface AccountOptions {
  subtype?: string
  contra?: boolean
  cashFlow?: CashFlowCategory
}

export interface LedgerChange {
  account: string
  side: DebitCredit | 'adjust'
  amount: number
  before: number
  after: number
}

export interface EntryLine {
  account: string
  amount: number
}

export interface TransactionParam {
  key: string
  label: string
  type: 'number' | 'text' | 'select'
  options?: string[]
}

export interface DebitCreditSpec {
  account: string
  param: string
}

export interface TransactionTemplate {
  id: string
  name: string
  description: string
  chapter: number
  topic: string
  debits: DebitCreditSpec[]
  credits: DebitCreditSpec[]
  params: TransactionParam[]
  cashFlowCategory: string
  explanation: string
  tier?: 'starter' | 'accruals' | 'intermediate' | 'advanced'
  quiz?: QuizQuestion[]
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export const NORMAL_SIDES: Record<AccountType, DebitCredit> = {
  Asset: 'debit',
  Liability: 'credit',
  Equity: 'credit',
  Revenue: 'credit',
  Expense: 'debit',
}

// ── Statement return types ──────────────────────────────────────────

export interface AccountLine {
  name: string
  balance: number
  contra?: boolean
}

export interface BalanceSheet {
  currentAssets: AccountLine[]
  noncurrentAssets: AccountLine[]
  totalCurrentAssets: number
  totalNoncurrentAssets: number
  totalAssets: number
  currentLiabilities: AccountLine[]
  noncurrentLiabilities: AccountLine[]
  totalCurrentLiabilities: number
  totalNoncurrentLiabilities: number
  totalLiabilities: number
  equity: AccountLine[]
  totalEquity: number
  totalLiabilitiesAndEquity: number
  isBalanced: boolean
}

export interface IncomeStatement {
  revenue: AccountLine[]
  totalRevenue: number
  cogs: AccountLine[]
  totalCOGS: number
  grossProfit: number
  operatingExpenses: AccountLine[]
  totalOperatingExpenses: number
  operatingIncome: number
  otherRevenue: AccountLine[]
  otherExpenses: AccountLine[]
  totalOther: number
  incomeBeforeTax: number
  taxExpense: number
  netIncome: number
  eps: number
}

export interface CashFlowStatement {
  operatingActivities: { label: string; amount: number }[]
  totalOperating: number
  investingActivities: { label: string; amount: number }[]
  totalInvesting: number
  financingActivities: { label: string; amount: number }[]
  totalFinancing: number
  netChange: number
  beginningCash: number
  endingCash: number
}

export interface EquityStatement {
  beginningBalances: { account: string; amount: number }[]
  changes: { account: string; description: string; amount: number }[]
  endingBalances: { account: string; amount: number }[]
  totalBeginning: number
  totalEnding: number
}
