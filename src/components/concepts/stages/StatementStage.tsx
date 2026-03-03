import type { StatementData, StatementLine } from '../TransactionAnimator'

interface StatementStageProps {
  data: StatementData
}

function formatAmount(n: number): string {
  if (n < 0) {
    return `(${Math.abs(n).toLocaleString('en-US')})`
  }
  return n.toLocaleString('en-US')
}

function StatementLineItem({ line }: { line: StatementLine }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: line.highlight ? '0.3rem 0.5rem' : '0.25rem 0.5rem',
        borderRadius: line.highlight ? '0.25rem' : 0,
        background: line.highlight ? 'rgba(74,10,18,0.07)' : 'transparent',
        fontWeight: line.highlight ? 700 : 400,
        marginBottom: '0.15rem',
      }}
    >
      <span
        style={{
          fontSize: '0.83rem',
          fontFamily: 'var(--font-body)',
          color: line.highlight ? 'var(--color-accent)' : 'var(--color-text)',
        }}
      >
        {line.label}
      </span>
      <span
        style={{
          fontSize: '0.83rem',
          fontFamily: 'var(--font-mono)',
          color: line.highlight ? 'var(--color-accent)' : 'var(--color-text)',
          fontWeight: line.highlight ? 700 : 500,
          letterSpacing: '-0.01em',
        }}
      >
        {formatAmount(line.value)}
      </span>
    </div>
  )
}

export default function StatementStage({ data }: StatementStageProps) {
  return (
    <div style={{ padding: '0.5rem 0' }}>
      {/* Statement header */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '1rem',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '0.2rem 0.75rem',
            background: 'var(--color-accent)',
            borderRadius: '9999px',
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#fff',
            fontFamily: 'var(--font-mono)',
            marginBottom: '0.5rem',
          }}
        >
          {data.type === 'BS' ? 'Balance Sheet' : 'Income Statement'}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--color-text)',
          }}
        >
          {data.title}
        </div>
      </div>

      {/* Sections */}
      <div
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: '0.375rem',
          overflow: 'hidden',
        }}
      >
        {data.sections.map((section, si) => (
          <div key={si}>
            {/* Section heading */}
            <div
              style={{
                padding: '0.4rem 0.75rem',
                background: 'var(--color-base)',
                borderBottom: '1px solid var(--color-border)',
                borderTop: si > 0 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <div
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {section.heading}
              </div>
            </div>

            {/* Lines */}
            <div
              style={{
                padding: '0.5rem 0.25rem',
                background: 'var(--color-surface)',
              }}
            >
              {section.lines.map((line, li) => (
                <StatementLineItem key={li} line={line} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
