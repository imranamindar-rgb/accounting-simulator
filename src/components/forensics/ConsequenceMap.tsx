import { useState } from 'react'

interface Connection {
  from: number // chapter id
  to: number // chapter id
  label: string
  description: string
}

interface ChapterNode {
  id: number
  title: string
  short: string
  color: string
  x: number
  y: number
  fraudTechnique: string
  downstreamEffect: string
}

const NODES: ChapterNode[] = [
  { id: 1, title: 'Accounting Equation', short: 'Ch1', color: '#4A0A12', x: 50, y: 50, fraudTechnique: 'Fictitious journal entries maintain equation balance while fabricating assets', downstreamEffect: 'Inflated assets must balance somewhere — check equity and liability for compensating entries' },
  { id: 2, title: 'Revenue Recognition', short: 'Ch2', color: '#7B1B2A', x: 250, y: 30, fraudTechnique: 'Premature recognition books future revenue today — DSO rises, CFO diverges', downstreamEffect: 'Every dollar of false revenue creates an AR balance that must eventually be written off or reversed' },
  { id: 3, title: 'Inventory', short: 'Ch3', color: '#92400E', x: 450, y: 50, fraudTechnique: 'Phantom inventory overstates assets; understated COGS inflates gross margin', downstreamEffect: 'Inventory write-downs destroy equity; working capital cash flow deteriorates' },
  { id: 4, title: 'Fixed Assets', short: 'Ch4', color: '#7C3AED', x: 650, y: 50, fraudTechnique: 'Capitalizing expenses moves costs from operating to investing; inflates CFO', downstreamEffect: 'Higher depreciation in future periods; assets become impaired; CFO was overstated' },
  { id: 5, title: 'Liabilities', short: 'Ch5', color: '#1D4ED8', x: 100, y: 200, fraudTechnique: 'Off-balance-sheet structures hide debt; repos disguise borrowing as sales', downstreamEffect: 'Real leverage is understated; covenant ratios are misleading; collapse when SPEs consolidate' },
  { id: 6, title: 'Equity', short: 'Ch6', color: '#065F46', x: 350, y: 200, fraudTechnique: 'SBC exclusions inflate non-GAAP EPS; buybacks mechanically reduce share count', downstreamEffect: 'Diluted earnings more meaningful than adjusted; buybacks destroy value when stock is overvalued' },
  { id: 7, title: 'Cash Flow', short: 'Ch7', color: '#B45309', x: 600, y: 200, fraudTechnique: 'Operating/investing reclassification inflates CFO; working capital timing managed', downstreamEffect: 'CFO vs NI divergence is the single most reliable fraud signal — visible in every 10-K' },
  { id: 8, title: 'Ratio Analysis', short: 'Ch8', color: '#0F766E', x: 150, y: 350, fraudTechnique: 'Denominator management improves ratios without operational improvement', downstreamEffect: 'DuPont decomposition exposes whether ROE comes from operations, efficiency, or leverage' },
  { id: 9, title: 'M&A Accounting', short: 'Ch9', color: '#6B21A8', x: 400, y: 350, fraudTechnique: 'Acquisition reserves create cookie jars; goodwill avoids impairment by using optimistic projections', downstreamEffect: 'Goodwill impairment is the largest single non-cash charge — signals failed synergy thesis years late' },
  { id: 10, title: 'Fraud Detection', short: 'Ch10', color: '#212121', x: 650, y: 350, fraudTechnique: 'Fraud Triangle: Pressure + Opportunity + Rationalization = manipulation', downstreamEffect: 'Systematic red flag analysis across all 9 prior chapters creates comprehensive forensic picture' },
]

const CONNECTIONS: Connection[] = [
  { from: 2, to: 7, label: 'Revenue → CFO Gap', description: 'Premature revenue recognition inflates NI; CFO stays low because cash hasn\'t arrived. DSO rises. The AR-to-CFO gap is Ch7\'s primary fraud signal.' },
  { from: 2, to: 8, label: 'Revenue → DSO Ratio', description: 'Beneish DSR (Days Sales Ratio) uses AR/Revenue trend. Rising DSO inflates asset turnover denominator and skews ROE analysis.' },
  { from: 3, to: 1, label: 'Inventory → Equation', description: 'Phantom inventory overstates assets. To keep Assets = L + E, retained earnings must be inflated — directly violating Ch1\'s double-entry integrity.' },
  { from: 3, to: 8, label: 'Inventory → Turnover Ratio', description: 'FIFO vs LIFO method choice affects inventory values and COGS. Must normalize for cost flow assumption before comparing turnover ratios cross-company.' },
  { from: 4, to: 7, label: 'Capex → CFO Inflation', description: 'Capitalized expenses move from operating to investing activities. Operating CF appears stronger; investing CF appears weaker. WorldCom: $3.8B CFO inflation.' },
  { from: 5, to: 8, label: 'Liabilities → Leverage Ratios', description: 'Off-balance-sheet debt understates all leverage ratios. Debt/EBITDA, interest coverage, and equity multiplier (DuPont) are misleading without OBS adjustments.' },
  { from: 6, to: 7, label: 'Buybacks → Financing CF', description: 'Debt-funded buybacks appear in financing activities. Operating CF appears strong while the balance sheet levers up. The cash flow statement shows the full picture.' },
  { from: 5, to: 1, label: 'OBS Debt → Equation', description: 'Off-balance-sheet liabilities remove assets AND liabilities simultaneously, making the equation balance while understating true leverage. Enron\'s SPEs moved $30B this way.' },
  { from: 9, to: 8, label: 'Goodwill → Ratios', description: 'Goodwill inflates total assets while generating no revenue. This depresses asset turnover (DuPont) and return on assets, making acquisition-heavy companies look inefficient.' },
  { from: 4, to: 8, label: 'Capex → Asset Turnover', description: 'Aggressive capitalization inflates PP&E, reducing asset turnover ratios. Peers who expense more appear more efficient even with identical underlying businesses.' },
  { from: 10, to: 2, label: 'Pressure → Revenue', description: 'Fraud Triangle pressure (EPS targets, covenant proximity) is highest correlation with revenue manipulation timing. Ch10 diagnostic framework applied to Ch2 risk.' },
  { from: 7, to: 10, label: 'CFO → Fraud Signal', description: 'CFO/NI ratio < 0.7 for 3+ consecutive years is the primary Beneish input and the most accessible, reliable fraud indicator. Ch7 output feeds directly into Ch10 screening.' },
  { from: 8, to: 10, label: 'Ratios → Beneish', description: 'Beneish M-Score uses 8 financial ratios — all computed from the ratio analysis framework in Ch8. DuPont decomposition exposes Enron\'s leverage-driven ROE.' },
]

export default function ConsequenceMap() {
  const [selectedNode, setSelectedNode] = useState<number | null>(null)
  const [selectedConn, setSelectedConn] = useState<Connection | null>(null)

  const node = NODES.find(n => n.id === selectedNode)
  const relevantConns = selectedNode
    ? CONNECTIONS.filter(c => c.from === selectedNode || c.to === selectedNode)
    : CONNECTIONS

  const W = 770, H = 440

  return (
    <div style={{ maxWidth: '800px' }}>
      <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
        Click any chapter node to see how its accounting concepts connect to others. Each arrow shows a fraud technique and its downstream effect on other chapters.
      </p>

      {/* SVG map */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.75rem', overflow: 'hidden', marginBottom: '1.25rem' }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
          {/* Connections */}
          {CONNECTIONS.map((conn, i) => {
            const fromNode = NODES.find(n => n.id === conn.from)!
            const toNode = NODES.find(n => n.id === conn.to)!
            const isHighlighted = selectedNode ? (conn.from === selectedNode || conn.to === selectedNode) : true
            const isSelected = selectedConn === conn
            const opacity = isHighlighted ? 1 : 0.12
            const color = isSelected ? '#4A0A12' : fromNode.color

            const x1 = fromNode.x + 45, y1 = fromNode.y + 20
            const x2 = toNode.x + 45, y2 = toNode.y + 20
            const mx = (x1 + x2) / 2 - 20
            const my = (y1 + y2) / 2 - 15

            return (
              <g key={i} style={{ cursor: 'pointer', opacity }} onClick={() => setSelectedConn(isSelected ? null : conn)}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={isSelected ? 2 : 1} strokeDasharray={isSelected ? '0' : '4 3'} />
                <circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r={8} fill={color + '18'} stroke={color} strokeWidth="0.5" />
                <text x={mx} y={my} fill={color} fontSize="7" fontFamily="monospace" style={{ pointerEvents: 'none' }}>
                  {conn.label.split(' → ')[0]}
                </text>
              </g>
            )
          })}

          {/* Nodes */}
          {NODES.map(n => {
            const isSelected = selectedNode === n.id
            const isHighlighted = selectedNode ? (selectedNode === n.id || relevantConns.some(c => c.from === n.id || c.to === n.id)) : true
            const opacity = isHighlighted ? 1 : 0.3

            return (
              <g key={n.id} style={{ cursor: 'pointer', opacity }} onClick={() => { setSelectedNode(selectedNode === n.id ? null : n.id); setSelectedConn(null) }}>
                <rect x={n.x} y={n.y} width={90} height={38} rx={6}
                  fill={isSelected ? n.color : n.color + '18'}
                  stroke={n.color} strokeWidth={isSelected ? 2 : 1} />
                <text x={n.x + 45} y={n.y + 14} textAnchor="middle" fill={isSelected ? '#fff' : n.color} fontSize="10" fontWeight="bold" fontFamily="monospace">
                  {n.short}
                </text>
                <text x={n.x + 45} y={n.y + 28} textAnchor="middle" fill={isSelected ? '#fff' : n.color} fontSize="7.5" fontFamily="sans-serif" style={{ pointerEvents: 'none' }}>
                  {n.title.split(' ')[0]}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Selected node detail */}
      {node && (
        <div style={{ padding: '1rem 1.125rem', background: `${node.color}08`, border: `1px solid ${node.color}30`, borderRadius: '0.625rem', marginBottom: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: node.color, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            {node.short}: {node.title}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Fraud Technique</div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text)', lineHeight: 1.6 }}>{node.fraudTechnique}</p>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#1b4332', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Downstream Effect</div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text)', lineHeight: 1.6 }}>{node.downstreamEffect}</p>
            </div>
          </div>
        </div>
      )}

      {/* Selected connection detail */}
      {selectedConn && (
        <div style={{ padding: '0.875rem 1rem', background: 'var(--color-base)', border: '1px solid var(--color-border)', borderRadius: '0.5rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '0.375rem' }}>
            {selectedConn.label}
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text)', lineHeight: 1.65 }}>
            {selectedConn.description}
          </p>
        </div>
      )}

      {!selectedNode && !selectedConn && (
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          Click a node or connection arrow to explore the cross-chapter consequence chain.
        </p>
      )}
    </div>
  )
}
