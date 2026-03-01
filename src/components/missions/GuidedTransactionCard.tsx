import { useEffect, useMemo, useState } from 'react'
import { useLedgerStore } from '../../store/ledgerStore'
import { useUIStore } from '../../store/uiStore'
import { useMasteryStore } from '../../store/masteryStore'
import type { CashFlowSection, Direction, Prediction } from '../../store/masteryStore'
import { MISCONCEPTIONS, diagnoseMisconceptions } from '../../engines/misconceptions'
import { TRANSACTION_TEMPLATES } from '../../data/transactionTemplates'
import type { TransactionTemplate, LedgerChange } from '../../engines/types'
import { JournalEntryPreview } from '../transaction/JournalEntryPreview'
import type { RecordedTransaction } from '../transaction/TransactionSidebar'

const EPS = 0.000001

function dirFromDelta(delta: number): Direction {
  if (Math.abs(delta) < EPS) return 'flat'
  return delta > 0 ? 'up' : 'down'
}

function badgeColor(dir: Direction): { bg: string; fg: string } {
  // Use saturated fills so selected predictions are unmistakable at a glance.
  if (dir === 'up') return { bg: 'var(--color-green)', fg: '#fff' }
  if (dir === 'down') return { bg: '#B91C1C', fg: '#fff' }
  return { bg: '#334155', fg: '#fff' }
}

function labelForDir(dir: Direction): string {
  return dir === 'up' ? 'Up' : dir === 'down' ? 'Down' : 'Flat'
}

function findTemplate(templateId: string): TransactionTemplate | null {
  return TRANSACTION_TEMPLATES.find((t) => t.id === templateId) ?? null
}

function isCashFlowSection(x: string): x is Exclude<CashFlowSection, 'none'> {
  return x === 'operating' || x === 'investing' || x === 'financing'
}

function computeAccountChanges(ledger: ReturnType<typeof useLedgerStore.getState>['ledger'], template: TransactionTemplate, beforeSnapshot: Map<string, number>): LedgerChange[] {
  const changes: LedgerChange[] = []
  const allAccounts = [
    ...template.debits.map((d) => d.account),
    ...template.credits.map((c) => c.account),
  ]
  const seen = new Set<string>()
  for (const accountName of allAccounts) {
    if (seen.has(accountName)) continue
    seen.add(accountName)

    const before = beforeSnapshot.get(accountName) ?? 0
    let after = before
    try {
      after = ledger.getAccount(accountName).balance
    } catch {
      // ignore
    }

    const isDebit = template.debits.some((d) => d.account === accountName)
    changes.push({
      account: accountName,
      side: isDebit ? 'debit' : 'credit',
      amount: Math.abs(after - before),
      before,
      after,
    })
  }
  return changes
}

function DirectionToggle({
  value,
  onChange,
  disabled = false,
}: {
  value: Direction
  onChange: (v: Direction) => void
  disabled?: boolean
}) {
  return (
    <div
      className="flex rounded-md overflow-hidden"
      style={{
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
      aria-disabled={disabled}
    >
      {(['up', 'flat', 'down'] as const).map((d, idx) => {
        const active = value === d
        const { bg, fg } = badgeColor(d)
        const icon = d === 'up' ? '↑' : d === 'down' ? '↓' : '→'
        return (
          <button
            key={d}
            type="button"
            onClick={() => onChange(d)}
            aria-pressed={active}
            className="cursor-pointer flex-1"
            style={{
              background: active ? bg : 'transparent',
              color: active ? fg : 'var(--color-text-muted)',
              border: 'none',
              borderRight:
                idx < 2 ? '1px solid var(--color-border)' : 'none',
              fontFamily: 'var(--font-mono)',
              fontWeight: active ? 800 : 600,
              fontSize: '0.8rem',
              padding: '8px 10px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
              boxShadow: active ? 'inset 0 0 0 2px rgba(255,255,255,0.22)' : 'none',
            }}
          >
            <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>{icon}</span>
            <span>{labelForDir(d)}</span>
          </button>
        )
      })}
    </div>
  )
}

function SectionToggle({
  value,
  onChange,
  disabled = false,
}: {
  value: CashFlowSection
  onChange: (v: CashFlowSection) => void
  disabled?: boolean
}) {
  const options: { id: CashFlowSection; label: string }[] = [
    { id: 'operating', label: 'CFO' },
    { id: 'investing', label: 'CFI' },
    { id: 'financing', label: 'CFF' },
    { id: 'none', label: 'None' },
  ]
  return (
    <div
      className="flex rounded-md overflow-hidden"
      style={{
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
      aria-disabled={disabled}
    >
      {options.map((opt, idx) => {
        const active = value === opt.id
        const activeBg = opt.id === 'none' ? '#334155' : '#0B3B59'
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={active}
            className="cursor-pointer flex-1"
            style={{
              background: active ? activeBg : 'transparent',
              color: active ? '#FAF0D4' : 'var(--color-text-muted)',
              border: 'none',
              borderRight:
                idx < options.length - 1 ? '1px solid var(--color-border)' : 'none',
              fontFamily: 'var(--font-mono)',
              fontWeight: active ? 800 : 600,
              fontSize: '0.8rem',
              padding: '8px 10px',
              transition: 'background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
              boxShadow: active ? 'inset 0 0 0 2px rgba(250,240,212,0.18)' : 'none',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function GuidedTransactionCard({
  templateId,
  concepts,
  defaultParams,
  debrief,
  onRecorded,
  onContinue,
}: {
  templateId: string
  concepts: string[]
  defaultParams?: Record<string, number>
  debrief?: string
  onRecorded?: (tx: RecordedTransaction) => void
  onContinue?: () => void
}) {
  const template = useMemo(() => findTemplate(templateId), [templateId])

  const selectedCompany = useLedgerStore((s) => s.selectedCompany)
  const recordTransaction = useLedgerStore((s) => s.recordTransaction)
  const getStatements = useLedgerStore((s) => s.getStatements)
  const ledger = useLedgerStore((s) => s.ledger)

  const recordAttempt = useMasteryStore((s) => s.recordAttempt)

  const [params, setParams] = useState<Record<string, number>>({})
  const [prediction, setPrediction] = useState<Prediction>({
    cash: 'flat',
    netIncome: 'flat',
    totalAssets: 'flat',
    totalLiabilities: 'flat',
    totalEquity: 'flat',
    cashFlowSection: 'none',
  })
  const [predictionLocked, setPredictionLocked] = useState(false)
  const [attemptScore, setAttemptScore] = useState<number | null>(null)
  const [attemptMisconceptions, setAttemptMisconceptions] = useState<string[]>([])
  const [attemptBreakdown, setAttemptBreakdown] = useState<Record<string, boolean> | null>(null)
  const [recordedTx, setRecordedTx] = useState<RecordedTransaction | null>(null)

  useEffect(() => {
    if (!template) return
    const initial: Record<string, number> = {}
    for (const p of template.params) {
      if (p.type === 'number') initial[p.key] = defaultParams?.[p.key] ?? 0
    }
    setParams(initial)
    setPrediction({
      cash: 'flat',
      netIncome: 'flat',
      totalAssets: 'flat',
      totalLiabilities: 'flat',
      totalEquity: 'flat',
      cashFlowSection: 'none',
    })
    setPredictionLocked(false)
    setAttemptScore(null)
    setAttemptMisconceptions([])
    setAttemptBreakdown(null)
    setRecordedTx(null)
  }, [templateId, template, defaultParams])

  if (!template) {
    return (
      <div
        className="rounded-lg p-4"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        Unknown template: <span style={{ fontFamily: 'var(--font-mono)' }}>{templateId}</span>
      </div>
    )
  }

  // TypeScript does not reliably narrow captured values inside event handlers.
  // Bind a non-null alias for the rest of this render.
  const tmpl = template

  function handleParamChange(key: string, value: string) {
    const num = parseFloat(value)
    setParams((prev) => ({
      ...prev,
      [key]: isNaN(num) ? 0 : num,
    }))
  }

  const totalDebits = tmpl.debits.reduce((sum, d) => sum + (params[d.param] || 0), 0)
  const totalCredits = tmpl.credits.reduce((sum, c) => sum + (params[c.param] || 0), 0)
  const isBalanced = totalDebits === totalCredits && totalDebits > 0
  const canRecord = !!selectedCompany && tmpl.params
    .filter((p) => p.type === 'number')
    .every((p) => (params[p.key] ?? 0) > 0)

  const isReadyToPost =
    !!selectedCompany && canRecord && isBalanced && predictionLocked && attemptScore === null

  const postBlockReason =
    attemptScore !== null
      ? 'Posted. Click Continue.'
      : !canRecord
        ? 'Enter a positive amount.'
        : !isBalanced
          ? 'Debits must equal credits.'
          : !predictionLocked
            ? 'Lock your prediction first.'
            : null

  function handleRecord() {
    if (!selectedCompany) return
    if (!isReadyToPost) return

    // Capture before state for scoring.
    const beforeStatements = getStatements()
    const beforeCash = ledger.getAccount('Cash').balance

    // Capture account-level changes for insight + flow highlighting.
    const beforeSnapshot = new Map<string, number>()
    for (const d of tmpl.debits) beforeSnapshot.set(d.account, ledger.getAccount(d.account).balance)
    for (const c of tmpl.credits) beforeSnapshot.set(c.account, ledger.getAccount(c.account).balance)

    recordTransaction(tmpl.id, params)

    const afterStatements = getStatements()
    const afterCash = ledger.getAccount('Cash').balance

    const actual: Prediction = {
      cash: dirFromDelta(afterCash - beforeCash),
      netIncome: dirFromDelta(afterStatements.incomeStatement.netIncome - beforeStatements.incomeStatement.netIncome),
      totalAssets: dirFromDelta(afterStatements.balanceSheet.totalAssets - beforeStatements.balanceSheet.totalAssets),
      totalLiabilities: dirFromDelta(afterStatements.balanceSheet.totalLiabilities - beforeStatements.balanceSheet.totalLiabilities),
      totalEquity: dirFromDelta(afterStatements.balanceSheet.totalEquity - beforeStatements.balanceSheet.totalEquity),
      cashFlowSection: isCashFlowSection(tmpl.cashFlowCategory) ? tmpl.cashFlowCategory : 'none',
    }

    const breakdown = {
      cash: prediction.cash === actual.cash,
      netIncome: prediction.netIncome === actual.netIncome,
      totalAssets: prediction.totalAssets === actual.totalAssets,
      totalLiabilities: prediction.totalLiabilities === actual.totalLiabilities,
      totalEquity: prediction.totalEquity === actual.totalEquity,
      cashFlowSection: prediction.cashFlowSection === actual.cashFlowSection,
    }
    const correctCount = Object.values(breakdown).filter(Boolean).length
    const score = Math.round((correctCount / Object.keys(breakdown).length) * 100)
    const misconceptions = diagnoseMisconceptions({ templateId: tmpl.id, prediction, actual })

    setAttemptScore(score)
    setAttemptMisconceptions(misconceptions)
    setAttemptBreakdown(breakdown)

    const changes = computeAccountChanges(ledger, tmpl, beforeSnapshot)
    const recorded: RecordedTransaction = {
      template: tmpl,
      params: { ...params },
      changes,
    }
    setRecordedTx(recorded)

    // Update flow diagram highlighting.
    useUIStore.getState().setLastTransaction({
      ...recorded,
      timestamp: Date.now(),
    })

    onRecorded?.(recorded)

    recordAttempt({
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      templateId: tmpl.id,
      templateName: tmpl.name,
      concepts,
      prediction,
      actual,
      score,
      breakdown,
      misconceptions,
    })
  }

  const scoreBadge =
    attemptScore === null
      ? null
      : attemptScore >= 85
        ? { bg: '#DEF7EC', fg: 'var(--color-green)', label: `${attemptScore}%` }
        : attemptScore >= 60
          ? { bg: '#FEF3C7', fg: '#92400E', label: `${attemptScore}%` }
          : { bg: '#FDE8E8', fg: '#B91C1C', label: `${attemptScore}%` }

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
    >
      <div
        className="px-4 py-3"
        style={{
          background: 'linear-gradient(135deg, rgba(11,59,89,0.08) 0%, rgba(218,165,32,0.08) 100%)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              {template.name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              {tmpl.description}
            </div>
          </div>
          {scoreBadge && (
            <span
              className="text-xs font-semibold px-2 py-1 rounded"
              style={{ background: scoreBadge.bg, color: scoreBadge.fg, fontFamily: 'var(--font-mono)' }}
            >
              Prediction: {scoreBadge.label}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Params */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {template.params
            .filter((p) => p.type === 'number')
            .map((p) => (
              <div key={p.key}>
                <label
                  className="block mb-1 font-semibold"
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {p.label}
                </label>
                <input
                  type="number"
                  value={params[p.key] ?? 0}
                  onChange={(e) => handleParamChange(p.key, e.target.value)}
                  className="w-full rounded px-2 py-1 border outline-none"
                  style={{
                    background: 'var(--color-base)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                  }}
                  disabled={attemptScore !== null}
                />
              </div>
            ))}
        </div>

        <JournalEntryPreview template={template} params={params} />

        {/* Prediction gate */}
        <div
          className="rounded-lg p-3"
          style={{ background: '#FFFBF0', border: '1px solid #E8D5B7' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold" style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}>
                Step 1: Commit Your Prediction
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                Before you post the entry, predict direction of the big-picture financial story.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPredictionLocked((v) => !v)}
              disabled={attemptScore !== null}
              className="text-sm px-4 py-2.5 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: predictionLocked ? '#DEF7EC' : '#2D6A4F',
                border: predictionLocked ? '1px solid rgba(45,106,79,0.25)' : '1px solid rgba(0,0,0,0.08)',
                color: predictionLocked ? 'var(--color-green)' : '#fff',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                boxShadow: predictionLocked ? 'none' : '0 8px 18px rgba(45,106,79,0.18)',
              }}
            >
              {predictionLocked ? '1) Prediction Committed (Edit)' : '1) Commit Prediction'}
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="flex items-center justify-between gap-2">
              <span style={{ fontSize: '0.82rem' }}>Cash</span>
              <DirectionToggle
                value={prediction.cash}
                onChange={(v) => setPrediction((p) => ({ ...p, cash: v }))}
                disabled={predictionLocked}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span style={{ fontSize: '0.82rem' }}>Net Income</span>
              <DirectionToggle
                value={prediction.netIncome}
                onChange={(v) => setPrediction((p) => ({ ...p, netIncome: v }))}
                disabled={predictionLocked}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span style={{ fontSize: '0.82rem' }}>Total Assets</span>
              <DirectionToggle
                value={prediction.totalAssets}
                onChange={(v) => setPrediction((p) => ({ ...p, totalAssets: v }))}
                disabled={predictionLocked}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span style={{ fontSize: '0.82rem' }}>Total Liabilities</span>
              <DirectionToggle
                value={prediction.totalLiabilities}
                onChange={(v) => setPrediction((p) => ({ ...p, totalLiabilities: v }))}
                disabled={predictionLocked}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span style={{ fontSize: '0.82rem' }}>Total Equity</span>
              <DirectionToggle
                value={prediction.totalEquity}
                onChange={(v) => setPrediction((p) => ({ ...p, totalEquity: v }))}
                disabled={predictionLocked}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span style={{ fontSize: '0.82rem' }}>Cash Flow Section</span>
              <SectionToggle
                value={prediction.cashFlowSection}
                onChange={(v) => setPrediction((p) => ({ ...p, cashFlowSection: v }))}
                disabled={predictionLocked}
              />
            </div>
          </div>

          {predictionLocked && attemptScore === null && (
            <div
              className="mt-3 rounded p-2"
              style={{
                background: 'rgba(11,59,89,0.06)',
                border: '1px solid rgba(11,59,89,0.15)',
                color: 'var(--color-text-muted)',
                fontSize: '0.78rem',
                lineHeight: 1.4,
              }}
            >
              Prediction locked. Post the entry to reveal the outcome and score.
            </div>
          )}

          {attemptBreakdown && (
            <div className="mt-3 rounded p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="font-semibold mb-2" style={{ fontSize: '0.82rem' }}>
                Prediction vs Actual
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2" style={{ fontSize: '0.78rem' }}>
                {(
                  [
                    ['cash', 'Cash'],
                    ['netIncome', 'Net Income'],
                    ['totalAssets', 'Total Assets'],
                    ['totalLiabilities', 'Total Liabilities'],
                    ['totalEquity', 'Total Equity'],
                    ['cashFlowSection', 'Cash Flow Section'],
                  ] as const
                ).map(([k, label]) => {
                  const ok = attemptBreakdown[k]
                  return (
                    <div
                      key={k}
                      className="flex items-center justify-between rounded px-2 py-1"
                      style={{ background: 'var(--color-base)', border: '1px solid var(--color-border)' }}
                    >
                      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                      <span style={{ color: ok ? 'var(--color-green)' : '#B91C1C', fontFamily: 'var(--font-mono)' }}>
                        {ok ? 'Correct' : 'Miss'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleRecord}
            disabled={!isReadyToPost}
            className="px-4 py-3 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-1"
            style={{
              background: '#0B3B59',
              color: '#FAF0D4',
              border: '1px solid rgba(0,0,0,0.1)',
              fontFamily: 'var(--font-display)',
              fontSize: '0.95rem',
              fontWeight: 700,
              boxShadow: isReadyToPost ? '0 10px 22px rgba(11,59,89,0.18)' : 'none',
            }}
          >
            2) Post Entry & Score
          </button>

          {attemptScore !== null && (
            <button
              type="button"
              onClick={onContinue}
              className="px-4 py-3 rounded cursor-pointer"
              style={{
                background: 'var(--color-gold)',
                color: '#4A0A12',
                border: '1px solid rgba(0,0,0,0.1)',
                fontFamily: 'var(--font-display)',
                fontSize: '0.95rem',
                fontWeight: 700,
              }}
            >
              Continue
            </button>
          )}
        </div>

        {postBlockReason && attemptScore === null && (
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            To enable Step 2: {postBlockReason}
          </div>
        )}

        {/* Posting checklist */}
        <div
          className="rounded-lg p-3"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="font-semibold mb-2" style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem' }}>
            Step Checklist
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2" style={{ fontSize: '0.78rem' }}>
            {[
              { label: 'Enter amounts', ok: canRecord },
              { label: 'Balanced entry', ok: isBalanced },
              { label: 'Lock prediction', ok: predictionLocked },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded px-3 py-2"
                style={{ background: 'var(--color-base)', border: '1px solid var(--color-border)' }}
              >
                <span style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                <span
                  style={{
                    color: item.ok ? 'var(--color-green)' : '#B91C1C',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                  }}
                >
                  {item.ok ? '✓' : '✕'}
                </span>
              </div>
            ))}
          </div>
          {postBlockReason && (
            <div className="mt-2" style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              {postBlockReason}
            </div>
          )}
        </div>

        {/* Misconceptions + debrief */}
        {attemptMisconceptions.length > 0 && (
          <div className="space-y-2">
            <div className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              Coach Notes (Misconceptions)
            </div>
            {attemptMisconceptions.map((id) => {
              const m = MISCONCEPTIONS[id]
              if (!m) return null
              return (
                <div
                  key={id}
                  className="rounded-lg p-3"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
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

        {debrief && attemptScore !== null && (
          <div className="rounded-lg p-3" style={{ background: '#FFFBF0', border: '1px solid #E8D5B7' }}>
            <div className="font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              Executive Debrief
            </div>
            <div style={{ fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--color-text)' }}>
              {debrief}
            </div>
          </div>
        )}

        {/* Keep recordedTx around so the caller can inspect if needed */}
        {recordedTx && (
          <div style={{ display: 'none' }}>
            {/* noop */}
          </div>
        )}
      </div>
    </div>
  )
}
