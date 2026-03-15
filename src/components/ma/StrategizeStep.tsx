import { useMAStore } from '../../store/maStore'
import { isFinancingMixValid } from '../../engines/MAEngine'
import StatementPanel from '../statements/StatementPanel'

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function StrategizeStep() {
  const target = useMAStore((s) => s.targetCompany)
  const dealTerms = useMAStore((s) => s.dealTerms)
  const setDealTerms = useMAStore((s) => s.setDealTerms)

  if (!target) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
        No target company selected. Go back to Import step.
      </div>
    )
  }

  const financingSum = dealTerms.cashPct + dealTerms.stockPct + dealTerms.debtPct
  const financingValid = isFinancingMixValid(dealTerms)

  const offerPrice = target.sharePrice * (1 + dealTerms.premiumPct / 100)
  const purchasePrice = offerPrice * target.sharesOut

  return (
    <div className="flex flex-col gap-6">
      <StatementPanel title="Deal Structure" subtitle="Configure acquisition terms">
        <div className="flex flex-col gap-6">
          {/* Premium */}
          <SliderField
            label="Acquisition Premium"
            value={dealTerms.premiumPct}
            onChange={(v) => setDealTerms({ premiumPct: v })}
            min={0}
            max={100}
            step={1}
            suffix="%"
          />

          {/* Financing mix */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3
                className="text-sm font-semibold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
              >
                Financing Mix
              </h3>
              {!financingValid && (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded"
                  style={{
                    background: 'var(--color-accent-light)',
                    color: '#fff',
                  }}
                >
                  Must sum to 100% (currently {financingSum.toFixed(0)}%)
                </span>
              )}
            </div>
            <SliderField
              label="Cash"
              value={dealTerms.cashPct}
              onChange={(v) => setDealTerms({ cashPct: v })}
              min={0}
              max={100}
              step={1}
              suffix="%"
            />
            <SliderField
              label="Stock"
              value={dealTerms.stockPct}
              onChange={(v) => setDealTerms({ stockPct: v })}
              min={0}
              max={100}
              step={1}
              suffix="%"
            />
            <SliderField
              label="Debt"
              value={dealTerms.debtPct}
              onChange={(v) => setDealTerms({ debtPct: v })}
              min={0}
              max={100}
              step={1}
              suffix="%"
            />
          </div>

          {/* Debt rate */}
          <SliderField
            label="Debt Interest Rate"
            value={dealTerms.debtRate}
            onChange={(v) => setDealTerms({ debtRate: v })}
            min={0}
            max={15}
            step={0.5}
            suffix="%"
          />

          {/* Tax rate (stored as decimal 0-1, display as 0-50%) */}
          <SliderField
            label="Tax Rate"
            value={dealTerms.taxRate * 100}
            onChange={(v) => setDealTerms({ taxRate: v / 100 })}
            min={0}
            max={50}
            step={1}
            suffix="%"
          />

          {/* Synergies */}
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
              Expected Synergies
            </label>
            <div className="flex items-center gap-1">
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>$</span>
              <input
                type="number"
                value={dealTerms.synergies}
                onChange={(e) => setDealTerms({ synergies: parseFloat(e.target.value) || 0 })}
                className="w-full max-w-xs px-2 py-1.5 rounded text-sm"
                style={{
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-base)',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
          </div>
        </div>
      </StatementPanel>

      {/* Live preview */}
      <StatementPanel title="Deal Preview" subtitle="Estimated pricing based on current terms">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          <PreviewRow label="Target Stock Price" value={`$${fmt(target.sharePrice)}`} />
          <PreviewRow label="Premium" value={`${dealTerms.premiumPct.toFixed(0)}%`} />
          <PreviewRow label="Offer Price per Share" value={`$${fmt(offerPrice)}`} bold />
          <PreviewRow label="Target Shares" value={fmt(target.sharesOut)} />
          <PreviewRow label="Total Purchase Price" value={`$${fmt(purchasePrice)}`} bold />
          <PreviewRow label="Cash Component" value={`$${fmt(purchasePrice * dealTerms.cashPct / 100)}`} />
          <PreviewRow label="Stock Component" value={`$${fmt(purchasePrice * dealTerms.stockPct / 100)}`} />
          <PreviewRow label="Debt Component" value={`$${fmt(purchasePrice * dealTerms.debtPct / 100)}`} />
        </div>
      </StatementPanel>
    </div>
  )
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  suffix?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
          {label}
        </label>
        <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>
          {value.toFixed(step < 1 ? 1 : 0)}{suffix ?? ''}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[var(--color-gold)]"
      />
    </div>
  )
}

function PreviewRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
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
