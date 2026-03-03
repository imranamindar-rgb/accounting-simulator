import { useState } from 'react'

interface RedFlag {
  id: string
  category: string
  flag: string
  severity: 'high' | 'medium' | 'low'
  why: string
  chapter: number
}

const RED_FLAGS: RedFlag[] = [
  // Revenue quality
  { id: 'rf1', category: 'Revenue Quality', flag: 'DSO growing faster than revenue for 2+ consecutive quarters', severity: 'high', why: 'Indicates cash not being collected proportionally — possible premature recognition or channel stuffing', chapter: 2 },
  { id: 'rf2', category: 'Revenue Quality', flag: 'CFO/Net Income ratio below 0.7 for 3+ consecutive years', severity: 'high', why: 'Primary earnings manipulation signal: accounting earnings far outpace cash earnings', chapter: 7 },
  { id: 'rf3', category: 'Revenue Quality', flag: 'Q4 revenue > 35% of annual total (non-seasonal business)', severity: 'medium', why: 'Classic channel stuffing pattern: pulling forward revenue to hit annual targets', chapter: 2 },
  { id: 'rf4', category: 'Revenue Quality', flag: 'Revenue recognition policy change without clear business rationale', severity: 'high', why: 'Policy changes near covenant violations or compensation targets are intentional manipulation', chapter: 2 },
  { id: 'rf5', category: 'Revenue Quality', flag: 'Beneish M-Score above −1.78', severity: 'high', why: 'Statistical model with 76% accuracy in identifying manipulators (Beneish 1999)', chapter: 8 },

  // Balance sheet
  { id: 'rf6', category: 'Balance Sheet', flag: 'Goodwill > 40% of total assets', severity: 'medium', why: 'High goodwill concentration requires continuous synergy realization; large impairment risk', chapter: 9 },
  { id: 'rf7', category: 'Balance Sheet', flag: 'Off-balance-sheet commitments > 20% of reported debt', severity: 'high', why: 'True leverage significantly understated; covenant ratios misleading', chapter: 5 },
  { id: 'rf8', category: 'Balance Sheet', flag: 'Market cap below book equity for 2+ years', severity: 'high', why: 'Market implicitly valuing assets below book — impairment likely required but possibly deferred', chapter: 4 },
  { id: 'rf9', category: 'Balance Sheet', flag: 'Inventory growing 2× faster than revenue for 3+ quarters', severity: 'high', why: 'Demand weakening, obsolescence risk, or phantom inventory accumulation', chapter: 3 },
  { id: 'rf10', category: 'Balance Sheet', flag: 'Capex as % of revenue sharply higher than industry peers without explanation', severity: 'medium', why: 'Possible expense capitalization fraud; could signal WorldCom-style manipulation', chapter: 4 },

  // Cash flow
  { id: 'rf11', category: 'Cash Flow', flag: 'Negative free cash flow for 5+ years (non-startup, mature business)', severity: 'high', why: 'Business consuming more capital than generating — unsustainable without external financing', chapter: 7 },
  { id: 'rf12', category: 'Cash Flow', flag: 'Quarter-end debt paydowns reversed within 30 days', severity: 'high', why: 'Balance sheet window-dressing; Repo 105 pattern; actual leverage higher than reported', chapter: 5 },
  { id: 'rf13', category: 'Cash Flow', flag: 'Operating cash flow exceeds EBITDA consistently', severity: 'medium', why: 'Unusual — suggest working capital benefits that may reverse; check AP for stretching', chapter: 7 },
  { id: 'rf14', category: 'Cash Flow', flag: 'Reclassification of items between operating/investing sections vs prior year', severity: 'high', why: 'Direct manipulation of CFO metric; SEC enforcement cases include this pattern', chapter: 7 },

  // Governance
  { id: 'rf15', category: 'Governance', flag: 'Auditor firm same for 10+ years without partner rotation', severity: 'medium', why: 'Familiarity bias compromises independence; PCAOB mandates partner rotation, not firm', chapter: 10 },
  { id: 'rf16', category: 'Governance', flag: 'Audit committee members lack financial expertise (no CPA, CFA, or CFO background)', severity: 'medium', why: 'Oversight effectiveness limited; management can dominate discussion of complex accounting', chapter: 10 },
  { id: 'rf17', category: 'Governance', flag: 'CEO/Chairman combined role with minimal independent directors', severity: 'high', why: 'Board oversight compromised; dominant CEO is a primary fraud enabler', chapter: 10 },
  { id: 'rf18', category: 'Governance', flag: 'CFO or controller departure in Q4 without successor announced', severity: 'high', why: 'Often precedes restatements; departing financial officer may be unwilling to certify statements', chapter: 10 },
  { id: 'rf19', category: 'Governance', flag: 'Related-party transactions with entities controlled by executives', severity: 'high', why: 'Classic self-dealing mechanism; Tyco, Enron, Adelphia all involved related-party abuse', chapter: 5 },

  // Earnings management
  { id: 'rf20', category: 'Earnings Management', flag: 'Earnings consistently beat consensus by exactly 1-2 cents per share', severity: 'medium', why: 'Statistically implausible natural result; suggests guidance management or estimate manipulation', chapter: 10 },
  { id: 'rf21', category: 'Earnings Management', flag: 'Large acquisition reserves that reverse over subsequent quarters', severity: 'high', why: 'Cookie jar accounting; acquisition charges created to release as income later', chapter: 9 },
  { id: 'rf22', category: 'Earnings Management', flag: 'Non-GAAP EPS > 30% above GAAP EPS', severity: 'medium', why: 'Large exclusions may include recurring, economically real costs being stripped from "adjusted" metrics', chapter: 6 },
  { id: 'rf23', category: 'Earnings Management', flag: 'Useful life or salvage value changes that reduce depreciation in a weak earnings period', severity: 'high', why: 'Classic Waste Management technique; accounting estimate changes timed to manage earnings', chapter: 4 },
  { id: 'rf24', category: 'Earnings Management', flag: 'Significant inventory write-down immediately after management change', severity: 'high', why: 'Prior management likely deferred required write-downs; new management taking big bath', chapter: 3 },
  { id: 'rf25', category: 'Earnings Management', flag: 'First-digit distribution of journal entries fails Benford\'s Law (χ² > 15.51)', severity: 'high', why: 'Statistical evidence of fabricated or manipulated entries at dataset level', chapter: 10 },
]

const CATEGORIES = ['Revenue Quality', 'Balance Sheet', 'Cash Flow', 'Governance', 'Earnings Management']

const SEVERITY_STYLE = {
  high: { bg: '#dc262618', text: '#dc2626', border: '#dc262630' },
  medium: { bg: '#d9770618', text: '#d97706', border: '#d9770630' },
  low: { bg: '#1b433218', text: '#1b4332', border: '#1b433230' },
}

export default function RedFlagChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [activeCategory, setActiveCategory] = useState<string>('All')

  const toggle = (id: string) => setChecked(s => ({ ...s, [id]: !s[id] }))

  const filtered = activeCategory === 'All' ? RED_FLAGS : RED_FLAGS.filter(f => f.category === activeCategory)
  const checkedCount = Object.values(checked).filter(Boolean).length
  const highChecked = RED_FLAGS.filter(f => f.severity === 'high' && checked[f.id]).length
  const riskLevel = highChecked >= 4 ? 'CRITICAL' : highChecked >= 2 ? 'HIGH' : checkedCount >= 5 ? 'ELEVATED' : 'STANDARD'
  const riskColor = { CRITICAL: '#dc2626', HIGH: '#d97706', ELEVATED: '#7c2d12', STANDARD: '#1b4332' }[riskLevel]

  return (
    <div>
      {/* Risk meter */}
      <div style={{
        padding: '0.875rem 1.125rem', borderRadius: '0.625rem', marginBottom: '1.25rem',
        background: `${riskColor}10`, border: `1px solid ${riskColor}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Overall Risk Level</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: riskColor }}>{riskLevel}</div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: riskColor }}>{checkedCount}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Flags</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: '#dc2626' }}>{highChecked}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>High Severity</div>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {['All', ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            style={{ padding: '0.3rem 0.7rem', borderRadius: '9999px', border: '1px solid var(--color-border)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', cursor: 'pointer', background: activeCategory === cat ? 'var(--color-accent)' : 'var(--color-surface)', color: activeCategory === cat ? '#fff' : 'var(--color-text-muted)' }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Flag list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filtered.map(flag => {
          const sev = SEVERITY_STYLE[flag.severity]
          const isChecked = checked[flag.id]
          return (
            <div key={flag.id} onClick={() => toggle(flag.id)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                padding: '0.75rem 0.875rem', borderRadius: '0.5rem', cursor: 'pointer',
                background: isChecked ? sev.bg : 'var(--color-surface)',
                border: `1px solid ${isChecked ? sev.border : 'var(--color-border)'}`,
                transition: 'all 0.15s',
              }}>
              {/* Checkbox */}
              <div style={{
                width: '1.1rem', height: '1.1rem', borderRadius: '0.25rem', flexShrink: 0, marginTop: '2px',
                border: `1.5px solid ${isChecked ? sev.text : 'var(--color-border)'}`,
                background: isChecked ? sev.text : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.6rem',
              }}>
                {isChecked && '✓'}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: isChecked ? 600 : 400, color: isChecked ? sev.text : 'var(--color-text)', lineHeight: 1.5 }}>
                    {flag.flag}
                  </span>
                  <span style={{ flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: '0.6rem', padding: '1px 6px', borderRadius: '9999px', background: sev.bg, color: sev.text, fontWeight: 600, textTransform: 'uppercase', border: `1px solid ${sev.border}` }}>
                    {flag.severity}
                  </span>
                </div>
                {isChecked && (
                  <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--color-text-muted)', lineHeight: 1.55 }}>
                    {flag.why} — see Ch{flag.chapter}.
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <button onClick={() => setChecked({})} style={{ marginTop: '1rem', padding: '0.375rem 0.875rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}>
        Clear All
      </button>
    </div>
  )
}
