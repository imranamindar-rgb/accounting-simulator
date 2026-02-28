/**
 * InsightSidebar -- always-visible right sidebar showing the last
 * recorded transaction's impact on financial statements.
 */

import { InsightPanel } from './InsightPanel'
import type { RecordedTransaction } from './TransactionSidebar'

interface InsightSidebarProps {
  lastRecorded: RecordedTransaction | null
}

export function InsightSidebar({ lastRecorded }: InsightSidebarProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-4 py-3 shrink-0"
        style={{
          background: 'linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)',
          color: '#FAF0D4',
        }}
      >
        <span
          className="font-semibold"
          style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}
        >
          Transaction Insights
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {lastRecorded ? (
          <InsightPanel
            template={lastRecorded.template}
            params={lastRecorded.params}
            changes={lastRecorded.changes}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div
              className="rounded-full mb-3 flex items-center justify-center"
              style={{
                width: 48,
                height: 48,
                background: 'var(--color-base)',
                border: '2px dashed var(--color-border)',
                fontSize: '1.2rem',
              }}
            >
              {'\u2728'}
            </div>
            <p
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.85rem',
                lineHeight: 1.5,
              }}
            >
              Record a transaction to see how it flows through the financial statements
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
