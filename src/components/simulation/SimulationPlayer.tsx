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
 * The user can play/pause, step forward/back, and see
 * highlighted values animate between steps.
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
  steps: SimulationStep[]
}

// ── Pre-built Scenarios ─────────────────────────────────────────

const SCENARIOS: Scenario[] = [
  {
    id: 'cash-sale',
    name: 'Cash Sale of Goods',
    description: 'A company sells $5,000 of inventory (cost $3,000) for cash. Watch how this single transaction touches all four statements.',
    icon: '\uD83D\uDCB0',
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
    id: 'buy-equipment',
    name: 'Purchase Equipment on Credit',
    description: 'A company buys $20,000 of equipment by signing a note payable. See how a non-cash transaction still flows through.',
    icon: '\uD83C\uDFED',
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
        title: 'Step 2: Income Statement - No Impact!',
        description: 'Buying an asset does NOT affect the Income Statement. Equipment is not an expense \u2014 it will be depreciated over its useful life.',
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
    id: 'pay-dividends',
    name: 'Declare and Pay Dividends',
    description: 'A company declares and pays $1,000 in cash dividends. Watch how dividends affect equity and cash flow.',
    icon: '\uD83D\uDCCA',
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
        title: 'Step 2: Income Statement - No Impact!',
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
  {
    id: 'credit-sale',
    name: 'Sale on Account (Credit Sale)',
    description: 'A company sells $8,000 of services on account. No cash yet! See the difference between revenue recognition and cash collection.',
    icon: '\uD83D\uDCDD',
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

// ── Main Component ──────────────────────────────────────────────

export default function SimulationPlayer() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const step = selectedScenario ? selectedScenario.steps[currentStep] : null
  const totalSteps = selectedScenario ? selectedScenario.steps.length : 0

  // Auto-play timer
  useEffect(() => {
    if (isPlaying && selectedScenario) {
      playTimerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= selectedScenario.steps.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 3000)
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current)
    }
  }, [isPlaying, selectedScenario])

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
        <div
          className="px-5 py-4"
          style={{
            background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
            color: '#FAF0D4',
          }}
        >
          <h2
            className="text-lg font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Transaction Flow Simulation
          </h2>
          <p className="text-xs mt-1 opacity-80" style={{ fontFamily: 'var(--font-body)' }}>
            Choose a scenario to see step-by-step how a transaction flows through all four financial statements
          </p>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SCENARIOS.map((scenario) => (
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
                e.currentTarget.style.borderColor = '#2D6A4F'
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(45,106,79,0.15)'
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
              <div
                className="mt-2 text-xs font-semibold"
                style={{ color: '#2D6A4F', fontFamily: 'var(--font-mono)' }}
              >
                {scenario.steps.length} steps {'\u2192'}
              </div>
            </button>
          ))}
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
            {'\u2190'} Back
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
        <div className="flex items-center justify-center gap-3 mt-4 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button
            type="button"
            onClick={() => { setCurrentStep(0); setIsPlaying(false) }}
            disabled={currentStep === 0}
            className="px-3 py-1.5 rounded text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'var(--color-base)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {'\u23EE'} Start
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-3 py-1.5 rounded text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'var(--color-base)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {'\u25C0'} Prev
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-5 py-2 rounded text-sm font-bold cursor-pointer"
            style={{
              background: isPlaying ? '#DC2626' : '#2D6A4F',
              color: 'white',
              border: 'none',
              fontFamily: 'var(--font-display)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.85'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            {isPlaying ? '\u23F8 Pause' : '\u25B6 Play'}
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(Math.min(totalSteps - 1, currentStep + 1))}
            disabled={currentStep >= totalSteps - 1}
            className="px-3 py-1.5 rounded text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'var(--color-base)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Next {'\u25B6'}
          </button>
          <button
            type="button"
            onClick={() => { setCurrentStep(totalSteps - 1); setIsPlaying(false) }}
            disabled={currentStep >= totalSteps - 1}
            className="px-3 py-1.5 rounded text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'var(--color-base)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            End {'\u23ED'}
          </button>
        </div>
      </div>
    </div>
  )
}
