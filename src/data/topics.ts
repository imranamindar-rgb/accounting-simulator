export interface Topic {
  id: string
  name: string
  chapter: number
  description: string
}

export const TOPICS: Topic[] = [
  { id: 'basics', name: 'Basic Transactions', chapter: 2, description: 'Introduction to recording simple business transactions.' },
  { id: 'double-entry', name: 'Double-Entry System', chapter: 3, description: 'Debits, credits, and the accounting equation.' },
  { id: 'record-keeping', name: 'Record-Keeping', chapter: 4, description: 'Books, records, and the transactional filter.' },
  { id: 'accrual', name: 'Accrual Accounting', chapter: 5, description: 'Adjusting entries, deferrals, and accruals.' },
  { id: 'reporting', name: 'Reporting Principles', chapter: 6, description: 'Accounting standards and valuation methods.' },
  { id: 'cash-control', name: 'Cash & Internal Control', chapter: 7, description: 'Bank reconciliations and cash management.' },
  { id: 'receivables', name: 'Accounts Receivable', chapter: 8, description: 'Bad debts, allowances, and collection.' },
  { id: 'inventory', name: 'Inventory', chapter: 9, description: 'FIFO, LIFO, weighted average, and NRV.' },
  { id: 'noncurrent-assets', name: 'Noncurrent Assets', chapter: 10, description: 'Depreciation, disposal, revaluation, and impairment.' },
  { id: 'liabilities', name: 'Liabilities', chapter: 11, description: 'Short/long-term debt, bonds, provisions, and GST.' },
  { id: 'equity', name: 'Investments & Equity', chapter: 12, description: 'Share capital, dividends, and treasury stock.' },
  { id: 'revenue-expense', name: 'Revenue & Expense Recognition', chapter: 13, description: 'Revenue recognition and comprehensive income.' },
  { id: 'cash-flow', name: 'Cash Flow Statement', chapter: 14, description: 'Direct and indirect methods.' },
  { id: 'analysis', name: 'Financial Statement Analysis', chapter: 15, description: 'Ratios and common-size statements.' },
  { id: 'policy-choices', name: 'Accounting Policy Choices', chapter: 16, description: 'Effects of different accounting methods.' },
]
