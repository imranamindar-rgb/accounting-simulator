import { describe, it, expect } from 'vitest'
import { TransactionEngine } from '../TransactionEngine.ts'
import { Ledger } from '../Ledger.ts'
import type { TransactionTemplate } from '../types.ts'

function makeTemplate(overrides: Partial<TransactionTemplate> = {}): TransactionTemplate {
  return {
    id: 'cash-sale',
    name: 'Cash Sale',
    description: 'Record a cash sale',
    chapter: 1,
    topic: 'revenue',
    debits: [{ account: 'Cash', param: 'amount' }],
    credits: [{ account: 'Revenue', param: 'amount' }],
    params: [{ key: 'amount', label: 'Sale Amount', type: 'number' }],
    cashFlowCategory: 'operating',
    explanation: 'Debit Cash, Credit Revenue',
    ...overrides,
  }
}

function setupLedger(): Ledger {
  const ledger = new Ledger()
  ledger.addAccount('Cash', 'Asset')
  ledger.addAccount('Revenue', 'Revenue')
  ledger.addAccount('Accounts Receivable', 'Asset')
  ledger.addAccount('Inventory', 'Asset')
  ledger.addAccount('Cost of Goods Sold', 'Expense')
  ledger.addAccount('Accounts Payable', 'Liability')
  return ledger
}

describe('TransactionEngine', () => {
  it('registers a template and retrieves it by id', () => {
    const ledger = setupLedger()
    const engine = new TransactionEngine(ledger)
    const template = makeTemplate()

    engine.registerTemplate(template)

    const retrieved = engine.getTemplate('cash-sale')
    expect(retrieved).toBe(template)
    expect(retrieved.id).toBe('cash-sale')
    expect(retrieved.name).toBe('Cash Sale')
  })

  it('throws on getting a non-existent template', () => {
    const ledger = setupLedger()
    const engine = new TransactionEngine(ledger)

    expect(() => engine.getTemplate('nonexistent')).toThrow(
      'Template "nonexistent" not found',
    )
  })

  it('executes a template — records correct journal entry in ledger', () => {
    const ledger = setupLedger()
    const engine = new TransactionEngine(ledger)
    engine.registerTemplate(makeTemplate())

    const changes = engine.execute('cash-sale', { amount: 500 })

    expect(changes).toHaveLength(2)
    expect(changes[0]).toEqual({
      account: 'Cash',
      side: 'debit',
      amount: 500,
      before: 0,
      after: 500,
    })
    expect(changes[1]).toEqual({
      account: 'Revenue',
      side: 'credit',
      amount: 500,
      before: 0,
      after: 500,
    })

    expect(ledger.getAccount('Cash').balance).toBe(500)
    expect(ledger.getAccount('Revenue').balance).toBe(500)
  })

  it('filters templates by chapter', () => {
    const ledger = setupLedger()
    const engine = new TransactionEngine(ledger)

    engine.registerTemplate(makeTemplate({ id: 't1', chapter: 1, topic: 'revenue' }))
    engine.registerTemplate(makeTemplate({ id: 't2', chapter: 1, topic: 'expenses' }))
    engine.registerTemplate(makeTemplate({ id: 't3', chapter: 2, topic: 'revenue' }))

    const ch1 = engine.getTemplatesByChapter(1)
    expect(ch1).toHaveLength(2)
    expect(ch1.map((t) => t.id).sort()).toEqual(['t1', 't2'])

    const ch2 = engine.getTemplatesByChapter(2)
    expect(ch2).toHaveLength(1)
    expect(ch2[0].id).toBe('t3')

    const ch99 = engine.getTemplatesByChapter(99)
    expect(ch99).toHaveLength(0)
  })

  it('filters templates by topic', () => {
    const ledger = setupLedger()
    const engine = new TransactionEngine(ledger)

    engine.registerTemplate(makeTemplate({ id: 't1', chapter: 1, topic: 'revenue' }))
    engine.registerTemplate(makeTemplate({ id: 't2', chapter: 1, topic: 'expenses' }))
    engine.registerTemplate(makeTemplate({ id: 't3', chapter: 2, topic: 'revenue' }))

    const revTemplates = engine.getTemplatesByTopic('revenue')
    expect(revTemplates).toHaveLength(2)
    expect(revTemplates.map((t) => t.id).sort()).toEqual(['t1', 't3'])

    const expTemplates = engine.getTemplatesByTopic('expenses')
    expect(expTemplates).toHaveLength(1)
    expect(expTemplates[0].id).toBe('t2')

    const noMatch = engine.getTemplatesByTopic('nonexistent')
    expect(noMatch).toHaveLength(0)
  })

  it('handles multi-debit/credit templates', () => {
    const ledger = setupLedger()
    const engine = new TransactionEngine(ledger)

    const multiTemplate = makeTemplate({
      id: 'sale-with-cogs',
      name: 'Sale with Cost of Goods Sold',
      debits: [
        { account: 'Cash', param: 'saleAmount' },
        { account: 'Cost of Goods Sold', param: 'cogsAmount' },
      ],
      credits: [
        { account: 'Revenue', param: 'saleAmount' },
        { account: 'Inventory', param: 'cogsAmount' },
      ],
      params: [
        { key: 'saleAmount', label: 'Sale Amount', type: 'number' },
        { key: 'cogsAmount', label: 'COGS Amount', type: 'number' },
      ],
    })

    engine.registerTemplate(multiTemplate)

    const changes = engine.execute('sale-with-cogs', {
      saleAmount: 1000,
      cogsAmount: 600,
    })

    expect(changes).toHaveLength(4)

    // Debit Cash 1000
    expect(changes[0]).toEqual({
      account: 'Cash',
      side: 'debit',
      amount: 1000,
      before: 0,
      after: 1000,
    })
    // Debit Cost of Goods Sold 600
    expect(changes[1]).toEqual({
      account: 'Cost of Goods Sold',
      side: 'debit',
      amount: 600,
      before: 0,
      after: 600,
    })
    // Credit Revenue 1000
    expect(changes[2]).toEqual({
      account: 'Revenue',
      side: 'credit',
      amount: 1000,
      before: 0,
      after: 1000,
    })
    // Credit Inventory 600
    expect(changes[3]).toEqual({
      account: 'Inventory',
      side: 'credit',
      amount: 600,
      before: 0,
      after: -600,
    })

    expect(ledger.getAccount('Cash').balance).toBe(1000)
    expect(ledger.getAccount('Cost of Goods Sold').balance).toBe(600)
    expect(ledger.getAccount('Revenue').balance).toBe(1000)
    expect(ledger.getAccount('Inventory').balance).toBe(-600)
  })

  it('rejects execution when params produce unbalanced entry', () => {
    const ledger = setupLedger()
    const engine = new TransactionEngine(ledger)

    // Template where debits and credits use different params
    const unbalancedTemplate = makeTemplate({
      id: 'unbalanced',
      debits: [{ account: 'Cash', param: 'debitAmount' }],
      credits: [{ account: 'Revenue', param: 'creditAmount' }],
      params: [
        { key: 'debitAmount', label: 'Debit Amount', type: 'number' },
        { key: 'creditAmount', label: 'Credit Amount', type: 'number' },
      ],
    })

    engine.registerTemplate(unbalancedTemplate)

    // Pass different amounts for debit and credit params
    expect(() =>
      engine.execute('unbalanced', { debitAmount: 1000, creditAmount: 500 }),
    ).toThrow('Debits and credits must balance')
  })
})
