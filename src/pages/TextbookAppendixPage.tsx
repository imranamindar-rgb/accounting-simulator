import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTextbookAppendix } from '../data/textbookToc'

/* ------------------------------------------------------------------ */
/*  Appendix A — Time Value of Money Calculator                       */
/* ------------------------------------------------------------------ */

type TvmMode = 'fv' | 'pv' | 'annuity-fv' | 'annuity-pv'

function TVMCalculator() {
  const [mode, setMode] = useState<TvmMode>('fv')
  const [pv, setPv] = useState('')
  const [fv, setFv] = useState('')
  const [rate, setRate] = useState('')
  const [periods, setPeriods] = useState('')
  const [payment, setPayment] = useState('')
  const [result, setResult] = useState<{ value: number; formula: string; steps: string } | null>(null)

  function compute() {
    const r = parseFloat(rate) / 100
    const n = parseFloat(periods)

    if (isNaN(r) || isNaN(n) || n <= 0) {
      setResult(null)
      return
    }

    switch (mode) {
      case 'fv': {
        const pvVal = parseFloat(pv)
        if (isNaN(pvVal)) return
        const val = pvVal * Math.pow(1 + r, n)
        setResult({
          value: val,
          formula: 'FV = PV × (1 + r)^n',
          steps: `FV = ${pvVal.toLocaleString()} × (1 + ${r})^${n} = ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        })
        break
      }
      case 'pv': {
        const fvVal = parseFloat(fv)
        if (isNaN(fvVal)) return
        const val = fvVal / Math.pow(1 + r, n)
        setResult({
          value: val,
          formula: 'PV = FV / (1 + r)^n',
          steps: `PV = ${fvVal.toLocaleString()} / (1 + ${r})^${n} = ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        })
        break
      }
      case 'annuity-fv': {
        const pmt = parseFloat(payment)
        if (isNaN(pmt)) return
        const val = r === 0 ? pmt * n : pmt * ((Math.pow(1 + r, n) - 1) / r)
        setResult({
          value: val,
          formula: 'FV = PMT × [((1 + r)^n - 1) / r]',
          steps: `FV = ${pmt.toLocaleString()} × [((1 + ${r})^${n} - 1) / ${r}] = ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        })
        break
      }
      case 'annuity-pv': {
        const pmt = parseFloat(payment)
        if (isNaN(pmt)) return
        const val = r === 0 ? pmt * n : pmt * ((1 - Math.pow(1 + r, -n)) / r)
        setResult({
          value: val,
          formula: 'PV = PMT × [(1 - (1 + r)^-n) / r]',
          steps: `PV = ${pmt.toLocaleString()} × [(1 - (1 + ${r})^-${n}) / ${r}] = ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        })
        break
      }
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-base)',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.9rem',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    fontFamily: 'var(--font-mono)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '4px',
    display: 'block',
  }

  const modes: { key: TvmMode; label: string }[] = [
    { key: 'fv', label: 'Future Value' },
    { key: 'pv', label: 'Present Value' },
    { key: 'annuity-fv', label: 'Annuity FV' },
    { key: 'annuity-pv', label: 'Annuity PV' },
  ]

  return (
    <div>
      {/* Mode selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {modes.map(m => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); setResult(null) }}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              border: '1px solid var(--color-border)',
              transition: 'all 0.15s',
              background: mode === m.key ? '#00695C' : 'var(--color-surface)',
              color: mode === m.key ? 'white' : 'var(--color-text-muted)',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Input fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {(mode === 'fv') && (
          <div>
            <label style={labelStyle}>Present Value (PV)</label>
            <input type="number" value={pv} onChange={e => setPv(e.target.value)} placeholder="e.g. 1000" style={inputStyle} />
          </div>
        )}
        {(mode === 'pv') && (
          <div>
            <label style={labelStyle}>Future Value (FV)</label>
            <input type="number" value={fv} onChange={e => setFv(e.target.value)} placeholder="e.g. 1500" style={inputStyle} />
          </div>
        )}
        {(mode === 'annuity-fv' || mode === 'annuity-pv') && (
          <div>
            <label style={labelStyle}>Payment (PMT)</label>
            <input type="number" value={payment} onChange={e => setPayment(e.target.value)} placeholder="e.g. 200" style={inputStyle} />
          </div>
        )}
        <div>
          <label style={labelStyle}>Interest Rate (%)</label>
          <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="e.g. 5" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Number of Periods</label>
          <input type="number" value={periods} onChange={e => setPeriods(e.target.value)} placeholder="e.g. 10" style={inputStyle} />
        </div>
      </div>

      {/* Compute button */}
      <button
        onClick={compute}
        style={{
          padding: '10px 28px',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: 700,
          fontFamily: 'var(--font-body)',
          cursor: 'pointer',
          border: 'none',
          background: '#00695C',
          color: 'white',
          transition: 'all 0.15s',
        }}
      >
        Calculate
      </button>

      {/* Result */}
      {result && (
        <div
          className="mt-6 rounded-xl p-5"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            Formula
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--color-accent)', fontWeight: 600, marginBottom: '12px' }}>
            {result.formula}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            Computation
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--color-text)', marginBottom: '12px' }}>
            {result.steps}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            Result
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text)' }}>
            ${result.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Appendix B — Data Analytics for Accounting                        */
/* ------------------------------------------------------------------ */

function DataAnalyticsContent() {
  const sectionStyle: React.CSSProperties = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.25rem',
  }

  const headingStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--color-text)',
    margin: '0 0 8px',
  }

  const subheadStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.72rem',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '6px',
  }

  const bodyStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    color: 'var(--color-text)',
    lineHeight: 1.65,
  }

  const bulletStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    color: 'var(--color-text)',
    lineHeight: 1.7,
    paddingLeft: '1.25rem',
    margin: '8px 0 0',
  }

  return (
    <div>
      {/* Benford's Law */}
      <div style={sectionStyle}>
        <div style={subheadStyle}>Detection Technique</div>
        <h3 style={headingStyle}>Benford's Law</h3>
        <p style={bodyStyle}>
          Benford's Law predicts the frequency distribution of leading digits in naturally occurring datasets.
          In legitimate financial data, the digit 1 appears as the leading digit about 30% of the time, while 9
          appears only about 4.6% of the time. Deviations from this expected distribution can signal
          fabricated or manipulated figures.
        </p>
        <ul style={bulletStyle}>
          <li>Compare actual first-digit frequencies against the expected Benford distribution</li>
          <li>Flag accounts or journals where chi-squared tests show statistically significant deviation</li>
          <li>Most effective on large, unmanipulated datasets (revenue, expenses, population figures)</li>
          <li>Not applicable to constrained datasets (e.g., prices ending in .99, assigned numbers)</li>
        </ul>
      </div>

      {/* Ratio Analysis Automation */}
      <div style={sectionStyle}>
        <div style={subheadStyle}>Efficiency Technique</div>
        <h3 style={headingStyle}>Ratio Analysis Automation</h3>
        <p style={bodyStyle}>
          Automating ratio analysis allows auditors and analysts to continuously monitor financial health
          indicators across multiple periods and peer companies. Rather than computing ratios manually
          each quarter, automated systems can flag anomalies in real time.
        </p>
        <ul style={bulletStyle}>
          <li>Track liquidity ratios (current ratio, quick ratio) over rolling quarters</li>
          <li>Compare profitability metrics (ROA, ROE, margins) against industry benchmarks</li>
          <li>Alert on sudden changes in days sales outstanding or inventory turnover</li>
          <li>Integrate with dashboards for executive-level KPI monitoring</li>
        </ul>
      </div>

      {/* Journal Entry Testing */}
      <div style={sectionStyle}>
        <div style={subheadStyle}>Audit Technique</div>
        <h3 style={headingStyle}>Journal Entry Testing</h3>
        <p style={bodyStyle}>
          Journal entry testing uses data analytics to identify unusual or potentially fraudulent entries in the
          general ledger. Auditing standards require auditors to test journal entries as part of fraud
          risk assessment procedures.
        </p>
        <ul style={bulletStyle}>
          <li>Filter entries posted by unusual users (non-accounting personnel, executives)</li>
          <li>Identify entries posted on weekends, holidays, or outside business hours</li>
          <li>Flag round-number entries or entries just below materiality thresholds</li>
          <li>Detect entries with unusual account combinations (e.g., revenue with a debit to an asset account not typically paired)</li>
          <li>Look for reversals posted near period-end that lack business justification</li>
        </ul>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Appendix Page                                                */
/* ------------------------------------------------------------------ */

export default function TextbookAppendixPage() {
  const { id = 'A' } = useParams<{ id: string }>()
  const appendix = getTextbookAppendix(id)

  if (!appendix) {
    return <div className="p-8" style={{ color: 'var(--color-text-muted)' }}>Appendix not found.</div>
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-base)' }}>
      {/* Header */}
      <div
        className="px-6 py-4 pl-16"
        style={{ background: appendix.color, color: 'white' }}
      >
        <div style={{ fontSize: '0.7rem', opacity: 0.7, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
          Appendix {appendix.id}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, margin: '2px 0 0', color: 'white' }}>
          {appendix.title}
        </h1>
        <p style={{ fontSize: '0.82rem', opacity: 0.8, margin: '2px 0 0' }}>
          {appendix.subtitle}
        </p>
      </div>

      {/* Breadcrumb */}
      <div className="px-6 py-3 pl-16" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        <Link
          to="/textbook"
          style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}
        >
          &larr; Back to Textbook Home
        </Link>
      </div>

      {/* Content */}
      <div className="px-6 py-6 max-w-5xl mx-auto">
        {id === 'A' ? <TVMCalculator /> : <DataAnalyticsContent />}
      </div>
    </div>
  )
}
