import { useState } from 'react'

function calcSL(cost: number, salvage: number, life: number) {
  const ann = (cost - salvage) / life; let bv = cost
  return Array.from({ length: life }, (_, i) => { bv -= ann; return { year: i + 1, dep: ann, bv: Math.max(salvage, bv) } })
}

function calcDDB(cost: number, salvage: number, life: number) {
  const rate = 2 / life; let bv = cost
  return Array.from({ length: life }, (_, i) => {
    const dep = Math.max(0, Math.min(bv * rate, bv - salvage)); bv -= dep
    return { year: i + 1, dep, bv }
  })
}

function calcSYD(cost: number, salvage: number, life: number) {
  const syd = life * (life + 1) / 2; let bv = cost
  return Array.from({ length: life }, (_, i) => {
    const dep = (cost - salvage) * (life - i) / syd; bv -= dep
    return { year: i + 1, dep, bv: Math.max(salvage, bv) }
  })
}

export default function DepreciationScheduleBuilder() {
  const [cost, setCost] = useState(240000)
  const [salvage, setSalvage] = useState(15000)
  const [life, setLife] = useState(10)

  const sl = calcSL(cost, salvage, life)
  const ddb = calcDDB(cost, salvage, life)
  const syd = calcSYD(cost, salvage, life)

  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Asset Cost', val: cost, set: setCost, min: 10000, max: 5000000, step: 10000, fmt: (v: number) => `$${v.toLocaleString()}` },
          { label: 'Salvage Value', val: salvage, set: setSalvage, min: 0, max: Math.floor(cost * 0.5), step: 1000, fmt: (v: number) => `$${v.toLocaleString()}` },
          { label: 'Useful Life (years)', val: life, set: setLife, min: 2, max: 30, step: 1, fmt: (v: number) => `${v} yrs` },
        ].map(({ label, val, set, min, max, step, fmt: f }) => (
          <div key={label} style={{ padding: '0.875rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-accent)' }}>{f(val)}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-accent)' }} />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem' }}>
        {[['Straight-Line', '#1e3a5f'], ['Double-Declining Balance', '#7c2d12'], ['Sum-of-Years Digits', '#1b4332']].map(([label, color]) => (
          <span key={label} style={{ fontSize: '0.75rem', color, fontFamily: 'var(--font-mono)' }}>■ {label}</span>
        ))}
      </div>

      <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface)', borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 600 }}>Year</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#1e3a5f', fontWeight: 600 }}>SL Depr.</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#1e3a5f', fontWeight: 600 }}>SL BV</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#7c2d12', fontWeight: 600 }}>DDB Depr.</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#7c2d12', fontWeight: 600 }}>DDB BV</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#1b4332', fontWeight: 600 }}>SYD Depr.</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#1b4332', fontWeight: 600 }}>SYD BV</th>
            </tr>
          </thead>
          <tbody>
            {sl.map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'transparent' : 'var(--color-surface)' }}>
                <td style={{ padding: '0.4rem 0.75rem', color: 'var(--color-text-muted)' }}>Yr {i + 1}</td>
                <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', color: '#1e3a5f' }}>{fmt(sl[i].dep)}</td>
                <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', color: '#1e3a5f' }}>{fmt(sl[i].bv)}</td>
                <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', color: '#7c2d12' }}>{fmt(ddb[i].dep)}</td>
                <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', color: '#7c2d12' }}>{fmt(ddb[i].bv)}</td>
                <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', color: '#1b4332' }}>{fmt(syd[i].dep)}</td>
                <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', color: '#1b4332' }}>{fmt(syd[i].bv)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '0.75rem 1rem', background: 'var(--color-base)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        <strong style={{ color: 'var(--color-text)' }}>Forensic note: </strong>
        DDB charges {fmt(ddb[0].dep)} in Year 1 vs {fmt(sl[0].dep)} under SL — a {((ddb[0].dep / sl[0].dep - 1) * 100).toFixed(0)}% higher charge. Companies that extend useful lives or switch from accelerated to SL boost near-term earnings without any operational change.
      </div>
    </div>
  )
}
