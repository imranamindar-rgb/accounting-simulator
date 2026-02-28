/**
 * RatioCard -- displays a single financial ratio with formatted value,
 * description, and optional colour-coded benchmark indicator.
 */

export interface RatioCardProps {
  name: string
  value: number | null
  format: 'ratio' | 'percent' | 'currency' | 'days'
  description: string
  benchmark?: { good: number; warning: number; inverse?: boolean }
}

// ── Formatting helpers ──────────────────────────────────────────────

function formatValue(value: number, format: RatioCardProps['format']): string {
  switch (format) {
    case 'ratio':
      return `${value.toFixed(2)}x`
    case 'percent':
      return `${(value * 100).toFixed(2)}%`
    case 'currency':
      return `$${Math.round(value).toLocaleString('en-US')}`
    case 'days':
      return `${Math.round(value)} days`
  }
}

// ── Benchmark evaluation ────────────────────────────────────────────

type BenchmarkLevel = 'good' | 'warning' | 'danger'

const BENCHMARK_COLORS: Record<BenchmarkLevel, string> = {
  good: '#2D6A4F',
  warning: '#DAA520',
  danger: '#C0392B',
}

function evaluateBenchmark(
  value: number,
  benchmark: NonNullable<RatioCardProps['benchmark']>,
): BenchmarkLevel {
  const { good, warning, inverse } = benchmark

  if (inverse) {
    // Lower is better (e.g. D/E, DSO)
    if (value <= good) return 'good'
    if (value <= warning) return 'warning'
    return 'danger'
  }

  // Higher is better (default)
  if (value >= good) return 'good'
  if (value >= warning) return 'warning'
  return 'danger'
}

// For percent-formatted ratios the benchmark thresholds are expressed as raw
// decimals (e.g. good=0.30 for 30 %).  We need to compare the raw ratio value
// against these thresholds, not the displayed percentage.
function benchmarkValue(
  value: number,
  _format: RatioCardProps['format'],
): number {
  return value
}

// ── Component ───────────────────────────────────────────────────────

export default function RatioCard({
  name,
  value,
  format,
  description,
  benchmark,
}: RatioCardProps) {
  const isNull = value === null || value === undefined

  let benchmarkLevel: BenchmarkLevel | null = null
  if (!isNull && benchmark) {
    benchmarkLevel = evaluateBenchmark(benchmarkValue(value, format), benchmark)
  }

  return (
    <div
      className="rounded-lg shadow-sm p-4 flex flex-col gap-1"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Ratio name + benchmark dot */}
      <div className="flex items-center gap-2">
        {benchmarkLevel && (
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: BENCHMARK_COLORS[benchmarkLevel],
              flexShrink: 0,
            }}
            title={benchmarkLevel}
          />
        )}
        <span
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {name}
        </span>
      </div>

      {/* Value */}
      <span
        className="text-xl font-semibold"
        style={{
          fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          color: isNull ? 'var(--color-text-muted)' : 'var(--color-text)',
        }}
      >
        {isNull ? 'N/A' : formatValue(value, format)}
      </span>

      {/* Description */}
      <span
        className="text-xs leading-snug"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {description}
      </span>
    </div>
  )
}
