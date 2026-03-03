import { useParams } from 'react-router-dom'
import { CHAPTER_PROBLEMS } from '../../data/chapterProblems'
import ProblemShell from '../../components/practice/ProblemShell'

export default function Zone3() {
  const { id = '1' } = useParams<{ id: string }>()
  const chapterId = Number(id)
  const problems = CHAPTER_PROBLEMS[chapterId]?.practice ?? []
  return (
    <ProblemShell
      problems={problems}
      zoneId={3}
      title="Practice Problems"
      subtitle="Apply the concepts from Zone 1 and your simulation experience. Earn full stars by answering without using hints."
    />
  )
}
