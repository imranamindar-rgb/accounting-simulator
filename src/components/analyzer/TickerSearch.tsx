/**
 * TickerSearch -- search bar for the Live Company Analyzer.
 *
 * Orchestrates the full data fetch pipeline:
 *   lookupCIK → fetchCompanyFacts → buildStatementsFromFacts → calculateRatios
 * and stores results via analyzerStore.setResults().
 */

import { useState, type KeyboardEvent } from 'react'
import { lookupCIK, fetchCompanyFacts } from '../../engines/secClient'
import { buildStatementsFromFacts } from '../../data/xbrlTagMap'
import { calculateRatios } from '../../engines/RatioCalculator'
import { useAnalyzerStore } from '../../store/analyzerStore'

// ── Component ────────────────────────────────────────────────────────

export default function TickerSearch() {
  const [inputValue, setInputValue] = useState('')
  const { loading, error, setLoading, setError, setResults, setTicker } = useAnalyzerStore()

  async function handleSearch() {
    const ticker = inputValue.trim().toUpperCase()
    if (!ticker || loading) return

    setLoading(true)
    setError(null)
    setTicker(ticker)

    try {
      const lookup = await lookupCIK(ticker)
      if (!lookup) {
        setError(`Ticker "${ticker}" not found in SEC EDGAR.`)
        setLoading(false)
        return
      }

      const facts = await fetchCompanyFacts(lookup.cik)
      const { bs, is } = buildStatementsFromFacts(facts)
      const ratios = calculateRatios(bs, is)

      setResults({
        entityName: lookup.name,
        facts,
        bs,
        is,
        ratios,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const isDisabled = loading || inputValue.trim() === ''

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 10,
        padding: '20px 24px',
      }}
    >
      {/* Header */}
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.1rem',
          fontWeight: 600,
          color: 'var(--color-text)',
          marginBottom: 6,
        }}
      >
        Live Company Analyzer
      </h2>
      <p
        style={{
          fontSize: '0.8rem',
          color: 'var(--color-text-muted)',
          marginBottom: 16,
        }}
      >
        Enter a US stock ticker to pull 10-K data from SEC EDGAR and compute financial ratios.
      </p>

      {/* Search row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="e.g. AAPL"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          disabled={loading}
          maxLength={10}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1rem',
            padding: '8px 14px',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            background: 'var(--color-base)',
            color: 'var(--color-text)',
            width: 160,
            letterSpacing: '0.08em',
            outline: 'none',
            opacity: loading ? 0.6 : 1,
          }}
        />

        <button
          type="button"
          onClick={handleSearch}
          disabled={isDisabled}
          style={{
            padding: '8px 20px',
            borderRadius: 6,
            border: 'none',
            background: isDisabled ? 'var(--color-border)' : 'var(--color-accent)',
            color: isDisabled ? 'var(--color-text-muted)' : '#fff',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s ease',
            minWidth: 100,
          }}
        >
          {loading ? 'Loading...' : 'Analyze'}
        </button>

        {/* Inline error */}
        {error && (
          <span
            style={{
              fontSize: '0.82rem',
              color: '#C0392B',
              fontFamily: 'var(--font-body)',
            }}
          >
            {error}
          </span>
        )}
      </div>
    </div>
  )
}
