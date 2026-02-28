/**
 * Main Statements Page.
 *
 * Routes the view based on uiStore.viewMode:
 *   - 'statements'     → 2x2 grid of the 4 financial statement panels
 *   - 'trialBalance'   → TrialBalance component
 *   - 'tAccounts'      → TAccountView component
 *   - 'generalLedger'  → GeneralLedger component
 *
 * If no company is loaded, shows a centered prompt.
 */

import { useLedgerStore } from '../store/ledgerStore'
import { useUIStore } from '../store/uiStore'
import BalanceSheet from '../components/statements/BalanceSheet'
import IncomeStatement from '../components/statements/IncomeStatement'
import CashFlowStatement from '../components/statements/CashFlowStatement'
import EquityStatement from '../components/statements/EquityStatement'
import RatioDashboard from '../components/analysis/RatioDashboard'
import WhatIfMode from '../components/analysis/WhatIfMode'
import FlowDiagram from '../components/flow/FlowDiagram'
import TrialBalance from '../components/views/TrialBalance'
import TAccountView from '../components/views/TAccountView'
import GeneralLedger from '../components/views/GeneralLedger'

function StatementsGrid() {
  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BalanceSheet />
        <IncomeStatement />
        <CashFlowStatement />
        <EquityStatement />
      </div>
      <RatioDashboard />
      <FlowDiagram />
    </div>
  )
}

export default function StatementsPage() {
  const selectedCompany = useLedgerStore((s) => s.selectedCompany)
  const mode = useUIStore((s) => s.mode)
  const viewMode = useUIStore((s) => s.viewMode)

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

  // What-if mode replaces the normal statement grid
  if (mode === 'whatif') {
    return <WhatIfMode />
  }

  switch (viewMode) {
    case 'statements':
      return <StatementsGrid />
    case 'trialBalance':
      return (
        <div className="p-4">
          <TrialBalance />
        </div>
      )
    case 'tAccounts':
      return <TAccountView />
    case 'generalLedger':
      return (
        <div className="p-4">
          <GeneralLedger />
        </div>
      )
    default:
      return <StatementsGrid />
  }
}
