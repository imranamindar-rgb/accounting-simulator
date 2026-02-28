import type { TransactionTemplate, LedgerChange } from './types.ts'
import type { Ledger } from './Ledger.ts'

export class TransactionEngine {
  private ledger: Ledger
  private templates: Map<string, TransactionTemplate>

  constructor(ledger: Ledger) {
    this.ledger = ledger
    this.templates = new Map()
  }

  registerTemplate(template: TransactionTemplate): void {
    this.templates.set(template.id, template)
  }

  getTemplate(id: string): TransactionTemplate {
    const template = this.templates.get(id)
    if (!template) {
      throw new Error(`Template "${id}" not found`)
    }
    return template
  }

  getTemplatesByChapter(chapter: number): TransactionTemplate[] {
    return [...this.templates.values()].filter((t) => t.chapter === chapter)
  }

  getTemplatesByTopic(topic: string): TransactionTemplate[] {
    return [...this.templates.values()].filter((t) => t.topic === topic)
  }

  execute(templateId: string, params: Record<string, number>): LedgerChange[] {
    const template = this.getTemplate(templateId)
    const debits = template.debits.map((d) => ({
      account: d.account,
      amount: params[d.param],
    }))
    const credits = template.credits.map((c) => ({
      account: c.account,
      amount: params[c.param],
    }))
    return this.ledger.recordEntry(debits, credits)
  }
}
