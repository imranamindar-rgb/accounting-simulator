import { useState } from 'react'
import type { FraudCase } from '../../data/conceptTypes'

interface FraudSpotlightProps {
  cases: FraudCase[]
}

const BIAS_COLORS: Record<string, { bg: string; text: string }> = {
  Incentive: { bg: '#7c2d12', text: '#ffffff' },
  Pressure: { bg: '#7c2d12', text: '#ffffff' },
  Opportunity: { bg: '#1e3a5f', text: '#ffffff' },
  Rationalization: { bg: '#1b4332', text: '#ffffff' },
  Greed: { bg: '#4a235a', text: '#ffffff' },
  Default: { bg: '#4a0a12', text: '#ffffff' },
}

function getBiasColor(bias: string): { bg: string; text: string } {
  for (const [key, value] of Object.entries(BIAS_COLORS)) {
    if (bias.toLowerCase().startsWith(key.toLowerCase())) return value
  }
  return BIAS_COLORS.Default
}

function FraudCard({ fraudCase }: { fraudCase: FraudCase }) {
  const [auditorOpen, setAuditorOpen] = useState(false)
  const biasColor = getBiasColor(fraudCase.bias)
  const biasLabel = fraudCase.bias.split('—')[0].trim().split(' ')[0]

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Card Header */}
      <div
        style={{
          background: 'var(--color-accent)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.2,
            }}
          >
            {fraudCase.company}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.7)',
              marginTop: '0.15rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {fraudCase.year}
          </div>
        </div>
        <span
          style={{
            background: biasColor.bg,
            color: biasColor.text,
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '0.2rem 0.5rem',
            borderRadius: '9999px',
            border: '1px solid rgba(255,255,255,0.25)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {biasLabel}
        </span>
      </div>

      {/* Card Body */}
      <div style={{ padding: '0.875rem 1rem', flex: 1 }}>
        <p
          style={{
            fontSize: '0.82rem',
            color: 'var(--color-text)',
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          {fraudCase.what}
        </p>
      </div>

      {/* Footer Rows */}
      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          padding: '0.75rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <FooterRow label="Concept Abused" value={fraudCase.conceptAbused} />
        <FooterRow label="Red Flag" value={fraudCase.redFlag} />
        <FooterRow label="Consequence" value={fraudCase.consequence} />
      </div>

      {/* Auditor Failure (collapsible) */}
      {fraudCase.auditorFailure && (
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <button
            type="button"
            onClick={() => setAuditorOpen(o => !o)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: auditorOpen ? 'rgba(74,10,18,0.06)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-accent)',
              textAlign: 'left',
            }}
          >
            <span>Auditor Failure</span>
            <span
              style={{
                fontSize: '0.7rem',
                color: 'var(--color-text-muted)',
                marginLeft: '0.5rem',
                transform: auditorOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                display: 'inline-block',
                transition: 'transform 0.2s',
              }}
            >
              &#9660;
            </span>
          </button>
          {auditorOpen && (
            <div
              style={{
                padding: '0 1rem 0.75rem',
                fontSize: '0.8rem',
                color: 'var(--color-text)',
                lineHeight: 1.6,
                background: 'rgba(74,10,18,0.03)',
              }}
            >
              {fraudCase.auditorFailure}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function FooterRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
      <span
        style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '0.78rem',
          color: 'var(--color-text)',
          lineHeight: 1.5,
        }}
      >
        {value}
      </span>
    </div>
  )
}

export default function FraudSpotlight({ cases }: FraudSpotlightProps) {
  if (cases.length === 0) return null

  return (
    <div>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.1rem',
          fontWeight: 700,
          color: 'var(--color-accent)',
          margin: '0 0 1rem',
        }}
      >
        Fraud Spotlight
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
        }}
      >
        {cases.map(c => (
          <FraudCard key={`${c.company}-${c.year}`} fraudCase={c} />
        ))}
      </div>
    </div>
  )
}
