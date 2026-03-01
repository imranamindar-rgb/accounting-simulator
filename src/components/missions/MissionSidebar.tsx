import { MISSIONS } from '../../data/missions'
import { useMissionStore } from '../../store/missionStore'
import { useMasteryStore } from '../../store/masteryStore'

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x))
}

export function MissionSidebar() {
  const activeMissionId = useMissionStore((s) => s.activeMissionId)
  const selectMission = useMissionStore((s) => s.selectMission)
  const completedThroughStep = useMissionStore((s) => s.completedThroughStep)

  const conceptStats = useMasteryStore((s) => s.conceptStats)
  const resetMastery = useMasteryStore((s) => s.resetMastery)

  const masteryValues = Object.values(conceptStats).map((c) => c.avgScore)
  const overallMastery =
    masteryValues.length > 0
      ? masteryValues.reduce((a, b) => a + b, 0) / masteryValues.length
      : 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-4 py-3 shrink-0"
        style={{
          background: 'linear-gradient(135deg, #0B3B59 0%, #062B41 100%)',
          color: '#FAF0D4',
        }}
      >
        <div className="font-semibold" style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
          Executive Missions
        </div>
        <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>
          Predict → Post → Interpret → Decide
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Mastery summary */}
        <div
          className="rounded-lg p-3"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
            <div className="font-semibold" style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}>
              Mastery
            </div>
            <div
              className="text-xs"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              {overallMastery.toFixed(0)}%
            </div>
          </div>
          <div className="h-2 rounded" style={{ background: 'var(--color-base)', overflow: 'hidden' }}>
            <div
              className="h-2"
              style={{
                width: `${clamp01(overallMastery / 100) * 100}%`,
                background: 'linear-gradient(90deg, #2D6A4F 0%, #DAA520 100%)',
              }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Based on prediction accuracy
            </span>
            <button
              type="button"
              onClick={resetMastery}
              className="text-xs px-2 py-1 rounded cursor-pointer"
              style={{
                background: 'var(--color-base)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Mission list */}
        <div className="space-y-2">
          {MISSIONS.map((m) => {
            const isActive = m.id === activeMissionId
            const completed = completedThroughStep[m.id] ?? 0
            const total = m.steps.length
            const pct = total > 0 ? completed / total : 0

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => selectMission(m.id)}
                className="w-full text-left rounded-lg p-3 cursor-pointer transition-colors"
                style={{
                  background: isActive ? '#FFFBF0' : 'var(--color-surface)',
                  border: isActive ? '1px solid #E8D5B7' : '1px solid var(--color-border)',
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold" style={{ fontFamily: 'var(--font-display)', fontSize: '0.92rem' }}>
                      {m.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      Role: {m.role} · {m.concepts.length} concepts
                    </div>
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {Math.round(pct * 100)}%
                  </div>
                </div>
                <div className="h-1.5 rounded mt-2" style={{ background: 'var(--color-base)', overflow: 'hidden' }}>
                  <div
                    className="h-1.5"
                    style={{
                      width: `${clamp01(pct) * 100}%`,
                      background: isActive
                        ? 'linear-gradient(90deg, #2563EB 0%, #0891B2 100%)'
                        : 'linear-gradient(90deg, rgba(37,99,235,0.55) 0%, rgba(8,145,178,0.55) 100%)',
                    }}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

