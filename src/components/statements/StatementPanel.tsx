/**
 * Reusable card wrapper for financial statements.
 * Warm parchment-style card with header area and content slot.
 */

export interface StatementPanelProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  headerRight?: React.ReactNode
}

export default function StatementPanel({
  title,
  subtitle,
  children,
  headerRight,
}: StatementPanelProps) {
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
        className="px-5 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div>
          <h2
            className="text-lg font-semibold leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {headerRight && <div>{headerRight}</div>}
      </div>

      {/* Content */}
      <div className="px-5 py-4 overflow-auto flex-1 text-sm">
        {children}
      </div>
    </div>
  )
}
