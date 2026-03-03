import { useParams } from 'react-router-dom'
import { CHAPTER_PROBLEMS } from '../../data/chapterProblems'
import ProblemShell from '../../components/practice/ProblemShell'
import RedFlagChecklist from '../../components/forensics/RedFlagChecklist'

export default function Zone3() {
  const { id = '1' } = useParams<{ id: string }>()
  const chapterId = Number(id)
  const problems = CHAPTER_PROBLEMS[chapterId]?.practice ?? []

  return (
    <div>
      <ProblemShell
        problems={problems}
        zoneId={3}
        title="Practice Problems"
        subtitle="Apply fraud detection concepts to realistic scenarios. Earn full stars by answering without using hints."
      />

      {/* Ch10 exclusive: Red Flag Checklist */}
      <div style={{ maxWidth: '720px', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
          Interactive Tool · Chapter 10
        </div>
        <h3 style={{ margin: '0 0 0.375rem', fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent)' }}>
          25-Point Red Flag Checklist
        </h3>
        <p style={{ margin: '0 0 1.25rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
          Check each red flag present in a company you are analyzing. The tool calculates overall risk level and severity-weighted assessment.
        </p>
        <RedFlagChecklist />
      </div>
    </div>
  )
}
