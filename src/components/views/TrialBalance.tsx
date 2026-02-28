/**
 * Trial Balance view component.
 *
 * Displays all ledger accounts in a three-column table:
 *   Account Name | Debit | Credit
 *
 * Features:
 *   - Accounts placed on their normal side (contra accounts on the opposite side)
 *   - Running totals highlighted green when balanced, red when not
 *   - Filter bar: All, Non-zero only, and by AccountType
 *   - Search input (case-insensitive account name filtering)
 *   - CSV export
 */

import { useState, useMemo } from 'react'
import { useLedgerStore } from '../../store/ledgerStore'
import StatementPanel from '../statements/StatementPanel'
import type { AccountType } from '../../engines/types'

type FilterMode = 'all' | 'nonzero' | AccountType

const ACCOUNT_TYPE_OPTIONS: AccountType[] = [
  'Asset',
  'Liability',
  'Equity',
  'Revenue',
  'Expense',
]

/** Format a number with commas, 2 decimal places, negatives in parentheses. */
function formatAmount(value: number): string {
  if (value === 0) return ''
  const isNegative = value < 0
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return isNegative ? `(${formatted})` : formatted
}

interface TrialBalanceRow {
  name: string
  type: AccountType
  debit: number
  credit: number
  balance: number
  contra: boolean
}

export default function TrialBalance() {
  const ledger = useLedgerStore((s) => s.ledger)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterMode>('all')

  // Build rows from ledger accounts
  const allRows = useMemo<TrialBalanceRow[]>(() => {
    const rows: TrialBalanceRow[] = []
    const accounts = ledger.getAllAccounts()

    for (const [, account] of accounts) {
      const balance = account.balance
      // Determine which column the balance belongs in.
      // Normal side: Assets/Expenses -> debit, Liabilities/Equity/Revenue -> credit
      // Contra accounts flip to the opposite side.
      const isDebitSide = account.contra
        ? account.normalSide === 'credit'
        : account.normalSide === 'debit'

      rows.push({
        name: account.name,
        type: account.type,
        debit: isDebitSide ? balance : 0,
        credit: isDebitSide ? 0 : balance,
        balance,
        contra: account.contra,
      })
    }

    // Sort by type order then name
    const typeOrder: Record<AccountType, number> = {
      Asset: 0,
      Liability: 1,
      Equity: 2,
      Revenue: 3,
      Expense: 4,
    }
    rows.sort((a, b) => {
      const typeCompare = typeOrder[a.type] - typeOrder[b.type]
      if (typeCompare !== 0) return typeCompare
      return a.name.localeCompare(b.name)
    })

    return rows
  }, [ledger])

  // Apply filters
  const filteredRows = useMemo(() => {
    let rows = allRows

    // Filter by type or non-zero
    if (filter === 'nonzero') {
      rows = rows.filter((r) => r.balance !== 0)
    } else if (filter !== 'all') {
      rows = rows.filter((r) => r.type === filter)
    }

    // Filter by search
    if (search.trim()) {
      const term = search.trim().toLowerCase()
      rows = rows.filter((r) => r.name.toLowerCase().includes(term))
    }

    return rows
  }, [allRows, filter, search])

  // Calculate totals from filtered rows
  const totalDebit = filteredRows.reduce((sum, r) => sum + r.debit, 0)
  const totalCredit = filteredRows.reduce((sum, r) => sum + r.credit, 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.005

  // CSV export handler
  function handleExportCSV() {
    const header = 'Account Name,Debit,Credit'
    const dataRows = filteredRows.map((r) => {
      const name = r.name.includes(',') ? `"${r.name}"` : r.name
      const debit = r.debit !== 0 ? r.debit.toFixed(2) : ''
      const credit = r.credit !== 0 ? r.credit.toFixed(2) : ''
      return `${name},${debit},${credit}`
    })
    const totalsRow = `Totals,${totalDebit.toFixed(2)},${totalCredit.toFixed(2)}`
    const csv = [header, ...dataRows, totalsRow].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'trial-balance.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportButton = (
    <button
      onClick={handleExportCSV}
      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded transition-colors cursor-pointer"
      style={{
        background: 'var(--color-accent)',
        color: 'var(--color-base)',
        fontFamily: 'var(--font-body)',
      }}
    >
      Export CSV
    </button>
  )

  return (
    <StatementPanel
      title="Trial Balance"
      subtitle="As of Period End"
      headerRight={exportButton}
    >
      {/* Filter bar and search */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['all', 'nonzero', ...ACCOUNT_TYPE_OPTIONS] as FilterMode[]).map(
            (mode) => {
              const label =
                mode === 'all'
                  ? 'All'
                  : mode === 'nonzero'
                    ? 'Non-zero'
                    : mode
              const isActive = filter === mode
              return (
                <button
                  key={mode}
                  onClick={() => setFilter(mode)}
                  className="text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                  style={{
                    fontFamily: 'var(--font-body)',
                    background: isActive
                      ? 'var(--color-accent)'
                      : 'transparent',
                    color: isActive
                      ? 'var(--color-base)'
                      : 'var(--color-text-muted)',
                    border: isActive
                      ? '1px solid var(--color-accent)'
                      : '1px solid var(--color-border)',
                  }}
                >
                  {label}
                </button>
              )
            },
          )}
        </div>

        {/* Search input */}
        <input
          type="text"
          placeholder="Search accounts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs px-3 py-1.5 rounded ml-auto"
          style={{
            fontFamily: 'var(--font-body)',
            background: 'var(--color-base)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            outline: 'none',
            minWidth: '180px',
          }}
        />
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr
            style={{
              borderBottom: '2px solid var(--color-border)',
            }}
          >
            <th
              className="text-left py-2 text-xs font-semibold uppercase tracking-wider"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text)',
              }}
            >
              Account Name
            </th>
            <th
              className="text-right py-2 text-xs font-semibold uppercase tracking-wider"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text)',
                width: '120px',
              }}
            >
              Debit
            </th>
            <th
              className="text-right py-2 text-xs font-semibold uppercase tracking-wider"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text)',
                width: '120px',
              }}
            >
              Credit
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className="py-6 text-center text-xs"
                style={{ color: 'var(--color-text-muted)' }}
              >
                No accounts match the current filters.
              </td>
            </tr>
          ) : (
            filteredRows.map((row) => (
              <tr
                key={row.name}
                className="transition-colors"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <td
                  className="py-1.5 text-sm"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: 'var(--color-text)',
                  }}
                >
                  <span>{row.name}</span>
                  {row.contra && (
                    <span
                      className="ml-1.5 text-xs italic"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      (contra)
                    </span>
                  )}
                </td>
                <td
                  className="py-1.5 text-right text-sm"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: row.debit < 0 ? '#B91C1C' : 'var(--color-text)',
                  }}
                >
                  {formatAmount(row.debit)}
                </td>
                <td
                  className="py-1.5 text-right text-sm"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: row.credit < 0 ? '#B91C1C' : 'var(--color-text)',
                  }}
                >
                  {formatAmount(row.credit)}
                </td>
              </tr>
            ))
          )}
        </tbody>

        {/* Totals row */}
        <tfoot>
          <tr
            style={{
              borderTop: '3px double var(--color-border)',
            }}
          >
            <td
              className="pt-2 pb-1 text-sm font-bold"
              style={{
                fontFamily: 'var(--font-display)',
                color: isBalanced ? 'var(--color-green)' : '#B91C1C',
              }}
            >
              Totals
              <span
                className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: isBalanced ? '#DEF7EC' : '#FDE8E8',
                  color: isBalanced ? 'var(--color-green)' : '#B91C1C',
                }}
              >
                {isBalanced ? 'Balanced' : 'Unbalanced'}
              </span>
            </td>
            <td
              className="pt-2 pb-1 text-right text-sm font-bold"
              style={{
                fontFamily: 'var(--font-mono)',
                color: isBalanced ? 'var(--color-green)' : '#B91C1C',
              }}
            >
              {formatAmount(totalDebit) || '0.00'}
            </td>
            <td
              className="pt-2 pb-1 text-right text-sm font-bold"
              style={{
                fontFamily: 'var(--font-mono)',
                color: isBalanced ? 'var(--color-green)' : '#B91C1C',
              }}
            >
              {formatAmount(totalCredit) || '0.00'}
            </td>
          </tr>
        </tfoot>
      </table>
    </StatementPanel>
  )
}
