/**
 * Statement of Cash Flows component.
 *
 * Supports both indirect and direct method based on uiStore.cashFlowMethod.
 * Three sections: Operating, Investing, Financing.
 * Shows Net Change, Beginning Cash, and Ending Cash.
 */

import { useLedgerStore } from '../../store/ledgerStore'
import { useStatements } from '../../hooks/useStatements'
import { useUIStore } from '../../store/uiStore'
import StatementPanel from './StatementPanel'
import {
  LineItem,
  SectionHeader,
  SubtotalRow,
  TotalRow,
} from './LineItem'
function MethodBadge({ method }: { method: 'indirect' | 'direct' }) {
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{
        background: method === 'indirect' ? '#EBF5FF' : '#FEF3C7',
        color: method === 'indirect' ? '#1E40AF' : '#92400E',
      }}
    >
      {method === 'indirect' ? 'Indirect' : 'Direct'}
    </span>
  )
}

export default function CashFlowStatement() {
  const statements = useStatements()
  const scale = useLedgerStore((s) => s.selectedCompany?.scale ?? 'ones')
  const cashFlowMethod = useUIStore((s) => s.cashFlowMethod)

  const cf =
    cashFlowMethod === 'direct'
      ? statements.cashFlowDirect
      : statements.cashFlowStatement

  return (
    <StatementPanel
      title="Cash Flow Statement"
      subtitle="Statement of Cash Flows"
      headerRight={<MethodBadge method={cashFlowMethod} />}
      collapsible
    >
      <table className="w-full">
        <tbody>
          {/* ── Operating Activities ─────────── */}
          <SectionHeader label="Operating Activities" />
          {cf.operatingActivities.map((item, i) => (
            <LineItem
              key={`op-${i}`}
              label={item.label}
              value={item.amount}
              scale={scale}
              indent
            />
          ))}
          <SubtotalRow
            label="Net Cash from Operating"
            value={cf.totalOperating}
            scale={scale}
          />

          {/* ── Investing Activities ─────────── */}
          <SectionHeader label="Investing Activities" />
          {cf.investingActivities.map((item, i) => (
            <LineItem
              key={`inv-${i}`}
              label={item.label}
              value={item.amount}
              scale={scale}
              indent
            />
          ))}
          <SubtotalRow
            label="Net Cash from Investing"
            value={cf.totalInvesting}
            scale={scale}
          />

          {/* ── Financing Activities ─────────── */}
          <SectionHeader label="Financing Activities" />
          {cf.financingActivities.map((item, i) => (
            <LineItem
              key={`fin-${i}`}
              label={item.label}
              value={item.amount}
              scale={scale}
              indent
            />
          ))}
          <SubtotalRow
            label="Net Cash from Financing"
            value={cf.totalFinancing}
            scale={scale}
          />

          {/* ── Summary ─────────────────────── */}
          <TotalRow label="Net Change in Cash" value={cf.netChange} scale={scale} />

          <LineItem
            label="Beginning Cash"
            value={cf.beginningCash}
            scale={scale}
          />
          <TotalRow label="Ending Cash" value={cf.endingCash} scale={scale} />
        </tbody>
      </table>
    </StatementPanel>
  )
}
