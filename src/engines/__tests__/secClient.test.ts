import { describe, it, expect } from 'vitest'
import { extractAnnualValue } from '../secClient'
import type { XBRLUnit } from '../secClient'

describe('extractAnnualValue', () => {
  it('returns the most recent 10-K value when multiple exist', () => {
    const units: XBRLUnit[] = [
      { form: '10-K', end: '2022-12-31', val: 100, filed: '2023-02-01' },
      { form: '10-K', end: '2023-12-31', val: 200, filed: '2024-02-01' },
      { form: '10-Q', end: '2024-03-31', val: 999, filed: '2024-05-01' },
    ]
    expect(extractAnnualValue(units)).toBe(200)
  })

  it('returns null when there are no 10-K entries', () => {
    const units: XBRLUnit[] = [
      { form: '10-Q', end: '2024-03-31', val: 999, filed: '2024-05-01' },
      { form: '20-F', end: '2023-12-31', val: 500, filed: '2024-03-01' },
    ]
    expect(extractAnnualValue(units)).toBeNull()
  })

  it('returns null for an empty array', () => {
    expect(extractAnnualValue([])).toBeNull()
  })
})
