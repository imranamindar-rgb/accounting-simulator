import { useState } from 'react'

interface Lot { qty: number; price: number }

const DEFAULT_LOTS: Lot[] = [
  { qty: 100, price: 10 },
  { qty: 150, price: 12 },
  { qty: 80, price: 15 },
  { qty: 0, price: 0 },
  { qty: 0, price: 0 },
]

function calcFIFO(lots: Lot[], sold: number) {
  let remaining = sold; let cogs = 0
  const end = lots.map(l => ({ ...l }))
  for (let i = 0; i < end.length && remaining > 0; i++) {
    const take = Math.min(remaining, end[i].qty)
    cogs += take * end[i].price; end[i].qty -= take; remaining -= take
  }
  return { cogs, ending: end.reduce((s, l) => s + l.qty * l.price, 0) }
}

function calcLIFO(lots: Lot[], sold: number) {
  let remaining = sold; let cogs = 0
  const end = lots.map(l => ({ ...l }))
  for (let i = end.length - 1; i >= 0 && remaining > 0; i--) {
    const take = Math.min(remaining, end[i].qty)
    cogs += take * end[i].price; end[i].qty -= take; remaining -= take
  }
  return { cogs, ending: end.reduce((s, l) => s + l.qty * l.price, 0) }
}

function calcWAC(lots: Lot[], sold: number) {
  const totalUnits = lots.reduce((s, l) => s + l.qty, 0)
  const totalCost = lots.reduce((s, l) => s + l.qty * l.price, 0)
  const wac = totalUnits > 0 ? totalCost / totalUnits : 0
  return { cogs: sold * wac, ending: (totalUnits - sold) * wac }
}

export default function InventoryCostComparator() {
  const [lots, setLots] = useState<Lot[]>(DEFAULT_LOTS)
  const [sold, setSold] = useState(200)
  const [sellingPrice, setSellingPrice] = useState(20)

  const activeLots = lots.filter(l => l.qty > 0 && l.price > 0)
  const totalUnits = activeLots.reduce((s, l) => s + l.qty, 0)
  const maxSold = Math.min(sold, totalUnits)

  const fifo = calcFIFO(activeLots, maxSold)
  const lifo = calcLIFO(activeLots, maxSold)
  const wac = calcWAC(activeLots, maxSold)

  const revenue = maxSold * sellingPrice
  const fmt = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  const updateLot = (i: number, field: keyof Lot, val: number) => {
    setLots(ls => ls.map((l, j) => j === i ? { ...l, [field]: val } : l))
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Purchase Lots (qty + unit cost)</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {lots.map((l, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', padding: '0.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>L{i + 1}</span>
              <input type="number" value={l.qty || ''} placeholder="qty" onChange={e => updateLot(i, 'qty', Number(e.target.value))}
                style={{ width: '60px', padding: '0.25rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', background: 'var(--color-base)', color: 'var(--color-text)' }} />
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>@</span>
              <input type="number" value={l.price || ''} placeholder="$" onChange={e => updateLot(i, 'price', Number(e.target.value))}
                style={{ width: '55px', padding: '0.25rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', background: 'var(--color-base)', color: 'var(--color-text)' }} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: `Units Sold (max ${totalUnits})`, val: sold, set: setSold, min: 0, max: totalUnits || 999 },
          { label: 'Selling Price / unit ($)', val: sellingPrice, set: setSellingPrice, min: 1, max: 500 },
        ].map(({ label, val, set, min, max }) => (
          <div key={label} style={{ padding: '0.875rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>{label}</div>
            <input type="range" min={min} max={max} value={val} onChange={e => set(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-accent)', marginBottom: '0.25rem' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-accent)' }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        {[
          { label: 'FIFO', sub: 'First In, First Out', data: fifo, color: '#1e3a5f' },
          { label: 'LIFO', sub: 'Last In, First Out', data: lifo, color: '#7c2d12' },
          { label: 'WAC', sub: 'Weighted Average Cost', data: wac, color: '#1b4332' },
        ].map(({ label, sub, data, color }) => {
          const gp = revenue - data.cogs
          return (
            <div key={label} style={{ padding: '1rem', background: 'var(--color-surface)', border: `1px solid ${color}30`, borderRadius: '0.625rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color, textTransform: 'uppercase', marginBottom: '0.125rem' }}>{label}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>{sub}</div>
              {[
                { label: 'Revenue', val: revenue, bold: false },
                { label: 'COGS', val: data.cogs, bold: false },
                { label: 'Gross Profit', val: gp, bold: true },
                { label: 'Ending Inventory', val: data.ending, bold: false },
              ].map(({ label: l, val, bold }) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem', borderTop: bold ? `1px solid ${color}20` : 'none', paddingTop: bold ? '0.3rem' : 0 }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{l}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: bold ? 700 : 400, color: bold ? color : 'var(--color-text)' }}>{fmt(val)}</span>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--color-base)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        <strong style={{ color: 'var(--color-text)' }}>Forensic note: </strong>
        {fifo.cogs > lifo.cogs
          ? `In rising price environments, LIFO produces higher COGS (${fmt(lifo.cogs)}) vs FIFO (${fmt(fifo.cogs)}), conserving cash via lower taxes but reporting lower profits. LIFO is banned under IFRS.`
          : `Cost flow assumptions produce identical inventory values when prices are flat.`}
      </div>
    </div>
  )
}
