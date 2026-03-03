# Live Company Analyzer & Transaction Flow Animator — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add two features: (1) a `/analyze` route where students type a stock ticker to run real SEC filing data through the app's ratio, DuPont, and forensic engines, and (2) step-through transaction flow animations in the ConceptSlideViewer for Ch1-3.

**Architecture:** Feature 1 uses SEC EDGAR XBRL API (free, no key) with a tag mapping layer that builds `BalanceSheet` + `IncomeStatement` structs and feeds them to the existing `calculateRatios()` engine. Feature 2 adds a `TransactionAnimator` React component to ConceptSlideViewer, rendering structured animation data from a new `chapterAnimations.ts` file.

**Tech Stack:** React 19, TypeScript, Zustand 5, CSS variables (no new dependencies), SEC EDGAR XBRL API, recharts (already installed)

---

## Part A: Live Company Analyzer

### Task 1: SEC Client — Ticker Lookup + XBRL Fetch

**Files:**
- Create: `src/engines/secClient.ts`
- Create: `src/engines/__tests__/secClient.test.ts`

**Step 1: Write the failing tests**

```ts
// src/engines/__tests__/secClient.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { lookupCIK, fetchCompanyFacts, extractAnnualValue } from '../secClient'

describe('secClient', () => {
  describe('extractAnnualValue', () => {
    it('extracts the most recent 10-K value from XBRL units array', () => {
      const units = [
        { form: '10-Q', end: '2024-03-31', val: 100, filed: '2024-05-01' },
        { form: '10-K', end: '2023-12-31', val: 200, filed: '2024-02-15' },
        { form: '10-K', end: '2022-12-31', val: 180, filed: '2023-02-14' },
      ]
      expect(extractAnnualValue(units)).toBe(200)
    })

    it('returns null when no 10-K filings exist', () => {
      const units = [
        { form: '10-Q', end: '2024-03-31', val: 100, filed: '2024-05-01' },
      ]
      expect(extractAnnualValue(units)).toBeNull()
    })

    it('returns null for empty array', () => {
      expect(extractAnnualValue([])).toBeNull()
    })
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/engines/__tests__/secClient.test.ts`
Expected: FAIL — module not found

**Step 3: Write the implementation**

```ts
// src/engines/secClient.ts

/** SEC EDGAR requires a User-Agent header identifying the caller. */
const SEC_HEADERS = {
  'User-Agent': 'AccountingSimulator/1.0 (educational-tool)',
  Accept: 'application/json',
}

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
    'us-gaap'?: Record<string, { units: { USD?: XBRLUnit[]; shares?: XBRLUnit[]; 'USD/shares'?: XBRLUnit[] } }>
  }
}

/** Extracts the most recent 10-K (annual) value from a XBRL units array. */
export function extractAnnualValue(units: { form: string; end: string; val: number; filed: string }[]): number | null {
  const annuals = units
    .filter(u => u.form === '10-K')
    .sort((a, b) => b.end.localeCompare(a.end))
  return annuals.length > 0 ? annuals[0].val : null
}

/**
 * Look up a company's CIK number from its ticker symbol.
 * Uses the SEC's company_tickers.json endpoint.
 */
export async function lookupCIK(ticker: string): Promise<{ cik: number; name: string } | null> {
  const res = await fetch('https://www.sec.gov/files/company_tickers.json', { headers: SEC_HEADERS })
  if (!res.ok) throw new Error(`SEC ticker lookup failed: ${res.status}`)
  const data: Record<string, { cik_str: number; ticker: string; title: string }> = await res.json()
  const upper = ticker.toUpperCase()
  const match = Object.values(data).find(c => c.ticker === upper)
  return match ? { cik: match.cik_str, name: match.title } : null
}

/**
 * Fetch all XBRL company facts for a given CIK from SEC EDGAR.
 */
export async function fetchCompanyFacts(cik: number): Promise<CompanyFacts> {
  const padded = String(cik).padStart(10, '0')
  const res = await fetch(`https://data.sec.gov/api/xbrl/companyfacts/CIK${padded}.json`, { headers: SEC_HEADERS })
  if (!res.ok) throw new Error(`SEC company facts failed: ${res.status}`)
  return res.json()
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/engines/__tests__/secClient.test.ts`
Expected: PASS (3 tests — only `extractAnnualValue` is unit-tested; network functions are integration-only)

**Step 5: Commit**

```bash
git add src/engines/secClient.ts src/engines/__tests__/secClient.test.ts
git commit -m "feat: add SEC EDGAR client with ticker lookup and XBRL fetch"
```

---

### Task 2: XBRL Tag Mapping → Engine Types

**Files:**
- Create: `src/data/xbrlTagMap.ts`
- Create: `src/engines/__tests__/xbrlTagMap.test.ts`

**Step 1: Write the failing tests**

```ts
// src/engines/__tests__/xbrlTagMap.test.ts
import { describe, it, expect } from 'vitest'
import { buildStatementsFromFacts } from '../../data/xbrlTagMap'
import type { CompanyFacts } from '../secClient'

function makeFacts(tags: Record<string, number>): CompanyFacts {
  const usGaap: CompanyFacts['facts']['us-gaap'] = {}
  for (const [tag, val] of Object.entries(tags)) {
    usGaap[tag] = { units: { USD: [{ form: '10-K', end: '2024-12-31', val, filed: '2025-02-15' }] } }
  }
  return { cik: 1, entityName: 'Test Co', facts: { 'us-gaap': usGaap } }
}

describe('buildStatementsFromFacts', () => {
  it('maps Assets and Liabilities to balance sheet totals', () => {
    const facts = makeFacts({
      Assets: 1000,
      AssetsCurrent: 600,
      Liabilities: 400,
      LiabilitiesCurrent: 200,
      StockholdersEquity: 600,
    })
    const { bs } = buildStatementsFromFacts(facts)
    expect(bs.totalAssets).toBe(1000)
    expect(bs.totalCurrentAssets).toBe(600)
    expect(bs.totalLiabilities).toBe(400)
    expect(bs.totalCurrentLiabilities).toBe(200)
    expect(bs.totalEquity).toBe(600)
  })

  it('maps Revenue and COGS to income statement', () => {
    const facts = makeFacts({
      Revenues: 500,
      CostOfGoodsSold: 200,
      OperatingExpenses: 100,
      NetIncomeLoss: 150,
    })
    const { is } = buildStatementsFromFacts(facts)
    expect(is.totalRevenue).toBe(500)
    expect(is.totalCOGS).toBe(200)
    expect(is.netIncome).toBe(150)
  })

  it('uses fallback tags when primary tags are missing', () => {
    const facts = makeFacts({
      RevenueFromContractWithCustomerExcludingAssessedTax: 800,
      CostOfRevenue: 300,
    })
    const { is } = buildStatementsFromFacts(facts)
    expect(is.totalRevenue).toBe(800)
    expect(is.totalCOGS).toBe(300)
  })

  it('returns zero for missing tags', () => {
    const facts = makeFacts({})
    const { bs, is } = buildStatementsFromFacts(facts)
    expect(bs.totalAssets).toBe(0)
    expect(is.totalRevenue).toBe(0)
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/engines/__tests__/xbrlTagMap.test.ts`
Expected: FAIL — module not found

**Step 3: Write the implementation**

```ts
// src/data/xbrlTagMap.ts
import type { BalanceSheet, IncomeStatement, AccountLine } from '../engines/types'
import type { CompanyFacts } from '../engines/secClient'
import { extractAnnualValue } from '../engines/secClient'

/**
 * XBRL tag fallback chains.
 * Each key maps to an array of US-GAAP XBRL tag names tried in order.
 */
const TAG_MAP: Record<string, string[]> = {
  // Balance Sheet
  totalAssets:              ['Assets'],
  totalCurrentAssets:       ['AssetsCurrent'],
  totalLiabilities:         ['Liabilities'],
  totalCurrentLiabilities:  ['LiabilitiesCurrent'],
  totalEquity:              ['StockholdersEquity', 'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest'],
  cash:                     ['CashAndCashEquivalentsAtCarryingValue', 'Cash'],
  accountsReceivable:       ['AccountsReceivableNetCurrent', 'AccountsReceivableNet'],
  inventory:                ['InventoryNet', 'InventoryFinishedGoods'],
  goodwill:                 ['Goodwill'],
  totalNoncurrentAssets:    ['AssetsNoncurrent'],
  totalNoncurrentLiabilities: ['LiabilitiesNoncurrent'],
  accountsPayable:          ['AccountsPayableCurrent', 'AccountsPayable'],
  longTermDebt:             ['LongTermDebt', 'LongTermDebtNoncurrent'],
  retainedEarnings:         ['RetainedEarningsAccumulatedDeficit'],

  // Income Statement
  totalRevenue:             ['Revenues', 'RevenueFromContractWithCustomerExcludingAssessedTax', 'SalesRevenueNet'],
  totalCOGS:                ['CostOfGoodsSold', 'CostOfGoodsSoldAndServicesCost', 'CostOfRevenue'],
  operatingExpenses:        ['OperatingExpenses'],
  operatingIncome:          ['OperatingIncomeLoss'],
  interestExpense:          ['InterestExpense'],
  netIncome:                ['NetIncomeLoss', 'ProfitLoss'],
  taxExpense:               ['IncomeTaxExpenseBenefit'],
  grossProfit:              ['GrossProfit'],
  depreciation:             ['DepreciationDepletionAndAmortization', 'DepreciationAndAmortization'],

  // Shares
  sharesOutstanding:        ['CommonStockSharesOutstanding', 'EntityCommonStockSharesOutstanding'],
}

/** Resolve a mapped key to its most recent 10-K value from XBRL facts. */
function resolve(facts: CompanyFacts, key: string): number {
  const gaap = facts.facts['us-gaap']
  if (!gaap) return 0
  const tags = TAG_MAP[key]
  if (!tags) return 0
  for (const tag of tags) {
    const concept = gaap[tag]
    if (!concept) continue
    const units = concept.units.USD ?? concept.units.shares ?? concept.units['USD/shares']
    if (!units) continue
    const val = extractAnnualValue(units)
    if (val !== null) return val
  }
  return 0
}

/** Build BalanceSheet and IncomeStatement structs from SEC XBRL facts. */
export function buildStatementsFromFacts(facts: CompanyFacts): { bs: BalanceSheet; is: IncomeStatement } {
  const r = (key: string) => resolve(facts, key)

  const totalAssets = r('totalAssets')
  const totalCurrentAssets = r('totalCurrentAssets')
  const totalNoncurrentAssets = r('totalNoncurrentAssets') || (totalAssets - totalCurrentAssets)
  const totalLiabilities = r('totalLiabilities')
  const totalCurrentLiabilities = r('totalCurrentLiabilities')
  const totalNoncurrentLiabilities = r('totalNoncurrentLiabilities') || (totalLiabilities - totalCurrentLiabilities)
  const totalEquity = r('totalEquity') || (totalAssets - totalLiabilities)

  const cash = r('cash')
  const ar = r('accountsReceivable')
  const inv = r('inventory')
  const goodwill = r('goodwill')
  const ap = r('accountsPayable')
  const ltd = r('longTermDebt')
  const re = r('retainedEarnings')

  const currentAssets: AccountLine[] = [
    ...(cash ? [{ name: 'Cash', balance: cash }] : []),
    ...(ar ? [{ name: 'Accounts Receivable', balance: ar }] : []),
    ...(inv ? [{ name: 'Inventory', balance: inv }] : []),
  ]
  const noncurrentAssets: AccountLine[] = [
    ...(goodwill ? [{ name: 'Goodwill', balance: goodwill }] : []),
  ]
  const currentLiabilities: AccountLine[] = [
    ...(ap ? [{ name: 'Accounts Payable', balance: ap }] : []),
  ]
  const noncurrentLiabilities: AccountLine[] = [
    ...(ltd ? [{ name: 'Long-Term Debt', balance: ltd }] : []),
  ]
  const equity: AccountLine[] = [
    ...(re ? [{ name: 'Retained Earnings', balance: re }] : []),
  ]

  const bs: BalanceSheet = {
    currentAssets,
    noncurrentAssets,
    totalCurrentAssets,
    totalNoncurrentAssets,
    totalAssets,
    currentLiabilities,
    noncurrentLiabilities,
    totalCurrentLiabilities,
    totalNoncurrentLiabilities,
    totalLiabilities,
    equity,
    totalEquity,
    totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
    isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1,
  }

  const totalRevenue = r('totalRevenue')
  const totalCOGS = r('totalCOGS')
  const gp = r('grossProfit') || (totalRevenue - totalCOGS)
  const opex = r('operatingExpenses')
  const opIncome = r('operatingIncome') || (gp - opex)
  const tax = r('taxExpense')
  const ni = r('netIncome')
  const interest = r('interestExpense')
  const shares = r('sharesOutstanding')

  const is: IncomeStatement = {
    revenue: [{ name: 'Revenue', balance: totalRevenue }],
    totalRevenue,
    cogs: [{ name: 'Cost of Revenue', balance: totalCOGS }],
    totalCOGS,
    grossProfit: gp,
    operatingExpenses: [{ name: 'Operating Expenses', balance: opex }],
    totalOperatingExpenses: opex,
    operatingIncome: opIncome,
    otherRevenue: [],
    otherExpenses: interest ? [{ name: 'Interest Expense', balance: interest }] : [],
    totalOther: -(interest || 0),
    incomeBeforeTax: opIncome - (interest || 0),
    taxExpense: tax,
    netIncome: ni,
    eps: shares > 0 ? ni / shares : 0,
  }

  return { bs, is }
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/engines/__tests__/xbrlTagMap.test.ts`
Expected: PASS (4 tests)

**Step 5: Commit**

```bash
git add src/data/xbrlTagMap.ts src/engines/__tests__/xbrlTagMap.test.ts
git commit -m "feat: add XBRL tag mapping to engine types"
```

---

### Task 3: Analyzer Zustand Store

**Files:**
- Create: `src/store/analyzerStore.ts`

**Step 1: Write the store**

```ts
// src/store/analyzerStore.ts
import { create } from 'zustand'
import type { BalanceSheet, IncomeStatement } from '../engines/types'
import type { FinancialRatios } from '../engines/RatioCalculator'
import type { CompanyFacts } from '../engines/secClient'

interface AnalyzerState {
  ticker: string
  entityName: string | null
  facts: CompanyFacts | null
  bs: BalanceSheet | null
  is: IncomeStatement | null
  ratios: FinancialRatios | null
  loading: boolean
  error: string | null

  setTicker: (t: string) => void
  setResults: (data: {
    entityName: string
    facts: CompanyFacts
    bs: BalanceSheet
    is: IncomeStatement
    ratios: FinancialRatios
  }) => void
  setLoading: (l: boolean) => void
  setError: (e: string | null) => void
  reset: () => void
}

export const useAnalyzerStore = create<AnalyzerState>()((set) => ({
  ticker: '',
  entityName: null,
  facts: null,
  bs: null,
  is: null,
  ratios: null,
  loading: false,
  error: null,

  setTicker: (ticker) => set({ ticker }),
  setResults: (data) => set({ ...data, loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  reset: () => set({ ticker: '', entityName: null, facts: null, bs: null, is: null, ratios: null, loading: false, error: null }),
}))
```

**Step 2: Commit**

```bash
git add src/store/analyzerStore.ts
git commit -m "feat: add Zustand store for company analyzer"
```

---

### Task 4: Ticker Search Component

**Files:**
- Create: `src/components/analyzer/TickerSearch.tsx`

**Step 1: Write the component**

This component renders a search bar, calls `lookupCIK` → `fetchCompanyFacts` → `buildStatementsFromFacts` → `calculateRatios`, then stores results in `analyzerStore`.

```tsx
// src/components/analyzer/TickerSearch.tsx
import { useState } from 'react'
import { useAnalyzerStore } from '../../store/analyzerStore'
import { lookupCIK, fetchCompanyFacts } from '../../engines/secClient'
import { buildStatementsFromFacts } from '../../data/xbrlTagMap'
import { calculateRatios } from '../../engines/RatioCalculator'

export default function TickerSearch() {
  const [input, setInput] = useState('')
  const { loading, error, setTicker, setResults, setLoading, setError } = useAnalyzerStore()

  const search = async () => {
    const trimmed = input.trim()
    if (!trimmed) return
    setTicker(trimmed)
    setLoading(true)
    setError(null)
    try {
      const match = await lookupCIK(trimmed)
      if (!match) { setError(`Ticker "${trimmed}" not found in SEC EDGAR`); return }
      const facts = await fetchCompanyFacts(match.cik)
      const { bs, is } = buildStatementsFromFacts(facts)
      const ratios = calculateRatios(bs, is)
      setResults({ entityName: match.name, facts, bs, is, ratios })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch company data')
    }
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value.toUpperCase())}
        onKeyDown={e => e.key === 'Enter' && search()}
        placeholder="Enter ticker (e.g. AAPL, MSFT, WMT)"
        style={{
          flex: 1, padding: '0.625rem 1rem', borderRadius: '0.5rem',
          border: '1px solid var(--color-border)', background: 'var(--color-surface)',
          fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--color-text)',
        }}
      />
      <button
        onClick={search}
        disabled={loading || !input.trim()}
        style={{
          padding: '0.625rem 1.25rem', borderRadius: '0.5rem', border: 'none',
          background: loading ? 'var(--color-border)' : 'var(--color-accent)',
          color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: '0.82rem', cursor: loading ? 'wait' : 'pointer',
        }}
      >
        {loading ? 'Loading…' : 'Analyze'}
      </button>
      {error && (
        <span style={{ fontSize: '0.78rem', color: '#C0392B', fontFamily: 'var(--font-mono)' }}>{error}</span>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/analyzer/TickerSearch.tsx
git commit -m "feat: add ticker search component for company analyzer"
```

---

### Task 5: Company Statements Display

**Files:**
- Create: `src/components/analyzer/CompanyStatements.tsx`

**Step 1: Write the component**

Renders the reconstructed Balance Sheet and Income Statement in a two-column grid using the same styling as the existing statement components.

```tsx
// src/components/analyzer/CompanyStatements.tsx
import { useAnalyzerStore } from '../../store/analyzerStore'
import type { AccountLine } from '../../engines/types'

const fmt = (n: number) => `$${(n / 1_000_000).toFixed(1)}M`

function Section({ title, items, total, totalLabel }: {
  title: string; items: AccountLine[]; total: number; totalLabel: string
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.375rem' }}>
        {title}
      </div>
      {items.filter(a => a.balance !== 0).map(a => (
        <div key={a.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.2rem 0', paddingLeft: '0.75rem' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>{a.name}</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>{fmt(a.balance)}</span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, borderTop: '1px solid var(--color-border)', paddingTop: '0.25rem', marginTop: '0.25rem' }}>
        <span>{totalLabel}</span>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>{fmt(total)}</span>
      </div>
    </div>
  )
}

export default function CompanyStatements() {
  const bs = useAnalyzerStore(s => s.bs)
  const is = useAnalyzerStore(s => s.is)
  if (!bs || !is) return null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      {/* Balance Sheet */}
      <div style={{ padding: '1.25rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--color-accent)', margin: '0 0 1rem' }}>Balance Sheet</h3>
        <Section title="Current Assets" items={bs.currentAssets} total={bs.totalCurrentAssets} totalLabel="Total Current Assets" />
        <Section title="Non-Current Assets" items={bs.noncurrentAssets} total={bs.totalNoncurrentAssets} totalLabel="Total Non-Current Assets" />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 700, borderTop: '2px solid var(--color-accent)', paddingTop: '0.5rem', marginBottom: '1.5rem' }}>
          <span>Total Assets</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>{fmt(bs.totalAssets)}</span>
        </div>
        <Section title="Current Liabilities" items={bs.currentLiabilities} total={bs.totalCurrentLiabilities} totalLabel="Total Current Liabilities" />
        <Section title="Non-Current Liabilities" items={bs.noncurrentLiabilities} total={bs.totalNoncurrentLiabilities} totalLabel="Total Non-Current Liabilities" />
        <Section title="Equity" items={bs.equity} total={bs.totalEquity} totalLabel="Total Equity" />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 700, borderTop: '2px solid var(--color-accent)', paddingTop: '0.5rem' }}>
          <span>Total L + E</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>{fmt(bs.totalLiabilitiesAndEquity)}</span>
        </div>
      </div>

      {/* Income Statement */}
      <div style={{ padding: '1.25rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--color-accent)', margin: '0 0 1rem' }}>Income Statement</h3>
        <Section title="Revenue" items={is.revenue} total={is.totalRevenue} totalLabel="Total Revenue" />
        <Section title="Cost of Revenue" items={is.cogs} total={is.totalCOGS} totalLabel="Total COGS" />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, padding: '0.375rem 0', color: 'var(--color-text)' }}>
          <span>Gross Profit</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{fmt(is.grossProfit)}</span>
        </div>
        <Section title="Operating Expenses" items={is.operatingExpenses} total={is.totalOperatingExpenses} totalLabel="Total OpEx" />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, padding: '0.375rem 0', color: 'var(--color-text)' }}>
          <span>Operating Income</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{fmt(is.operatingIncome)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 700, borderTop: '2px solid var(--color-accent)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
          <span>Net Income</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>{fmt(is.netIncome)}</span>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/analyzer/CompanyStatements.tsx
git commit -m "feat: add company statements display component"
```

---

### Task 6: Company Ratios + DuPont Tabs

**Files:**
- Create: `src/components/analyzer/CompanyRatios.tsx`
- Create: `src/components/analyzer/CompanyDuPont.tsx`

**Step 1: Write CompanyRatios — wraps existing RatioCard components**

```tsx
// src/components/analyzer/CompanyRatios.tsx
import { useAnalyzerStore } from '../../store/analyzerStore'
import RatioCard from '../analysis/RatioCard'

export default function CompanyRatios() {
  const ratios = useAnalyzerStore(s => s.ratios)
  if (!ratios) return null

  const sections = [
    { title: 'Profitability', items: [
      { name: 'Gross Margin', value: ratios.grossProfitMargin, format: 'percent' as const, description: 'Revenue remaining after COGS' },
      { name: 'Operating Margin', value: ratios.operatingMargin, format: 'percent' as const, description: 'Revenue remaining after operating expenses' },
      { name: 'Net Margin', value: ratios.netProfitMargin, format: 'percent' as const, description: 'Revenue remaining as profit' },
      { name: 'ROA', value: ratios.returnOnAssets, format: 'percent' as const, description: 'Net income relative to total assets' },
      { name: 'ROE', value: ratios.returnOnEquity, format: 'percent' as const, description: 'Net income relative to shareholder equity' },
    ]},
    { title: 'Liquidity', items: [
      { name: 'Current Ratio', value: ratios.currentRatio, format: 'ratio' as const, description: 'Current assets / current liabilities' },
      { name: 'Quick Ratio', value: ratios.quickRatio, format: 'ratio' as const, description: 'Liquid assets / current liabilities' },
    ]},
    { title: 'Leverage', items: [
      { name: 'Debt-to-Equity', value: ratios.debtToEquity, format: 'ratio' as const, description: 'Total liabilities / equity' },
      { name: 'Debt-to-Assets', value: ratios.debtToAssets, format: 'ratio' as const, description: 'Total liabilities / total assets' },
      { name: 'Interest Coverage', value: ratios.interestCoverage, format: 'ratio' as const, description: 'Operating income / interest expense' },
    ]},
    { title: 'Efficiency', items: [
      { name: 'Asset Turnover', value: ratios.assetTurnover, format: 'ratio' as const, description: 'Revenue / total assets' },
      { name: 'DSO', value: ratios.daysSalesOutstanding, format: 'days' as const, description: 'Average days to collect receivables' },
      { name: 'DIO', value: ratios.daysInventoryOutstanding, format: 'days' as const, description: 'Average days inventory is held' },
    ]},
  ]

  return (
    <div>
      {sections.map(s => (
        <div key={s.title} style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            {s.title}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {s.items.map(r => (
              <RatioCard key={r.name} {...r} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

**Step 2: Write CompanyDuPont — wraps existing DuPontChart**

```tsx
// src/components/analyzer/CompanyDuPont.tsx
import { useAnalyzerStore } from '../../store/analyzerStore'
import DuPontChart from '../analysis/DuPontChart'

export default function CompanyDuPont() {
  const ratios = useAnalyzerStore(s => s.ratios)
  if (!ratios) return null

  return (
    <div style={{ padding: '1.25rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--color-accent)', margin: '0 0 1rem' }}>
        DuPont Decomposition
      </h3>
      <DuPontChart
        dupont={{
          netMargin: ratios.dupontNetMargin,
          assetTurnover: ratios.dupontAssetTurnover,
          equityMultiplier: ratios.dupontEquityMultiplier,
        }}
        roe={ratios.returnOnEquity}
      />
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/analyzer/CompanyRatios.tsx src/components/analyzer/CompanyDuPont.tsx
git commit -m "feat: add ratio dashboard and DuPont chart for analyzer"
```

---

### Task 7: Company Forensics Tab

**Files:**
- Create: `src/components/analyzer/CompanyForensics.tsx`

**Step 1: Write the component**

Runs Benford analysis on revenue figures and displays auto-scored red flags. Uses recharts (already installed) for the Benford bar chart.

```tsx
// src/components/analyzer/CompanyForensics.tsx
import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useAnalyzerStore } from '../../store/analyzerStore'

const BENFORD = [0, 30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6]

function benfordAnalysis(values: number[]): { data: { digit: string; observed: number; expected: number }[]; chiSquared: number } {
  const counts = Array(10).fill(0)
  const valid = values.filter(v => v > 0)
  for (const v of valid) {
    const d = Number(String(Math.abs(v))[0])
    if (d >= 1 && d <= 9) counts[d]++
  }
  const total = valid.length
  const data = Array.from({ length: 9 }, (_, i) => {
    const digit = i + 1
    const observed = total > 0 ? (counts[digit] / total) * 100 : 0
    return { digit: String(digit), observed: +observed.toFixed(1), expected: BENFORD[digit] }
  })
  let chi = 0
  for (const d of data) {
    const expected = (d.expected / 100) * total
    const observed = (d.observed / 100) * total
    if (expected > 0) chi += ((observed - expected) ** 2) / expected
  }
  return { data, chiSquared: +chi.toFixed(2) }
}

export default function CompanyForensics() {
  const facts = useAnalyzerStore(s => s.facts)
  const ratios = useAnalyzerStore(s => s.ratios)
  const bs = useAnalyzerStore(s => s.bs)
  const is = useAnalyzerStore(s => s.is)

  const benford = useMemo(() => {
    if (!facts?.facts['us-gaap']) return null
    const gaap = facts.facts['us-gaap']
    const values: number[] = []
    for (const concept of Object.values(gaap)) {
      const units = concept.units.USD
      if (!units) continue
      for (const u of units) {
        if (u.form === '10-K' && u.val > 0) values.push(u.val)
      }
    }
    if (values.length < 20) return null
    return benfordAnalysis(values)
  }, [facts])

  const flags = useMemo(() => {
    if (!ratios || !bs || !is) return []
    const f: { label: string; severity: 'high' | 'medium' | 'low'; detail: string }[] = []
    if (ratios.netProfitMargin !== null && ratios.netProfitMargin < 0) f.push({ label: 'Negative Net Margin', severity: 'high', detail: 'Company is unprofitable' })
    if (ratios.currentRatio !== null && ratios.currentRatio < 1) f.push({ label: 'Current Ratio < 1', severity: 'high', detail: 'May struggle to meet short-term obligations' })
    if (ratios.debtToEquity !== null && ratios.debtToEquity > 3) f.push({ label: 'High Leverage (D/E > 3)', severity: 'high', detail: 'Elevated financial risk' })
    if (bs.totalAssets > 0 && (bs.noncurrentAssets.find(a => a.name === 'Goodwill')?.balance ?? 0) / bs.totalAssets > 0.4) f.push({ label: 'Goodwill > 40% of Assets', severity: 'medium', detail: 'Potential impairment risk from acquisitions' })
    if (ratios.interestCoverage !== null && ratios.interestCoverage < 2) f.push({ label: 'Low Interest Coverage (< 2x)', severity: 'high', detail: 'Difficulty servicing debt' })
    if (ratios.daysSalesOutstanding !== null && ratios.daysSalesOutstanding > 90) f.push({ label: 'DSO > 90 days', severity: 'medium', detail: 'Slow collections may signal revenue quality issues' })
    if (benford && benford.chiSquared > 15.51) f.push({ label: 'Benford Anomaly (χ² > 15.51)', severity: 'medium', detail: `Chi-squared of ${benford.chiSquared} exceeds critical value` })
    return f
  }, [ratios, bs, is, benford])

  if (!facts) return null

  const sevColor = { high: '#C0392B', medium: '#DAA520', low: '#2D6A4F' }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      {/* Benford */}
      <div style={{ padding: '1.25rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--color-accent)', margin: '0 0 1rem' }}>Benford's Law Analysis</h3>
        {benford ? (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={benford.data} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="digit" tick={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }} unit="%" />
                <Tooltip />
                <Bar dataKey="expected" fill="var(--color-border)" name="Benford Expected" />
                <Bar dataKey="observed" fill="var(--color-accent)" name="Observed" />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
              χ² = {benford.chiSquared}
              <span style={{ color: benford.chiSquared > 15.51 ? '#C0392B' : '#2D6A4F', marginLeft: '0.5rem', fontWeight: 700 }}>
                {benford.chiSquared > 15.51 ? 'ANOMALY DETECTED' : 'WITHIN NORMAL RANGE'}
              </span>
            </div>
          </>
        ) : (
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>
            Insufficient data points for Benford analysis
          </div>
        )}
      </div>

      {/* Red Flags */}
      <div style={{ padding: '1.25rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--color-accent)', margin: '0 0 1rem' }}>Red Flag Checklist</h3>
        {flags.length === 0 ? (
          <div style={{ color: '#2D6A4F', fontSize: '0.82rem', fontWeight: 600 }}>No red flags detected</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {flags.map(f => (
              <div key={f.label} style={{ padding: '0.625rem 0.75rem', borderRadius: '0.375rem', border: `1px solid ${sevColor[f.severity]}30`, background: `${sevColor[f.severity]}08` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: sevColor[f.severity], flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)' }}>{f.label}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', paddingLeft: '1rem' }}>{f.detail}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/analyzer/CompanyForensics.tsx
git commit -m "feat: add Benford analysis and red flag forensics tab"
```

---

### Task 8: Analyzer Page + Routing + Nav

**Files:**
- Create: `src/pages/CompanyAnalyzerPage.tsx`
- Modify: `src/App.tsx:10` (add lazy import + route)
- Modify: `src/components/shell/NavDrawer.tsx:73` (add nav entry)

**Step 1: Create the page**

```tsx
// src/pages/CompanyAnalyzerPage.tsx
import { useState } from 'react'
import { useAnalyzerStore } from '../store/analyzerStore'
import TickerSearch from '../components/analyzer/TickerSearch'
import CompanyStatements from '../components/analyzer/CompanyStatements'
import CompanyRatios from '../components/analyzer/CompanyRatios'
import CompanyDuPont from '../components/analyzer/CompanyDuPont'
import CompanyForensics from '../components/analyzer/CompanyForensics'

type Tab = 'statements' | 'ratios' | 'dupont' | 'forensics'

export default function CompanyAnalyzerPage() {
  const [tab, setTab] = useState<Tab>('statements')
  const entityName = useAnalyzerStore(s => s.entityName)
  const ticker = useAnalyzerStore(s => s.ticker)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'statements', label: 'Statements' },
    { key: 'ratios', label: 'Ratios' },
    { key: 'dupont', label: 'DuPont' },
    { key: 'forensics', label: 'Forensics' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" style={{ fontFamily: 'var(--font-body)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent)', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
        Company Analyzer
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', margin: '0 0 1.5rem' }}>
        Analyze real SEC filings with the same engines used throughout the course
      </p>

      <TickerSearch />

      {entityName && (
        <>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem' }}>
            {entityName} <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>({ticker})</span>
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid var(--color-border)', marginBottom: '1.5rem' }}>
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: '0.5rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontSize: '0.82rem', fontWeight: 600,
                  color: tab === t.key ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  borderBottom: tab === t.key ? '2px solid var(--color-accent)' : '2px solid transparent',
                  marginBottom: '-2px',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'statements' && <CompanyStatements />}
          {tab === 'ratios' && <CompanyRatios />}
          {tab === 'dupont' && <CompanyDuPont />}
          {tab === 'forensics' && <CompanyForensics />}
        </>
      )}
    </div>
  )
}
```

**Step 2: Add lazy import and route to App.tsx**

In `src/App.tsx`, add after line 11 (`const AppendixPage = ...`):
```tsx
const CompanyAnalyzerPage = lazy(() => import('./pages/CompanyAnalyzerPage'))
```

In the `<Routes>` block, add after the `/ma` route (line 34):
```tsx
<Route path="/analyze" element={<CompanyAnalyzerPage />} />
```

**Step 3: Add nav entry to NavDrawer.tsx**

In `src/components/shell/NavDrawer.tsx`, add after the Progress `</NavLink>` (after line 73):
```tsx
          {/* Company Analyzer */}
          <NavLink
            to="/analyze"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3 text-sm font-medium transition-colors"
            style={({ isActive }) => ({
              background: isActive ? 'var(--color-accent)' : 'transparent',
              color: isActive ? 'white' : 'var(--color-text)',
            })}
          >
            🔍 Company Analyzer
          </NavLink>
```

**Step 4: Run TypeScript check and build**

Run: `npx tsc --noEmit && npx vite build`
Expected: Clean

**Step 5: Commit**

```bash
git add src/pages/CompanyAnalyzerPage.tsx src/App.tsx src/components/shell/NavDrawer.tsx
git commit -m "feat: add /analyze route with Company Analyzer page"
```

---

## Part B: Transaction Flow Animator

### Task 9: Animation Types + TransactionAnimator Component

**Files:**
- Create: `src/components/concepts/TransactionAnimator.tsx`
- Create: `src/components/concepts/stages/EventStage.tsx`
- Create: `src/components/concepts/stages/JournalStage.tsx`
- Create: `src/components/concepts/stages/TAccountStage.tsx`
- Create: `src/components/concepts/stages/StatementStage.tsx`

**Step 1: Define animation types at the top of TransactionAnimator.tsx**

```tsx
// src/components/concepts/TransactionAnimator.tsx
import { useState } from 'react'
import EventStage from './stages/EventStage'
import JournalStage from './stages/JournalStage'
import TAccountStage from './stages/TAccountStage'
import StatementStage from './stages/StatementStage'

export interface EventData {
  who: string
  what: string
  amount: string
}

export interface JournalEntry {
  account: string
  debit?: number
  credit?: number
}

export interface JournalData {
  date: string
  entries: JournalEntry[]
  memo: string
}

export interface TAccountData {
  accounts: {
    name: string
    debits: number[]
    credits: number[]
  }[]
}

export interface StatementLine {
  label: string
  value: number
  highlight?: boolean
}

export interface StatementData {
  type: 'BS' | 'IS'
  title: string
  sections: { heading: string; lines: StatementLine[] }[]
}

export type AnimationStage =
  | { type: 'event'; title: string; description: string; data: EventData }
  | { type: 'journal'; title: string; description: string; data: JournalData }
  | { type: 'taccount'; title: string; description: string; data: TAccountData }
  | { type: 'statement'; title: string; description: string; data: StatementData }

export interface AnimationSequence {
  stages: AnimationStage[]
}

export default function TransactionAnimator({ sequence }: { sequence: AnimationSequence }) {
  const [step, setStep] = useState(0)
  const stage = sequence.stages[step]
  const total = sequence.stages.length

  return (
    <div style={{
      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
      borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '1rem',
    }}>
      {/* Header with controls */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.5rem 1rem', borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-base)',
      }}>
        <button
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          style={{
            padding: '0.3rem 0.75rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)',
            background: step === 0 ? 'var(--color-base)' : 'var(--color-surface)',
            color: step === 0 ? 'var(--color-text-muted)' : 'var(--color-text)',
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', cursor: step === 0 ? 'default' : 'pointer',
          }}
        >
          ◀ Prev
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-accent)' }}>
            {stage.title}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
            Step {step + 1} of {total}
          </div>
        </div>

        <button
          onClick={() => setStep(s => s + 1)}
          disabled={step === total - 1}
          style={{
            padding: '0.3rem 0.75rem', borderRadius: '0.375rem', border: 'none',
            background: step === total - 1 ? 'var(--color-border)' : 'var(--color-accent)',
            color: 'white', fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
            cursor: step === total - 1 ? 'default' : 'pointer',
          }}
        >
          Next ▶
        </button>
      </div>

      {/* Stage content with fade transition */}
      <div style={{ padding: '1.25rem', transition: 'opacity 0.2s', minHeight: '160px' }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '0 0 1rem', fontStyle: 'italic' }}>
          {stage.description}
        </p>

        {stage.type === 'event' && <EventStage data={stage.data} />}
        {stage.type === 'journal' && <JournalStage data={stage.data} />}
        {stage.type === 'taccount' && <TAccountStage data={stage.data} />}
        {stage.type === 'statement' && <StatementStage data={stage.data} />}
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem', padding: '0.5rem 0 0.75rem' }}>
        {sequence.stages.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            style={{
              width: i === step ? '1.5rem' : '0.5rem', height: '0.5rem',
              borderRadius: '9999px', border: 'none', cursor: 'pointer',
              background: i === step ? 'var(--color-accent)' : 'var(--color-border)',
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Write the four stage components**

```tsx
// src/components/concepts/stages/EventStage.tsx
import type { EventData } from '../TransactionAnimator'

export default function EventStage({ data }: { data: EventData }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
      padding: '1rem', background: 'var(--color-base)', borderRadius: '0.5rem',
      border: '1px dashed var(--color-border)',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text)' }}>
        {data.who}
      </div>
      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{data.what}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent)' }}>
        {data.amount}
      </div>
    </div>
  )
}
```

```tsx
// src/components/concepts/stages/JournalStage.tsx
import type { JournalData } from '../TransactionAnimator'

export default function JournalStage({ data }: { data: JournalData }) {
  const fmt = (n?: number) => n ? `$${n.toLocaleString()}` : ''
  return (
    <div style={{ background: 'var(--color-base)', borderRadius: '0.5rem', padding: '1rem', border: '1px solid var(--color-border)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
        Date: {data.date}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
            <th style={{ textAlign: 'left', padding: '0.25rem 0', color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>Account</th>
            <th style={{ textAlign: 'right', padding: '0.25rem 0', color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>Debit</th>
            <th style={{ textAlign: 'right', padding: '0.25rem 0', color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>Credit</th>
          </tr>
        </thead>
        <tbody>
          {data.entries.map((e, i) => (
            <tr key={i}>
              <td style={{ padding: '0.3rem 0', paddingLeft: e.credit ? '1.5rem' : 0, color: 'var(--color-text)' }}>{e.account}</td>
              <td style={{ textAlign: 'right', padding: '0.3rem 0', color: e.debit ? '#1e3a5f' : 'transparent' }}>{fmt(e.debit)}</td>
              <td style={{ textAlign: 'right', padding: '0.3rem 0', color: e.credit ? '#7c2d12' : 'transparent' }}>{fmt(e.credit)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
        {data.memo}
      </div>
    </div>
  )
}
```

```tsx
// src/components/concepts/stages/TAccountStage.tsx
import type { TAccountData } from '../TransactionAnimator'

export default function TAccountStage({ data }: { data: TAccountData }) {
  const fmt = (n: number) => `$${n.toLocaleString()}`
  return (
    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
      {data.accounts.map(a => (
        <div key={a.name} style={{
          minWidth: '140px', background: 'var(--color-base)', border: '1px solid var(--color-border)',
          borderRadius: '0.5rem', overflow: 'hidden',
        }}>
          <div style={{
            textAlign: 'center', padding: '0.375rem', fontFamily: 'var(--font-display)',
            fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-accent)',
            borderBottom: '2px solid var(--color-accent)',
          }}>
            {a.name}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '50px' }}>
            <div style={{ borderRight: '1px solid var(--color-border)', padding: '0.375rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
              {a.debits.map((d, i) => <div key={i} style={{ color: '#1e3a5f' }}>{fmt(d)}</div>)}
            </div>
            <div style={{ padding: '0.375rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
              {a.credits.map((c, i) => <div key={i} style={{ color: '#7c2d12' }}>{fmt(c)}</div>)}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ textAlign: 'center', fontSize: '0.6rem', color: 'var(--color-text-muted)', padding: '0.2rem' }}>Dr</div>
            <div style={{ textAlign: 'center', fontSize: '0.6rem', color: 'var(--color-text-muted)', padding: '0.2rem' }}>Cr</div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

```tsx
// src/components/concepts/stages/StatementStage.tsx
import type { StatementData } from '../TransactionAnimator'

export default function StatementStage({ data }: { data: StatementData }) {
  const fmt = (n: number) => `$${n.toLocaleString()}`
  return (
    <div style={{ background: 'var(--color-base)', borderRadius: '0.5rem', padding: '1rem', border: '1px solid var(--color-border)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '0.75rem' }}>
        {data.title}
      </div>
      {data.sections.map(s => (
        <div key={s.heading} style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
            {s.heading}
          </div>
          {s.lines.map(l => (
            <div key={l.label} style={{
              display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.2rem 0',
              background: l.highlight ? 'var(--color-accent)10' : 'transparent',
              paddingLeft: l.highlight ? '0.5rem' : 0, borderRadius: '0.25rem',
            }}>
              <span style={{ color: l.highlight ? 'var(--color-accent)' : 'var(--color-text-muted)', fontWeight: l.highlight ? 600 : 400 }}>{l.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: l.highlight ? 'var(--color-accent)' : 'var(--color-text)', fontWeight: l.highlight ? 700 : 400 }}>{fmt(l.value)}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/concepts/TransactionAnimator.tsx src/components/concepts/stages/
git commit -m "feat: add TransactionAnimator component with 4 stage renderers"
```

---

### Task 10: Chapter Animation Data (Ch1-3)

**Files:**
- Create: `src/data/chapterAnimations.ts`

**Step 1: Write the animation data for Ch1-3**

Create `src/data/chapterAnimations.ts` with `AnimationSequence` data for each concept slide that benefits from a flow animation. Key by `chapterId:slideId`.

Each chapter gets 2-3 animated slides (not every slide needs an animation — only the ones that teach a transaction flow). Use the slide IDs from `chapterConcepts.ts` (e.g., `ch1-s1`, `ch1-s2`).

**Ch1 example (Accounting Equation — cash investment):**
```ts
import type { AnimationSequence } from '../components/concepts/TransactionAnimator'

export const CHAPTER_ANIMATIONS: Record<string, AnimationSequence> = {
  'ch1-s1': {
    stages: [
      {
        type: 'event', title: 'Business Event',
        description: 'An owner invests cash to start a business.',
        data: { who: 'Owner', what: 'Invests cash into the business', amount: '$50,000' },
      },
      {
        type: 'journal', title: 'Journal Entry',
        description: 'Record the double entry — every transaction has equal debits and credits.',
        data: {
          date: 'Jan 1',
          entries: [
            { account: 'Cash', debit: 50000 },
            { account: 'Common Stock', credit: 50000 },
          ],
          memo: 'Owner investment of cash',
        },
      },
      {
        type: 'taccount', title: 'T-Accounts',
        description: 'Watch the debits and credits land in each account.',
        data: {
          accounts: [
            { name: 'Cash', debits: [50000], credits: [] },
            { name: 'Common Stock', debits: [], credits: [50000] },
          ],
        },
      },
      {
        type: 'statement', title: 'Balance Sheet Impact',
        description: 'The accounting equation stays balanced: Assets = Liabilities + Equity.',
        data: {
          type: 'BS', title: 'Balance Sheet',
          sections: [
            { heading: 'Assets', lines: [{ label: 'Cash', value: 50000, highlight: true }] },
            { heading: 'Liabilities', lines: [{ label: 'Total Liabilities', value: 0 }] },
            { heading: 'Equity', lines: [{ label: 'Common Stock', value: 50000, highlight: true }] },
          ],
        },
      },
    ],
  },
  // ... remaining Ch1-3 slide animations follow the same pattern
}
```

Author 2-3 sequences per chapter covering the most instructive transactions for that chapter. Total: ~8 animation sequences.

**Step 2: Commit**

```bash
git add src/data/chapterAnimations.ts
git commit -m "feat: add animation data for Ch1-3 concept slides"
```

---

### Task 11: Wire TransactionAnimator into ConceptSlideViewer

**Files:**
- Modify: `src/components/concepts/ConceptSlideViewer.tsx:261-278` (replace diagram placeholder)

**Step 1: Add import and lookup**

At the top of `ConceptSlideViewer.tsx`, add:
```tsx
import TransactionAnimator from './TransactionAnimator'
import { CHAPTER_ANIMATIONS } from '../../data/chapterAnimations'
```

**Step 2: Replace the diagram placeholder**

Replace lines 261-278 (the `{slide.diagram && (...)}` block) with:
```tsx
{(() => {
  const anim = CHAPTER_ANIMATIONS[slide.id]
  if (anim) return <TransactionAnimator sequence={anim} />
  if (slide.diagram) return (
    <div style={{
      background: 'var(--color-surface)', border: '1px dashed var(--color-border)',
      borderRadius: '0.375rem', padding: '1.5rem', marginBottom: '1rem',
      textAlign: 'center', fontSize: '0.82rem', color: 'var(--color-text-muted)', fontStyle: 'italic',
    }}>
      {slide.diagram}
    </div>
  )
  return null
})()}
```

This renders the `TransactionAnimator` when animation data exists for the slide ID, falls back to the old placeholder for slides with only a `diagram` string, and renders nothing otherwise.

**Step 3: Run TypeScript check and build**

Run: `npx tsc --noEmit && npx vite build`
Expected: Clean

**Step 4: Commit**

```bash
git add src/components/concepts/ConceptSlideViewer.tsx
git commit -m "feat: wire TransactionAnimator into ConceptSlideViewer"
```

---

### Task 12: Final Verification

**Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass (411+ including new xbrl tests)

**Step 2: Run TypeScript strict check**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 3: Run production build**

Run: `npx vite build`
Expected: Clean build

**Step 4: Commit and push**

```bash
git push origin main
```
