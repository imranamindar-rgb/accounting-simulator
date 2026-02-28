/**
 * WhatIfMode -- full-screen what-if account adjustment view.
 *
 * Replaces the normal statement grid when mode === 'whatif'.
 * Shows all accounts grouped by type with sliders + number inputs
 * to adjust balances in real-time. Statements (rendered elsewhere)
 * re-render automatically as the ledger updates.
 *
 * On mount, saves a snapshot so we can restore on exit.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useLedgerStore } from '../../store/ledgerStore'
import { useUIStore } from '../../store/uiStore'
import type { AccountType } from '../../engines/types'
import WhatIfBanner from './WhatIfBanner'

// ── Account type display config ─────────────────────────────────────

const TYPE_ORDER: AccountType[] = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']

const TYPE_COLORS: Record<AccountType, string> = {
  Asset: 'var(--color-green)',
  Liability: '#B03A2E',
  Equity: 'var(--color-accent)',
  Revenue: 'var(--color-green)',
  Expense: 'var(--color-gold)',
}

const TYPE_BG: Record<AccountType, string> = {
  Asset: 'rgba(45,106,79,0.06)',
  Liability: 'rgba(176,58,46,0.06)',
  Equity: 'rgba(74,10,18,0.06)',
  Revenue: 'rgba(45,106,79,0.06)',
  Expense: 'rgba(218,165,32,0.06)',
}

// ── Number formatting ───────────────────────────────────────────────

function formatBalance(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`
  }
  return `$${value.toLocaleString()}`
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
  const sliderMax = Math.max(Math.abs(baselineBalance) * 3, 1000)
  const sliderMin = baselineBalance < 0 ? baselineBalance * 3 : 0
  const changed = balance !== baselineBalance

  return (
    <div
      className="flex items-center gap-3 py-2 px-3 rounded"
      style={{
        background: changed ? TYPE_BG[type] : 'transparent',
        transition: 'background 0.2s',
      }}
    >
      {/* Account name */}
      <div
        className="flex-shrink-0 text-sm"
        style={{
          width: 220,
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

      {/* Slider */}
      <div className="flex-1 min-w-0">
        <input
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={Math.max(1, Math.round(sliderMax / 200))}
          value={balance}
          onChange={(e) => onChange(name, parseFloat(e.target.value))}
          className="w-full"
          style={{
            accentColor: TYPE_COLORS[type],
            cursor: 'pointer',
          }}
        />
      </div>

      {/* Number input */}
      <input
        type="number"
        value={balance}
        onChange={(e) => {
          const v = parseFloat(e.target.value)
          if (!isNaN(v)) onChange(name, v)
        }}
        className="text-right text-sm rounded px-2 py-1"
        style={{
          width: 120,
          fontFamily: 'var(--font-mono)',
          color: changed ? TYPE_COLORS[type] : 'var(--color-text)',
          background: 'var(--color-base)',
          border: `1px solid ${changed ? TYPE_COLORS[type] : 'var(--color-border)'}`,
          fontWeight: changed ? 600 : 400,
        }}
      />

      {/* Change indicator */}
      <div
        className="text-xs flex-shrink-0"
        style={{
          width: 70,
          textAlign: 'right',
          fontFamily: 'var(--font-mono)',
          color: changed ? TYPE_COLORS[type] : 'transparent',
        }}
      >
        {changed ? formatBalance(balance - baselineBalance) : '--'}
      </div>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────

export default function WhatIfMode() {
  const ledger = useLedgerStore((s) => s.ledger)
  const setMode = useUIStore((s) => s.setMode)

  const [originalSnapshot, setOriginalSnapshot] = useState<Map<string, number> | null>(null)
  // Local mirror of balances to drive the UI without a zustand re-render per slider tick
  const [balances, setBalances] = useState<Record<string, number>>({})
  const restoredRef = useRef(false)

  // Save original on mount
  useEffect(() => {
    const snap = ledger.takeSnapshot()
    setOriginalSnapshot(snap)

    // Build local balance mirror
    const bals: Record<string, number> = {}
    for (const [name, account] of ledger.getAllAccounts()) {
      bals[name] = account.balance
    }
    setBalances(bals)

    return () => {
      // Restore on unmount if not already restored via handleExit
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
    }
    setMode('transaction')
  }, [originalSnapshot, ledger, setMode])

  const handleAccountChange = useCallback(
    (name: string, value: number) => {
      ledger.adjustBalance(name, Math.round(value))
      setBalances((prev) => ({ ...prev, [name]: Math.round(value) }))
    },
    [ledger],
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
    <div className="p-4 space-y-4">
      <WhatIfBanner onExit={handleExit} />

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
            {/* Type header */}
            <div
              className="px-4 py-2.5 flex items-center gap-2"
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
                className="text-base font-semibold"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: TYPE_COLORS[type],
                }}
              >
                {type} Accounts
              </h3>
              <span
                className="text-xs"
                style={{ color: 'var(--color-text-muted)' }}
              >
                ({accounts.length})
              </span>
            </div>

            {/* Column headers */}
            <div
              className="flex items-center gap-3 px-3 py-1.5"
              style={{
                borderBottom: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <div style={{ width: 220 }}>Account</div>
              <div className="flex-1">Adjust</div>
              <div style={{ width: 120, textAlign: 'right' }}>Balance</div>
              <div style={{ width: 70, textAlign: 'right' }}>Change</div>
            </div>

            {/* Account rows */}
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
  )
}
