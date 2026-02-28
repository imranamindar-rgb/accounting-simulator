/**
 * Statement of Changes in Equity component.
 *
 * Shows beginning balances, changes during period, and ending balances
 * for all equity accounts.
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
export default function EquityStatement() {
  const statements = useStatements()
  const scale = useLedgerStore((s) => s.selectedCompany?.scale ?? 'ones')
  const { equityStatement: eq } = statements

  return (
    <StatementPanel
      title="Statement of Changes in Equity"
      subtitle="For the Period"
    >
      <table className="w-full">
        <tbody>
          {/* ── Beginning Balances ─────────────── */}
          <SectionHeader label="Beginning Balances" />
          {eq.beginningBalances.map((item) => (
            <LineItem
              key={`beg-${item.account}`}
              label={item.account}
              value={item.amount}
              scale={scale}
              indent
            />
          ))}
          <SubtotalRow
            label="Total Beginning Equity"
            value={eq.totalBeginning}
            scale={scale}
          />

          {/* ── Changes During Period ──────────── */}
          <SectionHeader label="Changes During Period" />
          {eq.changes.length === 0 ? (
            <tr>
              <td
                colSpan={2}
                className="py-1 pl-6 text-xs italic"
                style={{ color: 'var(--color-text-muted)' }}
              >
                No changes recorded
              </td>
            </tr>
          ) : (
            eq.changes.map((item, i) => (
              <LineItem
                key={`chg-${i}`}
                label={`${item.account}: ${item.description}`}
                value={item.amount}
                scale={scale}
                indent
              />
            ))
          )}

          {/* ── Ending Balances ────────────────── */}
          <SectionHeader label="Ending Balances" />
          {eq.endingBalances.map((item) => (
            <LineItem
              key={`end-${item.account}`}
              label={item.account}
              value={item.amount}
              scale={scale}
              indent
            />
          ))}
          <TotalRow
            label="Total Ending Equity"
            value={eq.totalEnding}
            scale={scale}
          />
        </tbody>
      </table>
    </StatementPanel>
  )
}
