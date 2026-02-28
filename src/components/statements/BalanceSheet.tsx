/**
 * Classified Balance Sheet component.
 *
 * Reads live data from the ledger store and renders a standard classified
 * balance sheet: Assets = Liabilities + Equity.
 */

import { useLedgerStore } from '../../store/ledgerStore'
import { useStatements } from '../../hooks/useStatements'
import StatementPanel from './StatementPanel'
import {
  LineItem,
  SectionHeader,
  SubHeader,
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
          indent={!line.contra}
          contra={line.contra}
        />
      ))}
    </>
  )
}

function BalancedIndicator({ balanced }: { balanced: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
      style={{
        background: balanced ? '#DEF7EC' : '#FDE8E8',
        color: balanced ? 'var(--color-green)' : '#B91C1C',
      }}
    >
      {balanced ? '\u2713' : '\u2717'}{' '}
      {balanced ? 'Balanced' : 'Unbalanced'}
    </span>
  )
}

export default function BalanceSheet() {
  const statements = useStatements()
  const scale = useLedgerStore((s) => s.selectedCompany?.scale ?? 'ones')
  const { balanceSheet: bs } = statements

  return (
    <StatementPanel
      title="Balance Sheet"
      subtitle="Classified"
      headerRight={<BalancedIndicator balanced={bs.isBalanced} />}
    >
      <table className="w-full">
        <tbody>
          {/* ── Assets ─────────────────────────── */}
          <SectionHeader label="Assets" />

          <SubHeader label="Current Assets" />
          <AccountLines lines={bs.currentAssets} scale={scale} />
          <SubtotalRow label="Total Current Assets" value={bs.totalCurrentAssets} scale={scale} />

          <SubHeader label="Non-Current Assets" />
          <AccountLines lines={bs.noncurrentAssets} scale={scale} />
          <SubtotalRow
            label="Total Non-Current Assets"
            value={bs.totalNoncurrentAssets}
            scale={scale}
          />

          <TotalRow label="Total Assets" value={bs.totalAssets} scale={scale} />

          {/* ── Liabilities ────────────────────── */}
          <SectionHeader label="Liabilities" />

          <SubHeader label="Current Liabilities" />
          <AccountLines lines={bs.currentLiabilities} scale={scale} />
          <SubtotalRow
            label="Total Current Liabilities"
            value={bs.totalCurrentLiabilities}
            scale={scale}
          />

          <SubHeader label="Non-Current Liabilities" />
          <AccountLines lines={bs.noncurrentLiabilities} scale={scale} />
          <SubtotalRow
            label="Total Non-Current Liabilities"
            value={bs.totalNoncurrentLiabilities}
            scale={scale}
          />

          <TotalRow label="Total Liabilities" value={bs.totalLiabilities} scale={scale} />

          {/* ── Equity ─────────────────────────── */}
          <SectionHeader label="Equity" />
          <AccountLines lines={bs.equity} scale={scale} />
          <TotalRow label="Total Equity" value={bs.totalEquity} scale={scale} />

          {/* ── Total L + E ────────────────────── */}
          <TotalRow
            label="Total Liabilities & Equity"
            value={bs.totalLiabilitiesAndEquity}
            scale={scale}
          />
        </tbody>
      </table>
    </StatementPanel>
  )
}
