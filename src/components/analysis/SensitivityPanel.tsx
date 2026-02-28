/**
 * SensitivityPanel -- collapsible right sidebar with 5 sensitivity sliders.
 *
 * Sliders:
 *   1. Revenue Scale    (50%-150%, default 100%)
 *   2. COGS %           (20%-80%, default computed)
 *   3. OpEx Scale       (50%-150%, default 100%)
 *   4. Interest Rate    (0%-15%, default computed)
 *   5. Tax Rate         (0%-40%, default computed)
 *
 * On open, saves a baseline snapshot. Every slider change restores the
 * baseline, then applies all adjustments in order so statements re-render
 * from the live ledger.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useLedgerStore } from '../../store/ledgerStore'
import { useUIStore } from '../../store/uiStore'

interface SliderValues {
  revenueScale: number
  cogsPct: number
  opexScale: number
  interestRate: number
  taxRate: number
}

interface SliderDef {
  key: keyof SliderValues
  label: string
  min: number
  max: number
  step: number
  format: (v: number) => string
}

const SLIDER_DEFS: SliderDef[] = [
  {
    key: 'revenueScale',
    label: 'Revenue Scale',
    min: 50,
    max: 150,
    step: 1,
    format: (v) => `${v}%`,
  },
  {
    key: 'cogsPct',
    label: 'COGS %',
    min: 20,
    max: 80,
    step: 1,
    format: (v) => `${v}%`,
  },
  {
    key: 'opexScale',
    label: 'OpEx Scale',
    min: 50,
    max: 150,
    step: 1,
    format: (v) => `${v}%`,
  },
  {
    key: 'interestRate',
    label: 'Interest Rate',
    min: 0,
    max: 15,
    step: 0.5,
    format: (v) => `${v}%`,
  },
  {
    key: 'taxRate',
    label: 'Tax Rate',
    min: 0,
    max: 40,
    step: 1,
    format: (v) => `${v}%`,
  },
]

/**
 * Compute default slider values from current ledger state.
 */
function computeDefaults(ledger: ReturnType<typeof useLedgerStore.getState>['ledger']): SliderValues {
  const revenues = ledger.getAccountsByType('Revenue')
  const expenses = ledger.getAccountsByType('Expense')
  const totalRevenue = revenues
    .filter((a) => a.subtype === 'operating')
    .reduce((s, a) => s + a.balance, 0)

  const totalCOGS = expenses
    .filter((a) => a.subtype === 'cogs')
    .reduce((s, a) => s + a.balance, 0)

  const totalDebt =
    (ledger.getAllAccounts().get('Bonds Payable')?.balance ?? 0) +
    (ledger.getAllAccounts().get('Notes Payable - Long Term')?.balance ?? 0)

  const interestExpense =
    ledger.getAllAccounts().get('Interest Expense')?.balance ?? 0

  const taxExpense = expenses
    .filter((a) => a.subtype === 'tax')
    .reduce((s, a) => s + a.balance, 0)

  const totalOpEx = expenses
    .filter((a) => a.subtype === 'operating')
    .reduce((s, a) => s + a.balance, 0)

  const incomeBeforeTax =
    totalRevenue - totalCOGS - totalOpEx - interestExpense +
    revenues.filter((a) => a.subtype === 'other').reduce((s, a) => s + a.balance, 0) -
    expenses.filter((a) => a.subtype === 'other' && a.name !== 'Interest Expense').reduce((s, a) => s + a.balance, 0)

  const cogsPct = totalRevenue > 0 ? Math.round((totalCOGS / totalRevenue) * 100) : 40
  const interestRate = totalDebt > 0 ? Math.round((interestExpense / totalDebt) * 1000) / 10 : 5
  const taxRate = incomeBeforeTax > 0 ? Math.round((taxExpense / incomeBeforeTax) * 100) : 25

  return {
    revenueScale: 100,
    cogsPct: Math.max(20, Math.min(80, cogsPct)),
    opexScale: 100,
    interestRate: Math.max(0, Math.min(15, interestRate)),
    taxRate: Math.max(0, Math.min(40, taxRate)),
  }
}

export default function SensitivityPanel() {
  const ledger = useLedgerStore((s) => s.ledger)
  const sensitivityOpen = useUIStore((s) => s.sensitivityOpen)
  const toggleSensitivity = useUIStore((s) => s.toggleSensitivity)

  const [baseline, setBaseline] = useState<Map<string, number> | null>(null)
  const [defaults, setDefaults] = useState<SliderValues | null>(null)
  const [sliderValues, setSliderValues] = useState<SliderValues>({
    revenueScale: 100,
    cogsPct: 40,
    opexScale: 100,
    interestRate: 5,
    taxRate: 25,
  })

  // Track whether panel was previously open to detect close
  const wasOpen = useRef(false)

  // On open: compute defaults and save baseline
  useEffect(() => {
    if (sensitivityOpen && !baseline) {
      const snap = ledger.takeSnapshot()
      setBaseline(snap)
      const defs = computeDefaults(ledger)
      setDefaults(defs)
      setSliderValues(defs)
    }
  }, [sensitivityOpen, baseline, ledger])

  // On close: restore baseline and clear state
  useEffect(() => {
    if (wasOpen.current && !sensitivityOpen && baseline) {
      ledger.restoreSnapshot(baseline)
      setBaseline(null)
      setDefaults(null)
    }
    wasOpen.current = sensitivityOpen
  }, [sensitivityOpen, baseline, ledger])

  /**
   * Apply all five sliders to the ledger in order.
   * Restores baseline first to ensure idempotent application.
   */
  const applySliders = useCallback(
    (values: SliderValues) => {
      if (!baseline) return
      ledger.restoreSnapshot(baseline)

      // 1. Revenue Scale -- scale all operating Revenue accounts
      const revenueAccounts = ledger.getAccountsByType('Revenue').filter((a) => a.subtype === 'operating')
      const revenueMultiplier = values.revenueScale / 100
      for (const acct of revenueAccounts) {
        const baseBalance = baseline.get(acct.name) ?? 0
        ledger.adjustBalance(acct.name, Math.round(baseBalance * revenueMultiplier))
      }

      // 2. COGS % -- set COGS as a percentage of (scaled) revenue
      const scaledRevenue = revenueAccounts.reduce((s, a) => s + a.balance, 0)
      const cogsAccounts = ledger.getAccountsByType('Expense').filter((a) => a.subtype === 'cogs')
      if (cogsAccounts.length > 0) {
        const targetCOGS = Math.round(scaledRevenue * (values.cogsPct / 100))
        // Distribute proportionally if multiple COGS accounts
        const totalBaseCOGS = cogsAccounts.reduce((s, a) => s + (baseline.get(a.name) ?? 0), 0)
        for (const acct of cogsAccounts) {
          if (totalBaseCOGS > 0) {
            const ratio = (baseline.get(acct.name) ?? 0) / totalBaseCOGS
            ledger.adjustBalance(acct.name, Math.round(targetCOGS * ratio))
          } else {
            ledger.adjustBalance(acct.name, Math.round(targetCOGS / cogsAccounts.length))
          }
        }
      }

      // 3. OpEx Scale -- scale all operating Expense accounts
      const opexAccounts = ledger.getAccountsByType('Expense').filter((a) => a.subtype === 'operating')
      const opexMultiplier = values.opexScale / 100
      for (const acct of opexAccounts) {
        const baseBalance = baseline.get(acct.name) ?? 0
        ledger.adjustBalance(acct.name, Math.round(baseBalance * opexMultiplier))
      }

      // 4. Interest Rate -- Interest Expense = rate * total debt
      const bondsPayable = ledger.getAllAccounts().get('Bonds Payable')?.balance ?? 0
      const notesPayable = ledger.getAllAccounts().get('Notes Payable - Long Term')?.balance ?? 0
      const totalDebt = bondsPayable + notesPayable
      const interestExpense = Math.round(totalDebt * (values.interestRate / 100))
      const interestAcct = ledger.getAllAccounts().get('Interest Expense')
      if (interestAcct) {
        ledger.adjustBalance('Interest Expense', interestExpense)
      }

      // 5. Tax Rate -- Tax Expense = rate * income before tax
      // Recompute income before tax from current balances
      const currentRevenue = ledger
        .getAccountsByType('Revenue')
        .reduce((s, a) => s + a.balance, 0)
      const currentCOGS = ledger
        .getAccountsByType('Expense')
        .filter((a) => a.subtype === 'cogs')
        .reduce((s, a) => s + a.balance, 0)
      const currentOpEx = ledger
        .getAccountsByType('Expense')
        .filter((a) => a.subtype === 'operating')
        .reduce((s, a) => s + a.balance, 0)
      const currentOtherExp = ledger
        .getAccountsByType('Expense')
        .filter((a) => a.subtype === 'other')
        .reduce((s, a) => s + a.balance, 0)
      const incomeBeforeTax = currentRevenue - currentCOGS - currentOpEx - currentOtherExp
      const taxAmount = Math.round(Math.max(0, incomeBeforeTax) * (values.taxRate / 100))
      const taxAccounts = ledger.getAccountsByType('Expense').filter((a) => a.subtype === 'tax')
      if (taxAccounts.length > 0) {
        const totalBaseTax = taxAccounts.reduce((s, a) => s + (baseline.get(a.name) ?? 0), 0)
        for (const acct of taxAccounts) {
          if (totalBaseTax > 0) {
            const ratio = (baseline.get(acct.name) ?? 0) / totalBaseTax
            ledger.adjustBalance(acct.name, Math.round(taxAmount * ratio))
          } else {
            ledger.adjustBalance(acct.name, Math.round(taxAmount / taxAccounts.length))
          }
        }
      }
    },
    [baseline, ledger],
  )

  const handleSliderChange = (key: keyof SliderValues, value: number) => {
    const newValues = { ...sliderValues, [key]: value }
    setSliderValues(newValues)
    applySliders(newValues)
  }

  const handleReset = () => {
    if (defaults) {
      setSliderValues(defaults)
      applySliders(defaults)
    }
  }

  // Determine if any slider has been moved from its default
  const isModified = defaults
    ? Object.keys(sliderValues).some(
        (k) => sliderValues[k as keyof SliderValues] !== defaults[k as keyof SliderValues],
      )
    : false

  return (
    <>
      {/* Overlay backdrop */}
      {sensitivityOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.15)' }}
          onClick={toggleSensitivity}
        />
      )}

      {/* Sidebar panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: 320,
          background: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          boxShadow: sensitivityOpen ? '-4px 0 24px rgba(0,0,0,0.12)' : 'none',
          transform: sensitivityOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div>
            <h2
              className="text-lg font-semibold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
            >
              Sensitivity Analysis
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Adjust parameters to see impact
            </p>
          </div>
          <button
            type="button"
            onClick={toggleSensitivity}
            className="p-1 rounded cursor-pointer"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              fontSize: '1.25rem',
              lineHeight: 1,
            }}
            title="Close sensitivity panel"
          >
            &times;
          </button>
        </div>

        {/* Sliders */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {SLIDER_DEFS.map((def) => (
            <div key={def.key}>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className="text-sm font-medium"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: 'var(--color-text)',
                  }}
                >
                  {def.label}
                </label>
                <span
                  className="text-sm font-semibold"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-accent-light)',
                  }}
                >
                  {def.format(sliderValues[def.key])}
                </span>
              </div>
              <input
                type="range"
                min={def.min}
                max={def.max}
                step={def.step}
                value={sliderValues[def.key]}
                onChange={(e) => handleSliderChange(def.key, parseFloat(e.target.value))}
                className="w-full"
                style={{
                  accentColor: 'var(--color-accent-light)',
                  cursor: 'pointer',
                }}
              />
              <div
                className="flex justify-between text-xs mt-0.5"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
              >
                <span>{def.format(def.min)}</span>
                <span>{def.format(def.max)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer with Reset */}
        <div
          className="px-5 py-4"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <button
            type="button"
            onClick={handleReset}
            disabled={!isModified}
            className="w-full py-2 px-4 rounded text-sm font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              fontFamily: 'var(--font-body)',
              background: isModified ? 'var(--color-accent)' : 'var(--color-border)',
              color: isModified ? '#FAF0D4' : 'var(--color-text-muted)',
              border: 'none',
            }}
          >
            Reset All
          </button>
        </div>
      </div>
    </>
  )
}
