/**
 * Currency formatting utility — component and plain function.
 *
 * - 'ones' scale:    45000 → "45,000"
 * - 'millions' scale: 110000 → "110,000M"
 * - Negatives shown in parentheses: -1600 → "(1,600)"
 */

type Scale = 'ones' | 'millions'

export interface FormatCurrencyProps {
  value: number
  scale?: Scale
  className?: string
  showSign?: boolean
}

/**
 * Format a number as a currency string (no decimals).
 * Negative values are wrapped in parentheses.
 */
export function formatCurrency(value: number, scale: Scale = 'ones'): string {
  const isNegative = value < 0
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  const suffix = scale === 'millions' ? 'M' : ''
  return isNegative ? `(${formatted}${suffix})` : `${formatted}${suffix}`
}

export default function FormatCurrency({
  value,
  scale = 'ones',
  className = '',
  showSign = false,
}: FormatCurrencyProps) {
  const isNegative = value < 0
  const text = showSign && value > 0
    ? `+${formatCurrency(value, scale)}`
    : formatCurrency(value, scale)

  return (
    <span
      className={`font-mono ${isNegative ? 'text-red-600' : ''} ${className}`}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {text}
    </span>
  )
}
