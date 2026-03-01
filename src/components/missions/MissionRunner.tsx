import { useCallback, useEffect, useMemo, useRef } from 'react'
import { MISSIONS } from '../../data/missions'
import { useMissionStore } from '../../store/missionStore'
import { useLedgerStore } from '../../store/ledgerStore'
import { useUIStore } from '../../store/uiStore'
import { GuidedTransactionCard } from './GuidedTransactionCard'
import type { RecordedTransaction } from '../transaction/TransactionSidebar'

function missionById(id: string) {
  return MISSIONS.find((m) => m.id === id) ?? MISSIONS[0]
}

export function MissionRunner({
  onRecorded,
}: {
  onRecorded?: (tx: RecordedTransaction) => void
}) {
  const activeMissionId = useMissionStore((s) => s.activeMissionId)
  const activeStepIndex = useMissionStore((s) => s.activeStepIndex)
  const selectMission = useMissionStore((s) => s.selectMission)
  const goToStep = useMissionStore((s) => s.goToStep)
  const completeCurrentStep = useMissionStore((s) => s.completeCurrentStep)
  const reflections = useMissionStore((s) => s.reflections)
  const setReflection = useMissionStore((s) => s.setReflection)
  const resetMission = useMissionStore((s) => s.resetMission)
  const completedThroughStep = useMissionStore((s) => s.completedThroughStep)

  const currentPeriod = useLedgerStore((s) => s.currentPeriod)
  const periods = useLedgerStore((s) => s.periods)
  const closePeriod = useLedgerStore((s) => s.closePeriod)

  const openReviewPack = useUIStore((s) => s.openReviewPack)

  const mission = useMemo(() => missionById(activeMissionId), [activeMissionId])
  const completed = completedThroughStep[mission.id] ?? 0
  const step = mission.steps[activeStepIndex] ?? null

  const actionAnchorRef = useRef<HTMLDivElement | null>(null)
  const scrollToAction = useCallback(() => {
    actionAnchorRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [])

  // Reduce "where do I click?" scrolling by snapping the center pane to the current
  // step's action region whenever the learner changes mission or advances steps.
  useEffect(() => {
    const id = requestAnimationFrame(() => scrollToAction())
    return () => cancelAnimationFrame(id)
  }, [activeMissionId, activeStepIndex, scrollToAction])

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(11,59,89,0.08) 0%, rgba(218,165,32,0.08) 100%)',
    border: '1px solid var(--color-border)',
  }

  if (!step) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg p-4" style={headerStyle}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold" style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                {mission.title}
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                Mission complete. Your next step is to run another mission or deepen mastery by improving your prediction score.
              </div>
            </div>
            <button
              type="button"
              onClick={() => resetMission(mission.id)}
              className="px-3 py-2 rounded cursor-pointer"
              style={{
                background: 'var(--color-base)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
              }}
            >
              Restart
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
      <div className="space-y-4">
        {/* Mission header */}
        <div className="rounded-lg p-4" style={headerStyle}>
          <div className="flex items-start justify-between gap-3">
            <div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Role: {mission.role} · Step {activeStepIndex + 1} / {mission.steps.length}
            </div>
            <div className="font-semibold" style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>
              {mission.title}
            </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginTop: 6 }}>
                <div><span style={{ fontWeight: 700, color: 'var(--color-text)' }}>Context:</span> {mission.context}</div>
                <div style={{ marginTop: 4 }}><span style={{ fontWeight: 700, color: 'var(--color-text)' }}>Objective:</span> {mission.objective}</div>
              </div>
            </div>
          <div className="flex flex-col items-end gap-2">
            {/* Mobile: Mission picker (sidebar is hidden below md) */}
            <select
              className="md:hidden rounded px-2 py-1 border-none outline-none cursor-pointer"
              value={mission.id}
              onChange={(e) => selectMission(e.target.value)}
              style={{
                background: 'var(--color-base)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                maxWidth: 220,
              }}
              aria-label="Select mission"
            >
              {MISSIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={scrollToAction}
                className="px-2.5 py-2 rounded cursor-pointer"
                style={{
                  background: '#2D6A4F',
                  border: '1px solid rgba(0,0,0,0.08)',
                  color: '#fff',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8rem',
                }}
                title="Scroll the center pane to the current step's action"
              >
                Jump to Action
              </button>
            <button
              type="button"
              onClick={() => resetMission(mission.id)}
              className="px-2.5 py-2 rounded cursor-pointer"
              style={{
                background: 'var(--color-base)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
              }}
            >
              Reset Mission
            </button>
            </div>
          </div>
        </div>

        {/* Step navigation */}
        <div className="mt-4 flex flex-wrap gap-2">
          {mission.steps.map((s, idx) => {
            const unlocked = idx <= completed
            const active = idx === activeStepIndex
            return (
              <button
                key={s.id}
                type="button"
                disabled={!unlocked}
                onClick={() => goToStep(idx)}
                className="px-2.5 py-1.5 rounded text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: active ? '#0B3B59' : 'var(--color-base)',
                  color: active ? '#FAF0D4' : 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {idx + 1}. {s.title}
              </button>
            )
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="rounded-lg p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="font-semibold" style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
          {step.title}
        </div>
        {'narrative' in step && (
          <div style={{ marginTop: 6, color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
            {step.narrative}
          </div>
        )}
      </div>

      <div ref={actionAnchorRef} style={{ scrollMarginTop: 16 }} />

      {step.type === 'transaction' && (
        <GuidedTransactionCard
          templateId={step.templateId}
          concepts={step.concepts}
          defaultParams={step.defaultParams}
          debrief={step.debrief}
          onRecorded={onRecorded}
          onContinue={completeCurrentStep}
        />
      )}

      {step.type === 'closePeriod' && (
        <div className="rounded-lg p-4" style={{ background: '#FFFBF0', border: '1px solid #E8D5B7' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            Close the period, then open the review pack and interpret the bridges.
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const periodIndexToOpen = periods.length
                closePeriod(`Period ${currentPeriod + 1}`)
                openReviewPack(periodIndexToOpen)
                completeCurrentStep()
              }}
              className="px-3 py-2 rounded cursor-pointer"
              style={{
                background: '#0B3B59',
                color: '#FAF0D4',
                border: '1px solid rgba(0,0,0,0.1)',
                fontFamily: 'var(--font-display)',
              }}
            >
              Close Period & Open Review Pack
            </button>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              (Current: Period {currentPeriod})
            </span>
          </div>
        </div>
      )}

      {step.type === 'reflection' && (
        <div className="rounded-lg p-4" style={{ background: '#FFFBF0', border: '1px solid #E8D5B7' }}>
          <div className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
            Reflection (Executive Output)
          </div>
          <div className="mt-1" style={{ fontSize: '0.85rem', color: 'var(--color-text)', lineHeight: 1.5 }}>
            {step.prompt}
          </div>
          <textarea
            className="w-full mt-3 rounded p-3 outline-none"
            rows={5}
            placeholder={step.placeholder ?? 'Write your answer.'}
            value={reflections[`${mission.id}:${step.id}`] ?? ''}
            onChange={(e) => setReflection(mission.id, step.id, e.target.value)}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
            }}
          />
          <div className="mt-3 flex items-center justify-between">
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Tip: be concrete. Name the driver, the account, and the implication.
            </span>
            <button
              type="button"
              onClick={completeCurrentStep}
              className="px-3 py-2 rounded cursor-pointer"
              style={{
                background: 'var(--color-gold)',
                color: '#4A0A12',
                border: '1px solid rgba(0,0,0,0.1)',
                fontFamily: 'var(--font-display)',
              }}
            >
              Mark Complete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
