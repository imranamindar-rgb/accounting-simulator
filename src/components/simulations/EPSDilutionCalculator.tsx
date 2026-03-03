import { useState } from 'react'

export default function EPSDilutionCalculator() {
  const [netIncome, setNetIncome] = useState(500)
  const [basicShares, setBasicShares] = useState(200)
  const [options, setOptions] = useState(10)
  const [strikePrice, setStrikePrice] = useState(20)
  const [marketPrice, setMarketPrice] = useState(30)
  const [rsus, setRsus] = useState(3)
  const [convertFace, setConvertFace] = useState(0)
  const [convertCoupon] = useState(0.04)
  const [taxRate] = useState(0.25)

  const basicEPS = netIncome / basicShares
  const optionDilutiveShares = marketPrice > strikePrice
    ? options - Math.floor((options * strikePrice) / marketPrice)
    : 0
  const rsuDilutiveShares = rsus
  const convertInterestAddback = convertFace > 0 ? convertFace * convertCoupon * (1 - taxRate) : 0
  const convertShares = convertFace > 0 ? Math.floor(convertFace / 1) * 50 / 1000 : 0

  const dilutedIncome = netIncome + convertInterestAddback
  const dilutedShares = basicShares + optionDilutiveShares + rsuDilutiveShares + convertShares
  const dilutedEPS = dilutedShares > 0 ? dilutedIncome / dilutedShares : 0
  const dilutionPct = basicEPS > 0 ? ((basicEPS - dilutedEPS) / basicEPS * 100) : 0

  const fmt2 = (n: number) => n.toFixed(2)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Net Income ($M)', val: netIncome, set: setNetIncome, min: 10, max: 5000, step: 10 },
          { label: 'Basic Shares Outstanding (M)', val: basicShares, set: setBasicShares, min: 10, max: 2000, step: 10 },
        ].map(({ label, val, set, min, max, step }) => (
          <div key={label} style={{ padding: '0.875rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-accent)' }}>{val}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-accent)' }} />
          </div>
        ))}
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Dilutive Instruments</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Options Outstanding (M)', val: options, set: setOptions, min: 0, max: 50, step: 1 },
          { label: 'Option Strike Price ($)', val: strikePrice, set: setStrikePrice, min: 5, max: 100, step: 1 },
          { label: 'Current Market Price ($)', val: marketPrice, set: setMarketPrice, min: 5, max: 200, step: 1 },
          { label: 'RSUs Unvested (M)', val: rsus, set: setRsus, min: 0, max: 30, step: 1 },
          { label: 'Convertible Bonds ($M, 0 = none)', val: convertFace, set: setConvertFace, min: 0, max: 2000, step: 100 },
        ].map(({ label, val, set, min, max, step }) => (
          <div key={label} style={{ padding: '0.875rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: '#6366f1' }}>{val}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(Number(e.target.value))} style={{ width: '100%', accentColor: '#6366f1' }} />
          </div>
        ))}
      </div>

      <div style={{ padding: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.625rem', marginBottom: '1rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Basic → Diluted EPS Bridge</div>
        {[
          { label: 'Basic EPS', eps: basicEPS, note: `${basicShares}M shares`, color: '#1e3a5f' },
          { label: `Options (TSM: +${optionDilutiveShares.toFixed(1)}M shares)`, eps: null, note: marketPrice <= strikePrice ? 'anti-dilutive (out of the money)' : `net new shares`, color: marketPrice > strikePrice ? '#dc2626' : '#1b4332' },
          { label: `RSUs (+${rsuDilutiveShares}M shares)`, eps: null, note: 'always dilutive', color: '#dc2626' },
          { label: convertFace > 0 ? `Converts (+${convertShares.toFixed(1)}M shares, +$${convertInterestAddback.toFixed(1)}M NI)` : 'Converts (none)', eps: null, note: '', color: convertFace > 0 ? '#dc2626' : '#1b4332' },
          { label: 'Diluted EPS', eps: dilutedEPS, note: `${dilutedShares.toFixed(1)}M shares`, color: 'var(--color-accent)' },
        ].map(({ label, eps, note, color }, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderTop: i > 0 && eps !== null ? '2px solid var(--color-border)' : i > 0 ? '1px solid var(--color-border)' : 'none' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color }}>{label}</div>
              {note && <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{note}</div>}
            </div>
            {eps !== null && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 700, color }}>${fmt2(eps)}</span>}
          </div>
        ))}
      </div>

      <div style={{ padding: '0.75rem 1rem', background: dilutionPct > 5 ? '#dc262612' : '#1b433212', border: `1px solid ${dilutionPct > 5 ? '#dc262630' : '#1b433230'}`, borderRadius: '0.5rem', fontSize: '0.8rem' }}>
        <span style={{ fontWeight: 700, color: dilutionPct > 5 ? '#dc2626' : '#1b4332' }}>
          {dilutionPct.toFixed(1)}% dilution
        </span>
        <span style={{ color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
          Basic ${fmt2(basicEPS)} → Diluted ${fmt2(dilutedEPS)}. {dilutionPct > 10 ? 'Material dilution — the gap between basic and diluted EPS is significant.' : 'Dilution is modest.'}
        </span>
      </div>
    </div>
  )
}
