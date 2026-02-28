import { useMAStore } from '../../store/maStore'
import ImportStep from './ImportStep'
import AnalyzeStep from './AnalyzeStep'
import StrategizeStep from './StrategizeStep'
import StructureStep from './StructureStep'

const STEPS = [
  { label: 'Import', icon: '1' },
  { label: 'Analyze', icon: '2' },
  { label: 'Strategize', icon: '3' },
  { label: 'Structure', icon: '4' },
] as const

export default function WorkbenchLayout() {
  const step = useMAStore((s) => s.workbenchStep)
  const setStep = useMAStore((s) => s.setWorkbenchStep)
  const reset = useMAStore((s) => s.resetWorkbench)
  const target = useMAStore((s) => s.targetCompany)
  const acquirer = useMAStore((s) => s.acquirerCompany)

  const canAdvance = (): boolean => {
    if (step === 0) return target !== null && acquirer !== null
    if (step === 1) return true
    if (step === 2) return true
    return false
  }

  const handleNext = () => {
    if (step < 3 && canAdvance()) {
      setStep((step + 1) as 0 | 1 | 2 | 3)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep((step - 1) as 0 | 1 | 2 | 3)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Step bar */}
      <div
        className="rounded-lg shadow-sm px-4 py-3 flex items-center justify-between"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {STEPS.map((s, i) => {
            const isActive = i === step
            const isCompleted = i < step
            return (
              <button
                key={s.label}
                onClick={() => {
                  if (i <= step) setStep(i as 0 | 1 | 2 | 3)
                }}
                className="flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer"
                style={{
                  opacity: i > step ? 0.5 : 1,
                  cursor: i <= step ? 'pointer' : 'default',
                }}
                disabled={i > step}
              >
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                  style={{
                    background: isActive
                      ? 'var(--color-gold)'
                      : isCompleted
                        ? 'var(--color-green)'
                        : 'var(--color-border)',
                    color: isActive || isCompleted ? '#fff' : 'var(--color-text-muted)',
                  }}
                >
                  {isCompleted ? '\u2713' : s.icon}
                </span>
                <span
                  className="text-sm font-medium hidden sm:inline"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: isActive ? 'var(--color-gold)' : 'var(--color-text)',
                  }}
                >
                  {s.label}
                </span>
              </button>
            )
          })}
        </div>
        <button
          onClick={reset}
          className="text-xs px-3 py-1 rounded border cursor-pointer transition-colors hover:opacity-80"
          style={{
            color: 'var(--color-accent-light)',
            borderColor: 'var(--color-accent-light)',
          }}
        >
          Reset
        </button>
      </div>

      {/* Step content */}
      <div>
        {step === 0 && <ImportStep />}
        {step === 1 && <AnalyzeStep />}
        {step === 2 && <StrategizeStep />}
        {step === 3 && <StructureStep />}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={step === 0}
          className="px-4 py-2 rounded text-sm font-medium transition-colors cursor-pointer"
          style={{
            background: step === 0 ? 'var(--color-border)' : 'var(--color-surface)',
            color: step === 0 ? 'var(--color-text-muted)' : 'var(--color-text)',
            border: '1px solid var(--color-border)',
            opacity: step === 0 ? 0.5 : 1,
            cursor: step === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Back
        </button>
        {step < 3 && (
          <button
            onClick={handleNext}
            disabled={!canAdvance()}
            className="px-4 py-2 rounded text-sm font-medium transition-colors cursor-pointer"
            style={{
              background: canAdvance() ? 'var(--color-gold)' : 'var(--color-border)',
              color: canAdvance() ? '#fff' : 'var(--color-text-muted)',
              opacity: canAdvance() ? 1 : 0.5,
              cursor: canAdvance() ? 'pointer' : 'not-allowed',
            }}
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}
