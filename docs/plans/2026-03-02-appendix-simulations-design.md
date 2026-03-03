# Appendix + Chapter Simulations Design

## Goal

Replace generic SimulationPlayer stubs in ch1–7 Zone2 with dedicated chapter-specific interactive tools. Add a three-part Appendix section accessible from the NavDrawer. Add "Designed by Imran Dar" attribution on the Home page and a global footer.

## Architecture

### Chapter-Specific Simulations (Zone 2)

Each ch1–7 Zone2 gets a standalone React component (no SimulationPlayer dependency). Ch8/9/10 already have dedicated tools and are unchanged.

| Chapter | Component | Core mechanic |
|---------|-----------|---------------|
| Ch1 | `AccountingEquationBalancer` | Enter debit/credit journal entries; Assets = L + E balance indicator updates live |
| Ch2 | `RevenueRecognitionTimer` | Pick contract type (point-in-time / over-time / milestone); timeline slider shows revenue vs deferred revenue vs cash |
| Ch3 | `InventoryCostComparator` | Enter up to 5 purchase lots + units sold; FIFO / LIFO / WAC COGS and ending inventory shown side-by-side |
| Ch4 | `DepreciationScheduleBuilder` | Enter cost, salvage, useful life; SL vs DDB vs SYD year-by-year schedule table + cumulative chart |
| Ch5 | `CovenantStressTester` | Enter Debt, EBITDA, Interest + covenant thresholds; drag EBITDA down; red flash when covenant breaches |
| Ch6 | `EPSDilutionCalculator` | Basic shares + layered instruments (options/RSUs/converts); treasury stock method; basic → diluted bridge |
| Ch7 | `CFOBridgeBuilder` | Start from Net Income; toggle non-cash add-backs and working capital changes; indirect-method CFO builds line by line |

All components live in `src/components/simulations/` and are wrapped in `SimulationWrapper`.

### Appendix Pages

Three new routes under `/appendix/:id`:

| Route | Page | Content |
|-------|------|---------|
| `/appendix/1` | `AppendixSimulations` | All 10 chapter simulations rendered in sequence (imports each component directly) |
| `/appendix/2` | `AppendixCases` | All fraud cases from `FRAUD_CASES` expanded into a full case library (richer than in-chapter FraudSpotlight) |
| `/appendix/3` | `AppendixStatementsPage` | The full `SimulationPlayer` — financial statements interconnection simulator — given a standalone home |

### Navigation

NavDrawer gets an "Appendix" section below the chapter list with three NavLinks:
- A1 · All Simulations
- A2 · Case Library
- A3 · Statements Simulator

### Attribution

- **Home page**: `"Designed by Imran Dar"` in small muted monospace font directly below the main `<h1>` heading
- **Global footer**: A thin strip at the bottom of every page reading `"Designed by Imran Dar · Financial Accounting EMBA Platform"` — implemented in `App.tsx` outside the `<Routes>` so it appears on all routes

## File Changes

**New files:**
- `src/components/simulations/AccountingEquationBalancer.tsx`
- `src/components/simulations/RevenueRecognitionTimer.tsx`
- `src/components/simulations/InventoryCostComparator.tsx`
- `src/components/simulations/DepreciationScheduleBuilder.tsx`
- `src/components/simulations/CovenantStressTester.tsx`
- `src/components/simulations/EPSDilutionCalculator.tsx`
- `src/components/simulations/CFOBridgeBuilder.tsx`
- `src/pages/AppendixPage.tsx` (renders A1/A2/A3 based on `useParams`)

**Modified files:**
- `src/zones/ch{1-7}/Zone2.tsx` — replace SimulationPlayer with dedicated component
- `src/components/shell/NavDrawer.tsx` — add Appendix section
- `src/pages/Home.tsx` — add attribution below heading
- `src/App.tsx` — add `/appendix/:id` route + global footer strip

## Design Principles

- Each simulation uses only sliders, number inputs, and computed derived state — no external data fetching
- All styled with existing CSS custom properties (no new design tokens)
- Components are self-contained and reusable for Appendix 1 (imported directly there)
- Footer is minimal: one line, muted text, no links
