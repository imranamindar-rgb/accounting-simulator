/**
 * SimulationPlayer -- Step-by-step animated walkthrough showing
 * how a transaction flows through the financial statements.
 *
 * Each scenario has pre-defined steps that highlight:
 * 1. Which accounts are debited/credited
 * 2. How Income Statement changes
 * 3. How Balance Sheet adjusts
 * 4. How Cash Flow and Equity statements are affected
 *
 * Controls: Play, Pause, Replay, Step Forward/Back, Speed control
 * Features: Collapsible panel, categorized scenarios, 15+ examples
 */

import { useState, useCallback, useRef, useEffect } from 'react'

// ── Simulation Data Types ───────────────────────────────────────

interface SimulationStep {
  title: string
  description: string
  highlight: string // which statement/area to highlight
  accounts: { name: string; change: number; side: 'debit' | 'credit' }[]
  statements: {
    incomeStatement?: { revenue?: number; expenses?: number; netIncome?: number }
    balanceSheet?: { assets?: number; liabilities?: number; equity?: number }
    cashFlow?: { operating?: number; investing?: number; financing?: number; netChange?: number }
    equity?: { beginning?: number; netIncome?: number; ending?: number }
  }
}

interface Scenario {
  id: string
  name: string
  description: string
  icon: string
  category: string
  steps: SimulationStep[]
}

// ── Speed options ───────────────────────────────────────────────

const SPEEDS = [
  { label: '0.5×', ms: 5000 },
  { label: '1×', ms: 3000 },
  { label: '1.5×', ms: 2000 },
  { label: '2×', ms: 1500 },
] as const

// ── Category definitions ────────────────────────────────────────

const CATEGORIES = [
  { id: 'revenue', label: '💵 Revenue & Sales', color: '#2D6A4F' },
  { id: 'expenses', label: '📋 Expenses & Operations', color: '#B03A2E' },
  { id: 'assets', label: '🏗️ Assets & Investing', color: '#2563EB' },
  { id: 'liabilities', label: '🏦 Liabilities & Financing', color: '#D97706' },
  { id: 'equity', label: '📊 Equity & Ownership', color: '#7C3AED' },
  { id: 'adjustments', label: '📐 Adjusting Entries', color: '#0891B2' },
] as const

// ── Pre-built Scenarios ─────────────────────────────────────────

const SCENARIOS: Scenario[] = [
  // ─── Revenue & Sales ───────────────────────
  {
    id: 'cash-sale',
    name: 'Cash Sale of Goods',
    description: 'A company sells $5,000 of inventory (cost $3,000) for cash. Watch how this single transaction touches all four statements.',
    icon: '💰',
    category: 'revenue',
    steps: [
      {
        title: 'Step 1: Record the Sale',
        description: 'The company sells goods for $5,000 cash. This creates revenue on the Income Statement.',
        highlight: 'journal',
        accounts: [
          { name: 'Cash', change: 5000, side: 'debit' },
          { name: 'Sales Revenue', change: 5000, side: 'credit' },
        ],
        statements: {
          incomeStatement: { revenue: 5000, expenses: 0, netIncome: 5000 },
        },
      },
      {
        title: 'Step 2: Record Cost of Goods Sold',
        description: 'The inventory that was sold cost $3,000. This is an expense that reduces Net Income.',
        highlight: 'journal',
        accounts: [
          { name: 'Cost of Goods Sold', change: 3000, side: 'debit' },
          { name: 'Inventory', change: 3000, side: 'credit' },
        ],
        statements: {
          incomeStatement: { revenue: 5000, expenses: 3000, netIncome: 2000 },
        },
      },
      {
        title: 'Step 3: Income Statement Impact',
        description: 'Revenue of $5,000 minus COGS of $3,000 = Net Income of $2,000. This profit flows to other statements.',
        highlight: 'income',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 5000, expenses: 3000, netIncome: 2000 },
        },
      },
      {
        title: 'Step 4: Balance Sheet Updates',
        description: 'Cash increased by $5,000, Inventory decreased by $3,000 (net asset change = +$2,000). Equity increases by $2,000 through Retained Earnings.',
        highlight: 'balance',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 5000, expenses: 3000, netIncome: 2000 },
          balanceSheet: { assets: 2000, liabilities: 0, equity: 2000 },
        },
      },
      {
        title: 'Step 5: Cash Flow Statement',
        description: 'The $5,000 cash received from the sale is an operating cash inflow. Net Income ($2,000) is adjusted for working capital changes.',
        highlight: 'cashflow',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 5000, expenses: 3000, netIncome: 2000 },
          balanceSheet: { assets: 2000, liabilities: 0, equity: 2000 },
          cashFlow: { operating: 5000, investing: 0, financing: 0, netChange: 5000 },
        },
      },
      {
        title: 'Step 6: Equity Statement',
        description: 'Net Income of $2,000 flows to the Equity Statement, increasing Retained Earnings and total equity.',
        highlight: 'equity',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 5000, expenses: 3000, netIncome: 2000 },
          balanceSheet: { assets: 2000, liabilities: 0, equity: 2000 },
          cashFlow: { operating: 5000, investing: 0, financing: 0, netChange: 5000 },
          equity: { beginning: 0, netIncome: 2000, ending: 2000 },
        },
      },
    ],
  },
  {
    id: 'credit-sale',
    name: 'Sale on Account (Credit Sale)',
    description: 'A company sells $8,000 of services on account. No cash yet! See the difference between revenue recognition and cash collection.',
    icon: '📝',
    category: 'revenue',
    steps: [
      {
        title: 'Step 1: Record the Credit Sale',
        description: 'The company performs $8,000 of services but the customer will pay later. Revenue is recognized now (accrual accounting).',
        highlight: 'journal',
        accounts: [
          { name: 'Accounts Receivable', change: 8000, side: 'debit' },
          { name: 'Service Revenue', change: 8000, side: 'credit' },
        ],
        statements: {},
      },
      {
        title: 'Step 2: Income Statement',
        description: 'Revenue of $8,000 is recognized immediately even though cash hasn\'t been collected. This is the accrual basis of accounting.',
        highlight: 'income',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 8000, expenses: 0, netIncome: 8000 },
        },
      },
      {
        title: 'Step 3: Balance Sheet',
        description: 'Accounts Receivable (asset) increases by $8,000. Retained Earnings (equity) increases by $8,000 through net income.',
        highlight: 'balance',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 8000, expenses: 0, netIncome: 8000 },
          balanceSheet: { assets: 8000, liabilities: 0, equity: 8000 },
        },
      },
      {
        title: 'Step 4: Cash Flow Statement',
        description: 'No cash was received! Net Income is $8,000, but the increase in A/R is subtracted in operating activities. Net cash change is $0.',
        highlight: 'cashflow',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 8000, expenses: 0, netIncome: 8000 },
          balanceSheet: { assets: 8000, liabilities: 0, equity: 8000 },
          cashFlow: { operating: 0, investing: 0, financing: 0, netChange: 0 },
        },
      },
    ],
  },
  {
    id: 'collect-receivable',
    name: 'Collect Accounts Receivable',
    description: 'A customer pays $8,000 on their account. Cash comes in, but is it revenue? Learn why collection ≠ revenue.',
    icon: '🧾',
    category: 'revenue',
    steps: [
      {
        title: 'Step 1: Record the Collection',
        description: 'The customer pays $8,000 cash that was previously owed. Cash goes up, Accounts Receivable goes down.',
        highlight: 'journal',
        accounts: [
          { name: 'Cash', change: 8000, side: 'debit' },
          { name: 'Accounts Receivable', change: 8000, side: 'credit' },
        ],
        statements: {},
      },
      {
        title: 'Step 2: Income Statement — No Impact!',
        description: 'Revenue was already recognized when the sale was made (accrual basis). Collecting cash does NOT create new revenue.',
        highlight: 'income',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
        },
      },
      {
        title: 'Step 3: Balance Sheet',
        description: 'Cash increases by $8,000, but Accounts Receivable decreases by $8,000. Total assets are UNCHANGED — just a swap between asset types.',
        highlight: 'balance',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: 0, liabilities: 0, equity: 0 },
        },
      },
      {
        title: 'Step 4: Cash Flow Statement',
        description: 'Even though Net Income is $0, operating cash flow is +$8,000. The decrease in A/R is added back. Cash comes in without affecting profit!',
        highlight: 'cashflow',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: 0, liabilities: 0, equity: 0 },
          cashFlow: { operating: 8000, investing: 0, financing: 0, netChange: 8000 },
        },
      },
    ],
  },
  {
    id: 'unearned-revenue',
    name: 'Receive Payment in Advance',
    description: 'A customer pays $6,000 upfront for services to be delivered later. Cash is in, but can we call it revenue yet?',
    icon: '⏳',
    category: 'revenue',
    steps: [
      {
        title: 'Step 1: Receive the Advance Payment',
        description: 'Customer pays $6,000 for future services. We have the cash but owe them the service. This creates a liability (Unearned Revenue).',
        highlight: 'journal',
        accounts: [
          { name: 'Cash', change: 6000, side: 'debit' },
          { name: 'Unearned Revenue', change: 6000, side: 'credit' },
        ],
        statements: {},
      },
      {
        title: 'Step 2: Income Statement — No Revenue Yet!',
        description: 'Under accrual accounting, revenue is only recognized when earned (services delivered). Receiving cash early is NOT revenue.',
        highlight: 'income',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
        },
      },
      {
        title: 'Step 3: Balance Sheet',
        description: 'Cash (asset) increases by $6,000 AND Unearned Revenue (liability) increases by $6,000. Both sides go up equally — equation balances!',
        highlight: 'balance',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: 6000, liabilities: 6000, equity: 0 },
        },
      },
      {
        title: 'Step 4: Cash Flow Statement',
        description: 'Cash increased by $6,000 from operating activities. Even though there is no Net Income, the increase in unearned revenue adds to operating cash.',
        highlight: 'cashflow',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: 6000, liabilities: 6000, equity: 0 },
          cashFlow: { operating: 6000, investing: 0, financing: 0, netChange: 6000 },
        },
      },
    ],
  },

  // ─── Expenses & Operations ─────────────────
  {
    id: 'pay-salaries',
    name: 'Pay Employee Salaries',
    description: 'A company pays $12,000 in salaries to employees. See how operating expenses reduce profit and cash.',
    icon: '👥',
    category: 'expenses',
    steps: [
      {
        title: 'Step 1: Record the Salary Payment',
        description: 'The company pays $12,000 cash to employees for work performed. Salaries Expense is debited, Cash is credited.',
        highlight: 'journal',
        accounts: [
          { name: 'Salaries Expense', change: 12000, side: 'debit' },
          { name: 'Cash', change: 12000, side: 'credit' },
        ],
        statements: {},
      },
      {
        title: 'Step 2: Income Statement',
        description: 'Salaries Expense of $12,000 reduces Net Income. There is no revenue in this transaction, so Net Income is negative ($12,000 loss).',
        highlight: 'income',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 12000, netIncome: -12000 },
        },
      },
      {
        title: 'Step 3: Balance Sheet',
        description: 'Cash (asset) decreases by $12,000. Retained Earnings (equity) decreases by $12,000 through the net loss. Both sides shrink equally.',
        highlight: 'balance',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 12000, netIncome: -12000 },
          balanceSheet: { assets: -12000, liabilities: 0, equity: -12000 },
        },
      },
      {
        title: 'Step 4: Cash Flow Statement',
        description: 'Operating cash outflow of $12,000. The salary payment reduces both operating cash and total cash.',
        highlight: 'cashflow',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 12000, netIncome: -12000 },
          balanceSheet: { assets: -12000, liabilities: 0, equity: -12000 },
          cashFlow: { operating: -12000, investing: 0, financing: 0, netChange: -12000 },
        },
      },
      {
        title: 'Step 5: Equity Statement',
        description: 'The net loss of $12,000 reduces ending equity. Retained Earnings decreases by the net loss amount.',
        highlight: 'equity',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 12000, netIncome: -12000 },
          balanceSheet: { assets: -12000, liabilities: 0, equity: -12000 },
          cashFlow: { operating: -12000, investing: 0, financing: 0, netChange: -12000 },
          equity: { beginning: 0, netIncome: -12000, ending: -12000 },
        },
      },
    ],
  },
  {
    id: 'pay-rent',
    name: 'Pay Monthly Rent',
    description: 'A company pays $3,000 monthly rent for office space. A classic operating expense with immediate cash impact.',
    icon: '🏢',
    category: 'expenses',
    steps: [
      {
        title: 'Step 1: Record the Rent Payment',
        description: 'The company pays $3,000 for this month\'s office rent. Rent Expense is debited, Cash is credited.',
        highlight: 'journal',
        accounts: [
          { name: 'Rent Expense', change: 3000, side: 'debit' },
          { name: 'Cash', change: 3000, side: 'credit' },
        ],
        statements: {},
      },
      {
        title: 'Step 2: Income Statement',
        description: 'Rent Expense of $3,000 reduces Net Income. Rent is a period cost — it\'s expensed in the period incurred.',
        highlight: 'income',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 3000, netIncome: -3000 },
        },
      },
      {
        title: 'Step 3: Balance Sheet',
        description: 'Cash decreases by $3,000 and equity decreases by $3,000 through the impact on Retained Earnings.',
        highlight: 'balance',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 3000, netIncome: -3000 },
          balanceSheet: { assets: -3000, liabilities: 0, equity: -3000 },
        },
      },
      {
        title: 'Step 4: Cash Flow Statement',
        description: 'Operating cash outflow of $3,000. Rent is a core operating cost.',
        highlight: 'cashflow',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 3000, netIncome: -3000 },
          balanceSheet: { assets: -3000, liabilities: 0, equity: -3000 },
          cashFlow: { operating: -3000, investing: 0, financing: 0, netChange: -3000 },
        },
      },
    ],
  },
  {
    id: 'purchase-inventory',
    name: 'Purchase Inventory on Account',
    description: 'A company buys $15,000 of inventory on credit. Assets and liabilities both increase — but no expense yet!',
    icon: '📦',
    category: 'expenses',
    steps: [
      {
        title: 'Step 1: Record the Purchase',
        description: 'The company buys $15,000 of merchandise inventory on account (will pay the supplier later).',
        highlight: 'journal',
        accounts: [
          { name: 'Inventory', change: 15000, side: 'debit' },
          { name: 'Accounts Payable', change: 15000, side: 'credit' },
        ],
        statements: {},
      },
      {
        title: 'Step 2: Income Statement — No Impact!',
        description: 'Buying inventory is NOT an expense! Inventory is an asset. It only becomes an expense (COGS) when the goods are sold.',
        highlight: 'income',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
        },
      },
      {
        title: 'Step 3: Balance Sheet',
        description: 'Inventory (asset) increases by $15,000 AND Accounts Payable (liability) increases by $15,000. The equation stays balanced!',
        highlight: 'balance',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: 15000, liabilities: 15000, equity: 0 },
        },
      },
      {
        title: 'Step 4: Cash Flow Statement',
        description: 'No cash was spent! This is a non-cash transaction. The increase in payables means cash is preserved for now.',
        highlight: 'cashflow',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: 15000, liabilities: 15000, equity: 0 },
          cashFlow: { operating: 0, investing: 0, financing: 0, netChange: 0 },
        },
      },
    ],
  },
  {
    id: 'pay-accounts-payable',
    name: 'Pay Supplier (Accounts Payable)',
    description: 'A company pays $15,000 to settle its accounts payable. Cash goes out, but is it an expense?',
    icon: '💳',
    category: 'expenses',
    steps: [
      {
        title: 'Step 1: Record the Payment',
        description: 'The company pays $15,000 to a supplier for inventory purchased earlier. This settles the outstanding payable.',
        highlight: 'journal',
        accounts: [
          { name: 'Accounts Payable', change: 15000, side: 'debit' },
          { name: 'Cash', change: 15000, side: 'credit' },
        ],
        statements: {},
      },
      {
        title: 'Step 2: Income Statement — No Impact!',
        description: 'Paying a debt is NOT an expense. The expense was either recorded when the goods were sold (COGS) or when services were received.',
        highlight: 'income',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
        },
      },
      {
        title: 'Step 3: Balance Sheet',
        description: 'Cash (asset) decreases by $15,000 AND Accounts Payable (liability) decreases by $15,000. Both sides shrink equally.',
        highlight: 'balance',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: -15000, liabilities: -15000, equity: 0 },
        },
      },
      {
        title: 'Step 4: Cash Flow Statement',
        description: 'Operating cash outflow of $15,000. Although Net Income is $0, the decrease in payables uses cash in operating activities.',
        highlight: 'cashflow',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: -15000, liabilities: -15000, equity: 0 },
          cashFlow: { operating: -15000, investing: 0, financing: 0, netChange: -15000 },
        },
      },
    ],
  },

  // ─── Assets & Investing ────────────────────
  {
    id: 'buy-equipment',
    name: 'Purchase Equipment on Credit',
    description: 'A company buys $20,000 of equipment by signing a note payable. See how a non-cash transaction still flows through.',
    icon: '🏭',
    category: 'assets',
    steps: [
      {
        title: 'Step 1: Record the Purchase',
        description: 'The company buys equipment worth $20,000 by signing a long-term note. No cash changes hands!',
        highlight: 'journal',
        accounts: [
          { name: 'Equipment', change: 20000, side: 'debit' },
          { name: 'Notes Payable', change: 20000, side: 'credit' },
        ],
        statements: {},
      },
      {
        title: 'Step 2: Income Statement — No Impact!',
        description: 'Buying an asset does NOT affect the Income Statement. Equipment is not an expense — it will be depreciated over its useful life.',
        highlight: 'income',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
        },
      },
      {
        title: 'Step 3: Balance Sheet Impact',
        description: 'Assets increase by $20,000 (equipment) AND Liabilities increase by $20,000 (note payable). The equation stays balanced!',
        highlight: 'balance',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: 20000, liabilities: 20000, equity: 0 },
        },
      },
      {
        title: 'Step 4: Cash Flow Statement',
        description: 'No cash was exchanged, so Operating and Financing sections show $0. However, this would be disclosed as a significant non-cash activity.',
        highlight: 'cashflow',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: 20000, liabilities: 20000, equity: 0 },
          cashFlow: { operating: 0, investing: 0, financing: 0, netChange: 0 },
        },
      },
    ],
  },
  {
    id: 'buy-equipment-cash',
    name: 'Purchase Equipment for Cash',
    description: 'A company buys $25,000 of equipment with cash. One asset replaces another — but watch the cash flow impact!',
    icon: '🔧',
    category: 'assets',
    steps: [
      {
        title: 'Step 1: Record the Cash Purchase',
        description: 'The company pays $25,000 cash for new equipment. Cash goes down, Equipment goes up.',
        highlight: 'journal',
        accounts: [
          { name: 'Equipment', change: 25000, side: 'debit' },
          { name: 'Cash', change: 25000, side: 'credit' },
        ],
        statements: {},
      },
      {
        title: 'Step 2: Income Statement — No Impact!',
        description: 'Buying equipment is a capital expenditure, not an expense. The cost is spread over time through depreciation.',
        highlight: 'income',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
        },
      },
      {
        title: 'Step 3: Balance Sheet',
        description: 'Equipment increases by $25,000 and Cash decreases by $25,000. Total assets stay the SAME — just a swap between asset types.',
        highlight: 'balance',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: 0, liabilities: 0, equity: 0 },
        },
      },
      {
        title: 'Step 4: Cash Flow Statement',
        description: 'This is an INVESTING activity! Cash outflow of $25,000 appears under investing activities, not operating.',
        highlight: 'cashflow',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: 0, liabilities: 0, equity: 0 },
          cashFlow: { operating: 0, investing: -25000, financing: 0, netChange: -25000 },
        },
      },
    ],
  },
  {
    id: 'prepaid-insurance',
    name: 'Prepay Insurance (12 Months)',
    description: 'A company pays $12,000 for a full year of insurance upfront. Is it an expense or an asset? The answer may surprise you!',
    icon: '🛡️',
    category: 'assets',
    steps: [
      {
        title: 'Step 1: Record the Prepayment',
        description: 'The company pays $12,000 cash for 12 months of insurance coverage. This is a Prepaid Expense (an asset), not an immediate expense.',
        highlight: 'journal',
        accounts: [
          { name: 'Prepaid Insurance', change: 12000, side: 'debit' },
          { name: 'Cash', change: 12000, side: 'credit' },
        ],
        statements: {},
      },
      {
        title: 'Step 2: Income Statement — No Impact!',
        description: 'Prepaying is NOT an expense yet! The benefit (insurance coverage) will be consumed over 12 months. Each month, $1,000 becomes an expense.',
        highlight: 'income',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
        },
      },
      {
        title: 'Step 3: Balance Sheet',
        description: 'Cash decreases by $12,000, but Prepaid Insurance (asset) increases by $12,000. Total assets stay the same — asset swap!',
        highlight: 'balance',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: 0, liabilities: 0, equity: 0 },
        },
      },
      {
        title: 'Step 4: Cash Flow Statement',
        description: 'Operating cash outflow of $12,000. Even though there\'s no expense on the Income Statement, cash went out for operations.',
        highlight: 'cashflow',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: 0, liabilities: 0, equity: 0 },
          cashFlow: { operating: -12000, investing: 0, financing: 0, netChange: -12000 },
        },
      },
    ],
  },

  // ─── Liabilities & Financing ───────────────
  {
    id: 'borrow-loan',
    name: 'Borrow from Bank (Take a Loan)',
    description: 'A company borrows $50,000 from the bank by signing a 5-year note. Cash comes in, but it\'s not revenue!',
    icon: '🏦',
    category: 'liabilities',
    steps: [
      {
        title: 'Step 1: Record the Borrowing',
        description: 'The company receives $50,000 cash from the bank and signs a long-term note payable. Cash increases, Liabilities increase.',
        highlight: 'journal',
        accounts: [
          { name: 'Cash', change: 50000, side: 'debit' },
          { name: 'Notes Payable - Long Term', change: 50000, side: 'credit' },
        ],
        statements: {},
      },
      {
        title: 'Step 2: Income Statement — No Impact!',
        description: 'Borrowing money is NOT revenue! It creates a liability (obligation to repay). Net Income is completely unaffected.',
        highlight: 'income',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
        },
      },
      {
        title: 'Step 3: Balance Sheet',
        description: 'Cash (asset) increases by $50,000 AND Notes Payable (liability) increases by $50,000. Both sides grow equally.',
        highlight: 'balance',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: 50000, liabilities: 50000, equity: 0 },
        },
      },
      {
        title: 'Step 4: Cash Flow Statement',
        description: 'This is a FINANCING activity! Cash inflow of $50,000 under financing activities. Borrowing is how a company finances its operations.',
        highlight: 'cashflow',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: 50000, liabilities: 50000, equity: 0 },
          cashFlow: { operating: 0, investing: 0, financing: 50000, netChange: 50000 },
        },
      },
    ],
  },
  {
    id: 'repay-loan',
    name: 'Repay a Bank Loan',
    description: 'A company repays $10,000 of its bank loan. Cash goes out, debt goes down — but is it an expense?',
    icon: '✅',
    category: 'liabilities',
    steps: [
      {
        title: 'Step 1: Record the Loan Repayment',
        description: 'The company pays $10,000 to the bank to reduce its loan balance. Notes Payable decreases, Cash decreases.',
        highlight: 'journal',
        accounts: [
          { name: 'Notes Payable - Long Term', change: 10000, side: 'debit' },
          { name: 'Cash', change: 10000, side: 'credit' },
        ],
        statements: {},
      },
      {
        title: 'Step 2: Income Statement — No Impact!',
        description: 'Repaying principal on a loan is NOT an expense! It\'s simply returning borrowed money. Only interest on the loan is an expense.',
        highlight: 'income',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
        },
      },
      {
        title: 'Step 3: Balance Sheet',
        description: 'Cash (asset) decreases by $10,000 AND Notes Payable (liability) decreases by $10,000. Both sides shrink equally.',
        highlight: 'balance',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: -10000, liabilities: -10000, equity: 0 },
        },
      },
      {
        title: 'Step 4: Cash Flow Statement',
        description: 'This is a FINANCING activity! Cash outflow of $10,000 under financing activities. Loan repayment is a financing outflow.',
        highlight: 'cashflow',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: -10000, liabilities: -10000, equity: 0 },
          cashFlow: { operating: 0, investing: 0, financing: -10000, netChange: -10000 },
        },
      },
    ],
  },

  // ─── Equity & Ownership ────────────────────
  {
    id: 'issue-stock',
    name: 'Issue Common Stock',
    description: 'A company issues 1,000 shares at $30 each, raising $30,000 in capital. See how owners invest in a company.',
    icon: '📈',
    category: 'equity',
    steps: [
      {
        title: 'Step 1: Record the Stock Issuance',
        description: 'The company issues shares and receives $30,000 cash from investors. Cash goes up, Common Stock goes up.',
        highlight: 'journal',
        accounts: [
          { name: 'Cash', change: 30000, side: 'debit' },
          { name: 'Common Stock', change: 30000, side: 'credit' },
        ],
        statements: {},
      },
      {
        title: 'Step 2: Income Statement — No Impact!',
        description: 'Issuing stock is NOT revenue! It\'s a capital contribution from owners. Revenue comes only from business operations.',
        highlight: 'income',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
        },
      },
      {
        title: 'Step 3: Balance Sheet',
        description: 'Cash (asset) increases by $30,000. Common Stock (equity) increases by $30,000. The company is bigger but not more profitable.',
        highlight: 'balance',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: 30000, liabilities: 0, equity: 30000 },
        },
      },
      {
        title: 'Step 4: Cash Flow Statement',
        description: 'This is a FINANCING activity! Cash inflow of $30,000 under financing activities. Stock issuance is equity financing.',
        highlight: 'cashflow',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: 30000, liabilities: 0, equity: 30000 },
          cashFlow: { operating: 0, investing: 0, financing: 30000, netChange: 30000 },
        },
      },
      {
        title: 'Step 5: Equity Statement',
        description: 'Common Stock increases by $30,000. This represents the owners\' investment, separate from Retained Earnings.',
        highlight: 'equity',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: 30000, liabilities: 0, equity: 30000 },
          cashFlow: { operating: 0, investing: 0, financing: 30000, netChange: 30000 },
          equity: { beginning: 0, netIncome: 0, ending: 30000 },
        },
      },
    ],
  },
  {
    id: 'pay-dividends',
    name: 'Declare and Pay Dividends',
    description: 'A company declares and pays $1,000 in cash dividends. Watch how dividends affect equity and cash flow.',
    icon: '💸',
    category: 'equity',
    steps: [
      {
        title: 'Step 1: Record the Dividend Payment',
        description: 'The company pays $1,000 in dividends to shareholders. This reduces both Cash and Retained Earnings.',
        highlight: 'journal',
        accounts: [
          { name: 'Dividends', change: 1000, side: 'debit' },
          { name: 'Cash', change: 1000, side: 'credit' },
        ],
        statements: {},
      },
      {
        title: 'Step 2: Income Statement — No Impact!',
        description: 'Dividends are NOT an expense! They are a distribution of profits to owners. Net Income is unaffected.',
        highlight: 'income',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
        },
      },
      {
        title: 'Step 3: Balance Sheet Impact',
        description: 'Cash decreases by $1,000 (asset down) and Retained Earnings decreases by $1,000 (equity down). Both sides decrease equally.',
        highlight: 'balance',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: -1000, liabilities: 0, equity: -1000 },
        },
      },
      {
        title: 'Step 4: Cash Flow Statement',
        description: 'The dividend payment is a Financing Activity outflow of $1,000. This reduces cash but is shown under financing, not operating.',
        highlight: 'cashflow',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: -1000, liabilities: 0, equity: -1000 },
          cashFlow: { operating: 0, investing: 0, financing: -1000, netChange: -1000 },
        },
      },
      {
        title: 'Step 5: Equity Statement',
        description: 'Dividends reduce ending equity. The Equity Statement shows dividends as a deduction from the balance.',
        highlight: 'equity',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 0, netIncome: 0 },
          balanceSheet: { assets: -1000, liabilities: 0, equity: -1000 },
          cashFlow: { operating: 0, investing: 0, financing: -1000, netChange: -1000 },
          equity: { beginning: 0, netIncome: 0, ending: -1000 },
        },
      },
    ],
  },

  // ─── Adjusting Entries ─────────────────────
  {
    id: 'record-depreciation',
    name: 'Record Depreciation Expense',
    description: 'A company records $5,000 of annual depreciation on equipment. A non-cash expense that reduces profit without reducing cash!',
    icon: '📉',
    category: 'adjustments',
    steps: [
      {
        title: 'Step 1: Record the Adjusting Entry',
        description: 'Depreciation Expense is debited and Accumulated Depreciation (contra-asset) is credited. No cash is involved!',
        highlight: 'journal',
        accounts: [
          { name: 'Depreciation Expense', change: 5000, side: 'debit' },
          { name: 'Accumulated Depreciation', change: 5000, side: 'credit' },
        ],
        statements: {},
      },
      {
        title: 'Step 2: Income Statement',
        description: 'Depreciation Expense of $5,000 reduces Net Income. Even though no cash left the company, profit goes down.',
        highlight: 'income',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 5000, netIncome: -5000 },
        },
      },
      {
        title: 'Step 3: Balance Sheet',
        description: 'Accumulated Depreciation increases, reducing net Equipment value (assets down $5,000). Equity also decreases by $5,000.',
        highlight: 'balance',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 5000, netIncome: -5000 },
          balanceSheet: { assets: -5000, liabilities: 0, equity: -5000 },
        },
      },
      {
        title: 'Step 4: Cash Flow Statement',
        description: 'Cash does NOT change! On the Cash Flow Statement, depreciation is ADDED BACK to Net Income because it\'s a non-cash expense. Net cash = $0.',
        highlight: 'cashflow',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 5000, netIncome: -5000 },
          balanceSheet: { assets: -5000, liabilities: 0, equity: -5000 },
          cashFlow: { operating: 0, investing: 0, financing: 0, netChange: 0 },
        },
      },
    ],
  },
  {
    id: 'accrue-interest',
    name: 'Accrue Interest Expense',
    description: 'A company accrues $2,000 of interest on its loan (not yet paid). See how expenses can arise without cash payments.',
    icon: '🔔',
    category: 'adjustments',
    steps: [
      {
        title: 'Step 1: Record the Accrual',
        description: 'Interest has been incurred but not yet paid. Interest Expense is debited and Interest Payable (liability) is credited.',
        highlight: 'journal',
        accounts: [
          { name: 'Interest Expense', change: 2000, side: 'debit' },
          { name: 'Interest Payable', change: 2000, side: 'credit' },
        ],
        statements: {},
      },
      {
        title: 'Step 2: Income Statement',
        description: 'Interest Expense of $2,000 reduces Net Income, even though no cash has been paid yet. This is the matching principle in action.',
        highlight: 'income',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 2000, netIncome: -2000 },
        },
      },
      {
        title: 'Step 3: Balance Sheet',
        description: 'Interest Payable (liability) increases by $2,000. Equity decreases by $2,000 through the net loss. No asset changes!',
        highlight: 'balance',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 2000, netIncome: -2000 },
          balanceSheet: { assets: 0, liabilities: 2000, equity: -2000 },
        },
      },
      {
        title: 'Step 4: Cash Flow Statement',
        description: 'No cash was paid! Net Income is -$2,000, but the increase in Interest Payable is added back. Net operating cash is $0.',
        highlight: 'cashflow',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 2000, netIncome: -2000 },
          balanceSheet: { assets: 0, liabilities: 2000, equity: -2000 },
          cashFlow: { operating: 0, investing: 0, financing: 0, netChange: 0 },
        },
      },
    ],
  },
  {
    id: 'earn-unearned-revenue',
    name: 'Earn Previously Unearned Revenue',
    description: 'A company delivers $6,000 of services previously paid in advance. The liability becomes revenue — no new cash!',
    icon: '🎯',
    category: 'adjustments',
    steps: [
      {
        title: 'Step 1: Record Revenue Earned',
        description: 'Services are delivered. Unearned Revenue (liability) is debited, Service Revenue is credited. Cash was received earlier!',
        highlight: 'journal',
        accounts: [
          { name: 'Unearned Revenue', change: 6000, side: 'debit' },
          { name: 'Service Revenue', change: 6000, side: 'credit' },
        ],
        statements: {},
      },
      {
        title: 'Step 2: Income Statement',
        description: 'Revenue of $6,000 is now recognized because the service has been delivered. Net Income increases by $6,000.',
        highlight: 'income',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 6000, expenses: 0, netIncome: 6000 },
        },
      },
      {
        title: 'Step 3: Balance Sheet',
        description: 'Unearned Revenue (liability) decreases by $6,000. Retained Earnings (equity) increases by $6,000. Assets are unchanged.',
        highlight: 'balance',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 6000, expenses: 0, netIncome: 6000 },
          balanceSheet: { assets: 0, liabilities: -6000, equity: 6000 },
        },
      },
      {
        title: 'Step 4: Cash Flow Statement',
        description: 'No new cash! Net Income is $6,000, but the decrease in Unearned Revenue is subtracted. Net operating cash change is $0.',
        highlight: 'cashflow',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 6000, expenses: 0, netIncome: 6000 },
          balanceSheet: { assets: 0, liabilities: -6000, equity: 6000 },
          cashFlow: { operating: 0, investing: 0, financing: 0, netChange: 0 },
        },
      },
    ],
  },
  {
    id: 'bad-debt-expense',
    name: 'Record Bad Debt Expense',
    description: 'A company estimates $1,500 of its receivables won\'t be collected. Learn the allowance method for doubtful accounts.',
    icon: '⚠️',
    category: 'adjustments',
    steps: [
      {
        title: 'Step 1: Record the Estimate',
        description: 'Based on experience, the company estimates $1,500 of receivables are uncollectible. Bad Debt Expense is debited, Allowance for Doubtful Accounts is credited.',
        highlight: 'journal',
        accounts: [
          { name: 'Bad Debt Expense', change: 1500, side: 'debit' },
          { name: 'Allowance for Doubtful Accounts', change: 1500, side: 'credit' },
        ],
        statements: {},
      },
      {
        title: 'Step 2: Income Statement',
        description: 'Bad Debt Expense of $1,500 reduces Net Income. This matches the estimated loss to the period when the sales were made.',
        highlight: 'income',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 1500, netIncome: -1500 },
        },
      },
      {
        title: 'Step 3: Balance Sheet',
        description: 'Allowance for Doubtful Accounts (contra-asset) increases, reducing net Accounts Receivable by $1,500. Equity also decreases.',
        highlight: 'balance',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 1500, netIncome: -1500 },
          balanceSheet: { assets: -1500, liabilities: 0, equity: -1500 },
        },
      },
      {
        title: 'Step 4: Cash Flow Statement',
        description: 'No cash is involved! Like depreciation, bad debt expense is a non-cash charge. It\'s added back to Net Income on the cash flow statement.',
        highlight: 'cashflow',
        accounts: [],
        statements: {
          incomeStatement: { revenue: 0, expenses: 1500, netIncome: -1500 },
          balanceSheet: { assets: -1500, liabilities: 0, equity: -1500 },
          cashFlow: { operating: 0, investing: 0, financing: 0, netChange: 0 },
        },
      },
    ],
  },
]

// ── Mini Statement Box ──────────────────────────────────────────

function StatementBox({
  title,
  color,
  lines,
  active,
  highlighted,
}: {
  title: string
  color: string
  lines: { label: string; value: number; isTotal?: boolean }[]
  active: boolean
  highlighted: boolean
}) {
  return (
    <div
      className="rounded-lg overflow-hidden transition-all duration-500"
      style={{
        border: highlighted
          ? `3px solid ${color}`
          : active
            ? `2px solid ${color}60`
            : '2px solid var(--color-border)',
        opacity: active ? 1 : 0.4,
        transform: highlighted ? 'scale(1.02)' : 'scale(1)',
        boxShadow: highlighted ? `0 4px 20px ${color}30` : 'none',
      }}
    >
      <div
        className="px-3 py-2 font-bold text-xs"
        style={{
          fontFamily: 'var(--font-display)',
          color: active ? color : 'var(--color-text-muted)',
          background: highlighted ? `${color}10` : 'var(--color-surface)',
        }}
      >
        {title}
      </div>
      <div className="px-3 pb-2 space-y-1" style={{ background: 'var(--color-surface)' }}>
        {lines.map((line) => (
          <div
            key={line.label}
            className="flex justify-between text-xs transition-all duration-300"
            style={{
              fontFamily: 'var(--font-mono)',
              borderTop: line.isTotal ? '1px solid var(--color-border)' : undefined,
              paddingTop: line.isTotal ? '4px' : undefined,
              fontWeight: line.isTotal ? 700 : 400,
            }}
          >
            <span style={{ color: 'var(--color-text)' }}>{line.label}</span>
            <span
              className="transition-all duration-500"
              style={{
                color:
                  !active
                    ? 'var(--color-text-muted)'
                    : line.value > 0
                      ? '#2D6A4F'
                      : line.value < 0
                        ? '#DC2626'
                        : 'var(--color-text-muted)',
                fontWeight: 600,
              }}
            >
              {line.value !== 0
                ? `${line.value > 0 ? '+' : ''}$${Math.abs(line.value).toLocaleString()}`
                : '$0'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Journal Entry Display ───────────────────────────────────────

function JournalEntry({
  accounts,
  visible,
}: {
  accounts: SimulationStep['accounts']
  visible: boolean
}) {
  if (!visible || accounts.length === 0) return null

  return (
    <div
      className="rounded-lg p-4 transition-all duration-500"
      style={{
        background: 'var(--color-base)',
        border: '2px solid var(--color-border)',
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        className="text-xs font-bold mb-2 uppercase tracking-wide"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}
      >
        Journal Entry
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.8 }}>
        {accounts.map((a, i) => (
          <div
            key={i}
            className="flex justify-between"
            style={{ paddingLeft: a.side === 'credit' ? '2rem' : 0 }}
          >
            <span style={{ color: a.side === 'debit' ? '#2D6A4F' : '#B03A2E' }}>
              {a.side === 'debit' ? 'Dr.' : 'Cr.'} {a.name}
            </span>
            <span
              style={{
                color: a.side === 'debit' ? '#2D6A4F' : '#B03A2E',
                fontWeight: 600,
              }}
            >
              ${a.change.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Control Button ──────────────────────────────────────────────

function ControlButton({
  onClick,
  disabled = false,
  primary = false,
  active = false,
  children,
  title,
}: {
  onClick: () => void
  disabled?: boolean
  primary?: boolean
  active?: boolean
  children: React.ReactNode
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="px-3 py-1.5 rounded text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      style={{
        background: primary
          ? '#2D6A4F'
          : active
            ? 'rgba(45,106,79,0.15)'
            : 'var(--color-base)',
        border: primary
          ? 'none'
          : active
            ? '2px solid #2D6A4F'
            : '1px solid var(--color-border)',
        color: primary ? 'white' : active ? '#2D6A4F' : 'var(--color-text)',
        fontFamily: 'var(--font-mono)',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !primary) {
          e.currentTarget.style.borderColor = '#2D6A4F'
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !primary && !active) {
          e.currentTarget.style.borderColor = 'var(--color-border)'
        }
      }}
    >
      {children}
    </button>
  )
}

// ── Collapse persistence key ────────────────────────────────────

const COLLAPSE_KEY = 'sim-player-collapsed'
const CATEGORY_KEY = 'sim-player-category'

// ── Main Component ──────────────────────────────────────────────

export default function SimulationPlayer() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speedIdx, setSpeedIdx] = useState(1) // default 1× (3000ms)
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(COLLAPSE_KEY) === 'true' } catch { return false }
  })
  const [activeCategory, setActiveCategory] = useState(() => {
    try { return localStorage.getItem(CATEGORY_KEY) ?? 'all' } catch { return 'all' }
  })
  const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const step = selectedScenario ? selectedScenario.steps[currentStep] : null
  const totalSteps = selectedScenario ? selectedScenario.steps.length : 0
  const speed = SPEEDS[speedIdx]

  // Persist collapse state
  useEffect(() => {
    try { localStorage.setItem(COLLAPSE_KEY, String(collapsed)) } catch { /* noop */ }
  }, [collapsed])

  useEffect(() => {
    try { localStorage.setItem(CATEGORY_KEY, activeCategory) } catch { /* noop */ }
  }, [activeCategory])

  // Auto-play timer
  useEffect(() => {
    if (playTimerRef.current) clearInterval(playTimerRef.current)

    if (isPlaying && selectedScenario) {
      playTimerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= selectedScenario.steps.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, speed.ms)
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current)
    }
  }, [isPlaying, selectedScenario, speed.ms])

  const handleSelectScenario = useCallback((scenario: Scenario) => {
    setSelectedScenario(scenario)
    setCurrentStep(0)
    setIsPlaying(false)
  }, [])

  const handleBack = useCallback(() => {
    setSelectedScenario(null)
    setCurrentStep(0)
    setIsPlaying(false)
  }, [])

  const handleReplay = useCallback(() => {
    setCurrentStep(0)
    setIsPlaying(true)
  }, [])

  const handleCycleSpeed = useCallback(() => {
    setSpeedIdx((prev) => (prev + 1) % SPEEDS.length)
  }, [])

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev)
  }, [])

  // Get cumulative statement values up to current step
  const getStatementValues = useCallback(() => {
    if (!step) {
      return {
        income: { revenue: 0, expenses: 0, netIncome: 0 },
        balance: { assets: 0, liabilities: 0, equity: 0 },
        cashFlow: { operating: 0, investing: 0, financing: 0, netChange: 0 },
        equity: { beginning: 0, netIncome: 0, ending: 0 },
      }
    }

    return {
      income: step.statements.incomeStatement ?? { revenue: 0, expenses: 0, netIncome: 0 },
      balance: step.statements.balanceSheet ?? { assets: 0, liabilities: 0, equity: 0 },
      cashFlow: step.statements.cashFlow ?? { operating: 0, investing: 0, financing: 0, netChange: 0 },
      equity: step.statements.equity ?? { beginning: 0, netIncome: 0, ending: 0 },
    }
  }, [step])

  const vals = getStatementValues()
  const isAtEnd = currentStep >= totalSteps - 1

  // Filter scenarios by category
  const filteredScenarios = activeCategory === 'all'
    ? SCENARIOS
    : SCENARIOS.filter((s) => s.category === activeCategory)

  // Count by category
  const categoryCounts = CATEGORIES.map((cat) => ({
    ...cat,
    count: SCENARIOS.filter((s) => s.category === cat.id).length,
  }))

  // Scenario selection screen
  if (!selectedScenario) {
    return (
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Header with collapse toggle */}
        <div
          className="px-5 py-4 flex items-center justify-between cursor-pointer select-none"
          style={{
            background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
            color: '#FAF0D4',
          }}
          onClick={toggleCollapse}
        >
          <div>
            <h2
              className="text-lg font-bold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Transaction Flow Simulation
            </h2>
            <p className="text-xs mt-1 opacity-80" style={{ fontFamily: 'var(--font-body)' }}>
              {collapsed
                ? `${SCENARIOS.length} interactive scenarios available — click to expand`
                : 'Choose a scenario to see step-by-step how a transaction flows through all four financial statements'}
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 rounded transition-colors cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#FAF0D4',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
            onClick={(e) => {
              e.stopPropagation()
              toggleCollapse()
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
            }}
          >
            <span style={{
              display: 'inline-block',
              transition: 'transform 0.3s ease',
              transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
              fontSize: '0.85rem',
            }}>
              ▼
            </span>
            {collapsed ? 'Expand' : 'Minimize'}
          </button>
        </div>

        {/* Collapsible body */}
        <div
          style={{
            maxHeight: collapsed ? 0 : '2000px',
            opacity: collapsed ? 0 : 1,
            overflow: 'hidden',
            transition: 'max-height 0.4s ease, opacity 0.3s ease',
          }}
        >
          {/* Category tabs */}
          <div
            className="px-4 pt-3 pb-2 flex flex-wrap gap-1.5"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className="px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors"
              style={{
                background: activeCategory === 'all' ? '#2D6A4F' : 'var(--color-base)',
                color: activeCategory === 'all' ? 'white' : 'var(--color-text-muted)',
                border: activeCategory === 'all' ? 'none' : '1px solid var(--color-border)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              All ({SCENARIOS.length})
            </button>
            {categoryCounts.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className="px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors"
                style={{
                  background: activeCategory === cat.id ? cat.color : 'var(--color-base)',
                  color: activeCategory === cat.id ? 'white' : 'var(--color-text-muted)',
                  border: activeCategory === cat.id ? 'none' : '1px solid var(--color-border)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          {/* Scenario cards grid */}
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredScenarios.map((scenario) => {
              const catDef = CATEGORIES.find((c) => c.id === scenario.category)
              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => handleSelectScenario(scenario)}
                  className="text-left rounded-lg p-4 transition-all cursor-pointer"
                  style={{
                    background: 'var(--color-base)',
                    border: '2px solid var(--color-border)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = catDef?.color ?? '#2D6A4F'
                    e.currentTarget.style.boxShadow = `0 2px 12px ${catDef?.color ?? '#2D6A4F'}25`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{scenario.icon}</span>
                    <span
                      className="font-bold text-sm"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
                    >
                      {scenario.name}
                    </span>
                  </div>
                  <p
                    className="text-xs"
                    style={{
                      color: 'var(--color-text-muted)',
                      fontFamily: 'var(--font-body)',
                      lineHeight: 1.5,
                    }}
                  >
                    {scenario.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: catDef?.color ?? '#2D6A4F', fontFamily: 'var(--font-mono)' }}
                    >
                      {scenario.steps.length} steps →
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{
                        background: `${catDef?.color ?? '#2D6A4F'}15`,
                        color: catDef?.color ?? '#2D6A4F',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {catDef?.label.split(' ').slice(1).join(' ') ?? scenario.category}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Simulation playback screen
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
          color: '#FAF0D4',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="text-white cursor-pointer px-2 py-1 rounded transition-colors"
            style={{ background: 'rgba(255,255,255,0.15)', fontSize: '0.78rem' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
          >
            ← Back
          </button>
          <div>
            <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              {selectedScenario.icon} {selectedScenario.name}
            </span>
          </div>
        </div>
        <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', opacity: 0.8 }}>
          Step {currentStep + 1} of {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5" style={{ background: 'var(--color-border)' }}>
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${((currentStep + 1) / totalSteps) * 100}%`,
            background: 'linear-gradient(90deg, #2D6A4F, #40916C)',
          }}
        />
      </div>

      <div className="p-4">
        {/* Step description */}
        {step && (
          <div
            className="rounded-lg p-4 mb-4"
            style={{
              background: '#F0FFF4',
              border: '2px solid #2D6A4F30',
            }}
          >
            <h3
              className="text-sm font-bold mb-1"
              style={{ fontFamily: 'var(--font-display)', color: '#2D6A4F' }}
            >
              {step.title}
            </h3>
            <p
              className="text-xs"
              style={{
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.6,
              }}
            >
              {step.description}
            </p>
          </div>
        )}

        {/* Journal Entry */}
        {step && <JournalEntry accounts={step.accounts} visible={step.highlight === 'journal'} />}

        {/* Statement Cards Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <StatementBox
            title="Income Statement"
            color="#2D6A4F"
            highlighted={step?.highlight === 'income'}
            active={!!step?.statements.incomeStatement}
            lines={[
              { label: 'Revenue', value: vals.income.revenue ?? 0 },
              { label: 'Expenses', value: -(vals.income.expenses ?? 0) },
              { label: 'Net Income', value: vals.income.netIncome ?? 0, isTotal: true },
            ]}
          />
          <StatementBox
            title="Balance Sheet"
            color="#2563EB"
            highlighted={step?.highlight === 'balance'}
            active={!!step?.statements.balanceSheet}
            lines={[
              { label: 'Assets', value: vals.balance.assets ?? 0 },
              { label: 'Liabilities', value: vals.balance.liabilities ?? 0 },
              { label: 'Equity', value: vals.balance.equity ?? 0, isTotal: true },
            ]}
          />
          <StatementBox
            title="Cash Flow"
            color="#D97706"
            highlighted={step?.highlight === 'cashflow'}
            active={!!step?.statements.cashFlow}
            lines={[
              { label: 'Operating', value: vals.cashFlow.operating ?? 0 },
              { label: 'Investing', value: vals.cashFlow.investing ?? 0 },
              { label: 'Financing', value: vals.cashFlow.financing ?? 0 },
              { label: 'Net Change', value: vals.cashFlow.netChange ?? 0, isTotal: true },
            ]}
          />
          <StatementBox
            title="Equity Statement"
            color="#7C3AED"
            highlighted={step?.highlight === 'equity'}
            active={!!step?.statements.equity}
            lines={[
              { label: 'Beginning', value: vals.equity.beginning ?? 0 },
              { label: 'Net Income', value: vals.equity.netIncome ?? 0 },
              { label: 'Ending', value: vals.equity.ending ?? 0, isTotal: true },
            ]}
          />
        </div>

        {/* Playback controls */}
        <div
          className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-3"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          {/* Navigation group */}
          <ControlButton
            onClick={() => { setCurrentStep(0); setIsPlaying(false) }}
            disabled={currentStep === 0}
            title="Go to first step"
          >
            ⏮ Start
          </ControlButton>
          <ControlButton
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            title="Previous step"
          >
            ◀ Prev
          </ControlButton>

          {/* Play / Pause */}
          <ControlButton
            onClick={() => setIsPlaying(!isPlaying)}
            primary
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </ControlButton>

          <ControlButton
            onClick={() => setCurrentStep(Math.min(totalSteps - 1, currentStep + 1))}
            disabled={isAtEnd}
            title="Next step"
          >
            Next ▶
          </ControlButton>
          <ControlButton
            onClick={() => { setCurrentStep(totalSteps - 1); setIsPlaying(false) }}
            disabled={isAtEnd}
            title="Go to last step"
          >
            End ⏭
          </ControlButton>

          {/* Separator */}
          <div
            style={{
              width: 1,
              height: 24,
              background: 'var(--color-border)',
              margin: '0 4px',
            }}
          />

          {/* Replay */}
          <ControlButton
            onClick={handleReplay}
            title="Restart and auto-play from the beginning"
          >
            🔄 Replay
          </ControlButton>

          {/* Speed */}
          <ControlButton
            onClick={handleCycleSpeed}
            active={speedIdx !== 1}
            title={`Playback speed: ${speed.label}. Click to cycle.`}
          >
            🏃 {speed.label}
          </ControlButton>
        </div>
      </div>
    </div>
  )
}
