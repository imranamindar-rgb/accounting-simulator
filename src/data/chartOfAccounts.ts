import type { AccountType, CashFlowCategory } from '../engines/types'

export interface AccountDefinition {
  name: string
  type: AccountType
  subtype: string
  contra?: boolean
  cashFlow?: CashFlowCategory
}

export const CHART_OF_ACCOUNTS: AccountDefinition[] = [
  // =============================================
  // CURRENT ASSETS
  // =============================================
  { name: 'Cash', type: 'Asset', subtype: 'current', cashFlow: 'cash' },
  { name: 'Short-Term Investments', type: 'Asset', subtype: 'current', cashFlow: 'investing' },
  { name: 'Accounts Receivable', type: 'Asset', subtype: 'current', cashFlow: 'operating' },
  { name: 'Allowance for Doubtful Accounts', type: 'Asset', subtype: 'current', contra: true, cashFlow: 'operating' },
  { name: 'Notes Receivable', type: 'Asset', subtype: 'current', cashFlow: 'operating' },
  { name: 'Inventory', type: 'Asset', subtype: 'current', cashFlow: 'operating' },
  { name: 'Prepaid Expenses', type: 'Asset', subtype: 'current', cashFlow: 'operating' },
  { name: 'Supplies', type: 'Asset', subtype: 'current', cashFlow: 'operating' },

  // =============================================
  // NON-CURRENT ASSETS
  // =============================================
  { name: 'Land', type: 'Asset', subtype: 'noncurrent', cashFlow: 'investing' },
  { name: 'Buildings', type: 'Asset', subtype: 'noncurrent', cashFlow: 'investing' },
  { name: 'Accumulated Depreciation - Buildings', type: 'Asset', subtype: 'noncurrent', contra: true, cashFlow: 'operating-adjustment' },
  { name: 'Equipment', type: 'Asset', subtype: 'noncurrent', cashFlow: 'investing' },
  { name: 'Accumulated Depreciation - Equipment', type: 'Asset', subtype: 'noncurrent', contra: true, cashFlow: 'operating-adjustment' },
  { name: 'Vehicles', type: 'Asset', subtype: 'noncurrent', cashFlow: 'investing' },
  { name: 'Accumulated Depreciation - Vehicles', type: 'Asset', subtype: 'noncurrent', contra: true, cashFlow: 'operating-adjustment' },
  { name: 'Intangible Assets', type: 'Asset', subtype: 'noncurrent', cashFlow: 'investing' },
  { name: 'Goodwill', type: 'Asset', subtype: 'noncurrent', cashFlow: 'investing' },

  // =============================================
  // CURRENT LIABILITIES
  // =============================================
  { name: 'Accounts Payable', type: 'Liability', subtype: 'current', cashFlow: 'operating' },
  { name: 'Salaries Payable', type: 'Liability', subtype: 'current', cashFlow: 'operating' },
  { name: 'Interest Payable', type: 'Liability', subtype: 'current', cashFlow: 'operating' },
  { name: 'Tax Payable', type: 'Liability', subtype: 'current', cashFlow: 'operating' },
  { name: 'Unearned Revenue', type: 'Liability', subtype: 'current', cashFlow: 'operating' },
  { name: 'Current Portion of Long-Term Debt', type: 'Liability', subtype: 'current', cashFlow: 'financing' },
  { name: 'GST Payable', type: 'Liability', subtype: 'current', cashFlow: 'operating' },

  // =============================================
  // NON-CURRENT LIABILITIES
  // =============================================
  { name: 'Notes Payable - Long Term', type: 'Liability', subtype: 'noncurrent', cashFlow: 'financing' },
  { name: 'Bonds Payable', type: 'Liability', subtype: 'noncurrent', cashFlow: 'financing' },
  { name: 'Bond Premium', type: 'Liability', subtype: 'noncurrent', cashFlow: 'financing' },
  { name: 'Bond Discount', type: 'Liability', subtype: 'noncurrent', contra: true, cashFlow: 'financing' },
  { name: 'Lease Liability', type: 'Liability', subtype: 'noncurrent', cashFlow: 'financing' },
  { name: 'Provision for Warranties', type: 'Liability', subtype: 'noncurrent', cashFlow: 'operating' },

  // =============================================
  // EQUITY
  // =============================================
  { name: 'Common Stock', type: 'Equity', subtype: 'contributed', cashFlow: 'financing' },
  { name: 'Preferred Stock', type: 'Equity', subtype: 'contributed', cashFlow: 'financing' },
  { name: 'Share Premium', type: 'Equity', subtype: 'contributed', cashFlow: 'financing' },
  { name: 'Retained Earnings', type: 'Equity', subtype: 'retained', cashFlow: 'financing' },
  { name: 'Treasury Stock', type: 'Equity', subtype: 'contributed', contra: true, cashFlow: 'financing' },
  { name: 'Revaluation Reserve', type: 'Equity', subtype: 'reserves', cashFlow: 'financing' },
  { name: 'Dividends Declared', type: 'Equity', subtype: 'retained', contra: true, cashFlow: 'financing' },

  // =============================================
  // REVENUE
  // =============================================
  { name: 'Sales Revenue', type: 'Revenue', subtype: 'operating' },
  { name: 'Service Revenue', type: 'Revenue', subtype: 'operating' },
  { name: 'Interest Income', type: 'Revenue', subtype: 'other' },
  { name: 'Gain on Sale of Assets', type: 'Revenue', subtype: 'other' },
  { name: 'Dividend Income', type: 'Revenue', subtype: 'other' },

  // =============================================
  // EXPENSES
  // =============================================
  { name: 'Cost of Goods Sold', type: 'Expense', subtype: 'cogs' },
  { name: 'Salaries Expense', type: 'Expense', subtype: 'operating' },
  { name: 'Rent Expense', type: 'Expense', subtype: 'operating' },
  { name: 'Utilities Expense', type: 'Expense', subtype: 'operating' },
  { name: 'Supplies Expense', type: 'Expense', subtype: 'operating' },
  { name: 'Insurance Expense', type: 'Expense', subtype: 'operating' },
  { name: 'Depreciation Expense', type: 'Expense', subtype: 'operating', cashFlow: 'operating-adjustment' },
  { name: 'Amortisation Expense', type: 'Expense', subtype: 'operating', cashFlow: 'operating-adjustment' },
  { name: 'Bad Debt Expense', type: 'Expense', subtype: 'operating' },
  { name: 'Warranty Expense', type: 'Expense', subtype: 'operating' },
  { name: 'Interest Expense', type: 'Expense', subtype: 'other' },
  { name: 'Loss on Sale of Assets', type: 'Expense', subtype: 'other' },
  { name: 'Tax Expense', type: 'Expense', subtype: 'tax' },
]
