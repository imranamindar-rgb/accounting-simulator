import type { AccountType, AccountOptions, EntryLine, LedgerChange } from './types.ts'
import { Account } from './Account.ts'

export type LedgerListener = (changes: LedgerChange[]) => void

export class Ledger {
  private accounts: Map<string, Account>
  private listeners: LedgerListener[]

  constructor() {
    this.accounts = new Map()
    this.listeners = []
  }

  addAccount(name: string, type: AccountType, options: AccountOptions = {}): Account {
    if (this.accounts.has(name)) {
      throw new Error(`Account "${name}" already exists`)
    }
    const account = new Account(name, type, options)
    this.accounts.set(name, account)
    return account
  }

  getAccount(name: string): Account {
    const account = this.accounts.get(name)
    if (!account) {
      throw new Error(`Account "${name}" not found`)
    }
    return account
  }

  getAccountsByType(type: AccountType): Account[] {
    return [...this.accounts.values()].filter((a) => a.type === type)
  }

  getAllAccounts(): Map<string, Account> {
    return this.accounts
  }

  recordEntry(debits: EntryLine[], credits: EntryLine[]): LedgerChange[] {
    const totalDebits = debits.reduce((sum, d) => sum + d.amount, 0)
    const totalCredits = credits.reduce((sum, c) => sum + c.amount, 0)
    if (totalDebits !== totalCredits) {
      throw new Error('Debits and credits must balance')
    }

    const changes: LedgerChange[] = []

    for (const { account, amount } of debits) {
      const acc = this.getAccount(account)
      const before = acc.balance
      acc.debit(amount)
      changes.push({ account, side: 'debit', amount, before, after: acc.balance })
    }

    for (const { account, amount } of credits) {
      const acc = this.getAccount(account)
      const before = acc.balance
      acc.credit(amount)
      changes.push({ account, side: 'credit', amount, before, after: acc.balance })
    }

    this._notify(changes)
    return changes
  }

  onChange(listener: LedgerListener): void {
    this.listeners.push(listener)
  }

  private _notify(changes: LedgerChange[]): void {
    for (const listener of this.listeners) {
      listener(changes)
    }
  }

  takeSnapshot(): Map<string, number> {
    const snapshot = new Map<string, number>()
    for (const [name, account] of this.accounts) {
      snapshot.set(name, account.balance)
    }
    return snapshot
  }

  adjustBalance(accountName: string, newBalance: number): LedgerChange[] {
    const account = this.getAccount(accountName)
    const before = account.balance
    account.balance = newBalance
    const changes: LedgerChange[] = [
      {
        account: accountName,
        before,
        after: newBalance,
        side: 'adjust',
        amount: Math.abs(newBalance - before),
      },
    ]
    this._notify(changes)
    return changes
  }

  restoreSnapshot(snapshot: Map<string, number>): void {
    const changes: LedgerChange[] = []
    for (const [name, balance] of snapshot) {
      const account = this.getAccount(name)
      const before = account.balance
      account.balance = balance
      changes.push({ account: name, before, after: balance, side: 'adjust', amount: Math.abs(balance - before) })
    }
    this._notify(changes)
  }
}
