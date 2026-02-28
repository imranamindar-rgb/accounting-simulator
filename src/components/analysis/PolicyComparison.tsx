/**
 * PolicyComparison -- modal comparing the impact of different accounting policies.
 *
 * Two tabs:
 *   1. Depreciation: Straight-Line vs Double-Declining Balance
 *   2. Inventory: FIFO (current) vs LIFO (estimated)
 *
 * Reads live account data from ledgerStore for computations.
 */

import { useState } from 'react'
import { useLedgerStore } from '../../store/ledgerStore'
import { useStatements } from '../../hooks/useStatements'

type Tab = 'depreciation' | 'inventory'

function fmt(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function ComparisonTable({
  headers,
  rows,
}: {
  headers: [string, string, string]
  rows: { label: string; col1: string; col2: string; highlight?: boolean }[]
}) {
  return (
    <table className="w-full text-sm" style={{ fontFamily: 'var(--font-body)' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
          {headers.map((h, i) => (
            <th
              key={i}
              className="py-2 px-3 text-left font-semibold"
              style={{
                color: i === 0 ? 'var(--color-text)' : 'var(--color-accent)',
                fontFamily: i === 0 ? 'var(--font-body)' : 'var(--font-display)',
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={i}
            style={{
              borderBottom: '1px solid var(--color-border)',
              background: row.highlight ? 'rgba(218, 165, 32, 0.08)' : 'transparent',
            }}
          >
            <td
              className="py-2.5 px-3 font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              {row.label}
            </td>
            <td
              className="py-2.5 px-3"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text)',
              }}
            >
              {row.col1}
            </td>
            <td
              className="py-2.5 px-3"
              style={{
                fontFamily: 'var(--font-mono)',
                color: row.highlight ? 'var(--color-gold)' : 'var(--color-text)',
                fontWeight: row.highlight ? 600 : 400,
              }}
            >
              {row.col2}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function DepreciationTab() {
  const ledger = useLedgerStore((s) => s.ledger)

  let equipmentCost = 0
  let accumDepr = 0
  try {
    equipmentCost = ledger.getAccount('Equipment').balance
  } catch {
    /* account may not exist */
  }
  try {
    accumDepr = ledger.getAccount('Accumulated Depreciation - Equipment').balance
  } catch {
    /* account may not exist */
  }

  // Contra accounts store as negative in normal-side logic;
  // accumulated depreciation is a contra asset, balance stored positive
  // but represents a reduction, so we use its absolute value.
  const absAccumDepr = Math.abs(accumDepr)
  const usefulLife = 10
  const bookValue = equipmentCost - absAccumDepr

  // Straight-Line
  const slAnnual = usefulLife > 0 ? equipmentCost / usefulLife : 0
  const slYearEndBV = bookValue - slAnnual

  // Double-Declining Balance
  const ddbRate = usefulLife > 0 ? 2 / usefulLife : 0
  const ddbAnnual = bookValue * ddbRate
  const ddbYearEndBV = bookValue - ddbAnnual

  const rows = [
    {
      label: 'Equipment Cost',
      col1: fmt(equipmentCost),
      col2: fmt(equipmentCost),
    },
    {
      label: 'Current Book Value',
      col1: fmt(bookValue),
      col2: fmt(bookValue),
    },
    {
      label: 'Annual Depreciation',
      col1: fmt(slAnnual),
      col2: fmt(ddbAnnual),
      highlight: Math.round(slAnnual) !== Math.round(ddbAnnual),
    },
    {
      label: 'Year-End Book Value',
      col1: fmt(slYearEndBV),
      col2: fmt(ddbYearEndBV),
      highlight: Math.round(slYearEndBV) !== Math.round(ddbYearEndBV),
    },
    {
      label: 'Impact on Net Income',
      col1: fmt(-slAnnual),
      col2: fmt(-ddbAnnual),
      highlight: Math.round(slAnnual) !== Math.round(ddbAnnual),
    },
    {
      label: 'Impact on Total Assets',
      col1: `lower by ${fmt(slAnnual)}`,
      col2: `lower by ${fmt(ddbAnnual)}`,
      highlight: Math.round(slAnnual) !== Math.round(ddbAnnual),
    },
  ]

  return (
    <div>
      <p
        className="text-xs mb-4"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
      >
        Compares Straight-Line vs Double-Declining Balance depreciation for
        Equipment (useful life: {usefulLife} years).
      </p>
      <ComparisonTable
        headers={['', 'Straight Line', 'Double Declining']}
        rows={rows}
      />
    </div>
  )
}

function InventoryTab() {
  const ledger = useLedgerStore((s) => s.ledger)
  const { incomeStatement } = useStatements()

  const currentCOGS = incomeStatement.totalCOGS
  const totalRevenue = incomeStatement.totalRevenue

  let currentInventory = 0
  try {
    currentInventory = ledger.getAccount('Inventory').balance
  } catch {
    /* account may not exist */
  }

  // FIFO = current (unchanged)
  const fifoCOGS = currentCOGS
  const fifoGrossProfit = totalRevenue - fifoCOGS
  const fifoInventory = currentInventory

  // LIFO = COGS +5%, Inventory -5%
  const lifoCOGS = Math.round(currentCOGS * 1.05)
  const lifoGrossProfit = totalRevenue - lifoCOGS
  const lifoInventory = Math.round(currentInventory * 0.95)

  const rows = [
    {
      label: 'COGS',
      col1: fmt(fifoCOGS),
      col2: fmt(lifoCOGS),
      highlight: fifoCOGS !== lifoCOGS,
    },
    {
      label: 'Gross Profit',
      col1: fmt(fifoGrossProfit),
      col2: fmt(lifoGrossProfit),
      highlight: fifoGrossProfit !== lifoGrossProfit,
    },
    {
      label: 'Ending Inventory',
      col1: fmt(fifoInventory),
      col2: fmt(lifoInventory),
      highlight: fifoInventory !== lifoInventory,
    },
    {
      label: 'Impact on Taxes',
      col1: 'Higher (more profit)',
      col2: 'Lower (less profit)',
      highlight: true,
    },
  ]

  return (
    <div>
      <p
        className="text-xs mb-4"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
      >
        Compares FIFO (current method) vs LIFO (estimated with 5% inflation
        adjustment).
      </p>
      <ComparisonTable
        headers={['', 'FIFO (Current)', 'LIFO (Estimated)']}
        rows={rows}
      />
    </div>
  )
}

export default function PolicyComparison({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState<Tab>('depreciation')

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col"
          style={{
            pointerEvents: 'auto',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <div>
              <h2
                className="text-lg font-semibold"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-text)',
                }}
              >
                Policy Comparison
              </h2>
              <p
                className="text-xs mt-0.5"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Side-by-side impact of different accounting methods
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded cursor-pointer"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                fontSize: '1.25rem',
                lineHeight: 1,
              }}
              title="Close"
            >
              &times;
            </button>
          </div>

          {/* Tabs */}
          <div
            className="flex px-6 pt-3"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            {(['depreciation', 'inventory'] as Tab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2 text-sm font-medium cursor-pointer transition-colors"
                style={{
                  fontFamily: 'var(--font-body)',
                  color:
                    activeTab === tab
                      ? 'var(--color-accent)'
                      : 'var(--color-text-muted)',
                  borderBottom:
                    activeTab === tab
                      ? '2px solid var(--color-accent)'
                      : '2px solid transparent',
                  background: 'none',
                  border: 'none',
                  borderBottomWidth: 2,
                  borderBottomStyle: 'solid',
                  borderBottomColor:
                    activeTab === tab
                      ? 'var(--color-accent)'
                      : 'transparent',
                  marginBottom: -1,
                }}
              >
                {tab === 'depreciation' ? 'Depreciation' : 'Inventory'}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {activeTab === 'depreciation' ? (
              <DepreciationTab />
            ) : (
              <InventoryTab />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
