import type { AccountType, AccountOptions, CashFlowCategory, DebitCredit } from './types.ts'
import { NORMAL_SIDES } from './types.ts'

export class Account {
  readonly name: string
  readonly type: AccountType
  readonly normalSide: DebitCredit
  balance: number
  readonly subtype: string | null
  readonly contra: boolean
  readonly cashFlowCategory: CashFlowCategory | null

  constructor(name: string, type: AccountType, options: AccountOptions = {}) {
    if (!NORMAL_SIDES[type]) {
      throw new Error(
        `Invalid account type: ${type}. Must be one of: ${Object.keys(NORMAL_SIDES).join(', ')}`,
      )
    }
    this.name = name
    this.type = type
    this.normalSide = NORMAL_SIDES[type]
    this.balance = 0
    this.subtype = options.subtype ?? null
    this.contra = options.contra ?? false
    this.cashFlowCategory = options.cashFlow ?? null
  }

  debit(amount: number): void {
    if (this.normalSide === 'debit') {
      this.balance += amount
    } else {
      this.balance -= amount
    }
  }

  credit(amount: number): void {
    if (this.normalSide === 'credit') {
      this.balance += amount
    } else {
      this.balance -= amount
    }
  }
}
