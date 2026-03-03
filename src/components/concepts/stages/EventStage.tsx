import type { EventData } from '../TransactionAnimator'

interface EventStageProps {
  data: EventData
}

export default function EventStage({ data }: EventStageProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        minHeight: '10rem',
      }}
    >
      <div
        style={{
          border: '2px dashed var(--color-border)',
          borderRadius: '0.5rem',
          padding: '2rem 2.5rem',
          textAlign: 'center',
          background: 'var(--color-base)',
          maxWidth: '28rem',
          width: '100%',
        }}
      >
        <div
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)',
            marginBottom: '0.75rem',
          }}
        >
          Business Event
        </div>

        <div
          style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            color: 'var(--color-text)',
            fontFamily: 'var(--font-body)',
            marginBottom: '0.375rem',
          }}
        >
          {data.who}
        </div>

        <div
          style={{
            fontSize: '0.88rem',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.5,
            marginBottom: '1rem',
          }}
        >
          {data.what}
        </div>

        <div
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '-0.02em',
          }}
        >
          {data.amount}
        </div>
      </div>
    </div>
  )
}
