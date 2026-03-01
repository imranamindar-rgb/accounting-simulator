import { useEffect, useState } from 'react'
import { useUIStore } from '../../store/uiStore'
import { useLedgerStore } from '../../store/ledgerStore'
import { SAMPLE_COMPANIES } from '../../data/sampleCompanies'
import { TOPICS } from '../../data/topics'
import { getAISettings } from '../../engines/aiClient'
import AISettingsModal from '../shared/AISettingsModal'
import PolicyComparison from '../analysis/PolicyComparison'

/* ── tiny reusable pieces ── */

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'default',
}: {
  options: { label: string; value: T }[]
  value: T
  onChange: (v: T) => void
  /** 'large' makes tabs bigger and more button-like */
  size?: 'default' | 'large'
}) {
  const isLarge = size === 'large'
  return (
    <div className="flex rounded-md overflow-hidden" style={{ gap: isLarge ? 2 : 0 }}>
      {options.map((opt) => {
        const isActive = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="text-white transition-all cursor-pointer"
            style={{
              fontSize: isLarge ? '0.88rem' : '0.78rem',
              padding: isLarge ? '6px 14px' : '4px 10px',
              background: isActive
                ? 'rgba(255,255,255,0.25)'
                : 'rgba(255,255,255,0.08)',
              fontWeight: isActive ? 700 : 400,
              borderRadius: isLarge ? 6 : 0,
              border: isActive
                ? '1px solid rgba(255,255,255,0.3)'
                : '1px solid rgba(255,255,255,0.1)',
              boxShadow: isActive && isLarge
                ? '0 2px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)'
                : 'none',
              letterSpacing: isLarge ? '0.02em' : 'normal',
              fontFamily: isLarge ? 'var(--font-display)' : 'inherit',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.18)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isActive
                ? 'rgba(255,255,255,0.25)'
                : 'rgba(255,255,255,0.08)'
              e.currentTarget.style.borderColor = isActive
                ? 'rgba(255,255,255,0.3)'
                : 'rgba(255,255,255,0.1)'
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function ToolbarButton({
  onClick,
  disabled = false,
  active = false,
  title,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  active?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="px-2.5 py-1 rounded text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        fontSize: '0.78rem',
        background: active
          ? 'rgba(255,255,255,0.2)'
          : 'rgba(255,255,255,0.1)',
        fontWeight: active ? 600 : 400,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = active
          ? 'rgba(255,255,255,0.2)'
          : 'rgba(255,255,255,0.1)'
      }}
    >
      {children}
    </button>
  )
}

function Separator() {
  return (
    <div
      className="mx-2 self-stretch"
      style={{
        width: 1,
        background: 'rgba(255,255,255,0.15)',
      }}
    />
  )
}

/* ── main toolbar ── */

export function Toolbar() {
  const activeTab = useUIStore((s) => s.activeTab)
  const viewMode = useUIStore((s) => s.viewMode)
  const setViewMode = useUIStore((s) => s.setViewMode)
  const learningMode = useUIStore((s) => s.learningMode)
  const setLearningMode = useUIStore((s) => s.setLearningMode)
  const cashFlowMethod = useUIStore((s) => s.cashFlowMethod)
  const setCashFlowMethod = useUIStore((s) => s.setCashFlowMethod)
  const selectedTopic = useUIStore((s) => s.selectedTopic)
  const setSelectedTopic = useUIStore((s) => s.setSelectedTopic)
  const sensitivityOpen = useUIStore((s) => s.sensitivityOpen)
  const toggleSensitivity = useUIStore((s) => s.toggleSensitivity)
  const openReviewPack = useUIStore((s) => s.openReviewPack)


  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [aiConfigured, setAiConfigured] = useState(() => !!getAISettings().apiKey)
  const [policyOpen, setPolicyOpen] = useState(false)

  const currentPeriod = useLedgerStore((s) => s.currentPeriod)
  const periods = useLedgerStore((s) => s.periods)
  const selectedCompany = useLedgerStore((s) => s.selectedCompany)
  const undoStack = useLedgerStore((s) => s.undoStack)
  const redoStack = useLedgerStore((s) => s.redoStack)
  const undo = useLedgerStore((s) => s.undo)
  const redo = useLedgerStore((s) => s.redo)
  const reset = useLedgerStore((s) => s.reset)
  const closePeriod = useLedgerStore((s) => s.closePeriod)
  const initFromCompany = useLedgerStore((s) => s.initFromCompany)

  /* Auto-select Sound & Light (the educational company) on mount, or first non-blank */
  useEffect(() => {
    if (!selectedCompany && SAMPLE_COMPANIES.length > 0) {
      const defaultCompany =
        SAMPLE_COMPANIES.find((c) => c.name.startsWith('Blank Company')) ??
        SAMPLE_COMPANIES[0]
      initFromCompany(defaultCompany)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleCompanyChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const company = SAMPLE_COMPANIES.find((c) => c.name === e.target.value)
    if (company) initFromCompany(company)
  }

  function handleTopicChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedTopic(e.target.value || null)
  }

  const controlGroupStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(4px)',
  }

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background:
          'linear-gradient(135deg, #8B0000 0%, #6B0F1A 40%, #4A0A12 100%)',
        borderTop: '3px solid #DAA520',
      }}
    >
      {/* ── Top row: brand + period ── */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex flex-col">
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: '1.25rem',
              color: '#FAF0D4',
            }}
          >
            Financial Accounting Simulator
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: '0.72rem',
              color: 'rgba(250,240,212,0.6)',
            }}
          >
            Interactive Learning Environment
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: '0.78rem',
              color: '#DAA520',
            }}
          >
            Imran Dar
          </span>
        </div>

        <div
          className="rounded px-3 py-1 text-white"
          style={{
            ...controlGroupStyle,
            fontSize: '0.82rem',
            fontFamily: "var(--font-mono)",
          }}
        >
          Period {currentPeriod}
        </div>
      </div>

      {/* ── Bottom row: controls ── */}
      <div
        className="flex flex-wrap items-center gap-2 px-4 py-2"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* View mode toggle - only visible on statements tab */}
        {activeTab === 'statements' && (
          <div
            className="rounded-md overflow-hidden"
            style={controlGroupStyle}
          >
            <SegmentedControl
              options={[
                { label: 'Statements', value: 'statements' as const },
                { label: 'Trial Balance', value: 'trialBalance' as const },
                { label: 'T-Accounts', value: 'tAccounts' as const },
                { label: 'GL', value: 'generalLedger' as const },
              ]}
              value={viewMode}
              onChange={setViewMode}
              size="large"
            />
          </div>
        )}

        {/* Learning mode toggle - only visible on statements tab */}
        {activeTab === 'statements' && (
          <div className="rounded-md overflow-hidden" style={controlGroupStyle}>
            <SegmentedControl
              options={[
                { label: 'MBA Mode', value: 'mba' as const },
                { label: 'Sandbox', value: 'sandbox' as const },
              ]}
              value={learningMode}
              onChange={setLearningMode}
              size="large"
            />
          </div>
        )}

        <Separator />

        {/* Company selector */}
        <select
          value={selectedCompany?.name ?? ''}
          onChange={handleCompanyChange}
          className="rounded px-2 py-1 text-white border-none outline-none cursor-pointer"
          style={{
            ...controlGroupStyle,
            fontSize: '0.78rem',
            color: 'white',
          }}
        >
          {SAMPLE_COMPANIES.map((c) => (
            <option key={c.name} value={c.name} style={{ color: '#2D3748' }}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Topic filter */}
        <select
          value={selectedTopic ?? ''}
          onChange={handleTopicChange}
          className="rounded px-2 py-1 text-white border-none outline-none cursor-pointer"
          style={{
            ...controlGroupStyle,
            fontSize: '0.78rem',
            color: 'white',
          }}
        >
          <option value="" style={{ color: '#2D3748' }}>
            All Topics
          </option>
          {TOPICS.map((t) => (
            <option key={t.id} value={t.id} style={{ color: '#2D3748' }}>
              Ch.{t.chapter}: {t.name}
            </option>
          ))}
        </select>

        {/* Cash flow method toggle */}
        <div className="rounded-md overflow-hidden" style={controlGroupStyle}>
          <SegmentedControl
            options={[
              { label: 'Indirect', value: 'indirect' as const },
              { label: 'Direct', value: 'direct' as const },
            ]}
            value={cashFlowMethod}
            onChange={setCashFlowMethod}
          />
        </div>

        <Separator />

        {/* Undo / Redo / Reset */}
        <div
          className="flex rounded-md overflow-hidden"
          style={controlGroupStyle}
        >
          <ToolbarButton
            onClick={undo}
            disabled={undoStack.length === 0}
            title="Undo"
          >
            Undo
          </ToolbarButton>
          <ToolbarButton
            onClick={redo}
            disabled={redoStack.length === 0}
            title="Redo"
          >
            Redo
          </ToolbarButton>
          <ToolbarButton onClick={reset} title="Reset to beginning balances">
            Reset
          </ToolbarButton>
        </div>

        {/* Sensitivity toggle */}
        <ToolbarButton
          onClick={toggleSensitivity}
          active={sensitivityOpen}
          title="Toggle sensitivity analysis"
        >
          Sensitivity
        </ToolbarButton>

        {/* Close Period */}
        <ToolbarButton
          onClick={() => {
            const periodIndexToOpen = periods.length
            closePeriod(`Period ${currentPeriod + 1}`)
            openReviewPack(periodIndexToOpen)
          }}
          title="Close current period"
        >
          Close Period
        </ToolbarButton>

        {/* Review Pack */}
        <ToolbarButton
          onClick={() => openReviewPack(null)}
          title="Open the CFO review pack"
        >
          Review Pack
        </ToolbarButton>

        {/* Policy Comparison */}
        <ToolbarButton
          onClick={() => setPolicyOpen(true)}
          title="Compare accounting policies"
        >
          Compare Policies
        </ToolbarButton>

        {/* Spacer to push AI button to the right */}
        <div className="flex-1" />

        {/* AI settings */}
        <ToolbarButton
          onClick={() => {
            setAiModalOpen(true)
          }}
          title="AI Settings"
        >
          <span className="flex items-center gap-1.5">
            AI
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{
                background: aiConfigured
                  ? 'var(--color-green)'
                  : 'rgba(255,255,255,0.35)',
              }}
            />
          </span>
        </ToolbarButton>
      </div>

      <AISettingsModal
        open={aiModalOpen}
        onClose={() => {
          setAiModalOpen(false)
          setAiConfigured(!!getAISettings().apiKey)
        }}
      />
      <PolicyComparison
        open={policyOpen}
        onClose={() => setPolicyOpen(false)}
      />
    </header>
  )
}
