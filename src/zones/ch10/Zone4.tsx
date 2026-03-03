import { useParams } from 'react-router-dom'
import { CHAPTER_PROBLEMS } from '../../data/chapterProblems'
import ProblemShell from '../../components/practice/ProblemShell'
import EarningsQualityScore from '../../components/forensics/EarningsQualityScore'
import ConsequenceMap from '../../components/forensics/ConsequenceMap'

export default function Zone4() {
  const { id = '1' } = useParams<{ id: string }>()
  const chapterId = Number(id)
  const problems = CHAPTER_PROBLEMS[chapterId]?.mastery ?? []

  const isCh10 = chapterId === 10

  return (
    <div>
      <ProblemShell
        problems={problems}
        zoneId={4}
        title="Mastery Challenge"
        subtitle="Advanced problems combining multiple concepts and real-world case analysis. These require synthesizing everything from the chapter."
      />

      {isCh10 && (
        <>
          <div style={{ marginTop: '2.5rem', marginBottom: '0.75rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>
              Capstone Tool · Earnings Quality
            </div>
            <h2 style={{ margin: '0 0 0.25rem', fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-accent)' }}>
              Earnings Quality Scorecard
            </h2>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Rate a company across nine forensic dimensions. Your composite score benchmarks earnings quality against EMBA-grade analyst standards.
            </p>
            <EarningsQualityScore />
          </div>

          <div style={{ marginTop: '2.5rem', marginBottom: '0.75rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>
              Capstone Tool · Consequence Map
            </div>
            <h2 style={{ margin: '0 0 0.25rem', fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-accent)' }}>
              Cross-Chapter Consequence Map
            </h2>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Explore how manipulation in one accounting area propagates across financial statements. Every fraud leaves a trail through multiple chapters.
            </p>
            <ConsequenceMap />
          </div>
        </>
      )}
    </div>
  )
}
