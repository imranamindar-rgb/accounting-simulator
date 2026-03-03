export interface ZoneDef {
  id: 1 | 2 | 3 | 4 | 5
  label: string
  icon: string
}

export interface ChapterDef {
  id: number
  slug: string
  title: string
  subtitle: string
  color: string
  zones: ZoneDef[]
}

export const ZONES: ZoneDef[] = [
  { id: 1, label: 'Concepts', icon: '📚' },
  { id: 2, label: 'Simulation', icon: '⚡' },
  { id: 3, label: 'Practice', icon: '✏️' },
  { id: 4, label: 'Mastery', icon: '🎯' },
  { id: 5, label: 'Takeaways', icon: '💡' },
]

export const CHAPTERS: ChapterDef[] = [
  {
    id: 1, slug: 'accounting-equation',
    title: 'The Accounting Equation',
    subtitle: 'Double Entry & T-Accounts',
    color: '#4A0A12', zones: ZONES,
  },
  {
    id: 2, slug: 'revenue-recognition',
    title: 'Revenue Recognition',
    subtitle: 'Accrual Accounting & Matching Principle',
    color: '#8B0000', zones: ZONES,
  },
  {
    id: 3, slug: 'inventory',
    title: 'Inventory Methods',
    subtitle: 'FIFO, LIFO & Weighted Average',
    color: '#92400E', zones: ZONES,
  },
  {
    id: 4, slug: 'depreciation',
    title: 'Long-Term Assets',
    subtitle: 'Depreciation & Capital Expenditure',
    color: '#1B4332', zones: ZONES,
  },
  {
    id: 5, slug: 'liabilities',
    title: 'Liabilities & Financing',
    subtitle: 'Off-Balance-Sheet & Debt Structures',
    color: '#1E3A5F', zones: ZONES,
  },
  {
    id: 6, slug: 'equity',
    title: 'Equity & EPS',
    subtitle: "Stockholders' Equity & Earnings Per Share",
    color: '#4A235A', zones: ZONES,
  },
  {
    id: 7, slug: 'cash-flow',
    title: 'Cash Flow Analysis',
    subtitle: 'Operating, Investing & Financing',
    color: '#006064', zones: ZONES,
  },
  {
    id: 8, slug: 'ratio-analysis',
    title: 'Ratio Analysis',
    subtitle: 'DuPont Decomposition & Financial Health',
    color: '#BF360C', zones: ZONES,
  },
  {
    id: 9, slug: 'ma-goodwill',
    title: 'M&A & Goodwill',
    subtitle: 'Business Combinations & Impairment',
    color: '#1A237E', zones: ZONES,
  },
  {
    id: 10, slug: 'fraud-detection',
    title: 'Fraud Detection',
    subtitle: 'Earnings Management & Forensic Accounting',
    color: '#212121', zones: ZONES,
  },
]
