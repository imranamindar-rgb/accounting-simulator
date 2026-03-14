/**
 * Textbook Slide Ordering Configuration
 *
 * Several chapters were originally designed for the forensic accounting simulator,
 * which leads with fraud/manipulation topics. For the textbook tab, fundamentals
 * should come before forensic content.
 *
 * This file defines the preferred slide ordering for textbook mode.
 * If a chapter is not listed here, slides are shown in their natural array order.
 *
 * Format: dataChapterId → array of slide IDs in textbook-preferred order
 */

export const TEXTBOOK_SLIDE_ORDER: Record<number, string[]> = {
  // Chapter 5 (Liabilities): Move fundamentals before forensic content
  // Original order: OBS financing, debt covenants, repos, current liabilities, bonds...
  // Textbook order: current liabilities first, then bonds, then forensic topics
  5: [
    'ch5-s4', // Current Liabilities (fundamentals)
    'ch5-s5', // Bond Pricing
    'ch5-s6', // Bond Issuance
    'ch5-s7', // Effective Interest Method
    'ch5-s8', // Bond Repurchase
    'ch5-s1', // Off-Balance-Sheet Financing (forensic)
    'ch5-s2', // Debt Covenants (forensic)
    'ch5-s3', // Repo Agreements (forensic)
  ],

  // Chapter 6 (Equity): Move fundamentals before forensic content
  // Original order: EPS, SBC, buybacks, stock issuance, dividends...
  // Textbook order: stock issuance first, then dividends/splits, then EPS/forensic
  6: [
    'ch6-s4', // Classes of Stock and Stock Issuance (fundamentals)
    'ch6-s5', // Cash Dividends (fundamentals)
    'ch6-s6', // Stock Dividends and Splits (fundamentals)
    'ch6-s7', // Comprehensive Income (fundamentals)
    'ch6-s8', // Summary of SE (fundamentals)
    'ch6-s1', // Basic vs Diluted EPS (analytical)
    'ch6-s2', // Stock-Based Compensation (forensic)
    'ch6-s3', // Share Buybacks (forensic)
  ],

  // Chapter 9 (Investments): Move investment classification before M&A forensics
  // Original order: acquisition accounting, cookie jar, M&A destruction, fair value, securities...
  // Textbook order: fair value & securities first, then equity method, consolidation, then forensic
  9: [
    'ch9-s4', // Fair Value Hierarchy (fundamentals)
    'ch9-s5', // Passive Investments - Debt Securities (fundamentals)
    'ch9-s6', // Passive Investments - Equity Securities (fundamentals)
    'ch9-s7', // Equity Method (fundamentals)
    'ch9-s8', // Consolidation (fundamentals)
    'ch9-s1', // Acquisition Accounting (analytical)
    'ch9-s2', // Cookie Jar Reserves (forensic)
    'ch9-s3', // M&A Value Destruction (forensic)
  ],

  // Chapter 12 (Adjusting Entries): Move accounting cycle before forensic content
  // Original order: why adjusting, accrued, deferred, depreciation, TB/closing, cookie jar, big bath, detection, cycle, post-closing
  // Textbook order: cycle overview first, then mechanics, then forensic last
  12: [
    'ch12-s9',  // Complete Accounting Cycle (overview)
    'ch12-s1',  // Why Adjusting Entries Exist
    'ch12-s2',  // Accrued Revenues and Expenses
    'ch12-s3',  // Deferred Revenues and Prepaid Expenses
    'ch12-s4',  // Depreciation and Amortization Adjustments
    'ch12-s5',  // Trial Balance and Closing Entries
    'ch12-s10', // Post-Closing TB and Subsequent Events
    'ch12-s6',  // Cookie Jar Reserves (forensic)
    'ch12-s7',  // Big Bath Charges (forensic)
    'ch12-s8',  // Detecting Manipulation (forensic)
  ],
}

/**
 * Returns slides in textbook-preferred order for a given chapter.
 * If no custom order is defined, returns slides in their natural order.
 */
export function getTextbookOrderedSlides<T extends { id: string }>(
  dataChapterId: number,
  slides: T[],
): T[] {
  const order = TEXTBOOK_SLIDE_ORDER[dataChapterId]
  if (!order) return slides

  const slideMap = new Map(slides.map(s => [s.id, s]))
  const ordered: T[] = []

  for (const id of order) {
    const slide = slideMap.get(id)
    if (slide) ordered.push(slide)
  }

  // Append any slides not in the order config (safety net)
  for (const slide of slides) {
    if (!order.includes(slide.id)) {
      ordered.push(slide)
    }
  }

  return ordered
}
