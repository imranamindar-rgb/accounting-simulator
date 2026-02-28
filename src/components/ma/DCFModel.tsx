import { useState, useMemo, useEffect } from 'react'
import { useMAStore } from '../../store/maStore'
import { computeDCF } from '../../engines/MAEngine'
import type { MACompanyInput, DCFInput, DCFResult } from '../../engines/MAEngine'
import StatementPanel from '../statements/StatementPanel'

interface Props {
  company: MACompanyInput
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function DCFModel({ company }: Props) {
  const dcfInputs = useMAStore((s) => s.dcfInputs)
  const setDCFInputs = useMAStore((s) => s.setDCFInputs)

  // Initialize DCF inputs from company data
  const defaultInputs: DCFInput = useMemo(
    () => ({
      baseFCF: company.freeCashFlow,
      growthRate: 0.08,
      wacc: 0.1,
      terminalGrowth: 0.025,
      years: 5,
      sharesOutstanding: company.sharesOut,
      longTermDebt: company.longTermDebt,
      cash: company.cash,
    }),
    [company],
  )

  // Local form state
  const [formState, setFormState] = useState<DCFInput>(dcfInputs ?? defaultInputs)

  // Sync store when inputs change
  useEffect(() => {
    if (!dcfInputs) {
      setDCFInputs(defaultInputs)
      setFormState(defaultInputs)
    }
  }, [defaultInputs]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = (field: keyof DCFInput, value: number) => {
    const updated = { ...formState, [field]: value }
    setFormState(updated)
    setDCFInputs(updated)
  }

  const result: DCFResult | null = useMemo(() => computeDCF(formState), [formState])

  const priceComparison = result
    ? result.impliedSharePrice - company.sharePrice
    : null

  return (
    <StatementPanel title="DCF Valuation Model" subtitle={company.name}>
      <div className="flex flex-col gap-6">
        {/* Input form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InputField
            label="Base FCF"
            value={formState.baseFCF}
            onChange={(v) => updateField('baseFCF', v)}
            prefix="$"
          />
          <InputField
            label="Growth Rate (%)"
            value={formState.growthRate * 100}
            onChange={(v) => updateField('growthRate', v / 100)}
            suffix="%"
          />
          <InputField
            label="WACC (%)"
            value={formState.wacc * 100}
            onChange={(v) => updateField('wacc', v / 100)}
            suffix="%"
          />
          <InputField
            label="Terminal Growth (%)"
            value={formState.terminalGrowth * 100}
            onChange={(v) => updateField('terminalGrowth', v / 100)}
            suffix="%"
          />
          <InputField
            label="Shares Outstanding"
            value={formState.sharesOutstanding}
            onChange={(v) => updateField('sharesOutstanding', v)}
          />
          <InputField
            label="Long-term Debt"
            value={formState.longTermDebt}
            onChange={(v) => updateField('longTermDebt', v)}
            prefix="$"
          />
          <InputField
            label="Cash"
            value={formState.cash}
            onChange={(v) => updateField('cash', v)}
            prefix="$"
          />
        </div>

        {result ? (
          <>
            {/* Projections table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                    <th className="text-left py-2 px-2" style={{ fontFamily: 'var(--font-body)' }}>Year</th>
                    <th className="text-right py-2 px-2" style={{ fontFamily: 'var(--font-body)' }}>Projected FCF</th>
                    <th className="text-right py-2 px-2" style={{ fontFamily: 'var(--font-body)' }}>PV Factor</th>
                    <th className="text-right py-2 px-2" style={{ fontFamily: 'var(--font-body)' }}>Present Value</th>
                  </tr>
                </thead>
                <tbody>
                  {result.projections.map((p) => (
                    <tr key={p.year} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td className="py-1.5 px-2">{p.year}</td>
                      <td className="py-1.5 px-2 text-right">${fmt(p.fcf)}</td>
                      <td className="py-1.5 px-2 text-right">{p.pvFactor.toFixed(4)}</td>
                      <td className="py-1.5 px-2 text-right">${fmt(p.pv)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 px-3 py-3 rounded"
              style={{ background: 'var(--color-base)' }}
            >
              <SummaryRow label="PV of Cash Flows" value={`$${fmt(result.pvOfCashFlows)}`} />
              <SummaryRow label="Terminal Value" value={`$${fmt(result.terminalValue)}`} />
              <SummaryRow label="PV of Terminal Value" value={`$${fmt(result.pvTerminal)}`} />
              <SummaryRow label="Enterprise Value" value={`$${fmt(result.enterpriseValue)}`} />
              <SummaryRow label="Equity Value" value={`$${fmt(result.equityValue)}`} />
              <SummaryRow label="Implied Share Price" value={`$${fmt(result.impliedSharePrice)}`} bold />
            </div>

            {/* Price comparison */}
            {priceComparison !== null && (
              <div className="flex items-center gap-3 text-sm">
                <span style={{ color: 'var(--color-text-muted)' }}>Current Price: </span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>${fmt(company.sharePrice)}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>vs Implied: </span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>${fmt(result.impliedSharePrice)}</span>
                <span
                  className="font-bold text-sm"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: priceComparison >= 0 ? 'var(--color-green)' : 'var(--color-accent-light)',
                  }}
                >
                  {priceComparison >= 0 ? '\u25B2' : '\u25BC'} {priceComparison >= 0 ? '+' : ''}
                  {fmt(priceComparison)} ({((priceComparison / company.sharePrice) * 100).toFixed(1)}%)
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="text-sm py-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
            WACC must be greater than terminal growth rate to compute DCF.
          </div>
        )}
      </div>
    </StatementPanel>
  )
}

function InputField({
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  prefix?: string
  suffix?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
        {label}
      </label>
      <div className="flex items-center gap-1">
        {prefix && (
          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full px-2 py-1.5 rounded text-sm"
          style={{
            border: '1px solid var(--color-border)',
            background: 'var(--color-base)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text)',
          }}
        />
        {suffix && (
          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{suffix}</span>
        )}
      </div>
    </div>
  )
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span
        className={`text-sm ${bold ? 'font-bold' : ''}`}
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}
      >
        {value}
      </span>
    </div>
  )
}
