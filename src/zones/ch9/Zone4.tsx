import { useParams } from 'react-router-dom'
import { CHAPTER_PROBLEMS } from '../../data/chapterProblems'
import ProblemShell from '../../components/practice/ProblemShell'

export default function Zone4() {
  const { id = '1' } = useParams<{ id: string }>()
  const chapterId = Number(id)
  const problems = CHAPTER_PROBLEMS[chapterId]?.mastery ?? []
  return (
    <ProblemShell
      problems={problems}
      zoneId={4}
      title="Mastery Challenge"
      subtitle="Advanced problems combining multiple concepts and real-world case analysis. These require synthesizing everything from the chapter."
    />
  )
}
