import { useMemo } from 'react'
import { SAMPLE_COMPANIES } from '../../data/sampleCompanies'
import { computeComps } from '../../engines/MAEngine'
import type { MACompanyInput, CompsAnalysis } from '../../engines/MAEngine'
import StatementPanel from '../statements/StatementPanel'

interface Props {
  company: MACompanyInput
}

function fmt(n: number | null): string {
  if (n === null) return 'N/A'
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function ComparableCompanies({ company }: Props) {
  // Find the matching SampleCompany for the subject
  const subject = useMemo(() => {
    const sc = SAMPLE_COMPANIES.find((c) => c.name === company.name)
    if (!sc) return null
    return {
      name: sc.name,
      stockPrice: sc.stockPrice,
      sharesOutstanding: sc.sharesOutstanding,
      balances: sc.balances,
    }
  }, [company.name])

  const analysis: CompsAnalysis | null = useMemo(() => {
    if (!subject) return null
    const all = SAMPLE_COMPANIES.map((c) => ({
      name: c.name,
      stockPrice: c.stockPrice,
      sharesOutstanding: c.sharesOutstanding,
      balances: c.balances,
    }))
    return computeComps(subject, all)
  }, [subject])

  if (!analysis) {
    return (
      <StatementPanel title="Comparable Companies" subtitle={company.name}>
        <div className="text-sm py-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
          Unable to compute comparable company analysis.
        </div>
      </StatementPanel>
    )
  }

  return (
    <StatementPanel title="Comparable Companies" subtitle={company.name}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th className="text-left py-2 px-2" style={{ fontFamily: 'var(--font-body)' }}>Company</th>
              <th className="text-right py-2 px-2" style={{ fontFamily: 'var(--font-body)' }}>P/E</th>
              <th className="text-right py-2 px-2" style={{ fontFamily: 'var(--font-body)' }}>EV/EBITDA</th>
              <th className="text-right py-2 px-2" style={{ fontFamily: 'var(--font-body)' }}>EV/Revenue</th>
              <th className="text-right py-2 px-2" style={{ fontFamily: 'var(--font-body)' }}>P/Book</th>
            </tr>
          </thead>
          <tbody>
            {analysis.comps.map((c) => (
              <tr key={c.name} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-1.5 px-2 text-sm" style={{ fontFamily: 'var(--font-body)' }}>{c.name}</td>
                <td className="py-1.5 px-2 text-right" style={{ fontFamily: 'var(--font-mono)' }}>{fmt(c.pe)}</td>
                <td className="py-1.5 px-2 text-right" style={{ fontFamily: 'var(--font-mono)' }}>{fmt(c.evEbitda)}</td>
                <td className="py-1.5 px-2 text-right" style={{ fontFamily: 'var(--font-mono)' }}>{fmt(c.evRev)}</td>
                <td className="py-1.5 px-2 text-right" style={{ fontFamily: 'var(--font-mono)' }}>{fmt(c.pBook)}</td>
              </tr>
            ))}
            {/* Median row */}
            <tr
              style={{
                borderTop: '2px solid var(--color-gold)',
                background: 'var(--color-base)',
              }}
            >
              <td
                className="py-2 px-2 text-sm font-bold"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--color-gold)' }}
              >
                Median
              </td>
              <td className="py-2 px-2 text-right font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
                {fmt(analysis.medianPE)}
              </td>
              <td className="py-2 px-2 text-right font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
                {fmt(analysis.medianEVEbitda)}
              </td>
              <td className="py-2 px-2 text-right font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
                {fmt(analysis.medianEVRevenue)}
              </td>
              <td className="py-2 px-2 text-right font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
                {fmt(analysis.medianPBook)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </StatementPanel>
  )
}
