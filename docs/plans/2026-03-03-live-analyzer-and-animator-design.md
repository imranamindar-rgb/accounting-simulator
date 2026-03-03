# Live Company Analyzer & Transaction Flow Animator — Design

**Date:** 2026-03-03
**Status:** Approved

---

## Feature 1: Live Company Analyzer

### Overview
New `/analyze` route where students type a stock ticker and get real SEC filing data run through the app's existing engines — statements, ratios, DuPont decomposition, and forensic checks. Uses SEC EDGAR XBRL API (free, no key, no CORS issues).

### Data Flow
```
User types ticker
  → SEC EDGAR company search (efts.sec.gov/LATEST/search-index)
  → returns CIK number
  → fetch data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json
  → parse XBRL JSON → extract most recent annual filing values
  → map ~40 XBRL tags to BalanceSheet + IncomeStatement structs
  → feed to calculateRatios(), DuPont decomposition, Benford analysis
```

### SEC XBRL Tag Mapping
`xbrlTagMap.ts` maps common US-GAAP XBRL tags to engine types with fallback chains:
- `us-gaap:Assets` → totalAssets
- `us-gaap:Revenues` / `us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax` → totalRevenue
- `us-gaap:CostOfGoodsSold` / `us-gaap:CostOfRevenue` → totalCOGS
- etc.

### Page Layout — 4 Tabs
1. **Statements** — Reconstructed BS + IS in existing statement component style
2. **Ratios** — Full ratio dashboard (reuse `RatioCard` from analysis/)
3. **DuPont** — DuPont decomposition chart (reuse `DuPontChart`)
4. **Forensics** — Benford's Law on revenue figures + auto-scored Red Flag Checklist

### State Management
- New `analyzerStore.ts` (Zustand): selected company, raw XBRL data, parsed statements, loading/error states
- In-memory cache for previously loaded tickers

### Error Handling
- Ticker not found → "Company not found in SEC EDGAR"
- Missing XBRL fields → show available data, grey out unavailable ratios
- Rate limiting → SEC requests User-Agent header and max 10 req/sec

---

## Feature 2: Transaction Flow Animator

### Overview
Step-through animated diagrams embedded in ConceptSlideViewer replacing the current italic placeholder. Students click Next/Prev to walk through: Business Event → Journal Entry → T-Accounts → Financial Statements. Ch1-3 first (~12 slides).

### Animation Data Shape
```ts
interface AnimationStage {
  type: 'event' | 'journal' | 'taccount' | 'statement'
  title: string
  description: string
  data: EventData | JournalData | TAccountData | StatementData
}

interface AnimationSequence {
  stages: AnimationStage[]
}
```

Each stage type renders a distinct visual:
- **event** — Business scenario box (who, what, how much)
- **journal** — Debit/credit table with account names and amounts
- **taccount** — Two T-account boxes side by side
- **statement** — Mini BS or IS with affected lines highlighted

### Step-Through Controls
- Prev/Next buttons cycle through stages
- Dot indicators show position (same pattern as concept slide navigation)
- CSS `transition: opacity 0.2s` for subtle fade on step change
- Styled with existing CSS variables

### Content Scope
- **Ch1 (Accounting Equation):** 4 slides, ~3-4 stages each
- **Ch2 (Revenue Recognition):** 4 slides, timing focus
- **Ch3 (Inventory):** 4 slides, cost flow methods

### Data Location
- `src/data/chapterAnimations.ts` — keyed by chapter ID and slide ID
- Separate from `chapterConcepts.ts` to avoid bloating

---

## Shared Concerns

### No New Dependencies
- Raw `fetch()` for SEC API (matches `aiClient.ts` pattern)
- Pure React + CSS transitions for animations
- `recharts` (already installed) for Benford chart

### File Structure
```
src/
  pages/
    CompanyAnalyzerPage.tsx
  components/
    analyzer/
      TickerSearch.tsx
      CompanyStatements.tsx
      CompanyRatios.tsx
      CompanyDuPont.tsx
      CompanyForensics.tsx
    concepts/
      TransactionAnimator.tsx
      stages/
        EventStage.tsx
        JournalStage.tsx
        TAccountStage.tsx
        StatementStage.tsx
  data/
    chapterAnimations.ts
    xbrlTagMap.ts
  engines/
    secClient.ts
  store/
    analyzerStore.ts
```

### Routing
- `/analyze` route in App.tsx (lazy loaded)
- "Company Analyzer" in sidebar nav

### Testing
- Unit tests for XBRL tag mapping
- Unit tests for animation data shape validation
- No E2E (consistent with current strategy)
