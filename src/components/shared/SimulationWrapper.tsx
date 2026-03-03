import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useProgressStore } from '../../store/progressStore'
import { CHAPTERS } from '../../data/toc'

interface SimulationWrapperProps {
  title: string
  description: string
  children: React.ReactNode
}

export default function SimulationWrapper({ title, description, children }: SimulationWrapperProps) {
  const { id = '1' } = useParams<{ id: string }>()
  const chapterId = Number(id)
  const chapter = CHAPTERS.find(c => c.id === chapterId)
  const markVisited = useProgressStore(s => s.markVisited)
  const recordAttempt = useProgressStore(s => s.recordAttempt)

  useEffect(() => {
    markVisited(chapterId, 2)
  }, [chapterId, markVisited])

  const handleComplete = () => {
    recordAttempt(chapterId, 2, true, 0)
  }

  const color = chapter?.color ?? 'var(--color-accent)'

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Zone header */}
      <div
        style={{
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: '0.25rem',
          }}
        >
          Zone 2 · Simulation
        </div>
        <h2
          style={{
            margin: '0 0 0.375rem',
            fontFamily: 'var(--font-display)',
            fontSize: '1.3rem',
            fontWeight: 700,
            color: 'var(--color-accent)',
          }}
        >
          {title}
        </h2>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          {description}
        </p>
      </div>

      {/* Simulation content */}
      <div>{children}</div>

      {/* Mark complete button */}
      <div style={{ marginTop: '1.5rem' }}>
        <button
          onClick={handleComplete}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: color,
            color: '#fff',
            fontFamily: 'var(--font-body)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Mark Simulation Complete ★★★
        </button>
      </div>
    </div>
  )
}
