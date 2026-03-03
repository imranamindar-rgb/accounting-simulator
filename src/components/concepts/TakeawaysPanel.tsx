import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CHAPTER_TAKEAWAYS } from '../../data/chapterTakeaways'
import { useProgressStore } from '../../store/progressStore'

interface TakeawayCardProps {
  concept: string
  insight: string
  connection: string
  index: number
  color: string
}

function TakeawayCard({ concept, insight, connection, index, color }: TakeawayCardProps) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '0.75rem',
        overflow: 'hidden',
      }}
    >
      {/* Color bar + header */}
      <div
        style={{
          background: color + '12',
          borderBottom: `1px solid ${color}30`,
          padding: '0.875rem 1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.875rem',
        }}
      >
        <div
          style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '0.5rem',
            background: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: '#fff',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          {index + 1}
        </div>
        <h3
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: 'var(--color-text)',
            lineHeight: 1.35,
          }}
        >
          {concept}
        </h3>
      </div>

      {/* Body */}
      <div style={{ padding: '1.125rem 1.25rem' }}>
        <p
          style={{
            margin: '0 0 0.875rem',
            fontSize: '0.83rem',
            color: 'var(--color-text)',
            lineHeight: 1.75,
          }}
        >
          {insight}
        </p>

        {/* Connection badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            padding: '0.625rem 0.875rem',
            background: 'var(--color-base)',
            borderRadius: '0.375rem',
            border: '1px solid var(--color-border)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: color,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
              paddingTop: '1px',
            }}
          >
            Link →
          </span>
          <span
            style={{
              fontSize: '0.78rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.55,
            }}
          >
            {connection}
          </span>
        </div>
      </div>
    </div>
  )
}

interface SkepticsLensProps {
  questions: string[]
  color: string
}

function SkepticsLens({ questions, color }: SkepticsLensProps) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: `1px solid ${color}30`,
        borderRadius: '0.75rem',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '0.875rem 1.25rem',
          background: color + '10',
          borderBottom: `1px solid ${color}20`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
        }}
      >
        <span style={{ fontSize: '1rem' }}>🔍</span>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: color,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 700,
            }}
          >
            Skeptic&apos;s Lens
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>
            5 questions to ask about any financial statement
          </div>
        </div>
      </div>

      <ul
        style={{
          margin: 0,
          padding: '0.75rem 1.25rem 1rem',
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        {questions.map((q, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.625rem',
              fontSize: '0.82rem',
              color: 'var(--color-text)',
              lineHeight: 1.6,
            }}
          >
            <span
              style={{
                color: color,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                fontWeight: 700,
                paddingTop: '2px',
                flexShrink: 0,
              }}
            >
              Q{i + 1}
            </span>
            {q}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function TakeawaysPanel() {
  const { id = '1' } = useParams<{ id: string }>()
  const chapterId = Number(id)
  const data = CHAPTER_TAKEAWAYS[chapterId]
  const markVisited = useProgressStore(s => s.markVisited)

  useEffect(() => {
    markVisited(chapterId, 5)
  }, [chapterId, markVisited])

  if (!data) {
    return (
      <div style={{ padding: '2rem', color: 'var(--color-text-muted)' }}>
        Takeaways coming soon.
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '720px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: '0.375rem',
          }}
        >
          Zone 5 · Takeaways
        </div>
        <h2
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            fontWeight: 700,
            color: 'var(--color-accent)',
          }}
        >
          What You Should Remember
        </h2>
        <p
          style={{
            margin: '0.375rem 0 0',
            fontSize: '0.85rem',
            color: 'var(--color-text-muted)',
          }}
        >
          Three core insights from this chapter — and five questions to ask every time you read a financial statement.
        </p>
      </div>

      {/* Takeaway cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {data.takeaways.map((t, i) => (
          <TakeawayCard
            key={i}
            {...t}
            index={i}
            color={data.color}
          />
        ))}
      </div>

      {/* Skeptic's Lens */}
      <SkepticsLens questions={data.skepticsLens} color={data.color} />
    </div>
  )
}
