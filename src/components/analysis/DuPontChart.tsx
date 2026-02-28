/**
 * DuPontChart -- visual 3-factor DuPont decomposition of ROE.
 *
 * ROE = Net Margin x Asset Turnover x Equity Multiplier
 *
 * Rendered as coloured blocks in a horizontal flex layout with
 * multiplication signs between them.
 */

export interface DuPontChartProps {
  dupont: {
    netMargin: number | null
    assetTurnover: number | null
    equityMultiplier: number | null
  }
  roe: number | null
}

// ── Helpers ─────────────────────────────────────────────────────────

function pct(v: number | null): string {
  if (v === null) return 'N/A'
  return `${(v * 100).toFixed(1)}%`
}

function ratio(v: number | null): string {
  if (v === null) return 'N/A'
  return `${v.toFixed(2)}x`
}

// ── Component colours ───────────────────────────────────────────────

const COLORS = {
  netMargin: { bg: '#2D6A4F', text: '#ffffff' },       // green
  assetTurnover: { bg: '#B8860B', text: '#ffffff' },    // dark goldenrod
  equityMultiplier: { bg: '#8B1A1A', text: '#ffffff' }, // dark red
  roe: { bg: '#1B4332', text: '#ffffff' },              // deep green
} as const

// ── Component ───────────────────────────────────────────────────────

export default function DuPontChart({ dupont, roe }: DuPontChartProps) {
  const factors: {
    label: string
    value: string
    color: { bg: string; text: string }
  }[] = [
    {
      label: 'Net Margin',
      value: pct(dupont.netMargin),
      color: COLORS.netMargin,
    },
    {
      label: 'Asset Turnover',
      value: ratio(dupont.assetTurnover),
      color: COLORS.assetTurnover,
    },
    {
      label: 'Equity Multiplier',
      value: ratio(dupont.equityMultiplier),
      color: COLORS.equityMultiplier,
    },
  ]

  return (
    <div
      className="rounded-lg p-5"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Title */}
      <p
        className="text-xs font-medium uppercase tracking-wide mb-3"
        style={{ color: 'var(--color-text-muted)' }}
      >
        DuPont Decomposition
      </p>

      {/* Formula label */}
      <p
        className="text-xs mb-4 text-center"
        style={{
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-mono, ui-monospace, monospace)',
        }}
      >
        ROE = Net Margin &times; Asset Turnover &times; Equity Multiplier
      </p>

      {/* Factor blocks */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* ROE result block */}
        <div
          className="rounded-md px-4 py-3 text-center flex-shrink-0"
          style={{
            backgroundColor: COLORS.roe.bg,
            color: COLORS.roe.text,
            minWidth: 90,
          }}
        >
          <div className="text-[10px] uppercase tracking-wider opacity-80">ROE</div>
          <div
            className="text-lg font-bold"
            style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}
          >
            {pct(roe)}
          </div>
        </div>

        {/* Equals sign */}
        <span
          className="text-lg font-bold"
          style={{ color: 'var(--color-text-muted)' }}
        >
          =
        </span>

        {factors.map((factor, idx) => (
          <div key={factor.label} className="flex items-center gap-2">
            {/* Multiplication sign (before 2nd and 3rd factor) */}
            {idx > 0 && (
              <span
                className="text-lg font-bold"
                style={{ color: 'var(--color-text-muted)' }}
              >
                &times;
              </span>
            )}

            <div
              className="rounded-md px-4 py-3 text-center flex-shrink-0"
              style={{
                backgroundColor: factor.color.bg,
                color: factor.color.text,
                minWidth: 100,
              }}
            >
              <div className="text-[10px] uppercase tracking-wider opacity-80">
                {factor.label}
              </div>
              <div
                className="text-lg font-bold"
                style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}
              >
                {factor.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
