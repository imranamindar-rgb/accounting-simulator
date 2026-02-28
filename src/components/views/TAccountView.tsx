/**
 * T-Account View — grid of T-account cards with filters.
 *
 * Renders all ledger accounts as classic T-shaped cards,
 * grouped by type with search, type-filter chips, and a
 * non-zero balance toggle.
 */

import { useState, useMemo } from 'react'
import { useLedgerStore } from '../../store/ledgerStore'
import StatementPanel from '../statements/StatementPanel'
import TAccountCard from './TAccountCard'
import type { Account } from '../../engines/Account'
import type { AccountType } from '../../engines/types'

const ACCOUNT_TYPE_ORDER: AccountType[] = [
  'Asset',
  'Liability',
  'Equity',
  'Revenue',
  'Expense',
]

const TYPE_CHIP_COLORS: Record<AccountType, { bg: string; activeBg: string; text: string }> = {
  Asset: { bg: '#EBF5FB', activeBg: '#AED6F1', text: '#1B4F72' },
  Liability: { bg: '#FDEDEC', activeBg: '#F5B7B1', text: '#78281F' },
  Equity: { bg: '#F4ECF7', activeBg: '#D2B4DE', text: '#4A235A' },
  Revenue: { bg: '#EAFAF1', activeBg: '#A9DFBF', text: '#1E8449' },
  Expense: { bg: '#FEF5E7', activeBg: '#F9E79F', text: '#7D6608' },
}

export default function TAccountView() {
  const ledger = useLedgerStore((s) => s.ledger)

  const [hideZero, setHideZero] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTypes, setActiveTypes] = useState<Set<AccountType>>(
    () => new Set(ACCOUNT_TYPE_ORDER),
  )

  const toggleType = (type: AccountType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  const filteredAccounts = useMemo(() => {
    const allAccounts = Array.from(ledger.getAllAccounts().values())
    const searchLower = search.toLowerCase()

    // Group by type in defined order
    const grouped: Account[] = []
    for (const type of ACCOUNT_TYPE_ORDER) {
      const ofType = allAccounts
        .filter((a) => a.type === type)
        .sort((a, b) => a.name.localeCompare(b.name))
      grouped.push(...ofType)
    }

    return grouped.filter((account) => {
      if (hideZero && account.balance === 0) return false
      if (!activeTypes.has(account.type)) return false
      if (search && !account.name.toLowerCase().includes(searchLower)) return false
      return true
    })
  }, [ledger, hideZero, search, activeTypes])

  const accountCount = Array.from(ledger.getAllAccounts().values()).length
  const visibleCount = filteredAccounts.length

  return (
    <div className="p-4">
      <StatementPanel
        title="T-Accounts"
        subtitle={`Showing ${visibleCount} of ${accountCount} accounts`}
      >
        {/* Filter controls */}
        <div className="mb-4 space-y-3">
          {/* Search bar and non-zero toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search accounts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-1.5 rounded text-sm"
                style={{
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-base)',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text)',
                  outline: 'none',
                }}
              />
            </div>
            <label
              className="flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer select-none"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
            >
              <input
                type="checkbox"
                checked={hideZero}
                onChange={(e) => setHideZero(e.target.checked)}
                className="accent-[var(--color-accent)]"
              />
              Non-zero only
            </label>
          </div>

          {/* Type filter chips */}
          <div className="flex flex-wrap gap-1.5">
            {ACCOUNT_TYPE_ORDER.map((type) => {
              const isActive = activeTypes.has(type)
              const colors = TYPE_CHIP_COLORS[type]
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                  style={{
                    background: isActive ? colors.activeBg : colors.bg,
                    color: colors.text,
                    border: `1px solid ${isActive ? colors.text + '40' : 'transparent'}`,
                    opacity: isActive ? 1 : 0.5,
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {type}
                </button>
              )
            })}
          </div>
        </div>

        {/* T-Account grid */}
        {filteredAccounts.length === 0 ? (
          <div
            className="text-center py-12"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
          >
            <p className="text-sm">No accounts match the current filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredAccounts.map((account) => (
              <TAccountCard key={account.name} account={account} />
            ))}
          </div>
        )}
      </StatementPanel>
    </div>
  )
}
