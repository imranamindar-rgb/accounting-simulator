/**
 * SEC EDGAR XBRL Client
 *
 * Fetches company financial data from the SEC EDGAR XBRL API.
 * Used by the Live Company Analyzer feature.
 */

const USER_AGENT = 'AccountingSimulator/1.0 (educational-tool)'

// ── Types ───────────────────────────────────────────────────────────

export interface XBRLUnit {
  form: string
  end: string
  val: number
  filed: string
  start?: string
  accn?: string
  frame?: string
}

export interface CompanyFacts {
  cik: number
  entityName: string
  facts: {
    'us-gaap'?: Record<
      string,
      {
        units: {
          USD?: XBRLUnit[]
          shares?: XBRLUnit[]
          'USD/shares'?: XBRLUnit[]
        }
      }
    >
  }
}

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Filters XBRL unit entries for 10-K filings, sorts by end date descending,
 * and returns the most recent value, or null if none exist.
 */
export function extractAnnualValue(units: XBRLUnit[]): number | null {
  const annual = units.filter(u => u.form === '10-K')
  if (annual.length === 0) return null
  annual.sort((a, b) => b.end.localeCompare(a.end))
  return annual[0].val
}

// ── API Functions ────────────────────────────────────────────────────

/**
 * Looks up a company's CIK number by ticker symbol using the SEC EDGAR
 * company tickers JSON endpoint.
 *
 * Returns { cik, name } or null if not found.
 */
export async function lookupCIK(
  ticker: string,
): Promise<{ cik: number; name: string } | null> {
  const url = 'https://www.sec.gov/files/company_tickers.json'
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  })

  if (!response.ok) {
    throw new Error(`SEC EDGAR ticker lookup failed: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as Record<
    string,
    { cik_str: number; ticker: string; title: string }
  >

  const upperTicker = ticker.toUpperCase()
  for (const entry of Object.values(data)) {
    if (entry.ticker.toUpperCase() === upperTicker) {
      return { cik: entry.cik_str, name: entry.title }
    }
  }

  return null
}

/**
 * Fetches the full XBRL company facts for the given CIK number.
 * The CIK is zero-padded to 10 digits as required by the API.
 */
export async function fetchCompanyFacts(cik: number): Promise<CompanyFacts> {
  const paddedCIK = String(cik).padStart(10, '0')
  const url = `https://data.sec.gov/api/xbrl/companyfacts/CIK${paddedCIK}.json`

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  })

  if (!response.ok) {
    throw new Error(`SEC EDGAR company facts fetch failed: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<CompanyFacts>
}
