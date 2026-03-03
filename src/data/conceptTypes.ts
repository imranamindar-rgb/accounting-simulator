export interface DeepDive {
  body: string[]
  keyInsights: string[]
  realWorldExample: string
  commonMistakes: string[]
}

export interface FraudCase {
  company: string
  year: number
  what: string           // 2-3 sentence description
  conceptAbused: string  // direct tie to chapter topic
  bias: string           // from fraud triangle
  redFlag: string        // what should have been caught
  consequence: string    // regulatory/criminal/financial outcome
  auditorFailure?: string // what the auditor missed
}

export interface PredictionOption {
  id: string
  text: string
  correct: boolean
  explanation: string
}

export interface PredictionPromptData {
  question: string
  options: PredictionOption[]  // exactly 3
}

export interface ConceptSlide {
  id: string
  chapterId: number
  sectionLabel: string
  title: string
  explanation: string
  formula?: string        // LaTeX string e.g. "Assets = Liabilities + Equity"
  highlights?: string[]
  diagram?: string        // SVG string or description for placeholder
  deepDive?: DeepDive
  predictionPrompt?: PredictionPromptData
}

export interface ChapterConcepts {
  chapterId: number
  slides: ConceptSlide[]
  fraudCases: FraudCase[]
  skepticsLens: string[]   // 5 questions
  takeaways: { concept: string; insight: string; connection: string }[]
}
