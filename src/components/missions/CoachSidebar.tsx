import { useMasteryStore } from '../../store/masteryStore'
import { MISCONCEPTIONS } from '../../engines/misconceptions'

export function CoachSidebar() {
  const lastAttempt = useMasteryStore((s) => s.lastAttempt)
  const recentAttempts = useMasteryStore((s) => s.recentAttempts)

  return (
    <div className="flex flex-col h-full">
      <div
        className="px-4 py-3 shrink-0"
        style={{
          background: 'linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)',
          color: '#FAF0D4',
        }}
      >
        <div className="font-semibold" style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
          Executive Coach
        </div>
        <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>
          Accuracy + interpretation, not memorization
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!lastAttempt ? (
          <div
            className="rounded-lg p-4 text-center"
            style={{
              background: 'var(--color-base)',
              border: '1px dashed var(--color-border)',
              color: 'var(--color-text-muted)',
              fontSize: '0.85rem',
              lineHeight: 1.5,
            }}
          >
            Complete a mission step to get coaching feedback here.
          </div>
        ) : (
          <>
            <div
              className="rounded-lg p-4"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                    Last Attempt
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {lastAttempt.templateName}
                  </div>
                </div>
                <div
                  className="text-xs font-semibold px-2 py-1 rounded"
                  style={{
                    background:
                      lastAttempt.score >= 85 ? '#DEF7EC' : lastAttempt.score >= 60 ? '#FEF3C7' : '#FDE8E8',
                    color:
                      lastAttempt.score >= 85 ? 'var(--color-green)' : lastAttempt.score >= 60 ? '#92400E' : '#B91C1C',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {lastAttempt.score}%
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2" style={{ fontSize: '0.8rem' }}>
                {(
                  [
                    ['cash', 'Cash'],
                    ['netIncome', 'Net Income'],
                    ['totalAssets', 'Total Assets'],
                    ['totalLiabilities', 'Total Liabilities'],
                    ['totalEquity', 'Total Equity'],
                    ['cashFlowSection', 'Cash Flow Section'],
                  ] as const
                ).map(([k, label]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between rounded px-3 py-1.5"
                    style={{
                      background: 'var(--color-base)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                    <span
                      style={{
                        color: lastAttempt.breakdown[k] ? 'var(--color-green)' : '#B91C1C',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                      }}
                    >
                      {lastAttempt.breakdown[k] ? 'Correct' : 'Miss'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {lastAttempt.misconceptions.length > 0 && (
              <div className="space-y-2">
                <div className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                  Targeted Fixes
                </div>
                {lastAttempt.misconceptions.map((id) => {
                  const m = MISCONCEPTIONS[id]
                  if (!m) return null
                  return (
                    <div
                      key={id}
                      className="rounded-lg p-3"
                      style={{
                        background: '#FFFBF0',
                        border: '1px solid #E8D5B7',
                      }}
                    >
                      <div className="font-semibold" style={{ fontSize: '0.85rem' }}>
                        {m.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                        {m.description}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {recentAttempts.length > 1 && (
              <div
                className="rounded-lg p-3"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div className="font-semibold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  Recent Scores
                </div>
                <div className="space-y-1">
                  {recentAttempts.slice(0, 6).map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between"
                      style={{ fontSize: '0.78rem' }}
                    >
                      <span style={{ color: 'var(--color-text-muted)' }}>{a.templateName}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>
                        {a.score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

