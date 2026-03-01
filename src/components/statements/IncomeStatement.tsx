/**
 * Multi-step Income Statement component.
 *
 * Revenue - COGS = Gross Profit
 * Gross Profit - Operating Expenses = Operating Income
 * Operating Income +/- Other = Income Before Tax
 * Income Before Tax - Tax = Net Income
 */

import { useLedgerStore } from '../../store/ledgerStore'
import { useStatements } from '../../hooks/useStatements'
import StatementPanel from './StatementPanel'
import {
  LineItem,
  SectionHeader,
  SubtotalRow,
  TotalRow,
} from './LineItem'
import type { Scale } from './statementUtils'
import type { AccountLine } from '../../engines/types'

function AccountLines({
  lines,
  scale,
}: {
  lines: AccountLine[]
  scale: Scale
}) {
  return (
    <>
      {lines.map((line) => (
        <LineItem
          key={line.name}
          label={line.name}
          value={line.balance}
          scale={scale}
          indent
          contra={line.contra}
        />
      ))}
    </>
  )
}

export default function IncomeStatement() {
  const statements = useStatements()
  const scale = useLedgerStore((s) => s.selectedCompany?.scale ?? 'ones')
  const sharesOutstanding = useLedgerStore((s) => s.sharesOutstanding)
  const { incomeStatement: is } = statements

  const eps =
    sharesOutstanding > 0
      ? is.netIncome / sharesOutstanding
      : 0

  return (
    <StatementPanel
      title="Income Statement"
      subtitle={`Multi-Step${scale === 'millions' ? ' · ($ in millions)' : ''}`}
    >
      <table className="w-full">
        <tbody>
          {/* ── Revenue ───────────────────────── */}
          <SectionHeader label="Revenue" />
          <AccountLines lines={is.revenue} scale={scale} />
          <SubtotalRow label="Total Revenue" value={is.totalRevenue} scale={scale} />

          {/* ── COGS ──────────────────────────── */}
          {is.cogs.length > 0 && (
            <>
              <SectionHeader label="Less: Cost of Goods Sold" />
              <AccountLines lines={is.cogs} scale={scale} />
              <SubtotalRow label="Total COGS" value={is.totalCOGS} scale={scale} />
            </>
          )}

          {/* ── Gross Profit ──────────────────── */}
          <TotalRow label="Gross Profit" value={is.grossProfit} scale={scale} />

          {/* ── Operating Expenses ─────────────── */}
          {is.operatingExpenses.length > 0 && (
            <>
              <SectionHeader label="Less: Operating Expenses" />
              <AccountLines lines={is.operatingExpenses} scale={scale} />
              <SubtotalRow
                label="Total Operating Expenses"
                value={is.totalOperatingExpenses}
                scale={scale}
              />
            </>
          )}

          {/* ── Operating Income ──────────────── */}
          <TotalRow label="Operating Income" value={is.operatingIncome} scale={scale} />

          {/* ── Other Revenue / Expenses ──────── */}
          {(is.otherRevenue.length > 0 || is.otherExpenses.length > 0) && (
            <>
              {is.otherRevenue.length > 0 && (
                <>
                  <SectionHeader label="Other Revenue" />
                  <AccountLines lines={is.otherRevenue} scale={scale} />
                </>
              )}
              {is.otherExpenses.length > 0 && (
                <>
                  <SectionHeader label="Other Expenses" />
                  <AccountLines lines={is.otherExpenses} scale={scale} />
                </>
              )}
              <SubtotalRow label="Total Other" value={is.totalOther} scale={scale} />
            </>
          )}

          {/* ── Income Before Tax ─────────────── */}
          <SubtotalRow
            label="Income Before Tax"
            value={is.incomeBeforeTax}
            scale={scale}
          />

          {/* ── Tax ───────────────────────────── */}
          <LineItem
            label="Less: Tax Expense"
            value={is.taxExpense}
            scale={scale}
            indent
          />

          {/* ── Net Income ────────────────────── */}
          <TotalRow label="Net Income" value={is.netIncome} scale={scale} />

          {/* ── EPS ───────────────────────────── */}
          <tr>
            <td
              className="pt-3 text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Earnings Per Share (EPS)
            </td>
            <td className="pt-3 text-right text-xs">
              <span
                className="font-mono"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                ${eps.toFixed(2)}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </StatementPanel>
  )
}
