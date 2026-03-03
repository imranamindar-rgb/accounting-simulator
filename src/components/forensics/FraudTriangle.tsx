import { useState } from 'react'

interface TriangleElement {
  id: 'pressure' | 'opportunity' | 'rationalization'
  label: string
  color: string
  description: string
  indicators: string[]
  enronExample: string
  wireCardExample: string
}

const ELEMENTS: TriangleElement[] = [
  {
    id: 'pressure',
    label: 'Pressure',
    color: '#7c2d12',
    description: 'The financial or professional motivation to commit fraud. Without perceived pressure, most individuals would not cross ethical lines.',
    indicators: [
      'Earnings guidance commitments that appear unreachable',
      'Covenant breach approaching (triggers acceleration)',
      'Large personal debt or financial obligations',
      'Executive compensation tied entirely to stock price/EPS',
      'Company facing insolvency without the fraud',
    ],
    enronExample: 'Enron\'s traders and executives faced extreme pressure to maintain revenue growth and stock price to preserve their stock option wealth. Mark-to-market accounting created enormous pressure to fabricate deal valuations.',
    wireCardExample: 'Wirecard executives faced pressure to maintain a high-growth narrative to justify a 30× revenue valuation multiple. When the business model generated insufficient real revenue, they fabricated the rest.',
  },
  {
    id: 'opportunity',
    label: 'Opportunity',
    color: '#1e3a5f',
    description: 'The ability to commit fraud without detection. Opportunity is determined by the strength of internal controls and oversight.',
    indicators: [
      'Dominant CEO who controls all decision-making',
      'Weak internal audit function or none at all',
      'Complex corporate structure (SPEs, subsidiaries, related parties)',
      'Auditors who have worked with management for 10+ years',
      'Geographic operations in low-oversight jurisdictions',
    ],
    enronExample: 'Enron\'s complexity — 3,000+ SPEs, mark-to-market accounting requiring constant estimates, international operations — created a zone of opacity where management had enormous discretion without effective oversight.',
    wireCardExample: 'Wirecard used a network of third-party payment processors in obscure jurisdictions. The cash was supposedly held at escrow accounts — a structure auditors accepted with management-provided confirmations for years.',
  },
  {
    id: 'rationalization',
    label: 'Rationalization',
    color: '#1b4332',
    description: 'The cognitive justification that allows the perpetrator to maintain a self-image as an ethical person while committing fraud.',
    indicators: [
      '"I\'ll fix it next quarter when business recovers"',
      '"Everyone in this industry does it"',
      '"I\'m just using aggressive but legal accounting"',
      '"The underlying business is real — I\'m just smoothing the timing"',
      '"I deserve this after everything I\'ve done for the company"',
    ],
    enronExample: '"Hypothetical Future Value" — Enron executives rationalized that booking theoretical future profits on complex derivatives was legitimate because the contracts would eventually be worth that amount. The rationalization was built into the accounting methodology itself.',
    wireCardExample: 'CEO Markus Braun rationalized that the business was genuinely growing and the accounting was "complex but legitimate." When confronted by journalists, he threatened legal action — an extension of the rationalization into public behavior.',
  },
]

interface CaseAnalysis {
  company: string
  year: number
  fraudType: string
  pressure: string
  opportunity: string
  rationalization: string
  amount: string
  outcome: string
}

const CASES: CaseAnalysis[] = [
  {
    company: 'Enron',
    year: 2001,
    fraudType: 'Mark-to-market revenue fabrication + SPE off-balance-sheet debt',
    pressure: 'Stock price needed to justify options; revenue growth commitments; impending maturity of obligations hidden in SPEs',
    opportunity: '3,000+ SPEs; complex energy contracts requiring estimate-based accounting; friendly auditor (Arthur Andersen)',
    rationalization: '"Hypothetical Future Value accounting" — booking theoretical profits was framed as innovative, not fraudulent',
    amount: '$74B in shareholder losses',
    outcome: 'Bankruptcy (2001); 20 executives convicted; Arthur Andersen destroyed; Sarbanes-Oxley Act passed',
  },
  {
    company: 'Wirecard',
    year: 2020,
    fraudType: 'Fictitious revenue + $1.9B phantom cash',
    pressure: '30× revenue multiple required continuous high-growth narrative; underlying payment processing margins insufficient to sustain valuation',
    opportunity: 'Third-party processor network in Philippines/Dubai provided opacity; auditor EY accepted management-provided bank confirmations',
    rationalization: 'CEO claimed it was a complex international structure that critics "didn\'t understand"; threatened legal action against FT journalists',
    amount: '€1.9B ($2.1B) in fictitious cash; €12B market cap destroyed',
    outcome: 'CEO arrested; COO fled to Belarus; EY faces regulatory and legal scrutiny; Germany overhauled financial oversight',
  },
  {
    company: 'Madoff',
    year: 2008,
    fraudType: 'Pure Ponzi scheme — no actual trading',
    pressure: 'Initial losses that Madoff decided to cover up rather than disclose; committed to providing stable, above-market returns',
    opportunity: 'Self-clearing broker-dealer (no independent custodian); SEC failed to investigate despite Markopolos warnings; small accounting firm as auditor',
    rationalization: '"Clients are better off with smooth returns than volatile truth; I provide a service." Decades of successful legitimacy created cognitive anchoring to his own credibility',
    amount: '$17B in losses (net); $65B in fictitious account statements',
    outcome: '150-year sentence; fraud ran 30+ years; SEC faced significant criticism; SIPC paid $2.6B in investor claims',
  },
]

export default function FraudTriangle() {
  const [activeElement, setActiveElement] = useState<string | null>(null)
  const [selectedCase, setSelectedCase] = useState<number>(0)

  const active = ELEMENTS.find(e => e.id === activeElement)

  return (
    <div>
      {/* Triangle visual */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <svg width="340" height="260" viewBox="0 0 340 260">
          {/* Triangle paths — clickable regions */}
          {/* Center overlap label */}
          <text x="170" y="130" textAnchor="middle" fill="#4A0A12" fontSize="11" fontWeight="bold" fontFamily="serif">
            FRAUD
          </text>
          <text x="170" y="148" textAnchor="middle" fill="#8B6F5E" fontSize="9" fontFamily="monospace">
            requires all three
          </text>

          {/* Pressure (top) */}
          <polygon
            points="170,20 90,170 145,170 170,90 195,170 250,170"
            fill={activeElement === 'pressure' ? '#7c2d12' : '#7c2d1218'}
            stroke="#7c2d12" strokeWidth="1.5"
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveElement(activeElement === 'pressure' ? null : 'pressure')}
          />
          <text x="170" y="55" textAnchor="middle" fill={activeElement === 'pressure' ? '#fff' : '#7c2d12'} fontSize="11" fontWeight="bold" fontFamily="sans-serif">Pressure</text>
          <text x="170" y="68" textAnchor="middle" fill={activeElement === 'pressure' ? '#fff' : '#7c2d12'} fontSize="8" fontFamily="sans-serif">(Incentive / Need)</text>

          {/* Opportunity (bottom-left) */}
          <polygon
            points="90,170 35,250 165,250 145,170"
            fill={activeElement === 'opportunity' ? '#1e3a5f' : '#1e3a5f18'}
            stroke="#1e3a5f" strokeWidth="1.5"
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveElement(activeElement === 'opportunity' ? null : 'opportunity')}
          />
          <text x="90" y="220" textAnchor="middle" fill={activeElement === 'opportunity' ? '#fff' : '#1e3a5f'} fontSize="11" fontWeight="bold" fontFamily="sans-serif">Opportunity</text>
          <text x="90" y="233" textAnchor="middle" fill={activeElement === 'opportunity' ? '#fff' : '#1e3a5f'} fontSize="8" fontFamily="sans-serif">(Weak Controls)</text>

          {/* Rationalization (bottom-right) */}
          <polygon
            points="250,170 195,170 175,250 305,250"
            fill={activeElement === 'rationalization' ? '#1b4332' : '#1b433218'}
            stroke="#1b4332" strokeWidth="1.5"
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveElement(activeElement === 'rationalization' ? null : 'rationalization')}
          />
          <text x="250" y="220" textAnchor="middle" fill={activeElement === 'rationalization' ? '#fff' : '#1b4332'} fontSize="11" fontWeight="bold" fontFamily="sans-serif">Rationalization</text>
          <text x="250" y="233" textAnchor="middle" fill={activeElement === 'rationalization' ? '#fff' : '#1b4332'} fontSize="8" fontFamily="sans-serif">(Justification)</text>
        </svg>
      </div>

      {/* Active element detail */}
      {active && (
        <div style={{
          marginBottom: '1.5rem', padding: '1.125rem 1.25rem',
          background: `${active.color}08`, border: `1px solid ${active.color}30`,
          borderRadius: '0.75rem',
        }}>
          <h3 style={{ margin: '0 0 0.5rem', fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: active.color }}>
            {active.label}
          </h3>
          <p style={{ margin: '0 0 0.875rem', fontSize: '0.82rem', color: 'var(--color-text)', lineHeight: 1.65 }}>
            {active.description}
          </p>

          <div style={{ marginBottom: '0.875rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: active.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.375rem' }}>
              Indicators to Watch For
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 1rem' }}>
              {active.indicators.map((ind, i) => (
                <li key={i} style={{ fontSize: '0.8rem', color: 'var(--color-text)', lineHeight: 1.6, marginBottom: '0.25rem' }}>{ind}</li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ padding: '0.625rem 0.875rem', background: 'var(--color-base)', borderRadius: '0.375rem', border: '1px solid var(--color-border)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#7c2d12', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Enron</div>
              <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--color-text-muted)', lineHeight: 1.55 }}>{active.enronExample}</p>
            </div>
            <div style={{ padding: '0.625rem 0.875rem', background: 'var(--color-base)', borderRadius: '0.375rem', border: '1px solid var(--color-border)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Wirecard</div>
              <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--color-text-muted)', lineHeight: 1.55 }}>{active.wireCardExample}</p>
            </div>
          </div>
        </div>
      )}

      {!activeElement && (
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          Click any element of the triangle to explore in detail.
        </p>
      )}

      {/* Case studies */}
      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
          Case Autopsy — Apply the Triangle
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {CASES.map((c, i) => (
            <button key={i} onClick={() => setSelectedCase(i)}
              style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', background: selectedCase === i ? 'var(--color-accent)' : 'var(--color-surface)', color: selectedCase === i ? '#fff' : 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', cursor: 'pointer' }}>
              {c.company}
            </button>
          ))}
        </div>

        {CASES[selectedCase] && (
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem', overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(74,10,18,0.06)', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-accent)', fontSize: '0.95rem' }}>
                {CASES[selectedCase].company} ({CASES[selectedCase].year})
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                {CASES[selectedCase].fraudType} · {CASES[selectedCase].amount}
              </div>
            </div>

            <div style={{ padding: '0.875rem 1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              {(['pressure', 'opportunity', 'rationalization'] as const).map(el => {
                const elem = ELEMENTS.find(e => e.id === el)!
                return (
                  <div key={el} style={{ padding: '0.625rem', background: `${elem.color}08`, borderRadius: '0.375rem', border: `1px solid ${elem.color}30` }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: elem.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
                      {elem.label}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--color-text)', lineHeight: 1.55 }}>
                      {CASES[selectedCase][el]}
                    </p>
                  </div>
                )
              })}
            </div>

            <div style={{ padding: '0.625rem 1rem', background: 'var(--color-base)', borderTop: '1px solid var(--color-border)', fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
              <strong style={{ color: 'var(--color-text)' }}>Outcome: </strong>
              {CASES[selectedCase].outcome}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
