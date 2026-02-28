import { describe, it, expect } from 'vitest'
import { Ledger } from '../Ledger.ts'
import {
  generateBalanceSheet,
  generateIncomeStatement,
  generateCashFlowStatement,
  generateCashFlowDirect,
  generateEquityStatement,
} from '../StatementGenerator.ts'

/**
 * Sets up a Ledger with the Sound & Light Pty Ltd sample data:
 *
 *   Cash            = 45,000   (Asset, current, cash)
 *   AR              = 32,000   (Asset, current, operating)
 *   ADA             = -1,600   (Asset, current, contra)
 *   Inventory       = 58,000   (Asset, current, operating)
 *   Prepaid         =  3,000   (Asset, current, operating)
 *   Equipment       = 120,000  (Asset, noncurrent, investing)
 *   AccDepr-Equip   = -24,000  (Asset, noncurrent, contra, operating-adjustment)
 *   AP              = 28,000   (Liability, current, operating)
 *   SalariesPayable =  4,500   (Liability, current, operating)
 *   UnearnedRev     =  6,000   (Liability, current, operating)
 *   NP-LT           = 50,000   (Liability, noncurrent, financing)
 *   CommonStock     = 100,000  (Equity, financing)
 *   RE              = 43,900   (Equity, financing)
 *
 * Total Assets:
 *   Current: 45000 + 32000 + (-1600) + 58000 + 3000 = 136,400
 *   Noncurrent: 120000 + (-24000) = 96,000
 *   Total: 232,400
 *
 * Total Liabilities:
 *   Current: 28000 + 4500 + 6000 = 38,500
 *   Noncurrent: 50,000
 *   Total: 88,500
 *
 * Total Equity: 100,000 + 43,900 = 143,900
 *
 * Accounting equation: 232,400 = 88,500 + 143,900 = 232,400 ✓
 */
function createSampleLedger(): Ledger {
  const ledger = new Ledger()

  // Current Assets
  ledger.addAccount('Cash', 'Asset', { subtype: 'current', cashFlow: 'cash' })
  ledger.addAccount('Accounts Receivable', 'Asset', { subtype: 'current', cashFlow: 'operating' })
  ledger.addAccount('Allowance for Doubtful Accounts', 'Asset', {
    subtype: 'current',
    contra: true,
    cashFlow: 'operating',
  })
  ledger.addAccount('Inventory', 'Asset', { subtype: 'current', cashFlow: 'operating' })
  ledger.addAccount('Prepaid Expenses', 'Asset', { subtype: 'current', cashFlow: 'operating' })

  // Noncurrent Assets
  ledger.addAccount('Equipment', 'Asset', { subtype: 'noncurrent', cashFlow: 'investing' })
  ledger.addAccount('Accumulated Depreciation - Equipment', 'Asset', {
    subtype: 'noncurrent',
    contra: true,
    cashFlow: 'operating-adjustment',
  })

  // Current Liabilities
  ledger.addAccount('Accounts Payable', 'Liability', {
    subtype: 'current',
    cashFlow: 'operating',
  })
  ledger.addAccount('Salaries Payable', 'Liability', {
    subtype: 'current',
    cashFlow: 'operating',
  })
  ledger.addAccount('Unearned Revenue', 'Liability', {
    subtype: 'current',
    cashFlow: 'operating',
  })

  // Noncurrent Liabilities
  ledger.addAccount('Notes Payable - Long Term', 'Liability', {
    subtype: 'noncurrent',
    cashFlow: 'financing',
  })

  // Equity
  ledger.addAccount('Common Stock', 'Equity', { cashFlow: 'financing' })
  ledger.addAccount('Retained Earnings', 'Equity', { cashFlow: 'financing' })

  // Set balances using adjustBalance
  ledger.adjustBalance('Cash', 45000)
  ledger.adjustBalance('Accounts Receivable', 32000)
  ledger.adjustBalance('Allowance for Doubtful Accounts', -1600)
  ledger.adjustBalance('Inventory', 58000)
  ledger.adjustBalance('Prepaid Expenses', 3000)
  ledger.adjustBalance('Equipment', 120000)
  ledger.adjustBalance('Accumulated Depreciation - Equipment', -24000)
  ledger.adjustBalance('Accounts Payable', 28000)
  ledger.adjustBalance('Salaries Payable', 4500)
  ledger.adjustBalance('Unearned Revenue', 6000)
  ledger.adjustBalance('Notes Payable - Long Term', 50000)
  ledger.adjustBalance('Common Stock', 100000)
  ledger.adjustBalance('Retained Earnings', 43900)

  return ledger
}

describe('StatementGenerator', () => {
  describe('generateBalanceSheet', () => {
    it('computes correct totals for Sound & Light Pty Ltd sample data', () => {
      const ledger = createSampleLedger()
      const bs = generateBalanceSheet(ledger)

      // Current Assets: 45000 + 32000 + (-1600) + 58000 + 3000 = 136400
      expect(bs.totalCurrentAssets).toBe(136400)

      // Noncurrent Assets: 120000 + (-24000) = 96000
      expect(bs.totalNoncurrentAssets).toBe(96000)

      // Total Assets: 232400
      expect(bs.totalAssets).toBe(232400)

      // Current Liabilities: 28000 + 4500 + 6000 = 38500
      expect(bs.totalCurrentLiabilities).toBe(38500)

      // Noncurrent Liabilities: 50000
      expect(bs.totalNoncurrentLiabilities).toBe(50000)

      // Total Liabilities: 88500
      expect(bs.totalLiabilities).toBe(88500)

      // Total Equity: 100000 + 43900 = 143900
      expect(bs.totalEquity).toBe(143900)

      // Accounting equation: Assets = Liabilities + Equity
      expect(bs.totalLiabilitiesAndEquity).toBe(232400)
      expect(bs.isBalanced).toBe(true)
    })

    it('includes correct account lines with contra flags', () => {
      const ledger = createSampleLedger()
      const bs = generateBalanceSheet(ledger)

      // Check current assets include contra accounts
      const ada = bs.currentAssets.find(a => a.name === 'Allowance for Doubtful Accounts')
      expect(ada).toBeDefined()
      expect(ada!.balance).toBe(-1600)
      expect(ada!.contra).toBe(true)

      // Check noncurrent assets include contra accounts
      const accDepr = bs.noncurrentAssets.find(
        a => a.name === 'Accumulated Depreciation - Equipment',
      )
      expect(accDepr).toBeDefined()
      expect(accDepr!.balance).toBe(-24000)
      expect(accDepr!.contra).toBe(true)
    })

    it('lists equity accounts', () => {
      const ledger = createSampleLedger()
      const bs = generateBalanceSheet(ledger)

      expect(bs.equity).toHaveLength(2)
      const cs = bs.equity.find(e => e.name === 'Common Stock')
      expect(cs).toBeDefined()
      expect(cs!.balance).toBe(100000)

      const re = bs.equity.find(e => e.name === 'Retained Earnings')
      expect(re).toBeDefined()
      expect(re!.balance).toBe(43900)
    })
  })

  describe('generateIncomeStatement', () => {
    it('computes correct line items for a cash sale', () => {
      const ledger = createSampleLedger()

      // Add revenue and expense accounts
      ledger.addAccount('Sales Revenue', 'Revenue', { subtype: 'operating' })

      // Record a cash sale of $10,000
      ledger.recordEntry(
        [{ account: 'Cash', amount: 10000 }],
        [{ account: 'Sales Revenue', amount: 10000 }],
      )

      const is = generateIncomeStatement(ledger)

      expect(is.totalRevenue).toBe(10000)
      expect(is.totalCOGS).toBe(0)
      expect(is.grossProfit).toBe(10000)
      expect(is.totalOperatingExpenses).toBe(0)
      expect(is.operatingIncome).toBe(10000)
      expect(is.totalOther).toBe(0)
      expect(is.incomeBeforeTax).toBe(10000)
      expect(is.taxExpense).toBe(0)
      expect(is.netIncome).toBe(10000)
    })

    it('computes multi-step income statement with COGS and expenses', () => {
      const ledger = createSampleLedger()

      // Revenue
      ledger.addAccount('Sales Revenue', 'Revenue', { subtype: 'operating' })
      ledger.addAccount('Interest Income', 'Revenue', { subtype: 'other' })

      // Expenses
      ledger.addAccount('Cost of Goods Sold', 'Expense', { subtype: 'cogs' })
      ledger.addAccount('Salaries Expense', 'Expense', { subtype: 'operating' })
      ledger.addAccount('Rent Expense', 'Expense', { subtype: 'operating' })
      ledger.addAccount('Interest Expense', 'Expense', { subtype: 'other' })
      ledger.addAccount('Tax Expense', 'Expense', { subtype: 'tax' })

      // Record transactions (use adjustBalance for simplicity)
      ledger.adjustBalance('Sales Revenue', 50000)
      ledger.adjustBalance('Cost of Goods Sold', 20000)
      ledger.adjustBalance('Salaries Expense', 8000)
      ledger.adjustBalance('Rent Expense', 5000)
      ledger.adjustBalance('Interest Income', 1000)
      ledger.adjustBalance('Interest Expense', 2000)
      ledger.adjustBalance('Tax Expense', 4000)

      const is = generateIncomeStatement(ledger)

      expect(is.totalRevenue).toBe(50000)
      expect(is.totalCOGS).toBe(20000)
      expect(is.grossProfit).toBe(30000)
      expect(is.totalOperatingExpenses).toBe(13000) // 8000 + 5000
      expect(is.operatingIncome).toBe(17000)
      expect(is.totalOther).toBe(-1000) // 1000 - 2000
      expect(is.incomeBeforeTax).toBe(16000)
      expect(is.taxExpense).toBe(4000)
      expect(is.netIncome).toBe(12000)
    })

    it('computes EPS using common stock balance', () => {
      const ledger = createSampleLedger()
      ledger.addAccount('Sales Revenue', 'Revenue', { subtype: 'operating' })
      ledger.adjustBalance('Sales Revenue', 10000)

      const is = generateIncomeStatement(ledger)

      // Common Stock = 100,000; netIncome = 10,000
      // EPS = 10000 / 100000 = 0.1
      expect(is.eps).toBe(0.1)
    })

    it('revenue account lines are present', () => {
      const ledger = createSampleLedger()
      ledger.addAccount('Sales Revenue', 'Revenue', { subtype: 'operating' })
      ledger.addAccount('Service Revenue', 'Revenue', { subtype: 'operating' })
      ledger.adjustBalance('Sales Revenue', 7000)
      ledger.adjustBalance('Service Revenue', 3000)

      const is = generateIncomeStatement(ledger)

      expect(is.revenue).toHaveLength(2)
      expect(is.revenue.map(r => r.name).sort()).toEqual(['Sales Revenue', 'Service Revenue'])
      expect(is.totalRevenue).toBe(10000)
    })
  })

  describe('accounting equation after transactions', () => {
    it('holds after recording a cash sale', () => {
      const ledger = createSampleLedger()
      ledger.addAccount('Sales Revenue', 'Revenue', { subtype: 'operating' })

      // Record a cash sale of $10,000
      ledger.recordEntry(
        [{ account: 'Cash', amount: 10000 }],
        [{ account: 'Sales Revenue', amount: 10000 }],
      )

      const bs = generateBalanceSheet(ledger)

      // Cash went up by 10000, so totalAssets = 232400 + 10000 = 242400
      expect(bs.totalAssets).toBe(242400)

      // Revenue is not on BS but income flows through equity implicitly
      // However, since Revenue is a separate type, BS equity doesn't change unless we close
      // The BS won't be balanced because revenue hasn't been closed to RE yet.
      // BUT: The original monolith includes only Asset, Liability, Equity accounts on BS.
      // Revenue is NOT an equity account. So the equation check will show unbalanced
      // unless revenue is closed.

      // Actually, looking at the sample data: assets went up by 10000 but equity didn't.
      // So isBalanced = false (until revenue is closed to RE).
      expect(bs.totalEquity).toBe(143900) // unchanged
      expect(bs.totalLiabilities).toBe(88500) // unchanged
      expect(bs.isBalanced).toBe(false) // 242400 !== 88500 + 143900
    })

    it('holds when revenue is closed to retained earnings', () => {
      const ledger = createSampleLedger()
      ledger.addAccount('Sales Revenue', 'Revenue', { subtype: 'operating' })

      // Record a cash sale of $10,000
      ledger.recordEntry(
        [{ account: 'Cash', amount: 10000 }],
        [{ account: 'Sales Revenue', amount: 10000 }],
      )

      // Close revenue to retained earnings
      ledger.recordEntry(
        [{ account: 'Sales Revenue', amount: 10000 }],
        [{ account: 'Retained Earnings', amount: 10000 }],
      )

      const bs = generateBalanceSheet(ledger)

      expect(bs.totalAssets).toBe(242400)
      expect(bs.totalEquity).toBe(153900) // 143900 + 10000
      expect(bs.totalLiabilities).toBe(88500)
      expect(bs.totalLiabilitiesAndEquity).toBe(242400)
      expect(bs.isBalanced).toBe(true)
    })
  })

  describe('generateCashFlowStatement (indirect method)', () => {
    it('produces correct adjustments for working capital changes', () => {
      const ledger = createSampleLedger()

      // Add income statement accounts
      ledger.addAccount('Sales Revenue', 'Revenue', { subtype: 'operating' })
      ledger.addAccount('Cost of Goods Sold', 'Expense', { subtype: 'cogs' })

      // Take beginning balances snapshot
      const beginningBalances = ledger.takeSnapshot()

      // Record transactions:
      // 1. Credit sale of $15,000
      ledger.recordEntry(
        [{ account: 'Accounts Receivable', amount: 15000 }],
        [{ account: 'Sales Revenue', amount: 15000 }],
      )
      // 2. COGS of $8,000
      ledger.recordEntry(
        [{ account: 'Cost of Goods Sold', amount: 8000 }],
        [{ account: 'Inventory', amount: 8000 }],
      )
      // 3. Pay off some AP $5,000
      ledger.recordEntry(
        [{ account: 'Accounts Payable', amount: 5000 }],
        [{ account: 'Cash', amount: 5000 }],
      )

      // Net income = Revenue - COGS = 15000 - 8000 = 7000
      const netIncome = 7000

      const cf = generateCashFlowStatement(ledger, beginningBalances, netIncome)

      // Operating adjustments:
      // Net income: 7000
      // AR increase of 15000 -> -15000 (asset increase reduces operating cash)
      // Inventory decrease of 8000 -> +8000 (asset decrease adds to operating cash)
      // AP decrease of 5000 -> -5000 (liability decrease reduces operating cash)
      // Total operating = 7000 - 15000 + 8000 - 5000 = -5000
      expect(cf.totalOperating).toBe(-5000)

      // Check net income is first operating item
      const netIncomeItem = cf.operatingActivities.find(a => a.label === 'Net Income')
      expect(netIncomeItem).toBeDefined()
      expect(netIncomeItem!.amount).toBe(7000)

      // Check AR adjustment
      const arAdjustment = cf.operatingActivities.find(a => a.label === 'Accounts Receivable')
      expect(arAdjustment).toBeDefined()
      expect(arAdjustment!.amount).toBe(-15000)

      // Check Inventory adjustment
      const invAdjustment = cf.operatingActivities.find(a => a.label === 'Inventory')
      expect(invAdjustment).toBeDefined()
      expect(invAdjustment!.amount).toBe(8000)

      // Check AP adjustment
      const apAdjustment = cf.operatingActivities.find(a => a.label === 'Accounts Payable')
      expect(apAdjustment).toBeDefined()
      expect(apAdjustment!.amount).toBe(-5000)

      // No investing or financing changes
      expect(cf.totalInvesting).toBe(0)
      expect(cf.totalFinancing).toBe(0)

      // Net change = -5000
      expect(cf.netChange).toBe(-5000)

      // Beginning cash = 45000, ending = 45000 - 5000 = 40000
      expect(cf.beginningCash).toBe(45000)
      expect(cf.endingCash).toBe(40000)
    })

    it('includes operating-adjustment for depreciation', () => {
      const ledger = createSampleLedger()

      const beginningBalances = ledger.takeSnapshot()

      // Record depreciation: debit Depreciation Expense, credit Accum Depr
      ledger.addAccount('Depreciation Expense', 'Expense', { subtype: 'operating' })
      ledger.recordEntry(
        [{ account: 'Depreciation Expense', amount: 6000 }],
        [{ account: 'Accumulated Depreciation - Equipment', amount: 6000 }],
      )
      // Note: credit to Accum Depr (contra asset, normal debit side) means balance goes from -24000 to -30000

      const netIncome = -6000 // Only expense, no revenue

      const cf = generateCashFlowStatement(ledger, beginningBalances, netIncome)

      // Accum Depr changed from -24000 to -30000 (change = -6000)
      // As Asset with operating-adjustment: impact = -(-6000) = +6000
      const deprAdj = cf.operatingActivities.find(
        a => a.label === 'Accumulated Depreciation - Equipment',
      )
      expect(deprAdj).toBeDefined()
      expect(deprAdj!.amount).toBe(6000)

      // Net income + depreciation add-back = -6000 + 6000 = 0
      expect(cf.totalOperating).toBe(0)
    })

    it('handles investing and financing activities', () => {
      const ledger = createSampleLedger()

      const beginningBalances = ledger.takeSnapshot()

      // Purchase equipment for $20,000 cash
      ledger.recordEntry(
        [{ account: 'Equipment', amount: 20000 }],
        [{ account: 'Cash', amount: 20000 }],
      )

      // Issue long-term note for $30,000
      ledger.recordEntry(
        [{ account: 'Cash', amount: 30000 }],
        [{ account: 'Notes Payable - Long Term', amount: 30000 }],
      )

      const cf = generateCashFlowStatement(ledger, beginningBalances, 0)

      // Investing: Equipment increased by 20000 -> impact = -20000
      expect(cf.totalInvesting).toBe(-20000)
      const equipItem = cf.investingActivities.find(a => a.label === 'Equipment')
      expect(equipItem).toBeDefined()
      expect(equipItem!.amount).toBe(-20000)

      // Financing: NP-LT increased by 30000 -> impact = +30000
      expect(cf.totalFinancing).toBe(30000)
      const npItem = cf.financingActivities.find(a => a.label === 'Notes Payable - Long Term')
      expect(npItem).toBeDefined()
      expect(npItem!.amount).toBe(30000)

      // Net change = 0 + (-20000) + 30000 = 10000
      expect(cf.netChange).toBe(10000)

      // Cash went from 45000, decreased by 20000, increased by 30000 = 55000
      expect(cf.beginningCash).toBe(45000)
      expect(cf.endingCash).toBe(55000)
    })
  })

  describe('generateEquityStatement', () => {
    it('shows beginning and ending balances correctly', () => {
      const ledger = createSampleLedger()

      const beginningBalances = ledger.takeSnapshot()

      const es = generateEquityStatement(ledger, beginningBalances, 0)

      // Beginning = ending (no changes)
      expect(es.totalBeginning).toBe(143900) // 100000 + 43900
      expect(es.totalEnding).toBe(143900)

      // Should have entries for Common Stock and Retained Earnings
      expect(es.beginningBalances).toHaveLength(2)
      expect(es.endingBalances).toHaveLength(2)

      const csBeginning = es.beginningBalances.find(b => b.account === 'Common Stock')
      expect(csBeginning).toBeDefined()
      expect(csBeginning!.amount).toBe(100000)

      const reBeginning = es.beginningBalances.find(b => b.account === 'Retained Earnings')
      expect(reBeginning).toBeDefined()
      expect(reBeginning!.amount).toBe(43900)

      // No changes when nothing changed
      expect(es.changes).toHaveLength(0)
    })

    it('shows changes after closing revenue to retained earnings', () => {
      const ledger = createSampleLedger()
      ledger.addAccount('Sales Revenue', 'Revenue', { subtype: 'operating' })

      const beginningBalances = ledger.takeSnapshot()

      // Record revenue and close to RE
      ledger.recordEntry(
        [{ account: 'Cash', amount: 10000 }],
        [{ account: 'Sales Revenue', amount: 10000 }],
      )
      ledger.recordEntry(
        [{ account: 'Sales Revenue', amount: 10000 }],
        [{ account: 'Retained Earnings', amount: 10000 }],
      )

      const es = generateEquityStatement(ledger, beginningBalances, 10000)

      expect(es.totalBeginning).toBe(143900)
      expect(es.totalEnding).toBe(153900) // 143900 + 10000

      // RE changed
      const reChange = es.changes.find(c => c.account === 'Retained Earnings')
      expect(reChange).toBeDefined()
      expect(reChange!.amount).toBe(10000)
      expect(reChange!.description).toBe('Increase')

      // Common Stock didn't change
      const csChange = es.changes.find(c => c.account === 'Common Stock')
      expect(csChange).toBeUndefined()
    })

    it('tracks additional stock issuance', () => {
      const ledger = createSampleLedger()

      const beginningBalances = ledger.takeSnapshot()

      // Issue additional stock for $25,000
      ledger.recordEntry(
        [{ account: 'Cash', amount: 25000 }],
        [{ account: 'Common Stock', amount: 25000 }],
      )

      const es = generateEquityStatement(ledger, beginningBalances, 0)

      expect(es.totalBeginning).toBe(143900)
      expect(es.totalEnding).toBe(168900) // 143900 + 25000

      const csChange = es.changes.find(c => c.account === 'Common Stock')
      expect(csChange).toBeDefined()
      expect(csChange!.amount).toBe(25000)
    })
  })

  describe('generateCashFlowDirect', () => {
    it('computes cash from customers correctly', () => {
      const ledger = createSampleLedger()

      ledger.addAccount('Sales Revenue', 'Revenue', { subtype: 'operating' })
      ledger.addAccount('Service Revenue', 'Revenue', { subtype: 'operating' })

      const beginningBalances = ledger.takeSnapshot()

      // Cash sale $20,000
      ledger.recordEntry(
        [{ account: 'Cash', amount: 20000 }],
        [{ account: 'Sales Revenue', amount: 20000 }],
      )

      // Credit sale $15,000 (increases AR)
      ledger.recordEntry(
        [{ account: 'Accounts Receivable', amount: 15000 }],
        [{ account: 'Service Revenue', amount: 15000 }],
      )

      const cf = generateCashFlowDirect(ledger, beginningBalances)

      // Cash from customers = totalRevenue(35000) - AR change(15000) - ADA change(0) + Unearned change(0)
      //                     = 35000 - 15000 = 20000
      const customerItem = cf.operatingActivities.find(
        a => a.label === 'Cash received from customers',
      )
      expect(customerItem).toBeDefined()
      expect(customerItem!.amount).toBe(20000)
    })
  })

  describe('edge cases', () => {
    it('handles empty ledger with no accounts', () => {
      const ledger = new Ledger()

      const bs = generateBalanceSheet(ledger)
      expect(bs.totalAssets).toBe(0)
      expect(bs.totalLiabilities).toBe(0)
      expect(bs.totalEquity).toBe(0)
      expect(bs.isBalanced).toBe(true) // 0 = 0 + 0

      const is = generateIncomeStatement(ledger)
      expect(is.netIncome).toBe(0)
      expect(is.totalRevenue).toBe(0)
    })

    it('handles ledger with only equity accounts', () => {
      const ledger = new Ledger()
      ledger.addAccount('Common Stock', 'Equity')
      ledger.adjustBalance('Common Stock', 50000)

      const bs = generateBalanceSheet(ledger)
      expect(bs.totalAssets).toBe(0)
      expect(bs.totalEquity).toBe(50000)
      expect(bs.isBalanced).toBe(false) // 0 !== 50000
    })
  })
})
