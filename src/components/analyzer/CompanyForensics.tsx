/**
 * CompanyForensics -- Benford's Law analysis + Red Flag Checklist.
 *
 * Two-column grid:
 *   Left:  Benford's Law bar chart (recharts BarChart) comparing expected vs
 *          observed first-digit distribution of all 10-K USD values.
 *   Right: Red Flag Checklist derived from ratios and Benford chi-squared.
 *
 * Benford expected distribution: [30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6]
 * Chi-squared threshold: 15.51 (df=8, p=0.05)
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useAnalyzerStore } from '../../store/analyzerStore'
import type { CompanyFacts } from '../../engines/secClient'
import type { FinancialRatios } from '../../engines/RatioCalculator'

// ── Benford constants ────────────────────────────────────────────────

const BENFORD_EXPECTED = [30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6]
const CHI_SQUARED_THRESHOLD = 15.51 // df=8, p=0.05 critical value

// ── Benford analysis ─────────────────────────────────────────────────

interface BenfordResult {
  counts: number[]       // raw counts per digit 1-9
  observed: number[]     // percentages per digit 1-9
  chiSquared: number
  totalValues: number
}

function analyzeBenford(facts: CompanyFacts): BenfordResult | null {
  const usGaap = facts.facts['us-gaap']
  if (!usGaap) return null

  // Collect all 10-K USD values
  const values: number[] = []
  for (const concept of Object.values(usGaap)) {
    const usdUnits = concept.units.USD
    if (!usdUnits) continue
    for (const entry of usdUnits) {
      if (entry.form === '10-K' && entry.val !== 0) {
        values.push(Math.abs(entry.val))
      }
    }
  }

  if (values.length < 20) return null

  // Count leading digits
  const counts = new Array<number>(9).fill(0)
  for (const v of values) {
    const firstDigit = parseInt(String(v).replace('.', '')[0], 10)
    if (firstDigit >= 1 && firstDigit <= 9) {
      counts[firstDigit - 1]++
    }
  }

  const total = counts.reduce((a, b) => a + b, 0)
  const observed = counts.map((c) => (total > 0 ? (c / total) * 100 : 0))

  // Compute chi-squared: sum of (O - E)^2 / E, where E is expected count
  let chiSquared = 0
  for (let i = 0; i < 9; i++) {
    const expectedCount = (BENFORD_EXPECTED[i] / 100) * total
    if (expectedCount > 0) {
      chiSquared += Math.pow(counts[i] - expectedCount, 2) / expectedCount
    }
  }

  return { counts, observed, chiSquared, totalValues: values.length }
}

// ── Chart data builder ───────────────────────────────────────────────

interface ChartDatum {
  digit: string
  Expected: number
  Observed: number
}

function buildChartData(observed: number[]): ChartDatum[] {
  return BENFORD_EXPECTED.map((exp, i) => ({
    digit: String(i + 1),
    Expected: parseFloat(exp.toFixed(1)),
    Observed: parseFloat(observed[i].toFixed(1)),
  }))
}

// ── Red flag detection ───────────────────────────────────────────────

type Severity = 'high' | 'medium' | 'low'

interface RedFlag {
  label: string
  detail: string
  severity: Severity
}

const SEVERITY_COLORS: Record<Severity, string> = {
  high: '#C0392B',
  medium: '#DAA520',
  low: '#2D6A4F',
}

function detectRedFlags(
  ratios: FinancialRatios,
  chiSquared: number | null,
  totalAssets: number,
  goodwill: number,
): RedFlag[] {
  const flags: RedFlag[] = []

  // 1. Negative net margin (high)
  if (ratios.netProfitMargin !== null && ratios.netProfitMargin < 0) {
    flags.push({
      label: 'Negative Net Margin',
      detail: `Net margin is ${(ratios.netProfitMargin * 100).toFixed(1)}% — company is unprofitable.`,
      severity: 'high',
    })
  }

  // 2. Current ratio < 1 (high)
  if (ratios.currentRatio !== null && ratios.currentRatio < 1) {
    flags.push({
      label: 'Low Liquidity',
      detail: `Current ratio ${ratios.currentRatio.toFixed(2)}x < 1.0 — short-term obligations exceed current assets.`,
      severity: 'high',
    })
  }

  // 3. D/E > 3 (high)
  if (ratios.debtToEquity !== null && ratios.debtToEquity > 3) {
    flags.push({
      label: 'Excessive Leverage',
      detail: `Debt-to-equity ${ratios.debtToEquity.toFixed(2)}x > 3.0 — heavily leveraged balance sheet.`,
      severity: 'high',
    })
  }

  // 4. Goodwill > 40% of assets (medium)
  if (totalAssets > 0 && goodwill > 0) {
    const goodwillPct = goodwill / totalAssets
    if (goodwillPct > 0.40) {
      flags.push({
        label: 'High Goodwill Concentration',
        detail: `Goodwill is ${(goodwillPct * 100).toFixed(1)}% of total assets — acquisition premium risk.`,
        severity: 'medium',
      })
    }
  }

  // 5. Interest coverage < 2 (high)
  if (ratios.interestCoverage !== null && ratios.interestCoverage < 2) {
    flags.push({
      label: 'Weak Interest Coverage',
      detail: `Interest coverage ${ratios.interestCoverage.toFixed(2)}x < 2.0 — limited debt service capacity.`,
      severity: 'high',
    })
  }

  // 6. DSO > 90 days (medium)
  if (ratios.dso !== null && ratios.dso > 90) {
    flags.push({
      label: 'High Days Sales Outstanding',
      detail: `DSO ${Math.round(ratios.dso)} days > 90 — slow receivables collection.`,
      severity: 'medium',
    })
  }

  // 7. Benford chi-squared > 15.51 (medium)
  if (chiSquared !== null && chiSquared > CHI_SQUARED_THRESHOLD) {
    flags.push({
      label: 'Benford Anomaly Detected',
      detail: `Chi-squared ${chiSquared.toFixed(2)} exceeds the 15.51 threshold — first-digit distribution is unusual.`,
      severity: 'medium',
    })
  }

  return flags
}

// ── Sub-components ───────────────────────────────────────────────────

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--color-text)',
          margin: 0,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────

export default function CompanyForensics() {
  const facts = useAnalyzerStore((s) => s.facts)
  const ratios = useAnalyzerStore((s) => s.ratios)
  const bs = useAnalyzerStore((s) => s.bs)

  if (!facts || !ratios || !bs) return null

  // Compute Benford analysis
  const benford = analyzeBenford(facts)
  const chiSquared = benford?.chiSquared ?? null
  const anomaly = chiSquared !== null && chiSquared > CHI_SQUARED_THRESHOLD

  // Goodwill from bs noncurrent assets
  const goodwillLine = bs.noncurrentAssets.find((l) => l.name === 'Goodwill')
  const goodwill = goodwillLine?.balance ?? 0

  // Red flags
  const flags = detectRedFlags(ratios, chiSquared, bs.totalAssets, goodwill)

  return (
    <div>
      {/* Section header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
          paddingBottom: 6,
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--color-text)',
            margin: 0,
          }}
        >
          Forensic Analysis
        </h3>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16,
        }}
      >
        {/* ── Benford's Law panel ── */}
        <Panel title="Benford's Law">
          {benford === null ? (
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--color-text-muted)',
                fontStyle: 'italic',
              }}
            >
              Insufficient data — fewer than 20 USD values found in this filing.
            </p>
          ) : (
            <>
              {/* Chi-squared badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 12px',
                  borderRadius: 4,
                  background: anomaly ? '#FEE2E2' : '#DCFCE7',
                  border: `1px solid ${anomaly ? '#FCA5A5' : '#86EFAC'}`,
                  alignSelf: 'flex-start',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: anomaly ? '#991B1B' : '#166534',
                  }}
                >
                  &chi;&sup2; = {chiSquared!.toFixed(2)}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: anomaly ? '#991B1B' : '#166534',
                  }}
                >
                  {anomaly ? 'ANOMALY DETECTED' : 'WITHIN NORMAL RANGE'}
                </span>
              </div>

              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)',
                  margin: 0,
                }}
              >
                Based on {benford.totalValues.toLocaleString()} 10-K USD values.
                Critical value: 15.51 (df=8, p=0.05).
              </p>

              {/* Bar chart */}
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={buildChartData(benford.observed)}
                    margin={{ top: 4, right: 4, left: 0, bottom: 4 }}
                    barCategoryGap="20%"
                    barGap={2}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis
                      dataKey="digit"
                      tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v: number) => `${v}%`}
                      tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                      axisLine={false}
                      tickLine={false}
                      width={38}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(1)}%`]}
                      contentStyle={{
                        fontSize: '0.75rem',
                        border: '1px solid var(--color-border)',
                        borderRadius: 4,
                        background: 'var(--color-surface)',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '0.72rem', paddingTop: 4 }}
                    />
                    <Bar dataKey="Expected" fill="#9CA3AF" name="Expected" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Observed" fill="var(--color-accent)" name="Observed" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </Panel>

        {/* ── Red Flag Checklist panel ── */}
        <Panel title="Red Flag Checklist">
          {flags.length === 0 ? (
            <p
              style={{
                fontSize: '0.85rem',
                color: '#2D6A4F',
                fontWeight: 600,
              }}
            >
              No red flags detected.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {flags.map((flag) => (
                <div
                  key={flag.label}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: 'var(--color-base)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {/* Severity dot */}
                  <span
                    style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: SEVERITY_COLORS[flag.severity],
                      flexShrink: 0,
                      marginTop: 3,
                    }}
                    title={flag.severity}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: 'var(--color-text)',
                        marginBottom: 2,
                      }}
                    >
                      {flag.label}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-text-muted)',
                        lineHeight: 1.4,
                      }}
                    >
                      {flag.detail}
                    </div>
                  </div>
                </div>
              ))}

              {/* Legend */}
              <div
                style={{
                  display: 'flex',
                  gap: 14,
                  marginTop: 4,
                  paddingTop: 8,
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                {(Object.entries(SEVERITY_COLORS) as [Severity, string][]).map(([sev, color]) => (
                  <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: color,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--color-text-muted)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {sev}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
