import { ZONES } from './toc'
import type { ZoneDef } from './toc'

export interface TextbookChapter {
  tbId: number          // Textbook chapter number (1-12)
  dataChapterId: number // Maps to internal data chapter ID (1-13)
  title: string         // Book chapter title
  subtitle: string      // Brief description
  color: string         // Accent color
  zones: ZoneDef[]
}

export interface TextbookAppendix {
  id: string            // 'A' or 'B'
  title: string
  subtitle: string
  color: string
}

/**
 * Maps textbook chapters (Hanlon et al. "Financial Accounting" 6th Ed.)
 * to internal data chapter IDs.
 *
 * Existing chapters 1-10 are reused where content maps.
 * New chapters use IDs 11-13 to avoid collisions.
 */
export const TEXTBOOK_CHAPTERS: TextbookChapter[] = [
  {
    tbId: 1, dataChapterId: 1,
    title: 'Introducing Financial Accounting',
    subtitle: 'The Accounting Equation & Double Entry',
    color: '#4A0A12', zones: ZONES,
  },
  {
    tbId: 2, dataChapterId: 11,
    title: 'Constructing Financial Statements',
    subtitle: 'Balance Sheet, Income Statement & Statement of Equity',
    color: '#7B2D26', zones: ZONES,
  },
  {
    tbId: 3, dataChapterId: 12,
    title: 'Adjusting Accounts for Financial Statements',
    subtitle: 'Adjusting Entries, Trial Balance & Closing',
    color: '#5C4033', zones: ZONES,
  },
  {
    tbId: 4, dataChapterId: 7,
    title: 'Reporting and Analyzing Cash Flows',
    subtitle: 'Operating, Investing & Financing Activities',
    color: '#006064', zones: ZONES,
  },
  {
    tbId: 5, dataChapterId: 8,
    title: 'Analyzing and Interpreting Financial Statements',
    subtitle: 'DuPont Decomposition & Ratio Analysis',
    color: '#BF360C', zones: ZONES,
  },
  {
    tbId: 6, dataChapterId: 2,
    title: 'Revenues, Receivables, and Operating Income',
    subtitle: 'Revenue Recognition & Accrual Accounting',
    color: '#8B0000', zones: ZONES,
  },
  {
    tbId: 7, dataChapterId: 3,
    title: 'Reporting and Analyzing Inventory',
    subtitle: 'FIFO, LIFO & Weighted Average',
    color: '#92400E', zones: ZONES,
  },
  {
    tbId: 8, dataChapterId: 4,
    title: 'Reporting and Analyzing Long-Term Operating Assets',
    subtitle: 'Depreciation & Capital Expenditure',
    color: '#1B4332', zones: ZONES,
  },
  {
    tbId: 9, dataChapterId: 5,
    title: 'Reporting and Analyzing Liabilities',
    subtitle: 'Off-Balance-Sheet & Debt Structures',
    color: '#1E3A5F', zones: ZONES,
  },
  {
    tbId: 10, dataChapterId: 13,
    title: 'Leases, Pensions, Income Taxes, and Contingencies',
    subtitle: 'ASC 842, Deferred Taxes & Pension Obligations',
    color: '#3E2723', zones: ZONES,
  },
  {
    tbId: 11, dataChapterId: 6,
    title: "Reporting and Analyzing Stockholders' Equity",
    subtitle: 'Equity Transactions & Earnings Per Share',
    color: '#4A235A', zones: ZONES,
  },
  {
    tbId: 12, dataChapterId: 9,
    title: 'Reporting and Analyzing Financial Investments',
    subtitle: 'Business Combinations & Goodwill',
    color: '#1A237E', zones: ZONES,
  },
]

export const TEXTBOOK_APPENDICES: TextbookAppendix[] = [
  {
    id: 'A',
    title: 'Time Value of Money',
    subtitle: 'Present Value, Future Value & Annuities',
    color: '#00695C',
  },
  {
    id: 'B',
    title: 'Data Analytics for Accounting',
    subtitle: 'Using Data to Detect Anomalies & Improve Analysis',
    color: '#37474F',
  },
]

export function getTextbookChapter(tbId: number): TextbookChapter | undefined {
  return TEXTBOOK_CHAPTERS.find(c => c.tbId === tbId)
}

export function resolveDataChapterId(tbId: number): number | undefined {
  return TEXTBOOK_CHAPTERS.find(c => c.tbId === tbId)?.dataChapterId
}

export function getTextbookAppendix(id: string): TextbookAppendix | undefined {
  return TEXTBOOK_APPENDICES.find(a => a.id === id)
}
