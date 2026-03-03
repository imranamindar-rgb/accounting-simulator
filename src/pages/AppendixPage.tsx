import { useParams, Link } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { FRAUD_CASES } from '../data/fraudCases'
import { CHAPTERS } from '../data/toc'
import { SAMPLE_COMPANIES } from '../data/sampleCompanies'
import { useLedgerStore } from '../store/ledgerStore'
import SimulationPlayer from '../components/simulation/SimulationPlayer'

// Simulation components
import AccountingEquationBalancer from '../components/simulations/AccountingEquationBalancer'
import RevenueRecognitionTimer from '../components/simulations/RevenueRecognitionTimer'
import InventoryCostComparator from '../components/simulations/InventoryCostComparator'
import DepreciationScheduleBuilder from '../components/simulations/DepreciationScheduleBuilder'
import CovenantStressTester from '../components/simulations/CovenantStressTester'
import EPSDilutionCalculator from '../components/simulations/EPSDilutionCalculator'
import CFOBridgeBuilder from '../components/simulations/CFOBridgeBuilder'
import DuPontExplorer from '../components/simulations/DuPontExplorer'
import PPACalculator from '../components/simulations/PPACalculator'
import BenfordDetector from '../components/simulations/BenfordDetector'

const StatementsPage = lazy(() => import('./StatementsPage'))

const SIM_CHAPTERS = [
  { id: 1, title: 'Accounting Equation', component: <AccountingEquationBalancer /> },
  { id: 2, title: 'Revenue Recognition', component: <RevenueRecognitionTimer /> },
  { id: 3, title: 'Inventory', component: <InventoryCostComparator /> },
  { id: 4, title: 'Fixed Assets', component: <DepreciationScheduleBuilder /> },
  { id: 5, title: 'Liabilities', component: <CovenantStressTester /> },
  { id: 6, title: 'Equity & EPS', component: <EPSDilutionCalculator /> },
  { id: 7, title: 'Cash Flow', component: <CFOBridgeBuilder /> },
  { id: 8, title: 'Ratio Analysis', component: <DuPontExplorer /> },
  { id: 9, title: 'M&A Accounting', component: <PPACalculator /> },
  { id: 10, title: 'Fraud Detection', component: <BenfordDetector /> },
]

function SectionHeader({ label, title, subtitle }: { label: string; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>{label}</div>
      <h2 style={{ margin: '0 0 0.25rem', fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-accent)' }}>{title}</h2>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{subtitle}</p>
    </div>
  )
}

function AppendixNav({ current }: { current: string }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
      {[
        { id: '1', label: 'A1 · All Simulations' },
        { id: '2', label: 'A2 · Case Library' },
        { id: '3', label: 'A3 · Statements Simulator' },
        { id: '4', label: 'A4 · Transaction Flow' },
      ].map(({ id, label }) => (
        <Link key={id} to={`/appendix/${id}`}
          style={{ padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', background: current === id ? 'var(--color-accent)' : 'var(--color-surface)', color: current === id ? '#fff' : 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textDecoration: 'none', fontWeight: 600 }}>
          {label}
        </Link>
      ))}
    </div>
  )
}

function A1Simulations() {
  return (
    <div>
      <SectionHeader label="Appendix 1" title="All Simulations" subtitle="Every chapter's interactive simulation on one page — use as a reference tool during case analysis." />
      {SIM_CHAPTERS.map(({ id, title, component }) => {
        const ch = CHAPTERS.find(c => c.id === id)
        return (
          <div key={id} style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Ch{id}</span>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: ch?.color ?? 'var(--color-accent)' }}>{title}</h3>
              <Link to={`/chapter/${id}/zone/2`} style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                Open in chapter →
              </Link>
            </div>
            {component}
          </div>
        )
      })}
    </div>
  )
}

function A2Cases() {
  return (
    <div>
      <SectionHeader label="Appendix 2" title="Case Library" subtitle="All fraud cases from every chapter. Each case illustrates how accounting concepts were weaponized — and how they were eventually uncovered." />
      {CHAPTERS.map(ch => {
        const cases = FRAUD_CASES[ch.id] ?? []
        if (cases.length === 0) return null
        return (
          <div key={ch.id} style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: ch.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', fontWeight: 700 }}>
              Ch{ch.id} · {ch.title}
            </div>
            {cases.map((c, i) => (
              <div key={i} style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem', background: 'var(--color-surface)', border: `1px solid ${ch.color}20`, borderLeft: `3px solid ${ch.color}`, borderRadius: '0 0.625rem 0.625rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>{c.company}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>{c.year}</span>
                </div>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: 'var(--color-text)', lineHeight: 1.65 }}>{c.what}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {[
                    { label: 'Concept Abused', val: c.conceptAbused, color: '#dc2626' },
                    { label: 'Red Flag', val: c.redFlag, color: '#d97706' },
                    { label: 'Consequence', val: c.consequence, color: '#1b4332' },
                    { label: 'Auditor Failure', val: c.auditorFailure, color: '#6366f1' },
                  ].filter(x => x.val).map(({ label, val, color }) => (
                    <div key={label}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem', fontWeight: 700 }}>{label}</div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.55 }}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

function A3Statements() {
  const selectedCompany = useLedgerStore(s => s.selectedCompany)
  const initFromCompany = useLedgerStore(s => s.initFromCompany)

  // Auto-initialize with Blank Company so the full simulator shows immediately
  useEffect(() => {
    if (!selectedCompany) {
      initFromCompany(SAMPLE_COMPANIES[0])
    }
  }, [selectedCompany, initFromCompany])

  return (
    <Suspense fallback={<div style={{ color: 'var(--color-text-muted)', padding: '2rem 2rem' }}>Loading simulator…</div>}>
      <StatementsPage />
    </Suspense>
  )
}

export default function AppendixPage() {
  const { id = '1' } = useParams<{ id: string }>()

  return (
    <div className="min-h-screen pl-0 pt-12" style={{ background: 'var(--color-base)' }}>
      {/* Header + nav always constrained */}
      <div className="px-8 py-8 max-w-5xl mx-auto">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>
          EMBA · Financial Accounting
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-accent)', margin: '0 0 1.5rem' }}>
          Appendix
        </h1>
        <AppendixNav current={id} />
      </div>

      {/* A1 and A2 stay constrained; A3 gets full width for 3-column layout */}
      {id === '1' && <div className="px-8 pb-12 max-w-5xl mx-auto"><A1Simulations /></div>}
      {id === '2' && <div className="px-8 pb-12 max-w-5xl mx-auto"><A2Cases /></div>}
      {id === '3' && (
        <div className="pb-12">
          <div className="px-8 max-w-5xl mx-auto mb-2">
            <SectionHeader label="Appendix 3" title="Financial Statements Simulator" subtitle="Enter transactions and watch them trace through the Income Statement, Balance Sheet, Cash Flow, and Equity Statement simultaneously." />
          </div>
          <A3Statements />
        </div>
      )}
      {id === '4' && (
        <div className="px-8 pb-12 max-w-5xl mx-auto">
          <SectionHeader label="Appendix 4" title="Transaction Flow Simulation" subtitle="Choose a scenario to see step-by-step how a transaction flows through all four financial statements." />
          <SimulationPlayer />
        </div>
      )}
    </div>
  )
}
