import { CHAPTER_PROBLEMS } from '../../data/chapterProblems'
import ProblemShell from '../../components/practice/ProblemShell'

export default function Zone4() {
  const chapterId = 11
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
