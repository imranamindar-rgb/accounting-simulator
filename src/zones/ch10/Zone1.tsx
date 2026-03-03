import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CHAPTER_CONCEPTS } from '../../data/chapterConcepts'
import { FRAUD_CASES } from '../../data/fraudCases'
import { CHAPTER_TAKEAWAYS } from '../../data/chapterTakeaways'
import ConceptSlideViewer from '../../components/concepts/ConceptSlideViewer'
import FraudTriangle from '../../components/forensics/FraudTriangle'
import { useProgressStore } from '../../store/progressStore'

export default function Zone1() {
  const { id = '1' } = useParams<{ id: string }>()
  const chapterId = Number(id)
  const markVisited = useProgressStore(s => s.markVisited)

  useEffect(() => {
    markVisited(chapterId, 1)
  }, [chapterId, markVisited])

  const slides = CHAPTER_CONCEPTS[chapterId] ?? []
  const fraudCases = FRAUD_CASES[chapterId] ?? []
  const skepticsLens = CHAPTER_TAKEAWAYS[chapterId]?.skepticsLens ?? []

  return (
    <div>
      <ConceptSlideViewer
        slides={slides}
        fraudCases={fraudCases}
        skepticsLens={skepticsLens}
        chapterId={chapterId}
        zoneId={1}
      />

      {/* Ch10 exclusive: interactive Fraud Triangle */}
      <div style={{ maxWidth: '720px', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
          Interactive Tool · Chapter 10
        </div>
        <h3 style={{ margin: '0 0 0.375rem', fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent)' }}>
          Fraud Triangle Explorer
        </h3>
        <p style={{ margin: '0 0 1.25rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
          Click each element to explore its indicators and real-world examples. Then analyze three major frauds through the triangle framework.
        </p>
        <FraudTriangle />
      </div>
    </div>
  )
}
