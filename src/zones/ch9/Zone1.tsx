import { useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { CHAPTER_CONCEPTS } from '../../data/chapterConcepts'
import { FRAUD_CASES } from '../../data/fraudCases'
import { CHAPTER_TAKEAWAYS } from '../../data/chapterTakeaways'
import { getTextbookOrderedSlides } from '../../data/textbookSlideOrder'
import ConceptSlideViewer from '../../components/concepts/ConceptSlideViewer'
import { useProgressStore } from '../../store/progressStore'

export default function Zone1() {
  const { id = '1' } = useParams<{ id: string }>()
  const chapterId = Number(id)
  const markVisited = useProgressStore(s => s.markVisited)
  const isTextbook = useLocation().pathname.startsWith('/textbook')

  useEffect(() => {
    markVisited(chapterId, 1)
  }, [chapterId, markVisited])

  const rawSlides = CHAPTER_CONCEPTS[chapterId] ?? []
  const slides = isTextbook ? getTextbookOrderedSlides(chapterId, rawSlides) : rawSlides
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
