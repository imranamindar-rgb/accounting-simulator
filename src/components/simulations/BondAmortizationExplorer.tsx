import { useState, useMemo } from 'react'

/* ------------------------------------------------------------------ */
/*  Calculation helpers                                                */
/* ------------------------------------------------------------------ */

interface AmortRow {
  year: number
  beginBV: number       // carrying value at start of period
  interestExp: number   // effective rate × begin BV
  couponPmt: number     // coupon rate × face value (cash)
  amortization: number  // |interestExp - couponPmt|
  endBV: number         // carrying value at end of period
}

function computeBondPrice(face: number, couponRate: number, marketRate: number, periods: number): number {
  const c = face * couponRate
  if (marketRate === 0) return c * periods + face
  const pvCoupons = c * ((1 - Math.pow(1 + marketRate, -periods)) / marketRate)
  const pvFace = face / Math.pow(1 + marketRate, periods)
  return pvCoupons + pvFace
}

function buildAmortSchedule(
  face: number,
  couponRate: number,
  marketRate: number,
  periods: number,
): AmortRow[] {
  const price = computeBondPrice(face, couponRate, marketRate, periods)
  const rows: AmortRow[] = []
  let bv = price

  for (let yr = 1; yr <= periods; yr++) {
    const intExp = bv * marketRate
    const coupon = face * couponRate
    const amort = Math.abs(intExp - coupon)
    // Discount: BV increases (intExp > coupon); Premium: BV decreases (intExp < coupon)
    const endBV = yr < periods
      ? (couponRate < marketRate ? bv + amort : bv - amort)
      : face // Force convergence at maturity
    rows.push({ year: yr, beginBV: bv, interestExp: intExp, couponPmt: coupon, amortization: amort, endBV })
    bv = endBV
  }
  return rows
}

/* ------------------------------------------------------------------ */
/*  Price-vs-Rate SVG chart                                            */
/* ------------------------------------------------------------------ */

function PriceRateChart({ face, couponRate, periods, currentRate }: {
  face: number; couponRate: number; periods: number; currentRate: number
}) {
  const chartW = 500
  const chartH = 180
  const padL = 60
  const padR = 16
  const padT = 16
  const padB = 32
  const innerW = chartW - padL - padR
  const innerH = chartH - padT - padB

  // Generate price points for rates from 0.5% to 15%
  const points = useMemo(() => {
    const pts: { rate: number; price: number }[] = []
    for (let r = 0.5; r <= 15; r += 0.5) {
      pts.push({ rate: r, price: computeBondPrice(face, couponRate, r / 100, periods) })
    }
    return pts
  }, [face, couponRate, periods])

  const minPrice = Math.min(...points.map(p => p.price)) * 0.95
  const maxPrice = Math.max(...points.map(p => p.price)) * 1.02
  const minRate = 0.5
  const maxRate = 15

  const xOf = (rate: number) => padL + ((rate - minRate) / (maxRate - minRate)) * innerW
  const yOf = (price: number) => padT + innerH - ((price - minPrice) / (maxPrice - minPrice)) * innerH

  const pathD = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'}${xOf(p.rate).toFixed(1)},${yOf(p.price).toFixed(1)}`
  ).join(' ')

  const currentPrice = computeBondPrice(face, couponRate, currentRate / 100, periods)
  const parPrice = face

  const fmt = (v: number) => v >= 10000 ? `$${(v / 1000).toFixed(0)}K` : `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`

  // Y-axis ticks
  const yRange = maxPrice - minPrice
  const yStep = yRange > 5000 ? 2000 : yRange > 2000 ? 1000 : yRange > 500 ? 200 : 100
  const yTicks: number[] = []
  for (let v = Math.ceil(minPrice / yStep) * yStep; v <= maxPrice; v += yStep) yTicks.push(v)

  return (
    <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
        Bond Price vs. Market Interest Rate
      </div>
      <div style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" style={{ display: 'block', maxWidth: `${chartW}px` }}>
          {/* Grid + Y-axis */}
          {yTicks.map(v => (
            <g key={v}>
              <line x1={padL} y1={yOf(v)} x2={padL + innerW} y2={yOf(v)} stroke="var(--color-border)" strokeWidth="0.5" />
              <text x={padL - 4} y={yOf(v) + 3} textAnchor="end" fontSize="8" fill="var(--color-text-muted)" fontFamily="monospace">{fmt(v)}</text>
            </g>
          ))}

          {/* Par value line */}
          {parPrice >= minPrice && parPrice <= maxPrice && (
            <>
              <line x1={padL} y1={yOf(parPrice)} x2={padL + innerW} y2={yOf(parPrice)} stroke="#d97706" strokeWidth="1" strokeDasharray="4 3" />
              <text x={padL + innerW + 2} y={yOf(parPrice) + 3} fontSize="8" fill="#d97706" fontFamily="monospace">Par</text>
            </>
          )}

          {/* X-axis ticks */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14].filter(r => r <= maxRate).map(r => (
            <g key={r}>
              <line x1={xOf(r)} y1={padT + innerH} x2={xOf(r)} y2={padT + innerH + 4} stroke="var(--color-border)" strokeWidth="1" />
              <text x={xOf(r)} y={padT + innerH + 14} textAnchor="middle" fontSize="8" fill="var(--color-text-muted)" fontFamily="monospace">{r}%</text>
            </g>
          ))}

          {/* Axes */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="var(--color-border)" strokeWidth="1.5" />
          <line x1={padL} y1={padT + innerH} x2={padL + innerW} y2={padT + innerH} stroke="var(--color-border)" strokeWidth="1.5" />

          {/* Price curve */}
          <path d={pathD} fill="none" stroke="#00695C" strokeWidth="2.5" strokeLinejoin="round" />

          {/* Current rate marker */}
          {currentRate >= minRate && currentRate <= maxRate && (
            <>
              <line x1={xOf(currentRate)} y1={padT} x2={xOf(currentRate)} y2={padT + innerH} stroke="#dc2626" strokeWidth="1" strokeDasharray="3 2" />
              <circle cx={xOf(currentRate)} cy={yOf(currentPrice)} r="5" fill="#dc2626" stroke="white" strokeWidth="1.5" />
              <text x={xOf(currentRate)} y={padT - 4} textAnchor="middle" fontSize="8" fill="#dc2626" fontFamily="monospace" fontWeight="700">
                {currentRate}% → {fmt(currentPrice)}
              </text>
            </>
          )}

          {/* X-axis label */}
          <text x={padL + innerW / 2} y={chartH - 2} textAnchor="middle" fontSize="8" fill="var(--color-text-muted)" fontFamily="monospace">Market Interest Rate</text>
        </svg>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function BondAmortizationExplorer() {
  const [face, setFace] = useState(10000)
  const [couponPct, setCouponPct] = useState(6)
  const [marketPct, setMarketPct] = useState(8)
  const [periods, setPeriods] = useState(3)
  const [isZeroCoupon, setIsZeroCoupon] = useState(false)

  const couponRate = isZeroCoupon ? 0 : couponPct / 100
  const marketRate = marketPct / 100
  const bondPrice = computeBondPrice(face, couponRate, marketRate, periods)
  const schedule = buildAmortSchedule(face, couponRate, marketRate, periods)

  const premiumDiscount = bondPrice - face
  const bondType = Math.abs(premiumDiscount) < 0.005 * face
    ? 'par'
    : premiumDiscount > 0
      ? 'premium'
      : 'discount'

  const totalInterest = schedule.reduce((s, r) => s + r.interestExp, 0)
  const totalCash = schedule.reduce((s, r) => s + r.couponPmt, 0) + face

  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`
  const fmt2 = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Coupon Bond', active: !isZeroCoupon, onClick: () => setIsZeroCoupon(false) },
          { label: 'Zero-Coupon Bond', active: isZeroCoupon, onClick: () => setIsZeroCoupon(true) },
        ].map(({ label, active, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--color-border)',
              background: active ? '#00695C' : 'var(--color-surface)',
              color: active ? 'white' : 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Input sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Face (Par) Value', val: face, set: setFace, min: 1000, max: 100000, step: 1000, color: 'var(--color-accent)', fmt: (v: number) => `$${v.toLocaleString()}` },
          ...(!isZeroCoupon ? [{
            label: 'Coupon Rate (%)', val: couponPct, set: setCouponPct, min: 0.5, max: 12, step: 0.5, color: '#1e3a5f', fmt: (v: number) => `${v.toFixed(1)}%`
          }] : []),
          { label: 'Market Rate at Issuance (%)', val: marketPct, set: setMarketPct, min: 0.5, max: 14, step: 0.5, color: '#dc2626', fmt: (v: number) => `${v.toFixed(1)}%` },
          { label: 'Years to Maturity', val: periods, set: setPeriods, min: 1, max: 10, step: 1, color: '#166534', fmt: (v: number) => `${v} yrs` },
        ].map(({ label, val, set, min, max, step, color, fmt: f }) => (
          <div key={label} style={{ padding: '0.875rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color }}>{f(val)}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(Number(e.target.value))} style={{ width: '100%', accentColor: color }} />
          </div>
        ))}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{
          padding: '1rem',
          background: bondType === 'par' ? '#fef3c7' : bondType === 'premium' ? '#dbeafe' : '#fee2e2',
          border: `2px solid ${bondType === 'par' ? '#d97706' : bondType === 'premium' ? '#2563eb' : '#dc2626'}`,
          borderRadius: '0.625rem',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Bond Issue Price
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: bondType === 'par' ? '#d97706' : bondType === 'premium' ? '#2563eb' : '#dc2626' }}>
            {fmt2(bondPrice)}
          </div>
          <div style={{
            marginTop: '0.375rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            display: 'inline-block',
            background: bondType === 'par' ? '#d9770618' : bondType === 'premium' ? '#2563eb18' : '#dc262618',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: bondType === 'par' ? '#d97706' : bondType === 'premium' ? '#2563eb' : '#dc2626',
          }}>
            {bondType === 'par'
              ? 'AT PAR'
              : bondType === 'premium'
                ? `PREMIUM (+${fmt2(premiumDiscount)})`
                : `DISCOUNT (${fmt2(premiumDiscount)})`}
          </div>
        </div>

        <div style={{ padding: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Total Interest Expense
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)' }}>
            {fmt2(totalInterest)}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Cash paid: {fmt2(totalCash)} − Received: {fmt2(bondPrice)}
          </div>
        </div>

        <div style={{ padding: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            {isZeroCoupon ? 'Face Value Due at Maturity' : 'Annual Coupon Payment'}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: '#1e3a5f' }}>
            {isZeroCoupon ? fmt(face) : fmt2(face * couponRate)}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            {isZeroCoupon ? 'No periodic payments' : `${couponPct}% × ${fmt(face)} per year`}
          </div>
        </div>
      </div>

      {/* Price-vs-Rate chart */}
      <PriceRateChart face={face} couponRate={couponRate} periods={periods} currentRate={marketPct} />

      {/* BSE at issuance */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Balance Sheet Equation — At Issuance
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr auto 1fr',
          gap: '0.5rem',
          alignItems: 'center',
          padding: '0.875rem',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '0.625rem',
        }}>
          {/* Assets */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Assets</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color: '#166534' }}>Cash +{fmt2(bondPrice)}</div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>=</div>
          {/* Liabilities */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Liabilities</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color: '#1e3a5f' }}>
              Bonds Pay. +{fmt(face)}
            </div>
            {bondType !== 'par' && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: bondType === 'discount' ? '#dc2626' : '#2563eb', marginTop: '2px' }}>
                {bondType === 'discount'
                  ? `Discount +${fmt2(face - bondPrice)}`
                  : `Premium +${fmt2(bondPrice - face)}`}
              </div>
            )}
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Net: {fmt2(bondPrice)}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>+</div>
          {/* SE */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Stockholders' Equity</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>No change</div>
          </div>
        </div>
      </div>

      {/* Amortization schedule */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Effective Interest Method — Amortization Schedule
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface)', borderBottom: '2px solid var(--color-border)' }}>
                <th style={{ padding: '0.5rem 0.6rem', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 600 }}>Year</th>
                <th style={{ padding: '0.5rem 0.6rem', textAlign: 'right', color: '#1e3a5f', fontWeight: 600 }}>Begin CV</th>
                <th style={{ padding: '0.5rem 0.6rem', textAlign: 'right', color: '#dc2626', fontWeight: 600 }}>Interest Exp.</th>
                <th style={{ padding: '0.5rem 0.6rem', textAlign: 'right', color: '#166534', fontWeight: 600 }}>Cash Coupon</th>
                <th style={{ padding: '0.5rem 0.6rem', textAlign: 'right', color: '#7c2d12', fontWeight: 600 }}>
                  {bondType === 'discount' ? 'Disc. Amort.' : bondType === 'premium' ? 'Prem. Amort.' : 'Amort.'}
                </th>
                <th style={{ padding: '0.5rem 0.6rem', textAlign: 'right', color: '#1e3a5f', fontWeight: 600 }}>End CV</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'transparent' : 'var(--color-surface)' }}>
                  <td style={{ padding: '0.4rem 0.6rem', color: 'var(--color-text-muted)' }}>Yr {row.year}</td>
                  <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right', color: '#1e3a5f' }}>{fmt2(row.beginBV)}</td>
                  <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right', color: '#dc2626', fontWeight: 600 }}>{fmt2(row.interestExp)}</td>
                  <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right', color: '#166534' }}>{fmt2(row.couponPmt)}</td>
                  <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right', color: '#7c2d12' }}>{fmt2(row.amortization)}</td>
                  <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right', color: '#1e3a5f', fontWeight: 600 }}>{fmt2(row.endBV)}</td>
                </tr>
              ))}
              {/* Maturity row */}
              <tr style={{ borderTop: '2px solid var(--color-border)', background: '#f8f4ef' }}>
                <td style={{ padding: '0.4rem 0.6rem', fontWeight: 700 }}>Maturity</td>
                <td colSpan={2} style={{ padding: '0.4rem 0.6rem', textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>
                  Cash −{fmt(face)}
                </td>
                <td colSpan={3} style={{ padding: '0.4rem 0.6rem', textAlign: 'right', color: '#1e3a5f', fontWeight: 700 }}>
                  Bonds Pay. −{fmt(face)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Key relationships */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem 1rem', background: 'var(--color-base)', border: '1px solid var(--color-border)', borderRadius: '0.5rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Interest Expense Formula
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--color-text)' }}>
            <strong>Interest Exp.</strong> = Carrying Value × <span style={{ color: '#dc2626', fontWeight: 600 }}>Market Rate ({marketPct}%)</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Changes each period as CV {bondType === 'discount' ? 'increases' : bondType === 'premium' ? 'decreases' : 'stays constant'}
          </div>
        </div>
        <div style={{ padding: '0.75rem 1rem', background: 'var(--color-base)', border: '1px solid var(--color-border)', borderRadius: '0.5rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Cash Coupon Formula
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--color-text)' }}>
            <strong>Cash Paid</strong> = Face Value × <span style={{ color: '#166534', fontWeight: 600 }}>Coupon Rate ({isZeroCoupon ? '0' : couponPct}%)</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Fixed every period: {fmt2(face * couponRate)}/year
          </div>
        </div>
      </div>

      {/* Forensic note */}
      <div style={{ padding: '0.75rem 1rem', background: 'var(--color-base)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        <strong style={{ color: 'var(--color-text)' }}>
          {isZeroCoupon ? 'Key insight: ' : 'Forensic note: '}
        </strong>
        {isZeroCoupon
          ? `This zero-coupon bond produces ${fmt2(totalInterest)} in total interest expense over ${periods} years — all non-cash until the ${fmt(face)} maturity payment. The increasing annual expense (${schedule.length > 1 ? `${fmt2(schedule[0].interestExp)} → ${fmt2(schedule[schedule.length - 1].interestExp)}` : fmt2(schedule[0]?.interestExp ?? 0)}) reflects compound interest accrual. On the cash flow statement, the amortization of discount is added back to net income in the operating section.`
          : `Total interest cost = ${fmt2(totalCash)} total cash paid − ${fmt2(bondPrice)} cash received = ${fmt2(totalCash - bondPrice)}. This equals total interest expense of ${fmt2(totalInterest)}. ${bondType === 'discount' ? 'Interest expense INCREASES each period because the carrying value grows toward par.' : bondType === 'premium' ? 'Interest expense DECREASES each period because the carrying value shrinks toward par.' : 'Interest expense equals the coupon payment each period because there is no premium or discount to amortize.'}`
        }
      </div>
    </div>
  )
}
