/**
 * Main Statements Page -- 3-column layout.
 *
 * LEFT:   TransactionSidebar (always visible, record transactions)
 * CENTER: FlowDiagram at top, then statement grid / views below
 * RIGHT:  InsightSidebar (shows last transaction impact)
 *
 * In What-If mode the center replaces with the WhatIfMode editor.
 */

import { useState } from 'react'
import { useLedgerStore } from '../store/ledgerStore'
import { useUIStore } from '../store/uiStore'
import BalanceSheet from '../components/statements/BalanceSheet'
import IncomeStatement from '../components/statements/IncomeStatement'
import CashFlowStatement from '../components/statements/CashFlowStatement'
import EquityStatement from '../components/statements/EquityStatement'
import RatioDashboard from '../components/analysis/RatioDashboard'
import WhatIfMode from '../components/analysis/WhatIfMode'
import FlowDiagram from '../components/flow/FlowDiagram'
import SimulationPlayer from '../components/simulation/SimulationPlayer'
import TrialBalance from '../components/views/TrialBalance'
import TAccountView from '../components/views/TAccountView'
import GeneralLedger from '../components/views/GeneralLedger'
import { TransactionSidebar } from '../components/transaction/TransactionSidebar'
import { InsightSidebar } from '../components/transaction/InsightSidebar'
import type { RecordedTransaction } from '../components/transaction/TransactionSidebar'

/** Center content for the default "statements" view */
function StatementsCenter() {
  return (
    <div className="space-y-4">
      <FlowDiagram />
      <SimulationPlayer />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BalanceSheet />
        <IncomeStatement />
        <CashFlowStatement />
        <EquityStatement />
      </div>
      <RatioDashboard />
    </div>
  )
}

/** Routes the center column based on viewMode */
function CenterContent() {
  const viewMode = useUIStore((s) => s.viewMode)

  switch (viewMode) {
    case 'statements':
      return <StatementsCenter />
    case 'trialBalance':
      return <TrialBalance />
    case 'tAccounts':
      return <TAccountView />
    case 'generalLedger':
      return <GeneralLedger />
    default:
      return <StatementsCenter />
  }
}

export default function StatementsPage() {
  const selectedCompany = useLedgerStore((s) => s.selectedCompany)
  const mode = useUIStore((s) => s.mode)

  const [lastRecorded, setLastRecorded] = useState<RecordedTransaction | null>(null)

  if (!selectedCompany) {
    return (
      <div
        className="flex items-center justify-center h-64"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <p className="text-lg">Select a company from the toolbar to begin</p>
      </div>
    )
  }

  // What-if mode replaces only the center column
  if (mode === 'whatif') {
    return <WhatIfMode />
  }

  return (
    <div
      className="flex"
      style={{ minHeight: 'calc(100vh - 120px)' }}
    >
      {/* ── LEFT: Transaction Sidebar ── */}
      <aside
        className="shrink-0 hidden md:block"
        style={{
          width: 280,
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        <TransactionSidebar onRecorded={setLastRecorded} />
      </aside>

      {/* ── CENTER: Main Content ── */}
      <main className="flex-1 min-w-0 overflow-y-auto p-4">
        <CenterContent />
      </main>

      {/* ── RIGHT: Insights Sidebar ── */}
      <aside
        className="shrink-0 hidden md:block"
        style={{
          width: 300,
          background: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
        }}
      >
        <InsightSidebar lastRecorded={lastRecorded} />
      </aside>
    </div>
  )
}
