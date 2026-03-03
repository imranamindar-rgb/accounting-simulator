# Chapter/Zone Architecture — Design Document

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the accounting simulator from a 2-page tool into a 10-chapter EMBA-grade learning platform with pedagogical depth, fraud forensics, and professional skepticism training — taking it decisively beyond the quant-lab architecture.

**Architecture:** Port quant-lab's chapter/zone structure into accounting. Each of 10 chapters has 5 zones (Concepts → Simulation → Practice → Mastery → Takeaways). Every chapter's Concepts zone embeds 3 real fraud cases with behavioral analysis. Chapter 10 is dedicated to Earnings Management & Fraud Detection. Existing simulations (SimulationPlayer, T-accounts, M&A workbench, DuPont, etc.) slot directly into their respective chapter zones.

**Tech Stack:** React 19, TypeScript, Vite 7, Tailwind CSS 4, Zustand 5, React Router DOM 7, Recharts, KaTeX (new), existing engines (Ledger, MAEngine, RatioCalculator, StatementGenerator)

---

## Curriculum Structure

### 10 Chapters

| # | Chapter | Zone 2 Simulation (existing) | Fraud Focus |
|---|---------|------------------------------|-------------|
| 1 | The Accounting Equation & Double Entry | Transaction Builder + T-Account View | HealthSouth, Parmalat, Waste Management |
| 2 | Revenue Recognition & Accrual Accounting | SimulationPlayer (revenue scenarios) | Sunbeam, Lucent, Xerox |
| 3 | Inventory Methods | Policy Comparison (FIFO/LIFO/WAC) | Crazy Eddie, Phar-Mor, Leslie Fay |
| 4 | Long-Term Assets & Depreciation | SimulationPlayer (asset scenarios) | WorldCom, Waste Management, Rite Aid |
| 5 | Liabilities & Off-Balance-Sheet Financing | SimulationPlayer (debt scenarios) | Enron SPEs, Lehman Repo 105, AIG |
| 6 | Equity, EPS & Executive Compensation | SimulationPlayer (equity scenarios) | Tyco, Adelphia, Backdating scandals |
| 7 | Cash Flow Analysis | CashFlow Statement + WhatIf Mode | Lehman, Autonomy/HP, Peregrine Systems |
| 8 | Ratio Analysis & DuPont Decomposition | RatioDashboard + DuPontChart | Enron ratios, Valeant, GE Capital |
| 9 | M&A, Goodwill & Business Combinations | M&A Workbench + ComparableCompanies | Kraft Heinz, AOL/TimeWarner, Tyco acquisitions |
| 10 | Earnings Management & Fraud Detection | Benford's Law + Red Flag Detector | Wirecard, Luckin Coffee, Madoff |

---

## Zone Structure (per chapter)

### Zone 1: Concepts
- Slide-based viewer (same pattern as quant-lab `ch1ConceptSlides.tsx`)
- Each slide: `title`, `diagram` (SVG/React component), `explanation`, `formula` (KaTeX), `highlights[]`, `deepDive` panel
- **Fraud Spotlight panel** embedded in every chapter — 3 cases minimum:
  - What happened (2-3 sentences)
  - The accounting concept abused (direct tie to chapter)
  - The bias at play (from fraud triangle)
  - The red flag that should have been caught
  - Consequence (regulatory action, stock collapse, criminal charges)
- **Prediction Prompt** before key reveals: student commits to a prediction before seeing the answer
- **Auditor Failure Analysis** panel: what the auditor missed and why

### Zone 2: Simulation
- Chapter-specific interactive simulation (existing components, wrapped in standard shell)
- **Earnings Quality Score** widget visible in header — accrual ratio, cash conversion, revenue/cash divergence
- Real-time ratio feedback as student records transactions

### Zone 3: Practice
- Seeded procedural problems (narrative-driven business scenarios)
- **CEO Decision Point** framing: problem presented from executive seat under real pressure
- 3-tier hints (conceptual → computational → answer)
- Step-by-step solution reveal with KaTeX formulas
- Sensitivity analysis narrative

### Zone 4: Mastery Check
- Stricter grading (hints cost stars)
- Mix of mechanics problems AND judgment questions ("Which of these three CFO options creates the greatest long-term risk?")
- Stars (0–3) recorded in progress store

### Zone 5: Takeaways
- 3 key takeaways per chapter (concept / insight / connection to other chapters)
- **The Skeptic's Lens** — 5 practical questions to ask when reading financial statements
- **Cross-Chapter Consequence Map** — visual showing how this chapter's manipulation cascades through other statements

---

## Chapter 10: Earnings Management & Fraud Detection (EMBA capstone)

### Unique features beyond standard zones:
1. **Fraud Triangle interactive** — pressure / opportunity / rationalization sliders; shows how each dimension increases fraud risk
2. **Benford's Law simulator** — upload or use sample numbers; detect first-digit anomalies in reported figures
3. **Red Flag Checklist** — 12-item diagnostic:
   - Net income vs. cash from operations divergence
   - Days Sales Outstanding trend vs. revenue growth
   - Goodwill as % of total assets (growing?)
   - Aggressive revenue timing (Q4 spikes)
   - Capex vs. industry peers
   - Auditor change within 12 months
   - Management turnover (CFO/CAO)
   - Related-party transaction growth
   - Consistent "just-met" earnings guidance
   - Unusually smooth earnings (Madoff signal)
   - Inventory growth > revenue growth
   - Accelerating accounts payable
4. **Case Autopsy** — 3 full autopsies (Wirecard, Luckin Coffee, Madoff):
   - Interactive timeline: stock price + analyst ratings + accounting events
   - Before/after financial statement comparison
   - Specific red flags that were visible at the time
5. **Interactive Restatement Exercise** — Given 3 years of a real company's financials, identify warning signs before seeing the actual restatement

---

## Pedagogical Features (across all chapters)

### Prediction Prompts
Before every major concept reveal:
> *"Before we show the impact — what do you think happens to the cash flow statement when revenue is recognized via bill-and-hold?"*
Student selects from 3 options. Prediction is logged. Gap between prediction and reality drives reflection.

### CEO Decision Point Scenarios
Practice problems framed from the executive seat:
> *"It's Q4. You're $40M short of analyst estimates. Your CFO presents three options: (A) accelerate recognition of a large contract, (B) reduce bad-debt reserve by $35M, (C) report the miss. Which do you choose, and what are the downstream consequences?"*

### Earnings Quality Score
Composite metric visible throughout Zone 2:
- **Accrual Ratio** = (Net Income − CFO) / Average Total Assets (lower = higher quality)
- **Cash Conversion Rate** = CFO / Net Income (higher = better)
- **Revenue Quality** = Cash collected / Revenue recognized
Displayed as a color-coded badge. Students learn to optimize quality, not just income.

### Auditor Failure Panels
Per fraud case, a dedicated "What the Auditor Missed" panel:
- Arthur Andersen / Enron: document shredding, client dependency
- EY / Wirecard: trusted management, deferred to third-party trustee
- Grant Thornton / Parmalat: confirmed balance with forged bank letter

### Cross-Chapter Consequence Map
Visual diagram in Zone 5 Takeaways:
```
Overstate Revenue (Ch2)
  → Inflate AR (Ch7: cash lag)
  → Inflate Assets (Ch1: equation imbalance)
  → Equity looks strong (Ch6: misleading ROE)
  → Ratios pass screening (Ch8: DuPont distorted)
  → Cash quietly collapses (Ch7: red flag)
```

### The Skeptic's Lens
5 practical questions closing every chapter. Example (Ch2):
1. Is revenue growing faster than cash collected from customers?
2. Has the company changed its revenue recognition policy in the last 2 years?
3. Are accounts receivable days increasing while revenue grows?
4. What percentage of revenue comes from Q4?
5. Does management guidance consistently match reported results within 1%?

---

## New Routes

```
/                          → Home (chapter grid, progress overview, concept search)
/chapter/:id               → ChapterPage (zone 1 default)
/chapter/:id/zone/:zone    → ChapterPage (specific zone 1–5)
/progress                  → Progress dashboard
```

Existing routes preserved:
```
/          → redirects into Home (was StatementsPage, now Ch1 entry)
/ma        → preserved as direct link to M&A Workbench (Ch9 Zone 2)
```

---

## New Components to Build

### Shell
- `NavDrawer.tsx` — collapsible sidebar, chapter list with progress indicators
- `ChapterLayout.tsx` — standard header + zone nav + earnings quality widget
- `ZoneNav.tsx` — 5-zone tab navigation
- `Home.tsx` — chapter grid, overall progress, concept search bar

### Pages
- `ChapterPage.tsx` — zone router, lazy-loads zone content
- `Progress.tsx` — completion dashboard, prediction calibration, stars

### Concept System
- `ConceptSlideViewer.tsx` — slide navigation, deep-dive panel toggle
- `FraudSpotlight.tsx` — 3-case fraud panel per chapter
- `PredictionPrompt.tsx` — pre-reveal hypothesis capture
- `AuditorFailurePanel.tsx` — "what the auditor missed"
- `SkepticsLens.tsx` — 5 questions per chapter
- `ConsequenceMap.tsx` — cross-chapter cascade diagram

### Problem System
- `ProblemShell.tsx` — CEO Decision Point framing wrapper
- `HintSystem.tsx` — 3-tier progressive hints
- `SolutionReveal.tsx` — step-by-step with KaTeX
- `MasteryCheck.tsx` — stricter assessment mode
- `ch1Problems.ts` through `ch10Problems.ts` — seeded generators

### Ch10 Forensics
- `FraudTriangle.tsx` — interactive pressure/opportunity/rationalization
- `BenfordLaw.tsx` — digit frequency analysis simulation
- `RedFlagChecklist.tsx` — 12-item diagnostic
- `CaseAutopsy.tsx` — timeline + before/after statements
- `RestatementExercise.tsx` — spot-the-fraud interactive

### Data
- `ch1ConceptSlides.tsx` through `ch10ConceptSlides.tsx` — slide content
- `toc.ts` — table of contents (chapter + zone structure)
- `chapterTakeaways.ts` — 3 takeaways per chapter
- `fraudCases.ts` — 30 fraud cases (3 per chapter), structured data

### Stores
- `progressStore.ts` — section stars, predictions, reflections (new, mirrors quant-lab)
- Existing `ledgerStore`, `maStore`, `uiStore` preserved

---

## New Dependencies

```bash
katex          # Mathematical formula rendering
@types/katex   # TypeScript types
```

---

## Design Principles

1. **EMBA framing throughout** — every feature answers "what does this mean for a decision-maker?"
2. **Mechanics + judgment** — no chapter teaches only the mechanics; every chapter asks what you'd do with the information
3. **Real > synthetic** — fraud cases use real numbers, real company names, real consequences
4. **Prediction before reveal** — build intuition, not just recall
5. **Quality over quantity** — the Earnings Quality Score reframes the goal from "maximize net income" to "maximize transparency"
