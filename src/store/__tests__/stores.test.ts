import { describe, it, expect, beforeEach } from 'vitest'
import { useLedgerStore } from '../ledgerStore.ts'
import { useUIStore } from '../uiStore.ts'
import { useMAStore } from '../maStore.ts'
import { SAMPLE_COMPANIES } from '../../data/sampleCompanies.ts'

// Sound & Light Pty Ltd — find by name (Blank Company is now at index 0)
const soundAndLight = SAMPLE_COMPANIES.find(c => c.name.includes('Sound'))!

// ── Ledger Store ────────────────────────────────────────────────────

describe('useLedgerStore', () => {
  beforeEach(() => {
    // Reset the store between tests by re-initializing
    useLedgerStore.setState({
      undoStack: [],
      redoStack: [],
      transactionHistory: [],
      periods: [],
      currentPeriod: 0,
      selectedCompany: null,
    })
  })

  describe('initFromCompany', () => {
    it('populates ledger with correct account balances from Sound & Light', () => {
      useLedgerStore.getState().initFromCompany(soundAndLight)
      const { ledger } = useLedgerStore.getState()

      expect(ledger.getAccount('Cash').balance).toBe(45000)
      expect(ledger.getAccount('Accounts Receivable').balance).toBe(32000)
      expect(ledger.getAccount('Allowance for Doubtful Accounts').balance).toBe(-1600)
      expect(ledger.getAccount('Inventory').balance).toBe(58000)
      expect(ledger.getAccount('Prepaid Expenses').balance).toBe(3000)
      expect(ledger.getAccount('Equipment').balance).toBe(120000)
      expect(ledger.getAccount('Accumulated Depreciation - Equipment').balance).toBe(-24000)
      expect(ledger.getAccount('Accounts Payable').balance).toBe(28000)
      expect(ledger.getAccount('Salaries Payable').balance).toBe(4500)
      expect(ledger.getAccount('Unearned Revenue').balance).toBe(6000)
      expect(ledger.getAccount('Notes Payable - Long Term').balance).toBe(50000)
      expect(ledger.getAccount('Common Stock').balance).toBe(100000)
      expect(ledger.getAccount('Retained Earnings').balance).toBe(43900)
    })

    it('sets selectedCompany and sharesOutstanding', () => {
      useLedgerStore.getState().initFromCompany(soundAndLight)
      const state = useLedgerStore.getState()

      expect(state.selectedCompany).toBe(soundAndLight)
      expect(state.sharesOutstanding).toBe(10)
    })

    it('saves beginning balances as a snapshot', () => {
      useLedgerStore.getState().initFromCompany(soundAndLight)
      const { beginningBalances } = useLedgerStore.getState()

      expect(beginningBalances.get('Cash')).toBe(45000)
      expect(beginningBalances.get('Inventory')).toBe(58000)
      expect(beginningBalances.get('Common Stock')).toBe(100000)
    })

    it('clears undo/redo stacks and history on init', () => {
      useLedgerStore.getState().initFromCompany(soundAndLight)
      const state = useLedgerStore.getState()

      expect(state.undoStack).toHaveLength(0)
      expect(state.redoStack).toHaveLength(0)
      expect(state.transactionHistory).toHaveLength(0)
    })
  })

  describe('recordTransaction', () => {
    beforeEach(() => {
      useLedgerStore.getState().initFromCompany(soundAndLight)
    })

    it('updates ledger balances correctly for a cash sale', () => {
      const { ledger } = useLedgerStore.getState()
      const cashBefore = ledger.getAccount('Cash').balance

      useLedgerStore.getState().recordTransaction('cash-sale', { amount: 5000 })

      // After the transaction, re-read from store (ledger mutates in place)
      const { ledger: updatedLedger } = useLedgerStore.getState()
      expect(updatedLedger.getAccount('Cash').balance).toBe(cashBefore + 5000)
      expect(updatedLedger.getAccount('Sales Revenue').balance).toBe(5000)
    })

    it('adds transaction to history', () => {
      useLedgerStore.getState().recordTransaction('cash-sale', { amount: 5000 })
      const { transactionHistory } = useLedgerStore.getState()

      expect(transactionHistory).toHaveLength(1)
      expect(transactionHistory[0].templateId).toBe('cash-sale')
      expect(transactionHistory[0].params).toEqual({ amount: 5000 })
      expect(transactionHistory[0].timestamp).toBeGreaterThan(0)
    })

    it('pushes snapshot to undo stack and clears redo stack', () => {
      useLedgerStore.getState().recordTransaction('cash-sale', { amount: 5000 })
      const state = useLedgerStore.getState()

      expect(state.undoStack).toHaveLength(1)
      expect(state.redoStack).toHaveLength(0)
    })

    it('handles multiple transactions', () => {
      useLedgerStore.getState().recordTransaction('cash-sale', { amount: 5000 })
      useLedgerStore.getState().recordTransaction('cash-purchase', { amount: 2000 })

      const { ledger, undoStack } = useLedgerStore.getState()
      expect(ledger.getAccount('Cash').balance).toBe(45000 + 5000 - 2000)
      expect(ledger.getAccount('Sales Revenue').balance).toBe(5000)
      expect(ledger.getAccount('Inventory').balance).toBe(58000 + 2000)
      expect(undoStack).toHaveLength(2)
    })
  })

  describe('undo', () => {
    beforeEach(() => {
      useLedgerStore.getState().initFromCompany(soundAndLight)
    })

    it('reverts the last transaction', () => {
      useLedgerStore.getState().recordTransaction('cash-sale', { amount: 5000 })
      expect(useLedgerStore.getState().ledger.getAccount('Cash').balance).toBe(50000)

      useLedgerStore.getState().undo()
      expect(useLedgerStore.getState().ledger.getAccount('Cash').balance).toBe(45000)
      expect(useLedgerStore.getState().ledger.getAccount('Sales Revenue').balance).toBe(0)
    })

    it('pushes current state to redo stack', () => {
      useLedgerStore.getState().recordTransaction('cash-sale', { amount: 5000 })
      useLedgerStore.getState().undo()

      const state = useLedgerStore.getState()
      expect(state.undoStack).toHaveLength(0)
      expect(state.redoStack).toHaveLength(1)
    })

    it('does nothing when undo stack is empty', () => {
      const cashBefore = useLedgerStore.getState().ledger.getAccount('Cash').balance
      useLedgerStore.getState().undo()
      expect(useLedgerStore.getState().ledger.getAccount('Cash').balance).toBe(cashBefore)
    })

    it('can undo multiple transactions sequentially', () => {
      useLedgerStore.getState().recordTransaction('cash-sale', { amount: 5000 })
      useLedgerStore.getState().recordTransaction('cash-purchase', { amount: 2000 })

      useLedgerStore.getState().undo() // undo cash-purchase
      expect(useLedgerStore.getState().ledger.getAccount('Cash').balance).toBe(50000)
      expect(useLedgerStore.getState().ledger.getAccount('Inventory').balance).toBe(58000)

      useLedgerStore.getState().undo() // undo cash-sale
      expect(useLedgerStore.getState().ledger.getAccount('Cash').balance).toBe(45000)
    })
  })

  describe('redo', () => {
    beforeEach(() => {
      useLedgerStore.getState().initFromCompany(soundAndLight)
    })

    it('re-applies an undone transaction', () => {
      useLedgerStore.getState().recordTransaction('cash-sale', { amount: 5000 })
      useLedgerStore.getState().undo()
      expect(useLedgerStore.getState().ledger.getAccount('Cash').balance).toBe(45000)

      useLedgerStore.getState().redo()
      expect(useLedgerStore.getState().ledger.getAccount('Cash').balance).toBe(50000)
      expect(useLedgerStore.getState().ledger.getAccount('Sales Revenue').balance).toBe(5000)
    })

    it('moves state from redo stack to undo stack', () => {
      useLedgerStore.getState().recordTransaction('cash-sale', { amount: 5000 })
      useLedgerStore.getState().undo()
      useLedgerStore.getState().redo()

      const state = useLedgerStore.getState()
      expect(state.undoStack).toHaveLength(1)
      expect(state.redoStack).toHaveLength(0)
    })

    it('does nothing when redo stack is empty', () => {
      useLedgerStore.getState().recordTransaction('cash-sale', { amount: 5000 })
      const cashAfter = useLedgerStore.getState().ledger.getAccount('Cash').balance

      useLedgerStore.getState().redo() // nothing to redo
      expect(useLedgerStore.getState().ledger.getAccount('Cash').balance).toBe(cashAfter)
    })
  })

  describe('reset', () => {
    it('restores initial balances after transactions', () => {
      useLedgerStore.getState().initFromCompany(soundAndLight)
      useLedgerStore.getState().recordTransaction('cash-sale', { amount: 5000 })
      useLedgerStore.getState().recordTransaction('cash-purchase', { amount: 2000 })

      useLedgerStore.getState().reset()

      const { ledger, undoStack, redoStack, transactionHistory } = useLedgerStore.getState()
      expect(ledger.getAccount('Cash').balance).toBe(45000)
      expect(ledger.getAccount('Sales Revenue').balance).toBe(0)
      expect(ledger.getAccount('Inventory').balance).toBe(58000)
      expect(undoStack).toHaveLength(0)
      expect(redoStack).toHaveLength(0)
      expect(transactionHistory).toHaveLength(0)
    })

    it('does nothing if no company selected', () => {
      // No initFromCompany called, reset should not throw
      useLedgerStore.getState().reset()
    })
  })

  describe('closePeriod', () => {
    it('saves period snapshot and increments counter', () => {
      useLedgerStore.getState().initFromCompany(soundAndLight)
      useLedgerStore.getState().recordTransaction('cash-sale', { amount: 5000 })

      useLedgerStore.getState().closePeriod('Period 1')

      const { periods, currentPeriod } = useLedgerStore.getState()
      expect(periods).toHaveLength(1)
      expect(periods[0].label).toBe('Period 1')
      expect(periods[0].statements.balanceSheet).toBeDefined()
      expect(periods[0].statements.incomeStatement).toBeDefined()
      expect(currentPeriod).toBe(1)
    })
  })

  describe('getStatements', () => {
    it('returns valid statement objects for Sound & Light', () => {
      useLedgerStore.getState().initFromCompany(soundAndLight)
      const statements = useLedgerStore.getState().getStatements()

      // Balance Sheet
      expect(statements.balanceSheet).toBeDefined()
      expect(statements.balanceSheet.totalAssets).toBeGreaterThan(0)
      expect(statements.balanceSheet.isBalanced).toBe(true)

      // Income Statement
      expect(statements.incomeStatement).toBeDefined()
      expect(typeof statements.incomeStatement.netIncome).toBe('number')

      // Cash Flow Statement (indirect)
      expect(statements.cashFlowStatement).toBeDefined()
      expect(typeof statements.cashFlowStatement.netChange).toBe('number')
      expect(typeof statements.cashFlowStatement.beginningCash).toBe('number')

      // Cash Flow Statement (direct)
      expect(statements.cashFlowDirect).toBeDefined()
      expect(typeof statements.cashFlowDirect.netChange).toBe('number')

      // Equity Statement
      expect(statements.equityStatement).toBeDefined()
      expect(typeof statements.equityStatement.totalBeginning).toBe('number')
      expect(typeof statements.equityStatement.totalEnding).toBe('number')
    })

    it('reflects transaction changes in statements', () => {
      useLedgerStore.getState().initFromCompany(soundAndLight)

      const statementsBefore = useLedgerStore.getState().getStatements()
      const revenueBefore = statementsBefore.incomeStatement.totalRevenue

      useLedgerStore.getState().recordTransaction('cash-sale', { amount: 10000 })

      const statementsAfter = useLedgerStore.getState().getStatements()
      expect(statementsAfter.incomeStatement.totalRevenue).toBe(revenueBefore + 10000)
    })
  })

  describe('getRatios', () => {
    it('returns valid ratio calculations', () => {
      useLedgerStore.getState().initFromCompany(soundAndLight)

      // Make a sale so there is revenue for ratio calculations
      useLedgerStore.getState().recordTransaction('cash-sale', { amount: 10000 })
      useLedgerStore.getState().recordTransaction('record-cogs', { amount: 6000 })

      const ratios = useLedgerStore.getState().getRatios()

      expect(ratios).toBeDefined()
      // With revenue of 10000, COGS of 6000, gross profit is 4000
      expect(ratios.grossProfitMargin).toBeCloseTo(0.4, 5)
      expect(typeof ratios.currentRatio).toBe('number')
      expect(typeof ratios.debtToEquity).toBe('number')
    })

    it('returns null ratios when denominators are zero', () => {
      useLedgerStore.getState().initFromCompany(soundAndLight)

      // No revenue recorded: safeDiv(0, totalRevenue=0) returns null
      const ratios = useLedgerStore.getState().getRatios()
      expect(ratios.grossProfitMargin).toBeNull()
      expect(ratios.netProfitMargin).toBeNull()
      // assetTurnover = totalRevenue / totalAssets = 0 / positive = 0 (not null)
      expect(ratios.assetTurnover).toBe(0)
      // interestCoverage = operatingIncome / interestExpense, with no interest expense => null
      expect(ratios.interestCoverage).toBeNull()
    })
  })
})

// ── UI Store ────────────────────────────────────────────────────────

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset to defaults
    useUIStore.setState({
      mode: 'transaction',
      activeTab: 'statements',
      drawerOpen: false,
      sensitivityOpen: false,
      tutorialStep: null,
      quizzesEnabled: false,
      unlockedTiers: new Set(['starter']),
      cashFlowMethod: 'indirect',
      viewMode: 'statements',
      selectedTopic: null,
    })
  })

  describe('default values', () => {
    it('has correct defaults', () => {
      const state = useUIStore.getState()

      expect(state.mode).toBe('transaction')
      expect(state.activeTab).toBe('statements')
      expect(state.drawerOpen).toBe(false)
      expect(state.sensitivityOpen).toBe(false)
      expect(state.tutorialStep).toBeNull()
      expect(state.quizzesEnabled).toBe(false)
      expect(state.unlockedTiers).toEqual(new Set(['starter']))
      expect(state.cashFlowMethod).toBe('indirect')
      expect(state.viewMode).toBe('statements')
      expect(state.selectedTopic).toBeNull()
    })
  })

  describe('setMode', () => {
    it('changes the mode', () => {
      useUIStore.getState().setMode('whatif')
      expect(useUIStore.getState().mode).toBe('whatif')
    })

    it('can switch back to transaction', () => {
      useUIStore.getState().setMode('whatif')
      useUIStore.getState().setMode('transaction')
      expect(useUIStore.getState().mode).toBe('transaction')
    })
  })

  describe('setActiveTab', () => {
    it('changes the active tab', () => {
      useUIStore.getState().setActiveTab('ma')
      expect(useUIStore.getState().activeTab).toBe('ma')
    })
  })

  describe('toggleDrawer', () => {
    it('toggles drawer open and closed', () => {
      expect(useUIStore.getState().drawerOpen).toBe(false)
      useUIStore.getState().toggleDrawer()
      expect(useUIStore.getState().drawerOpen).toBe(true)
      useUIStore.getState().toggleDrawer()
      expect(useUIStore.getState().drawerOpen).toBe(false)
    })
  })

  describe('setViewMode', () => {
    it('changes the view mode', () => {
      useUIStore.getState().setViewMode('tAccounts')
      expect(useUIStore.getState().viewMode).toBe('tAccounts')
    })
  })

  describe('setCashFlowMethod', () => {
    it('changes the cash flow method', () => {
      useUIStore.getState().setCashFlowMethod('direct')
      expect(useUIStore.getState().cashFlowMethod).toBe('direct')
    })
  })

  describe('unlockTier', () => {
    it('adds a tier to the unlocked set', () => {
      useUIStore.getState().unlockTier('accruals')
      const tiers = useUIStore.getState().unlockedTiers

      expect(tiers.has('starter')).toBe(true)
      expect(tiers.has('accruals')).toBe(true)
      expect(tiers.size).toBe(2)
    })

    it('does not duplicate existing tiers', () => {
      useUIStore.getState().unlockTier('starter')
      expect(useUIStore.getState().unlockedTiers.size).toBe(1)
    })

    it('can unlock multiple tiers sequentially', () => {
      useUIStore.getState().unlockTier('accruals')
      useUIStore.getState().unlockTier('intermediate')

      const tiers = useUIStore.getState().unlockedTiers
      expect(tiers.has('starter')).toBe(true)
      expect(tiers.has('accruals')).toBe(true)
      expect(tiers.has('intermediate')).toBe(true)
      expect(tiers.size).toBe(3)
    })
  })

  describe('unlockAll', () => {
    it('adds all 4 tiers', () => {
      useUIStore.getState().unlockAll()
      const tiers = useUIStore.getState().unlockedTiers

      expect(tiers.has('starter')).toBe(true)
      expect(tiers.has('accruals')).toBe(true)
      expect(tiers.has('intermediate')).toBe(true)
      expect(tiers.has('advanced')).toBe(true)
      expect(tiers.size).toBe(4)
    })
  })

  describe('setSelectedTopic', () => {
    it('sets and clears the selected topic', () => {
      useUIStore.getState().setSelectedTopic('basics')
      expect(useUIStore.getState().selectedTopic).toBe('basics')

      useUIStore.getState().setSelectedTopic(null)
      expect(useUIStore.getState().selectedTopic).toBeNull()
    })
  })
})

// ── MA Store ────────────────────────────────────────────────────────

describe('useMAStore', () => {
  beforeEach(() => {
    useMAStore.getState().resetWorkbench()
  })

  describe('default values', () => {
    it('has correct default deal terms', () => {
      const { dealTerms } = useMAStore.getState()

      expect(dealTerms.premiumPct).toBe(25)
      expect(dealTerms.cashPct).toBe(50)
      expect(dealTerms.stockPct).toBe(30)
      expect(dealTerms.debtPct).toBe(20)
      expect(dealTerms.debtRate).toBe(5)
      expect(dealTerms.taxRate).toBe(0.25)
      expect(dealTerms.synergies).toBe(0)
    })

    it('has correct default workbench step', () => {
      expect(useMAStore.getState().workbenchStep).toBe(0)
    })

    it('has null companies and DCF inputs by default', () => {
      const state = useMAStore.getState()
      expect(state.targetCompany).toBeNull()
      expect(state.acquirerCompany).toBeNull()
      expect(state.dcfInputs).toBeNull()
    })
  })

  describe('setWorkbenchStep', () => {
    it('changes the workbench step', () => {
      useMAStore.getState().setWorkbenchStep(2)
      expect(useMAStore.getState().workbenchStep).toBe(2)
    })
  })

  describe('setTargetCompany', () => {
    it('sets the target company', () => {
      const mockCompany: import('../../engines/MAEngine.ts').MACompanyInput = {
        name: 'Test Corp',
        sharePrice: 100,
        sharesOut: 1000,
        netIncome: 50000,
        totalAssets: 500000,
        totalLiabilities: 200000,
        totalEquity: 300000,
        currentAssets: 150000,
        currentLiabilities: 80000,
        cash: 50000,
        inventory: 30000,
        accountsReceivable: 40000,
        longTermDebt: 120000,
        revenue: 400000,
        cogs: 200000,
        operatingIncome: 80000,
        ebitda: 100000,
        interestExpense: 10000,
        freeCashFlow: 60000,
        grossProfit: 200000,
      }

      useMAStore.getState().setTargetCompany(mockCompany)
      expect(useMAStore.getState().targetCompany).toEqual(mockCompany)
    })
  })

  describe('setDealTerms', () => {
    it('merges partial updates with existing terms', () => {
      useMAStore.getState().setDealTerms({ premiumPct: 30, synergies: 5000 })

      const { dealTerms } = useMAStore.getState()
      expect(dealTerms.premiumPct).toBe(30)
      expect(dealTerms.synergies).toBe(5000)
      // Others should remain at defaults
      expect(dealTerms.cashPct).toBe(50)
      expect(dealTerms.stockPct).toBe(30)
      expect(dealTerms.debtPct).toBe(20)
      expect(dealTerms.debtRate).toBe(5)
      expect(dealTerms.taxRate).toBe(0.25)
    })

    it('can update a single field', () => {
      useMAStore.getState().setDealTerms({ taxRate: 0.30 })
      expect(useMAStore.getState().dealTerms.taxRate).toBe(0.30)
      expect(useMAStore.getState().dealTerms.premiumPct).toBe(25) // unchanged
    })
  })

  describe('setDCFInputs', () => {
    it('sets DCF inputs', () => {
      const dcf: import('../../engines/MAEngine.ts').DCFInput = {
        baseFCF: 100000,
        growthRate: 0.08,
        wacc: 0.10,
        terminalGrowth: 0.025,
        sharesOutstanding: 1000,
        longTermDebt: 50000,
        cash: 30000,
      }

      useMAStore.getState().setDCFInputs(dcf)
      expect(useMAStore.getState().dcfInputs).toEqual(dcf)
    })
  })

  describe('resetWorkbench', () => {
    it('restores all defaults', () => {
      // Modify some state first
      useMAStore.getState().setWorkbenchStep(3)
      useMAStore.getState().setDealTerms({ premiumPct: 50, synergies: 10000 })
      useMAStore.getState().setTargetCompany({
        name: 'Test',
        sharePrice: 100,
        sharesOut: 1000,
        netIncome: 50000,
        totalAssets: 500000,
        totalLiabilities: 200000,
        totalEquity: 300000,
        currentAssets: 150000,
        currentLiabilities: 80000,
        cash: 50000,
        inventory: 30000,
        accountsReceivable: 40000,
        longTermDebt: 120000,
        revenue: 400000,
        cogs: 200000,
        operatingIncome: 80000,
        ebitda: 100000,
        interestExpense: 10000,
        freeCashFlow: 60000,
        grossProfit: 200000,
      })

      // Now reset
      useMAStore.getState().resetWorkbench()

      const state = useMAStore.getState()
      expect(state.workbenchStep).toBe(0)
      expect(state.targetCompany).toBeNull()
      expect(state.acquirerCompany).toBeNull()
      expect(state.dcfInputs).toBeNull()
      expect(state.dealTerms.premiumPct).toBe(25)
      expect(state.dealTerms.synergies).toBe(0)
    })
  })
})
