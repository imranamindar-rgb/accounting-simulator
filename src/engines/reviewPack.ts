import { Ledger } from './Ledger'
import { CHART_OF_ACCOUNTS } from '../data/chartOfAccounts'
import {
  generateBalanceSheet,
  generateIncomeStatement,
  generateCashFlowStatement,
} from './StatementGenerator'
import type { BalanceSheet, CashFlowStatement, IncomeStatement } from './types'
import type { CashFlowCategory, AccountType } from './types'

export interface WorkingCapitalDriver {
  account: string
  change: number
  cashImpact: number
  type: AccountType | 'Unknown'
}

export interface ReviewPackData {
  label: string
  balanceSheet: BalanceSheet
  incomeStatement: IncomeStatement
  cashFlow: CashFlowStatement
  noncashAdjustments: { label: string; amount: number }[]
  workingCapitalAdjustments: { label: string; amount: number }[]
  noncashTotal: number
  workingCapitalTotal: number
  workingCapitalDrivers: WorkingCapitalDriver[]
  flags: string[]
  cfoToNetIncome: number | null
}

function accountDef(name: string) {
  return CHART_OF_ACCOUNTS.find((a) => a.name === name)
}

function ledgerFromSnapshot(snapshot: Map<string, number>): Ledger {
  const ledger = new Ledger()
  for (const acctDef of CHART_OF_ACCOUNTS) {
    ledger.addAccount(acctDef.name, acctDef.type, {
      subtype: acctDef.subtype,
      contra: acctDef.contra,
      cashFlow: acctDef.cashFlow,
    })
  }
  for (const [accountName, balance] of snapshot) {
    try {
      ledger.adjustBalance(accountName, balance)
    } catch {
      // Ignore unknown accounts.
    }
  }
  return ledger
}

function splitOperatingActivities(cf: CashFlowStatement) {
  const items = cf.operatingActivities.filter((x) => x.label !== 'Net Income')
  const noncash: { label: string; amount: number }[] = []
  const wc: { label: string; amount: number }[] = []
  const other: { label: string; amount: number }[] = []

  for (const item of items) {
    const def = accountDef(item.label)
    const cat = def?.cashFlow as CashFlowCategory | undefined
    if (cat === 'operating-adjustment') noncash.push(item)
    else if (cat === 'operating') wc.push(item)
    else other.push(item)
  }

  return { noncash, wc, other }
}

function sum(items: { amount: number }[]): number {
  return items.reduce((s, x) => s + x.amount, 0)
}

export function computeReviewPack(args: {
  label: string
  beginningSnapshot: Map<string, number>
  endingSnapshot: Map<string, number>
  /** Optional precomputed statements (used for closed periods) */
  balanceSheet?: BalanceSheet
  incomeStatement?: IncomeStatement
}): ReviewPackData {
  const endingLedger = ledgerFromSnapshot(args.endingSnapshot)

  const balanceSheet = args.balanceSheet ?? generateBalanceSheet(endingLedger)
  const incomeStatement = args.incomeStatement ?? generateIncomeStatement(endingLedger)
  const cashFlow = generateCashFlowStatement(
    endingLedger,
    args.beginningSnapshot,
    incomeStatement.netIncome,
  )

  const { noncash, wc } = splitOperatingActivities(cashFlow)
  const noncashTotal = sum(noncash)
  const workingCapitalTotal = sum(wc)

  const driverAccounts = [
    'Accounts Receivable',
    'Inventory',
    'Prepaid Expenses',
    'Accounts Payable',
    'Unearned Revenue',
  ]

  const workingCapitalDrivers: WorkingCapitalDriver[] = driverAccounts.map((name) => {
    const begin = args.beginningSnapshot.get(name) ?? 0
    const end = args.endingSnapshot.get(name) ?? 0
    const change = end - begin
    const def = accountDef(name)
    const type = def?.type ?? 'Unknown'
    // Indirect method sign convention: Asset increases use cash (negative), liability increases provide cash (positive).
    const cashImpact =
      type === 'Asset'
        ? -change
        : type === 'Liability'
          ? change
          : 0

    return { account: name, change, cashImpact, type }
  })

  const flags: string[] = []
  if (incomeStatement.netIncome > 0 && cashFlow.totalOperating < 0) {
    flags.push('Net income is positive but operating cash flow is negative (cash conversion risk).')
  }
  if (incomeStatement.netIncome < 0 && cashFlow.totalOperating > 0) {
    flags.push('Net income is negative but operating cash flow is positive (non-cash losses or working capital release).')
  }

  const cfoToNetIncome =
    incomeStatement.netIncome !== 0
      ? cashFlow.totalOperating / incomeStatement.netIncome
      : null

  return {
    label: args.label,
    balanceSheet,
    incomeStatement,
    cashFlow,
    noncashAdjustments: noncash,
    workingCapitalAdjustments: wc,
    noncashTotal,
    workingCapitalTotal,
    workingCapitalDrivers,
    flags,
    cfoToNetIncome,
  }
}

