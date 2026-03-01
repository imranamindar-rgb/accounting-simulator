/**
 * Main Statements Page -- 3-column layout.
 *
 * LEFT:   TransactionSidebar (always visible, record transactions)
 * CENTER: FlowDiagram at top, then statement grid / views below
 * RIGHT:  InsightSidebar (shows last transaction impact)
 */

import { useState } from 'react'
import { useLedgerStore } from '../store/ledgerStore'
import { useUIStore } from '../store/uiStore'
import BalanceSheet from '../components/statements/BalanceSheet'
import IncomeStatement from '../components/statements/IncomeStatement'
import CashFlowStatement from '../components/statements/CashFlowStatement'
import EquityStatement from '../components/statements/EquityStatement'
import RatioDashboard from '../components/analysis/RatioDashboard'
import FlowDiagram from '../components/flow/FlowDiagram'
import SimulationPlayer from '../components/simulation/SimulationPlayer'
import { MissionSidebar } from '../components/missions/MissionSidebar'
import { MissionRunner } from '../components/missions/MissionRunner'
import { CoachSidebar } from '../components/missions/CoachSidebar'
import TrialBalance from '../components/views/TrialBalance'
import TAccountView from '../components/views/TAccountView'
import GeneralLedger from '../components/views/GeneralLedger'
import { TransactionSidebar } from '../components/transaction/TransactionSidebar'
import { InsightSidebar } from '../components/transaction/InsightSidebar'
import type { RecordedTransaction } from '../components/transaction/TransactionSidebar'

/** Collapsible group heading for the 4 financial statements */
function StatementsGroup() {
  const collapsed = useUIStore((s) => s.statementsCollapsed)
  const toggle = useUIStore((s) => s.toggleStatementsCollapsed)

  return (
    <div
      className="rounded-lg shadow-sm overflow-hidden"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Group Header */}
      <div
        className="px-5 py-3 flex items-center justify-between cursor-pointer select-none"
        style={{
          borderBottom: collapsed ? 'none' : '1px solid var(--color-border)',
          background: 'linear-gradient(135deg, rgba(139,0,0,0.04) 0%, rgba(218,165,32,0.04) 100%)',
        }}
        onClick={toggle}
      >
        <div className="flex items-center gap-2">
          <span
            style={{
              display: 'inline-block',
              transition: 'transform 0.25s ease',
              transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
              fontSize: '0.7rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1,
            }}
          >
            ▼
          </span>
          <div>
            <h2
              className="text-lg font-semibold leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Financial Statements
            </h2>
            {!collapsed && (
              <p
                className="text-xs mt-0.5"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Balance Sheet · Income Statement · Cash Flow · Equity
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
          style={{
            background: 'var(--color-border)',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            border: 'none',
          }}
          onClick={(e) => {
            e.stopPropagation()
            toggle()
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-text-muted)'
            e.currentTarget.style.color = 'var(--color-surface)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-border)'
            e.currentTarget.style.color = 'var(--color-text-muted)'
          }}
        >
          {collapsed ? 'Expand' : 'Minimize'}
        </button>
      </div>

      {/* Statements content */}
      <div
        style={{
          overflow: 'hidden',
          transition: 'max-height 0.35s ease, opacity 0.25s ease',
          maxHeight: collapsed ? 0 : '10000px',
          opacity: collapsed ? 0 : 1,
        }}
      >
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BalanceSheet />
            <IncomeStatement />
            <CashFlowStatement />
            <EquityStatement />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Center content for the default "statements" view */
function StatementsCenter() {
  const learningMode = useUIStore((s) => s.learningMode)
  return (
    <div className="space-y-4">
      <FlowDiagram />
      {learningMode === 'sandbox' ? <SimulationPlayer /> : <MissionRunner />}
      <StatementsGroup />
      <RatioDashboard />
    </div>
  )
}

function MBAExecutiveCenter() {
  const viewMode = useUIStore((s) => s.viewMode)
  return (
    <div className="space-y-4">
      <FlowDiagram />
      <MissionRunner />
      {viewMode === 'statements' ? (
        <>
          <StatementsGroup />
          <RatioDashboard />
        </>
      ) : viewMode === 'trialBalance' ? (
        <TrialBalance />
      ) : viewMode === 'tAccounts' ? (
        <TAccountView />
      ) : viewMode === 'generalLedger' ? (
        <GeneralLedger />
      ) : (
        <>
          <StatementsGroup />
          <RatioDashboard />
        </>
      )}
    </div>
  )
}

/** Routes the center column based on viewMode */
function CenterContent() {
  const viewMode = useUIStore((s) => s.viewMode)
  const learningMode = useUIStore((s) => s.learningMode)

  // In MBA mode, missions should always stay visible even when the learner
  // toggles to supporting views (Trial Balance, T-Accounts, GL).
  if (learningMode === 'mba') {
    return <MBAExecutiveCenter />
  }

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
  const learningMode = useUIStore((s) => s.learningMode)

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

  return (
    <div
      className="flex"
      style={{ minHeight: 'calc(100vh - 120px)' }}
    >
      {/* ── LEFT: Sandbox Transactions or Missions ── */}
      <aside
        className="shrink-0 hidden md:block"
        style={{
          width: 280,
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {learningMode === 'sandbox' ? (
          <TransactionSidebar onRecorded={setLastRecorded} />
        ) : (
          <MissionSidebar />
        )}
      </aside>

      {/* ── CENTER: Main Content ── */}
      <main className="flex-1 min-w-0 overflow-y-auto p-4">
        <CenterContent />
      </main>

      {/* ── RIGHT: Insights or Coach ── */}
      <aside
        className="shrink-0 hidden md:block"
        style={{
          width: 300,
          background: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
        }}
      >
        {learningMode === 'sandbox' ? (
          <InsightSidebar lastRecorded={lastRecorded} />
        ) : (
          <CoachSidebar />
        )}
      </aside>
    </div>
  )
}
