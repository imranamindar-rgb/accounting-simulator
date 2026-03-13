import { useEffect } from 'react'
import { CHAPTER_CONCEPTS } from '../../data/chapterConcepts'
import { FRAUD_CASES } from '../../data/fraudCases'
import { CHAPTER_TAKEAWAYS } from '../../data/chapterTakeaways'
import ConceptSlideViewer from '../../components/concepts/ConceptSlideViewer'
import { useProgressStore } from '../../store/progressStore'

export default function Zone1() {
  const chapterId = 12
  const markVisited = useProgressStore(s => s.markVisited)

  useEffect(() => {
    markVisited(chapterId, 1)
  }, [chapterId, markVisited])

  const slides = CHAPTER_CONCEPTS[chapterId] ?? []
  const fraudCases = FRAUD_CASES[chapterId] ?? []
  const skepticsLens = CHAPTER_TAKEAWAYS[chapterId]?.skepticsLens ?? []

  return (
    <ConceptSlideViewer
      slides={slides}
      fraudCases={fraudCases}
      skepticsLens={skepticsLens}
      chapterId={chapterId}
      zoneId={1}
    />
  )
}
