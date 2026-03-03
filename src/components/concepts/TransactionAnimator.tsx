import { useState } from 'react'
import EventStage from './stages/EventStage'
import JournalStage from './stages/JournalStage'
import TAccountStage from './stages/TAccountStage'
import StatementStage from './stages/StatementStage'

// ---- Exported Type Definitions ----

export interface EventData {
  who: string
  what: string
  amount: string
}

export interface JournalEntry {
  account: string
  debit?: number
  credit?: number
}

export interface JournalData {
  date: string
  entries: JournalEntry[]
  memo: string
}

export interface TAccountData {
  accounts: {
    name: string
    debits: number[]
    credits: number[]
  }[]
}

export interface StatementLine {
  label: string
  value: number
  highlight?: boolean
}

export interface StatementData {
  type: 'BS' | 'IS'
  title: string
  sections: {
    heading: string
    lines: StatementLine[]
  }[]
}

export type AnimationStage =
  | { type: 'event'; title: string; description: string; data: EventData }
  | { type: 'journal'; title: string; description: string; data: JournalData }
  | { type: 'taccount'; title: string; description: string; data: TAccountData }
  | { type: 'statement'; title: string; description: string; data: StatementData }

export interface AnimationSequence {
  stages: AnimationStage[]
}

// ---- Stage label mapping ----

const STAGE_LABELS: Record<AnimationStage['type'], string> = {
  event: 'Business Event',
  journal: 'Journal Entry',
  taccount: 'T-Accounts',
  statement: 'Financial Statement',
}

// ---- Stage renderer ----

function StageRenderer({ stage }: { stage: AnimationStage }) {
  if (stage.type === 'event') return <EventStage data={stage.data} />
  if (stage.type === 'journal') return <JournalStage data={stage.data} />
  if (stage.type === 'taccount') return <TAccountStage data={stage.data} />
  if (stage.type === 'statement') return <StatementStage data={stage.data} />
  return null
}

// ---- Main Component ----

interface TransactionAnimatorProps {
  sequence: AnimationSequence
}

export default function TransactionAnimator({ sequence }: TransactionAnimatorProps) {
  const [step, setStep] = useState(0)
  const { stages } = sequence
  const total = stages.length
  const current = stages[step]
  const isFirst = step === 0
  const isLast = step === total - 1

  return (
    <div
      style={{
        fontFamily: 'var(--font-body)',
        border: '1px solid var(--color-border)',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        background: 'var(--color-surface)',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-base)',
          gap: '0.75rem',
        }}
      >
        {/* Prev button */}
        <button
          type="button"
          disabled={isFirst}
          onClick={() => setStep(s => Math.max(0, s - 1))}
          style={{
            padding: '0.375rem 0.875rem',
            background: isFirst ? 'var(--color-base)' : 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.375rem',
            cursor: isFirst ? 'not-allowed' : 'pointer',
            fontSize: '0.78rem',
            color: isFirst ? 'var(--color-text-muted)' : 'var(--color-text)',
            fontFamily: 'var(--font-body)',
            flexShrink: 0,
          }}
        >
          Prev
        </button>

        {/* Title + step indicator */}
        <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono)',
              marginBottom: '0.15rem',
            }}
          >
            {STAGE_LABELS[current.type]}
          </div>
          <div
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: 'var(--color-text)',
              fontFamily: 'var(--font-body)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {current.title}
          </div>
          <div
            style={{
              fontSize: '0.67rem',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono)',
              marginTop: '0.1rem',
            }}
          >
            Step {step + 1} of {total}
          </div>
        </div>

        {/* Next button */}
        <button
          type="button"
          disabled={isLast}
          onClick={() => setStep(s => Math.min(total - 1, s + 1))}
          style={{
            padding: '0.375rem 0.875rem',
            background: isLast ? 'var(--color-base)' : 'var(--color-accent)',
            border: `1px solid ${isLast ? 'var(--color-border)' : 'var(--color-accent)'}`,
            borderRadius: '0.375rem',
            cursor: isLast ? 'not-allowed' : 'pointer',
            fontSize: '0.78rem',
            color: isLast ? 'var(--color-text-muted)' : '#ffffff',
            fontFamily: 'var(--font-body)',
            fontWeight: isLast ? 400 : 600,
            flexShrink: 0,
          }}
        >
          Next
        </button>
      </div>

      {/* Description */}
      <div
        style={{
          padding: '0.75rem 1.25rem 0',
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)',
          lineHeight: 1.6,
        }}
      >
        {current.description}
      </div>

      {/* Stage content */}
      <div style={{ padding: '0 1.25rem 1rem' }}>
        <StageRenderer stage={current} />
      </div>

      {/* Dot indicators */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.4rem',
          alignItems: 'center',
          padding: '0 1rem 1rem',
          borderTop: '1px solid var(--color-border)',
          paddingTop: '0.75rem',
        }}
      >
        {stages.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStep(i)}
            style={{
              width: i === step ? '1.5rem' : '0.5rem',
              height: '0.5rem',
              borderRadius: '9999px',
              background: i === step ? 'var(--color-accent)' : 'var(--color-border)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.2s',
            }}
            aria-label={`Go to step ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
