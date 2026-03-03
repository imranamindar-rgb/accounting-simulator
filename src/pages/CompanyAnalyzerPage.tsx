import { useState } from 'react'
import { useAnalyzerStore } from '../store/analyzerStore'
import TickerSearch from '../components/analyzer/TickerSearch'
import CompanyStatements from '../components/analyzer/CompanyStatements'
import CompanyRatios from '../components/analyzer/CompanyRatios'
import CompanyDuPont from '../components/analyzer/CompanyDuPont'
import CompanyForensics from '../components/analyzer/CompanyForensics'

type Tab = 'statements' | 'ratios' | 'dupont' | 'forensics'

export default function CompanyAnalyzerPage() {
  const [tab, setTab] = useState<Tab>('statements')
  const entityName = useAnalyzerStore(s => s.entityName)
  const ticker = useAnalyzerStore(s => s.ticker)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'statements', label: 'Statements' },
    { key: 'ratios', label: 'Ratios' },
    { key: 'dupont', label: 'DuPont' },
    { key: 'forensics', label: 'Forensics' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" style={{ fontFamily: 'var(--font-body)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent)', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
        Company Analyzer
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', margin: '0 0 1.5rem' }}>
        Analyze real SEC filings with the same engines used throughout the course
      </p>

      <TickerSearch />

      {entityName && (
        <>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem' }}>
            {entityName} <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>({ticker})</span>
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid var(--color-border)', marginBottom: '1.5rem' }}>
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: '0.5rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontSize: '0.82rem', fontWeight: 600,
                  color: tab === t.key ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  borderBottom: tab === t.key ? '2px solid var(--color-accent)' : '2px solid transparent',
                  marginBottom: '-2px',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'statements' && <CompanyStatements />}
          {tab === 'ratios' && <CompanyRatios />}
          {tab === 'dupont' && <CompanyDuPont />}
          {tab === 'forensics' && <CompanyForensics />}
        </>
      )}
    </div>
  )
}
