/**
 * General Ledger view component.
 *
 * Displays a chronological record of all journal entries with debit/credit
 * amounts and running balances.
 *
 * Features:
 *   - Account selector: "All Accounts" (grouped by account) or single account
 *   - Chronological table: # | Date/Time | Description | Debit | Credit | Running Balance
 *   - CSV export
 *   - Empty state when no transactions exist
 */

import { useState, useMemo } from 'react'
import { useLedgerStore } from '../../store/ledgerStore'
import StatementPanel from '../statements/StatementPanel'

/** Format a number with commas and 2 decimal places. Empty string for zero. */
function formatCurrency(value: number): string {
  if (value === 0) return ''
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return value < 0 ? `(${formatted})` : formatted
}

/** Format currency, always showing a value (including zero). */
function formatBalance(value: number): string {
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return value < 0 ? `(${formatted})` : formatted
}

/** Format a timestamp to a short date/time string. */
function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Build a human-readable description from template name and first param. */
function buildDescription(
  templateName: string,
  params: Record<string, number>,
): string {
  const values = Object.values(params)
  if (values.length === 0) return templateName
  const firstValue = values[0]
  const formatted = firstValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return `${templateName} — $${formatted}`
}

/** A single ledger entry row for display. */
interface LedgerRow {
  entryNum: number
  timestamp: number
  description: string
  account: string
  debit: number
  credit: number
}

/** A ledger row with running balance for single-account view. */
interface LedgerRowWithBalance extends LedgerRow {
  runningBalance: number
}

export default function GeneralLedger() {
  const transactionHistory = useLedgerStore((s) => s.transactionHistory)
  const ledger = useLedgerStore((s) => s.ledger)
  const [selectedAccount, setSelectedAccount] = useState<string>('all')

  // Build sorted account list from ledger
  const accounts = useMemo(() => {
    return Array.from(ledger.getAllAccounts().keys()).sort()
  }, [ledger])

  // Build flat list of all ledger rows from transaction history
  const allRows = useMemo<LedgerRow[]>(() => {
    const rows: LedgerRow[] = []
    let entryNum = 1

    for (const txn of transactionHistory) {
      const description = buildDescription(txn.templateName, txn.params)

      for (const change of txn.changes) {
        rows.push({
          entryNum,
          timestamp: txn.timestamp,
          description,
          account: change.account,
          debit: change.side === 'debit' ? change.amount : 0,
          credit: change.side === 'credit' ? change.amount : 0,
        })
      }
      entryNum++
    }

    return rows
  }, [transactionHistory])

  // Group rows by account for "All Accounts" mode
  const groupedByAccount = useMemo(() => {
    const groups = new Map<string, LedgerRowWithBalance[]>()

    for (const accountName of accounts) {
      const accountRows = allRows.filter((r) => r.account === accountName)
      if (accountRows.length === 0) continue

      let runningBalance = 0
      const rowsWithBalance: LedgerRowWithBalance[] = accountRows.map((r) => {
        // Debits increase asset/expense accounts, credits increase liability/equity/revenue
        // For running balance, we use debit - credit as the net movement
        runningBalance += r.debit - r.credit
        return { ...r, runningBalance }
      })
      groups.set(accountName, rowsWithBalance)
    }

    return groups
  }, [allRows, accounts])

  // Single account filtered view with running balance
  const singleAccountRows = useMemo<LedgerRowWithBalance[]>(() => {
    if (selectedAccount === 'all') return []

    const accountRows = allRows.filter((r) => r.account === selectedAccount)
    let runningBalance = 0
    return accountRows.map((r) => {
      runningBalance += r.debit - r.credit
      return { ...r, runningBalance }
    })
  }, [allRows, selectedAccount])

  // CSV export handler
  function handleExportCSV() {
    const header = '#,Date,Description,Account,Debit,Credit'
    const dataRows = allRows.map((r) => {
      const date = new Date(r.timestamp).toISOString().split('T')[0]
      const desc = r.description.includes(',')
        ? `"${r.description}"`
        : r.description
      const acct = r.account.includes(',') ? `"${r.account}"` : r.account
      const debit = r.debit !== 0 ? r.debit.toFixed(2) : ''
      const credit = r.credit !== 0 ? r.credit.toFixed(2) : ''
      return `${r.entryNum},${date},${desc},${acct},${debit},${credit}`
    })
    const csv = [header, ...dataRows].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'general-ledger.csv'
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

  // Table header row shared between modes
  function TableHead({ showBalance }: { showBalance: boolean }) {
    return (
      <thead>
        <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
          <th
            className="text-left py-2 text-xs font-semibold uppercase tracking-wider"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text)',
              width: '40px',
            }}
          >
            #
          </th>
          <th
            className="text-left py-2 text-xs font-semibold uppercase tracking-wider"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text)',
              width: '120px',
            }}
          >
            Date / Time
          </th>
          <th
            className="text-left py-2 text-xs font-semibold uppercase tracking-wider"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text)',
            }}
          >
            Description
          </th>
          <th
            className="text-right py-2 text-xs font-semibold uppercase tracking-wider"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text)',
              width: '110px',
            }}
          >
            Debit
          </th>
          <th
            className="text-right py-2 text-xs font-semibold uppercase tracking-wider"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text)',
              width: '110px',
            }}
          >
            Credit
          </th>
          {showBalance && (
            <th
              className="text-right py-2 text-xs font-semibold uppercase tracking-wider"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text)',
                width: '120px',
              }}
            >
              Balance
            </th>
          )}
        </tr>
      </thead>
    )
  }

  function EntryRow({
    row,
    showBalance,
  }: {
    row: LedgerRowWithBalance
    showBalance: boolean
  }) {
    return (
      <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
        <td
          className="py-1.5 text-sm"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-muted)',
          }}
        >
          {row.entryNum}
        </td>
        <td
          className="py-1.5 text-xs"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-muted)',
          }}
        >
          {formatDateTime(row.timestamp)}
        </td>
        <td
          className="py-1.5 text-sm"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text)',
          }}
        >
          {row.description}
        </td>
        <td
          className="py-1.5 text-right text-sm"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text)',
          }}
        >
          {formatCurrency(row.debit)}
        </td>
        <td
          className="py-1.5 text-right text-sm"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text)',
          }}
        >
          {formatCurrency(row.credit)}
        </td>
        {showBalance && (
          <td
            className="py-1.5 text-right text-sm font-medium"
            style={{
              fontFamily: 'var(--font-mono)',
              color:
                row.runningBalance < 0
                  ? '#B91C1C'
                  : 'var(--color-text)',
            }}
          >
            {formatBalance(row.runningBalance)}
          </td>
        )}
      </tr>
    )
  }

  const isEmpty = transactionHistory.length === 0

  return (
    <StatementPanel
      title="General Ledger"
      subtitle="Chronological Journal Entries"
      headerRight={exportButton}
    >
      {/* Account selector */}
      <div className="flex items-center gap-3 mb-4">
        <label
          className="text-xs font-medium"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-muted)',
          }}
        >
          Account:
        </label>
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="text-xs px-3 py-1.5 rounded cursor-pointer"
          style={{
            fontFamily: 'var(--font-body)',
            background: 'var(--color-base)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            outline: 'none',
            minWidth: '200px',
          }}
        >
          <option value="all">All Accounts</option>
          {accounts.map((acct) => (
            <option key={acct} value={acct}>
              {acct}
            </option>
          ))}
        </select>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div
          className="flex items-center justify-center py-12"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <p
            className="text-sm"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            No transactions recorded yet.
          </p>
        </div>
      )}

      {/* All Accounts mode: grouped sections */}
      {!isEmpty && selectedAccount === 'all' && (
        <div className="space-y-6">
          {Array.from(groupedByAccount.entries()).map(
            ([accountName, rows]) => (
              <div key={accountName}>
                {/* Account header */}
                <div
                  className="px-3 py-2 rounded-t text-sm font-semibold"
                  style={{
                    fontFamily: 'var(--font-display)',
                    background: 'var(--color-base)',
                    color: 'var(--color-accent)',
                    borderBottom: '2px solid var(--color-gold)',
                  }}
                >
                  {accountName}
                </div>
                <table className="w-full">
                  <TableHead showBalance={true} />
                  <tbody>
                    {rows.map((row, idx) => (
                      <EntryRow
                        key={`${accountName}-${idx}`}
                        row={row}
                        showBalance={true}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ),
          )}
        </div>
      )}

      {/* Single account mode */}
      {!isEmpty && selectedAccount !== 'all' && (
        <>
          {singleAccountRows.length === 0 ? (
            <div
              className="flex items-center justify-center py-12"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <p
                className="text-sm"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                No entries for this account.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <TableHead showBalance={true} />
              <tbody>
                {singleAccountRows.map((row, idx) => (
                  <EntryRow
                    key={idx}
                    row={row}
                    showBalance={true}
                  />
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </StatementPanel>
  )
}
