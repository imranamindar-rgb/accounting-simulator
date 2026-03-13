import { useState } from 'react'

interface Criterion {
  id: number
  question: string
  explanation: string
}

const CRITERIA: Criterion[] = [
  { id: 1, question: 'Does ownership of the asset transfer to the lessee at the end of the lease?', explanation: 'If the lease transfers ownership, the lessee effectively purchases the asset — making it a finance lease.' },
  { id: 2, question: 'Does the lease contain a bargain purchase option?', explanation: 'A purchase option priced significantly below fair value signals the lessee will likely buy the asset.' },
  { id: 3, question: 'Is the lease term equal to or greater than 75% of the asset\'s remaining economic life?', explanation: 'Using the asset for most of its useful life means the lessee bears the majority of economic risk.' },
  { id: 4, question: 'Does the present value of lease payments equal or exceed 90% of the asset\'s fair value?', explanation: 'Paying nearly the full value through lease payments is economically equivalent to purchasing.' },
  { id: 5, question: 'Is the asset so specialized that it has no alternative use to the lessor at lease end?', explanation: 'If only the lessee can use the asset, the risks and rewards have effectively transferred.' },
]

type Answer = 'yes' | 'no' | null

export default function LeaseClassifier() {
  const [answers, setAnswers] = useState<Record<number, Answer>>(
    Object.fromEntries(CRITERIA.map(c => [c.id, null]))
  )
  const [currentStep, setCurrentStep] = useState(0)
  const [showCalculator, setShowCalculator] = useState(false)

  // PV calculator state
  const [annualPayment, setAnnualPayment] = useState(10000)
  const [leaseTerm, setLeaseTerm] = useState(5)
  const [discountRate, setDiscountRate] = useState(6)

  const allAnswered = currentStep >= CRITERIA.length
  const hasYes = Object.values(answers).some(a => a === 'yes')
  const classification = allAnswered ? (hasYes ? 'Finance Lease' : 'Operating Lease') : null

  const answer = (value: Answer) => {
    const criterion = CRITERIA[currentStep]
    setAnswers(prev => ({ ...prev, [criterion.id]: value }))

    // If yes, we can classify immediately (any yes = finance lease)
    if (value === 'yes') {
      // Still advance to show all criteria were considered
      setCurrentStep(prev => prev + 1)
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const reset = () => {
    setAnswers(Object.fromEntries(CRITERIA.map(c => [c.id, null])))
    setCurrentStep(0)
    setShowCalculator(false)
  }

  // PV calculation
  const rate = discountRate / 100
  const pvFactor = rate === 0 ? leaseTerm : (1 - Math.pow(1 + rate, -leaseTerm)) / rate
  const pvPayments = Math.round(annualPayment * pvFactor * 100) / 100

  const fmt = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div>
      {/* Progress indicator */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem' }}>
        {CRITERIA.map((c, i) => {
          const a = answers[c.id]
          const bg = a === 'yes' ? '#dc2626' : a === 'no' ? '#16a34a' : i === currentStep ? 'var(--color-accent)' : 'var(--color-border)'
          return (
            <div key={c.id} style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: bg,
              transition: 'background 0.2s',
            }} />
          )
        })}
      </div>

      {/* Current criterion */}
      {!allAnswered && (
        <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
            ASC 842 Criterion {currentStep + 1} of {CRITERIA.length}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.4 }}>
            {CRITERIA[currentStep].question}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
            {CRITERIA[currentStep].explanation}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => answer('yes')} style={{
              padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #dc262640',
              background: '#dc262612', color: '#dc2626', fontFamily: 'var(--font-body)',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
            }}>
              Yes
            </button>
            <button onClick={() => answer('no')} style={{
              padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #16a34a40',
              background: '#16a34a12', color: '#16a34a', fontFamily: 'var(--font-body)',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
            }}>
              No
            </button>
          </div>
        </div>
      )}

      {/* Answered criteria summary */}
      {currentStep > 0 && (
        <div style={{ marginBottom: '1.25rem', padding: '0.875rem', background: 'var(--color-base)', border: '1px solid var(--color-border)', borderRadius: '0.5rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Criteria Evaluated
          </div>
          {CRITERIA.slice(0, currentStep).map(c => (
            <div key={c.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: '0.78rem', marginBottom: '0.3rem', padding: '0.2rem 0.4rem',
              borderRadius: '0.25rem',
              background: answers[c.id] === 'yes' ? '#dc262612' : '#16a34a12',
            }}>
              <span style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text)', flex: 1 }}>
                {c.id}. {c.question.length > 60 ? c.question.slice(0, 60) + '...' : c.question}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                color: answers[c.id] === 'yes' ? '#dc2626' : '#16a34a',
                marginLeft: '0.5rem',
              }}>
                {answers[c.id] === 'yes' ? 'YES' : 'NO'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Classification result */}
      {allAnswered && classification && (
        <div style={{
          marginBottom: '1.25rem',
          padding: '1rem 1.25rem',
          background: classification === 'Finance Lease' ? '#7c2d1212' : '#1b433212',
          border: `1px solid ${classification === 'Finance Lease' ? '#7c2d1240' : '#1b433240'}`,
          borderRadius: '0.625rem',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
            Classification Result
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700,
            color: classification === 'Finance Lease' ? '#7c2d12' : '#1b4332',
            marginBottom: '0.35rem',
          }}>
            {classification}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            {classification === 'Finance Lease'
              ? 'At least one ASC 842 criterion was met. The lessee records a right-of-use (ROU) asset and lease liability. The ROU asset is amortized and interest expense is recognized on the liability.'
              : 'No ASC 842 criteria were met. The lessee records a right-of-use (ROU) asset and lease liability, but recognizes a single straight-line lease expense combining amortization and interest.'}
          </div>

          <button onClick={() => setShowCalculator(!showCalculator)} style={{
            marginTop: '0.75rem', padding: '0.4rem 1rem', borderRadius: '0.5rem',
            border: '1px solid var(--color-border)', background: 'var(--color-surface)',
            color: 'var(--color-text)', fontFamily: 'var(--font-body)',
            fontSize: '0.82rem', cursor: 'pointer',
          }}>
            {showCalculator ? 'Hide' : 'Show'} PV Calculator & Journal Entry
          </button>
        </div>
      )}

      {/* PV Calculator */}
      {showCalculator && (
        <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            Present Value Calculator
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Annual Payment $</div>
              <input type="number" value={annualPayment} onChange={e => setAnnualPayment(Number(e.target.value))} style={{ width: '100%', padding: '0.4rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', background: 'var(--color-base)', color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Lease Term (years)</div>
              <input type="number" value={leaseTerm} onChange={e => setLeaseTerm(Number(e.target.value))} min={1} max={30} style={{ width: '100%', padding: '0.4rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', background: 'var(--color-base)', color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Discount Rate %</div>
              <input type="number" value={discountRate} onChange={e => setDiscountRate(Number(e.target.value))} min={0} max={30} step={0.5} style={{ width: '100%', padding: '0.4rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', background: 'var(--color-base)', color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }} />
            </div>
          </div>

          {/* PV Result */}
          <div style={{
            padding: '0.875rem 1rem',
            background: '#1e3a5f12',
            border: '1px solid #1e3a5f30',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#1e3a5f', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Present Value of Lease Payments
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: '#1e3a5f' }}>
              {fmt(pvPayments)}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              PV factor (ordinary annuity, {leaseTerm} periods, {discountRate}%): {pvFactor.toFixed(4)}
            </div>
          </div>

          {/* Journal Entry */}
          <div style={{ padding: '0.875rem', background: 'var(--color-base)', border: '1px solid var(--color-border)', borderRadius: '0.5rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              Journal Entry — Lease Commencement
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-text)', marginBottom: '0.3rem' }}>
              <span style={{ display: 'inline-block', width: '220px' }}>Dr Right-of-Use Asset</span>
              <span style={{ fontWeight: 700 }}>{fmt(pvPayments)}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-text)', paddingLeft: '1.5rem' }}>
              <span style={{ display: 'inline-block', width: '196px' }}>Cr Lease Liability</span>
              <span style={{ fontWeight: 700 }}>{fmt(pvPayments)}</span>
            </div>
            <div style={{ marginTop: '0.75rem', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              At commencement, the ROU asset and lease liability are both recorded at the present value of future lease payments.
              {classification === 'Finance Lease'
                ? ' For a finance lease, the ROU asset is amortized (usually straight-line) and interest expense is recognized separately on the liability each period.'
                : ' For an operating lease, a single straight-line lease expense is recognized each period, combining the amortization of the ROU asset and the unwinding of the discount on the liability.'}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={reset} style={{
          padding: '0.5rem 1rem', borderRadius: '0.5rem',
          border: '1px solid var(--color-border)', background: 'transparent',
          color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)',
          fontSize: '0.82rem', cursor: 'pointer',
        }}>
          Start Over
        </button>
      </div>
    </div>
  )
}
