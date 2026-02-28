import { describe, it, expect, vi } from 'vitest'
import { Ledger } from '../Ledger.ts'
import type { LedgerChange } from '../types.ts'

describe('Ledger', () => {
  it('adds and retrieves accounts', () => {
    const ledger = new Ledger()
    const account = ledger.addAccount('Cash', 'Asset')
    expect(account.name).toBe('Cash')
    expect(account.type).toBe('Asset')

    const retrieved = ledger.getAccount('Cash')
    expect(retrieved).toBe(account)
  })

  it('throws on duplicate account', () => {
    const ledger = new Ledger()
    ledger.addAccount('Cash', 'Asset')
    expect(() => ledger.addAccount('Cash', 'Asset')).toThrow(
      'Account "Cash" already exists',
    )
  })

  it('throws on missing account', () => {
    const ledger = new Ledger()
    expect(() => ledger.getAccount('NonExistent')).toThrow(
      'Account "NonExistent" not found',
    )
  })

  it('records a balanced journal entry', () => {
    const ledger = new Ledger()
    ledger.addAccount('Cash', 'Asset')
    ledger.addAccount('Revenue', 'Revenue')

    const changes = ledger.recordEntry(
      [{ account: 'Cash', amount: 1000 }],
      [{ account: 'Revenue', amount: 1000 }],
    )

    expect(changes).toHaveLength(2)
    expect(changes[0]).toEqual({
      account: 'Cash',
      side: 'debit',
      amount: 1000,
      before: 0,
      after: 1000,
    })
    expect(changes[1]).toEqual({
      account: 'Revenue',
      side: 'credit',
      amount: 1000,
      before: 0,
      after: 1000,
    })

    expect(ledger.getAccount('Cash').balance).toBe(1000)
    expect(ledger.getAccount('Revenue').balance).toBe(1000)
  })

  it('rejects unbalanced entries', () => {
    const ledger = new Ledger()
    ledger.addAccount('Cash', 'Asset')
    ledger.addAccount('Revenue', 'Revenue')

    expect(() =>
      ledger.recordEntry(
        [{ account: 'Cash', amount: 1000 }],
        [{ account: 'Revenue', amount: 500 }],
      ),
    ).toThrow('Debits and credits must balance')
  })

  it('takes and restores snapshots', () => {
    const ledger = new Ledger()
    ledger.addAccount('Cash', 'Asset')
    ledger.addAccount('Revenue', 'Revenue')

    ledger.recordEntry(
      [{ account: 'Cash', amount: 500 }],
      [{ account: 'Revenue', amount: 500 }],
    )

    const snapshot = ledger.takeSnapshot()
    expect(snapshot.get('Cash')).toBe(500)
    expect(snapshot.get('Revenue')).toBe(500)

    // Make further changes
    ledger.recordEntry(
      [{ account: 'Cash', amount: 300 }],
      [{ account: 'Revenue', amount: 300 }],
    )
    expect(ledger.getAccount('Cash').balance).toBe(800)

    // Restore snapshot
    ledger.restoreSnapshot(snapshot)
    expect(ledger.getAccount('Cash').balance).toBe(500)
    expect(ledger.getAccount('Revenue').balance).toBe(500)
  })

  it('filters accounts by type', () => {
    const ledger = new Ledger()
    ledger.addAccount('Cash', 'Asset')
    ledger.addAccount('Accounts Receivable', 'Asset')
    ledger.addAccount('Revenue', 'Revenue')
    ledger.addAccount('Accounts Payable', 'Liability')

    const assets = ledger.getAccountsByType('Asset')
    expect(assets).toHaveLength(2)
    expect(assets.map((a) => a.name).sort()).toEqual([
      'Accounts Receivable',
      'Cash',
    ])

    const liabilities = ledger.getAccountsByType('Liability')
    expect(liabilities).toHaveLength(1)
    expect(liabilities[0].name).toBe('Accounts Payable')

    const equities = ledger.getAccountsByType('Equity')
    expect(equities).toHaveLength(0)
  })

  it('adjustBalance sets balance directly', () => {
    const ledger = new Ledger()
    ledger.addAccount('Cash', 'Asset')

    ledger.recordEntry(
      [{ account: 'Cash', amount: 100 }],
      // Need a balancing account
      (() => {
        ledger.addAccount('Equity', 'Equity')
        return [{ account: 'Equity', amount: 100 }]
      })(),
    )
    expect(ledger.getAccount('Cash').balance).toBe(100)

    const changes = ledger.adjustBalance('Cash', 250)
    expect(ledger.getAccount('Cash').balance).toBe(250)
    expect(changes).toHaveLength(1)
    expect(changes[0]).toEqual({
      account: 'Cash',
      side: 'adjust',
      amount: 150,
      before: 100,
      after: 250,
    })
  })

  it('adjustBalance works when reducing balance', () => {
    const ledger = new Ledger()
    ledger.addAccount('Cash', 'Asset')
    ledger.addAccount('Equity', 'Equity')
    ledger.recordEntry(
      [{ account: 'Cash', amount: 500 }],
      [{ account: 'Equity', amount: 500 }],
    )

    const changes = ledger.adjustBalance('Cash', 200)
    expect(ledger.getAccount('Cash').balance).toBe(200)
    expect(changes[0].amount).toBe(300)
    expect(changes[0].before).toBe(500)
    expect(changes[0].after).toBe(200)
  })

  it('listener is called on recordEntry', () => {
    const ledger = new Ledger()
    ledger.addAccount('Cash', 'Asset')
    ledger.addAccount('Revenue', 'Revenue')

    const listener = vi.fn()
    ledger.onChange(listener)

    ledger.recordEntry(
      [{ account: 'Cash', amount: 200 }],
      [{ account: 'Revenue', amount: 200 }],
    )

    expect(listener).toHaveBeenCalledTimes(1)
    const changes: LedgerChange[] = listener.mock.calls[0][0]
    expect(changes).toHaveLength(2)
    expect(changes[0].account).toBe('Cash')
    expect(changes[1].account).toBe('Revenue')
  })

  it('listener is called on adjustBalance', () => {
    const ledger = new Ledger()
    ledger.addAccount('Cash', 'Asset')

    const listener = vi.fn()
    ledger.onChange(listener)

    ledger.adjustBalance('Cash', 999)

    expect(listener).toHaveBeenCalledTimes(1)
    const changes: LedgerChange[] = listener.mock.calls[0][0]
    expect(changes).toHaveLength(1)
    expect(changes[0]).toEqual({
      account: 'Cash',
      side: 'adjust',
      amount: 999,
      before: 0,
      after: 999,
    })
  })

  it('listener is called on restoreSnapshot', () => {
    const ledger = new Ledger()
    ledger.addAccount('Cash', 'Asset')
    ledger.addAccount('Equity', 'Equity')

    ledger.recordEntry(
      [{ account: 'Cash', amount: 100 }],
      [{ account: 'Equity', amount: 100 }],
    )

    const snapshot = ledger.takeSnapshot()

    ledger.recordEntry(
      [{ account: 'Cash', amount: 50 }],
      [{ account: 'Equity', amount: 50 }],
    )

    const listener = vi.fn()
    ledger.onChange(listener)

    ledger.restoreSnapshot(snapshot)

    expect(listener).toHaveBeenCalledTimes(1)
    const changes: LedgerChange[] = listener.mock.calls[0][0]
    expect(changes).toHaveLength(2)
  })

  it('supports multiple listeners', () => {
    const ledger = new Ledger()
    ledger.addAccount('Cash', 'Asset')

    const listener1 = vi.fn()
    const listener2 = vi.fn()
    ledger.onChange(listener1)
    ledger.onChange(listener2)

    ledger.adjustBalance('Cash', 100)

    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledTimes(1)
  })

  it('records compound journal entries with multiple debits and credits', () => {
    const ledger = new Ledger()
    ledger.addAccount('Cash', 'Asset')
    ledger.addAccount('Accounts Receivable', 'Asset')
    ledger.addAccount('Revenue', 'Revenue')

    const changes = ledger.recordEntry(
      [
        { account: 'Cash', amount: 600 },
        { account: 'Accounts Receivable', amount: 400 },
      ],
      [{ account: 'Revenue', amount: 1000 }],
    )

    expect(changes).toHaveLength(3)
    expect(ledger.getAccount('Cash').balance).toBe(600)
    expect(ledger.getAccount('Accounts Receivable').balance).toBe(400)
    expect(ledger.getAccount('Revenue').balance).toBe(1000)
  })

  it('addAccount passes options through to Account', () => {
    const ledger = new Ledger()
    const account = ledger.addAccount('Equipment', 'Asset', {
      subtype: 'fixed-asset',
      contra: false,
      cashFlow: 'investing',
    })

    expect(account.subtype).toBe('fixed-asset')
    expect(account.contra).toBe(false)
    expect(account.cashFlowCategory).toBe('investing')
  })
})
