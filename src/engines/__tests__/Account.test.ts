import { describe, it, expect } from 'vitest'
import { Account } from '../Account.ts'
import type { AccountType } from '../types.ts'

describe('Account', () => {
  it('creates an asset account with debit normal side', () => {
    const account = new Account('Cash', 'Asset')
    expect(account.name).toBe('Cash')
    expect(account.type).toBe('Asset')
    expect(account.normalSide).toBe('debit')
    expect(account.balance).toBe(0)
  })

  it('debiting an asset increases balance', () => {
    const account = new Account('Cash', 'Asset')
    account.debit(100)
    expect(account.balance).toBe(100)
  })

  it('crediting an asset decreases balance', () => {
    const account = new Account('Cash', 'Asset')
    account.debit(200)
    account.credit(50)
    expect(account.balance).toBe(150)
  })

  it('crediting a liability increases balance', () => {
    const account = new Account('Accounts Payable', 'Liability')
    expect(account.normalSide).toBe('credit')
    account.credit(500)
    expect(account.balance).toBe(500)
  })

  it('debiting a liability decreases balance', () => {
    const account = new Account('Accounts Payable', 'Liability')
    account.credit(500)
    account.debit(200)
    expect(account.balance).toBe(300)
  })

  it('throws on invalid account type', () => {
    expect(() => new Account('Bad', 'InvalidType' as AccountType)).toThrow(
      'Invalid account type: InvalidType',
    )
  })

  it('stores subtype, contra, and cashFlow options', () => {
    const account = new Account('Accumulated Depreciation', 'Asset', {
      subtype: 'contra-asset',
      contra: true,
      cashFlow: 'operating',
    })
    expect(account.subtype).toBe('contra-asset')
    expect(account.contra).toBe(true)
    expect(account.cashFlowCategory).toBe('operating')
  })

  it('defaults options to null/false when not provided', () => {
    const account = new Account('Cash', 'Asset')
    expect(account.subtype).toBeNull()
    expect(account.contra).toBe(false)
    expect(account.cashFlowCategory).toBeNull()
  })

  it('revenue account has credit normal side and works correctly', () => {
    const account = new Account('Sales Revenue', 'Revenue')
    expect(account.normalSide).toBe('credit')
    account.credit(1000)
    expect(account.balance).toBe(1000)
    account.debit(200)
    expect(account.balance).toBe(800)
  })

  it('expense account has debit normal side and works correctly', () => {
    const account = new Account('Rent Expense', 'Expense')
    expect(account.normalSide).toBe('debit')
    account.debit(750)
    expect(account.balance).toBe(750)
    account.credit(100)
    expect(account.balance).toBe(650)
  })

  it('equity account has credit normal side', () => {
    const account = new Account('Common Stock', 'Equity')
    expect(account.normalSide).toBe('credit')
    account.credit(10000)
    expect(account.balance).toBe(10000)
    account.debit(500)
    expect(account.balance).toBe(9500)
  })

  it('supports all cashFlow categories', () => {
    const categories = ['operating', 'investing', 'financing', 'operating-adjustment', 'cash'] as const
    for (const cat of categories) {
      const account = new Account(`Account-${cat}`, 'Asset', { cashFlow: cat })
      expect(account.cashFlowCategory).toBe(cat)
    }
  })
})
