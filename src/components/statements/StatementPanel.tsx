/**
 * Reusable card wrapper for financial statements.
 * Warm parchment-style card with header area and content slot.
 * Supports optional collapse/minimize functionality.
 */

import { useState } from 'react'

export interface StatementPanelProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  headerRight?: React.ReactNode
  /** When true, adds a minimize/expand toggle button to the header */
  collapsible?: boolean
  /** Start collapsed (only effective when collapsible=true). Default: false */
  defaultCollapsed?: boolean
}

export default function StatementPanel({
  title,
  subtitle,
  children,
  headerRight,
  collapsible = false,
  defaultCollapsed = false,
}: StatementPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <div
      className="rounded-lg shadow-sm overflow-hidden flex flex-col"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Header */}
      <div
        className={`px-5 py-3 flex items-center justify-between${collapsible ? ' cursor-pointer select-none' : ''}`}
        style={{ borderBottom: collapsed ? 'none' : '1px solid var(--color-border)' }}
        onClick={collapsible ? () => setCollapsed((c) => !c) : undefined}
      >
        <div className="flex items-center gap-2">
          {collapsible && (
            <span
              style={{
                display: 'inline-block',
                transition: 'transform 0.25s ease',
                transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                fontSize: '0.7rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1,
              }}
            >
              ▼
            </span>
          )}
          <div>
            <h2
              className="text-lg font-semibold leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {title}
            </h2>
            {subtitle && !collapsed && (
              <p
                className="text-xs mt-0.5"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {headerRight && !collapsed && <div>{headerRight}</div>}
          {collapsible && (
            <button
              type="button"
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
              style={{
                background: 'var(--color-border)',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                border: 'none',
              }}
              onClick={(e) => {
                e.stopPropagation()
                setCollapsed((c) => !c)
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-text-muted)'
                e.currentTarget.style.color = 'var(--color-surface)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-border)'
                e.currentTarget.style.color = 'var(--color-text-muted)'
              }}
            >
              {collapsed ? 'Expand' : 'Minimize'}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          overflow: 'hidden',
          transition: 'max-height 0.35s ease, opacity 0.25s ease',
          maxHeight: collapsed ? 0 : '5000px',
          opacity: collapsed ? 0 : 1,
        }}
      >
        <div className="px-5 py-4 overflow-auto flex-1 text-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
