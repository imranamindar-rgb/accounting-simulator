/**
 * WhatIfMode -- split-view what-if scenario explorer.
 *
 * LEFT:  Grouped account sliders to adjust balances
 * RIGHT: Live-updating mini financial statements + ratios
 *
 * On mount, saves a snapshot so we can restore on exit.
 * Bumps ledgerVersion on every slider change so all statement
 * components (including FlowDiagram) recompute automatically.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useLedgerStore } from '../../store/ledgerStore'
import { useUIStore } from '../../store/uiStore'
import { useStatements } from '../../hooks/useStatements'
import type { AccountType } from '../../engines/types'
import WhatIfBanner from './WhatIfBanner'

// ── Account type display config ─────────────────────────────────────

const TYPE_ORDER: AccountType[] = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']

const TYPE_COLORS: Record<AccountType, string> = {
  Asset: '#2D6A4F',
  Liability: '#B03A2E',
  Equity: '#7C3AED',
  Revenue: '#2D6A4F',
  Expense: '#D97706',
}

const TYPE_BG: Record<AccountType, string> = {
  Asset: 'rgba(45,106,79,0.06)',
  Liability: 'rgba(176,58,46,0.06)',
  Equity: 'rgba(124,58,237,0.06)',
  Revenue: 'rgba(45,106,79,0.06)',
  Expense: 'rgba(218,165,32,0.06)',
}

// ── Number formatting ───────────────────────────────────────────────

function fmt(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`
  return `${sign}$${abs.toLocaleString()}`
}

// ── Account row component ───────────────────────────────────────────

interface AccountRowProps {
  name: string
  type: AccountType
  balance: number
  baselineBalance: number
  onChange: (name: string, value: number) => void
}

function AccountRow({ name, type, balance, baselineBalance, onChange }: AccountRowProps) {
  const sliderMax = Math.max(Math.abs(baselineBalance) * 3, 10000)
  const sliderMin = baselineBalance < 0 ? baselineBalance * 3 : 0
  const changed = balance !== baselineBalance
  const delta = balance - baselineBalance

  return (
    <div
      className="flex items-center gap-2 py-1.5 px-3 rounded"
      style={{
        background: changed ? TYPE_BG[type] : 'transparent',
        transition: 'background 0.2s',
      }}
    >
      <div
        className="shrink-0 text-xs"
        style={{
          width: 160,
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        title={name}
      >
        {name}
      </div>

      <div className="flex-1 min-w-0">
        <input
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={Math.max(1, Math.round(sliderMax / 200))}
          value={balance}
          onChange={(e) => onChange(name, parseFloat(e.target.value))}
          className="w-full"
          style={{ accentColor: TYPE_COLORS[type], cursor: 'pointer', height: '4px' }}
        />
      </div>

      <input
        type="number"
        value={balance}
        onChange={(e) => {
          const v = parseFloat(e.target.value)
          if (!isNaN(v)) onChange(name, v)
        }}
        className="text-right text-xs rounded px-1.5 py-1"
        style={{
          width: 90,
          fontFamily: 'var(--font-mono)',
          color: changed ? TYPE_COLORS[type] : 'var(--color-text)',
          background: 'var(--color-base)',
          border: `1px solid ${changed ? TYPE_COLORS[type] : 'var(--color-border)'}`,
          fontWeight: changed ? 600 : 400,
        }}
      />

      <div
        className="text-[10px] shrink-0"
        style={{
          width: 60,
          textAlign: 'right',
          fontFamily: 'var(--font-mono)',
          color: changed
            ? delta > 0
              ? '#2D6A4F'
              : '#B03A2E'
            : 'transparent',
        }}
      >
        {changed ? `${delta > 0 ? '+' : ''}${fmt(delta)}` : '--'}
      </div>
    </div>
  )
}

// ── Mini Statement Card ─────────────────────────────────────────────

function MiniStatement({
  title,
  color,
  lines,
}: {
  title: string
  color: string
  lines: { label: string; value: number; bold?: boolean }[]
}) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        border: `1px solid ${color}20`,
        borderTop: `3px solid ${color}`,
      }}
    >
      <div
        className="px-3 py-2 font-bold text-xs"
        style={{ fontFamily: 'var(--font-display)', color }}
      >
        {title}
      </div>
      <div className="px-3 pb-2 space-y-1">
        {lines.map((line) => (
          <div
            key={line.label}
            className="flex justify-between items-center"
            style={{
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: line.bold ? 700 : 400,
              borderTop: line.bold ? '1px solid var(--color-border)' : undefined,
              paddingTop: line.bold ? '4px' : undefined,
              marginTop: line.bold ? '2px' : undefined,
            }}
          >
            <span style={{ color: 'var(--color-text)' }}>{line.label}</span>
            <span
              style={{
                color: line.value < 0 ? '#DC2626' : 'var(--color-text)',
                fontWeight: 600,
              }}
            >
              {fmt(line.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Balance Check Indicator ─────────────────────────────────────────

function BalanceCheck() {
  const { balanceSheet } = useStatements()
  const balanced =
    Math.abs(balanceSheet.totalAssets - (balanceSheet.totalLiabilities + balanceSheet.totalEquity)) < 1

  return (
    <div
      className="rounded-lg px-4 py-3 text-center font-bold text-sm"
      style={{
        background: balanced ? 'rgba(45,106,79,0.1)' : 'rgba(220,38,38,0.1)',
        border: `2px solid ${balanced ? '#2D6A4F' : '#DC2626'}`,
        color: balanced ? '#2D6A4F' : '#DC2626',
        fontFamily: 'var(--font-display)',
      }}
    >
      {balanced ? (
        <>
          <span style={{ fontSize: '1.1rem' }}>{'\u2705'}</span> Balance Sheet Equation Holds
          <div
            className="text-xs font-normal mt-1"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
          >
            Assets ({fmt(balanceSheet.totalAssets)}) = Liabilities ({fmt(balanceSheet.totalLiabilities)}) + Equity ({fmt(balanceSheet.totalEquity)})
          </div>
        </>
      ) : (
        <>
          <span style={{ fontSize: '1.1rem' }}>{'\u274C'}</span> Balance Sheet Out of Balance!
          <div
            className="text-xs font-normal mt-1"
            style={{ color: '#DC2626', fontFamily: 'var(--font-body)' }}
          >
            Assets ({fmt(balanceSheet.totalAssets)}) {'\u2260'} Liabilities ({fmt(balanceSheet.totalLiabilities)}) + Equity ({fmt(balanceSheet.totalEquity)})
          </div>
          <div
            className="text-xs font-normal mt-0.5"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
          >
            Difference: {fmt(balanceSheet.totalAssets - balanceSheet.totalLiabilities - balanceSheet.totalEquity)}
          </div>
        </>
      )}
    </div>
  )
}

// ── Live Statement Panel ────────────────────────────────────────────

function LiveStatements() {
  const { balanceSheet, incomeStatement, cashFlowStatement, equityStatement } = useStatements()

  return (
    <div className="space-y-3">
      <BalanceCheck />

      <MiniStatement
        title="Income Statement"
        color="#2D6A4F"
        lines={[
          { label: 'Revenue', value: incomeStatement.totalRevenue },
          { label: 'COGS', value: -incomeStatement.totalCOGS },
          { label: 'Operating Exp.', value: -incomeStatement.totalOperatingExpenses },
          { label: 'Net Income', value: incomeStatement.netIncome, bold: true },
        ]}
      />

      <MiniStatement
        title="Balance Sheet"
        color="#2563EB"
        lines={[
          { label: 'Total Assets', value: balanceSheet.totalAssets },
          { label: 'Total Liabilities', value: balanceSheet.totalLiabilities },
          { label: 'Total Equity', value: balanceSheet.totalEquity, bold: true },
        ]}
      />

      <MiniStatement
        title="Cash Flow"
        color="#D97706"
        lines={[
          { label: 'Operating', value: cashFlowStatement.totalOperating },
          { label: 'Investing', value: cashFlowStatement.totalInvesting },
          { label: 'Financing', value: cashFlowStatement.totalFinancing },
          { label: 'Net Change', value: cashFlowStatement.netChange, bold: true },
        ]}
      />

      <MiniStatement
        title="Equity Statement"
        color="#7C3AED"
        lines={[
          { label: 'Beginning', value: equityStatement.totalBeginning },
          { label: 'Net Income', value: incomeStatement.netIncome },
          { label: 'Ending', value: equityStatement.totalEnding, bold: true },
        ]}
      />
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────

export default function WhatIfMode() {
  const ledger = useLedgerStore((s) => s.ledger)
  const setMode = useUIStore((s) => s.setMode)
  const bumpLedgerVersion = useLedgerStore((s) => s.bumpLedgerVersion)

  const [originalSnapshot, setOriginalSnapshot] = useState<Map<string, number> | null>(null)
  const [balances, setBalances] = useState<Record<string, number>>({})
  const restoredRef = useRef(false)

  // Save original on mount
  useEffect(() => {
    const snap = ledger.takeSnapshot()
    setOriginalSnapshot(snap)

    const bals: Record<string, number> = {}
    for (const [name, account] of ledger.getAllAccounts()) {
      bals[name] = account.balance
    }
    setBalances(bals)

    return () => {
      if (!restoredRef.current && snap) {
        ledger.restoreSnapshot(snap)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleExit = useCallback(() => {
    if (originalSnapshot) {
      ledger.restoreSnapshot(originalSnapshot)
      restoredRef.current = true
      bumpLedgerVersion()
    }
    setMode('transaction')
  }, [originalSnapshot, ledger, setMode, bumpLedgerVersion])

  const handleAccountChange = useCallback(
    (name: string, value: number) => {
      const rounded = Math.round(value)
      ledger.adjustBalance(name, rounded)
      setBalances((prev) => ({ ...prev, [name]: rounded }))
      // This is the key fix: bump version so useStatements() recomputes
      bumpLedgerVersion()
    },
    [ledger, bumpLedgerVersion],
  )

  // Group accounts by type
  const grouped: Record<AccountType, { name: string; balance: number }[]> = {
    Asset: [],
    Liability: [],
    Equity: [],
    Revenue: [],
    Expense: [],
  }

  for (const [name, account] of ledger.getAllAccounts()) {
    grouped[account.type].push({
      name,
      balance: balances[name] ?? account.balance,
    })
  }

  return (
    <div className="p-4">
      <WhatIfBanner onExit={handleExit} />

      {/* Split layout: Sliders LEFT, Live Statements RIGHT */}
      <div className="flex gap-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {/* LEFT: Account sliders */}
        <div className="flex-1 min-w-0 overflow-y-auto space-y-3">
          {TYPE_ORDER.map((type) => {
            const accounts = grouped[type]
            if (accounts.length === 0) return null

            return (
              <div
                key={type}
                className="rounded-lg overflow-hidden"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div
                  className="px-3 py-2 flex items-center gap-2"
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    background: TYPE_BG[type],
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: TYPE_COLORS[type] }}
                  />
                  <h3
                    className="text-sm font-bold"
                    style={{
                      fontFamily: 'var(--font-display)',
                      color: TYPE_COLORS[type],
                    }}
                  >
                    {type} Accounts
                  </h3>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    ({accounts.length})
                  </span>
                </div>

                <div className="py-1">
                  {accounts.map((acct) => (
                    <AccountRow
                      key={acct.name}
                      name={acct.name}
                      type={type}
                      balance={acct.balance}
                      baselineBalance={originalSnapshot?.get(acct.name) ?? acct.balance}
                      onChange={handleAccountChange}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* RIGHT: Live financial statements */}
        <aside
          className="shrink-0 hidden lg:block overflow-y-auto"
          style={{ width: 300 }}
        >
          <div
            className="sticky top-0 rounded-lg p-3"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h3
              className="text-sm font-bold mb-3"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text)',
              }}
            >
              Live Statement Preview
            </h3>
            <LiveStatements />
          </div>
        </aside>
      </div>
    </div>
  )
}
