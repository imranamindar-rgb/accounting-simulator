import { create } from 'zustand'
import { Ledger } from '../engines/Ledger.ts'
import { TransactionEngine } from '../engines/TransactionEngine.ts'
import {
  generateBalanceSheet,
  generateIncomeStatement,
  generateCashFlowStatement,
  generateCashFlowDirect,
  generateEquityStatement,
} from '../engines/StatementGenerator.ts'
import { calculateRatios } from '../engines/RatioCalculator.ts'
import { closeAccounts } from '../engines/closeAccounts.ts'
import { CHART_OF_ACCOUNTS } from '../data/chartOfAccounts.ts'
import { TRANSACTION_TEMPLATES } from '../data/transactionTemplates.ts'
import type { SampleCompany } from '../data/sampleCompanies.ts'
import type {
  BalanceSheet,
  IncomeStatement,
  CashFlowStatement,
  EquityStatement,
  LedgerChange,
} from '../engines/types.ts'
import type { FinancialRatios } from '../engines/RatioCalculator.ts'

interface TransactionRecord {
  templateId: string
  templateName: string
  params: Record<string, number>
  timestamp: number
  changes: LedgerChange[]
}

interface PeriodSnapshot {
  label: string
  snapshot: Map<string, number>
  statements: {
    balanceSheet: BalanceSheet
    incomeStatement: IncomeStatement
  }
}

interface LedgerState {
  ledger: Ledger
  transactionEngine: TransactionEngine
  undoStack: Map<string, number>[]
  redoStack: Map<string, number>[]
  beginningBalances: Map<string, number>
  transactionHistory: TransactionRecord[]
  periods: PeriodSnapshot[]
  currentPeriod: number
  selectedCompany: SampleCompany | null
  sharesOutstanding: number

  // Actions
  initFromCompany: (company: SampleCompany) => void
  recordTransaction: (templateId: string, params: Record<string, number>) => void
  undo: () => void
  redo: () => void
  reset: () => void
  closePeriod: (label: string) => void

  // Derived (computed on demand)
  getStatements: () => {
    balanceSheet: BalanceSheet
    incomeStatement: IncomeStatement
    cashFlowStatement: CashFlowStatement
    cashFlowDirect: CashFlowStatement
    equityStatement: EquityStatement
  }
  getRatios: () => FinancialRatios
}

function createInitialLedger(): { ledger: Ledger; transactionEngine: TransactionEngine } {
  const ledger = new Ledger()
  const transactionEngine = new TransactionEngine(ledger)
  return { ledger, transactionEngine }
}

export const useLedgerStore = create<LedgerState>()((set, get) => {
  const initial = createInitialLedger()

  return {
    ledger: initial.ledger,
    transactionEngine: initial.transactionEngine,
    undoStack: [],
    redoStack: [],
    beginningBalances: new Map(),
    transactionHistory: [],
    periods: [],
    currentPeriod: 0,
    selectedCompany: null,
    sharesOutstanding: 1,

    initFromCompany: (company: SampleCompany) => {
      const ledger = new Ledger()
      const transactionEngine = new TransactionEngine(ledger)

      // Add all accounts from chart of accounts
      for (const acctDef of CHART_OF_ACCOUNTS) {
        ledger.addAccount(acctDef.name, acctDef.type, {
          subtype: acctDef.subtype,
          contra: acctDef.contra,
          cashFlow: acctDef.cashFlow,
        })
      }

      // Register all transaction templates
      for (const template of TRANSACTION_TEMPLATES) {
        transactionEngine.registerTemplate(template)
      }

      // Set balances from company data
      for (const [accountName, balance] of Object.entries(company.balances)) {
        ledger.adjustBalance(accountName, balance)
      }

      const beginningBalances = ledger.takeSnapshot()

      set({
        ledger,
        transactionEngine,
        undoStack: [],
        redoStack: [],
        beginningBalances,
        transactionHistory: [],
        periods: [],
        currentPeriod: 0,
        selectedCompany: company,
        sharesOutstanding: company.sharesOutstanding,
      })
    },

    recordTransaction: (templateId: string, params: Record<string, number>) => {
      const { ledger, transactionEngine, undoStack, transactionHistory } = get()

      // Save current snapshot to undo stack
      const snapshot = ledger.takeSnapshot()
      const newUndoStack = [...undoStack, snapshot]

      // Execute the transaction and capture changes
      const changes = transactionEngine.execute(templateId, params)

      // Get template name
      const template = TRANSACTION_TEMPLATES.find((t) => t.id === templateId)
      const templateName = template?.name ?? templateId

      // Add to history
      const newHistory = [
        ...transactionHistory,
        { templateId, templateName, params, timestamp: Date.now(), changes },
      ]

      set({
        undoStack: newUndoStack,
        redoStack: [],
        transactionHistory: newHistory,
      })
    },

    undo: () => {
      const { ledger, undoStack, redoStack } = get()
      if (undoStack.length === 0) return

      // Save current state to redo stack
      const currentSnapshot = ledger.takeSnapshot()
      const newRedoStack = [...redoStack, currentSnapshot]

      // Pop the last undo snapshot and restore it
      const newUndoStack = [...undoStack]
      const previousSnapshot = newUndoStack.pop()!
      ledger.restoreSnapshot(previousSnapshot)

      set({
        undoStack: newUndoStack,
        redoStack: newRedoStack,
      })
    },

    redo: () => {
      const { ledger, undoStack, redoStack } = get()
      if (redoStack.length === 0) return

      // Save current state to undo stack
      const currentSnapshot = ledger.takeSnapshot()
      const newUndoStack = [...undoStack, currentSnapshot]

      // Pop the last redo snapshot and restore it
      const newRedoStack = [...redoStack]
      const nextSnapshot = newRedoStack.pop()!
      ledger.restoreSnapshot(nextSnapshot)

      set({
        undoStack: newUndoStack,
        redoStack: newRedoStack,
      })
    },

    reset: () => {
      const { selectedCompany } = get()
      if (selectedCompany) {
        get().initFromCompany(selectedCompany)
      }
    },

    closePeriod: (label: string) => {
      const { ledger, periods, currentPeriod, transactionHistory } = get()

      // Capture pre-closing statements
      const balanceSheet = generateBalanceSheet(ledger)
      const incomeStatement = generateIncomeStatement(ledger)
      const preClosingSnapshot = ledger.takeSnapshot()

      // Execute closing entries
      const changes = closeAccounts(ledger)

      // Post-closing becomes new beginning balances
      const postClosingSnapshot = ledger.takeSnapshot()

      // Add to history
      const closingRecord: TransactionRecord = {
        templateId: 'close-period',
        templateName: 'Closing Entries',
        params: {},
        timestamp: Date.now(),
        changes,
      }

      const newPeriods = [
        ...periods,
        {
          label,
          snapshot: preClosingSnapshot,
          statements: { balanceSheet, incomeStatement },
        },
      ]

      set({
        periods: newPeriods,
        currentPeriod: currentPeriod + 1,
        beginningBalances: postClosingSnapshot,
        transactionHistory: [...transactionHistory, closingRecord],
        undoStack: [],
        redoStack: [],
      })
    },

    getStatements: () => {
      const { ledger, beginningBalances, sharesOutstanding } = get()
      const balanceSheet = generateBalanceSheet(ledger)
      const incomeStatement = generateIncomeStatement(ledger)
      const cashFlowStatement = generateCashFlowStatement(
        ledger,
        beginningBalances,
        incomeStatement.netIncome,
      )
      const cashFlowDirect = generateCashFlowDirect(ledger, beginningBalances)
      const equityStatement = generateEquityStatement(
        ledger,
        beginningBalances,
        incomeStatement.netIncome,
      )

      // sharesOutstanding is available for consumers that need EPS calculations
      void sharesOutstanding

      return {
        balanceSheet,
        incomeStatement,
        cashFlowStatement,
        cashFlowDirect,
        equityStatement,
      }
    },

    getRatios: () => {
      const { getStatements } = get()
      const { balanceSheet, incomeStatement, cashFlowStatement } = getStatements()
      return calculateRatios(balanceSheet, incomeStatement, cashFlowStatement)
    },
  }
})
