/**
 * Shared sub-components for rendering statement rows.
 * Used across Balance Sheet, Income Statement, Cash Flow, and Equity.
 */

import FormatCurrency from '../shared/FormatCurrency'
import type { Scale } from './statementUtils'

/* ── Single account / item row ──────────────────────────────── */

interface LineItemProps {
  label: string
  value: number
  scale: Scale
  indent?: boolean
  contra?: boolean
  bold?: boolean
}

export function LineItem({ label, value, scale, indent, contra, bold }: LineItemProps) {
  return (
    <tr>
      <td
        className={`py-0.5 ${indent || contra ? 'pl-6' : ''} ${bold ? 'font-semibold' : ''}`}
        style={{ color: 'var(--color-text)' }}
      >
        {label}
      </td>
      <td className={`py-0.5 text-right ${bold ? 'font-semibold' : ''}`}>
        <FormatCurrency value={value} scale={scale} />
      </td>
    </tr>
  )
}

/* ── Section header ─────────────────────────────────────────── */

interface SectionHeaderProps {
  label: string
}

export function SectionHeader({ label }: SectionHeaderProps) {
  return (
    <tr>
      <td
        colSpan={2}
        className="pt-3 pb-1 font-semibold text-sm"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
      >
        {label}
      </td>
    </tr>
  )
}

/* ── Sub-header (e.g. "Current Assets") ─────────────────────── */

interface SubHeaderProps {
  label: string
}

export function SubHeader({ label }: SubHeaderProps) {
  return (
    <tr>
      <td
        colSpan={2}
        className="pt-2 pb-0.5 pl-2 text-xs font-medium uppercase tracking-wider"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </td>
    </tr>
  )
}

/* ── Subtotal row (single top border) ───────────────────────── */

interface SubtotalRowProps {
  label: string
  value: number
  scale: Scale
}

export function SubtotalRow({ label, value, scale }: SubtotalRowProps) {
  return (
    <tr>
      <td
        className="pt-1 pb-0.5 pl-2 font-medium"
        style={{
          borderTop: '1px solid var(--color-border)',
          color: 'var(--color-text)',
        }}
      >
        {label}
      </td>
      <td
        className="pt-1 pb-0.5 text-right font-medium"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <FormatCurrency value={value} scale={scale} />
      </td>
    </tr>
  )
}

/* ── Total row (double top border, bold) ────────────────────── */

interface TotalRowProps {
  label: string
  value: number
  scale: Scale
}

export function TotalRow({ label, value, scale }: TotalRowProps) {
  return (
    <tr>
      <td
        className="pt-1 pb-0.5 font-bold"
        style={{
          borderTop: '3px double var(--color-border)',
          color: 'var(--color-text)',
        }}
      >
        {label}
      </td>
      <td
        className="pt-1 pb-0.5 text-right font-bold"
        style={{ borderTop: '3px double var(--color-border)' }}
      >
        <FormatCurrency value={value} scale={scale} />
      </td>
    </tr>
  )
}
