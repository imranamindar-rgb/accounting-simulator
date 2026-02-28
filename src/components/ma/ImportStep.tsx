import { useMemo } from 'react'
import { useMAStore } from '../../store/maStore'
import { useLedgerStore } from '../../store/ledgerStore'
import { SAMPLE_COMPANIES } from '../../data/sampleCompanies'
import { CHART_OF_ACCOUNTS } from '../../data/chartOfAccounts'
import { buildMACompanyInput } from '../../engines/MAEngine'
import type { MACompanyInput } from '../../engines/MAEngine'
import StatementPanel from '../statements/StatementPanel'

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtPct(n: number | null): string {
  if (n === null) return 'N/A'
  return (n * 100).toFixed(1) + '%'
}

function CompanySummary({ company }: { company: MACompanyInput }) {
  const eps = company.sharesOut > 0 ? company.netIncome / company.sharesOut : 0
  const pe = eps > 0 ? company.sharePrice / eps : null
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
      <div style={{ color: 'var(--color-text-muted)' }}>Stock Price</div>
      <div style={{ fontFamily: 'var(--font-mono)' }}>${fmt(company.sharePrice)}</div>
      <div style={{ color: 'var(--color-text-muted)' }}>Shares Outstanding</div>
      <div style={{ fontFamily: 'var(--font-mono)' }}>{fmt(company.sharesOut)}</div>
      <div style={{ color: 'var(--color-text-muted)' }}>Market Cap</div>
      <div style={{ fontFamily: 'var(--font-mono)' }}>${fmt(company.sharePrice * company.sharesOut)}</div>
      <div style={{ color: 'var(--color-text-muted)' }}>Revenue</div>
      <div style={{ fontFamily: 'var(--font-mono)' }}>${fmt(company.revenue)}</div>
      <div style={{ color: 'var(--color-text-muted)' }}>Net Income</div>
      <div style={{ fontFamily: 'var(--font-mono)' }}>${fmt(company.netIncome)}</div>
      <div style={{ color: 'var(--color-text-muted)' }}>EPS</div>
      <div style={{ fontFamily: 'var(--font-mono)' }}>${fmt(eps)}</div>
      <div style={{ color: 'var(--color-text-muted)' }}>P/E Ratio</div>
      <div style={{ fontFamily: 'var(--font-mono)' }}>{pe !== null ? fmt(pe) : 'N/A'}</div>
      <div style={{ color: 'var(--color-text-muted)' }}>Total Assets</div>
      <div style={{ fontFamily: 'var(--font-mono)' }}>${fmt(company.totalAssets)}</div>
      <div style={{ color: 'var(--color-text-muted)' }}>Gross Margin</div>
      <div style={{ fontFamily: 'var(--font-mono)' }}>
        {fmtPct(company.revenue > 0 ? company.grossProfit / company.revenue : null)}
      </div>
    </div>
  )
}

export default function ImportStep() {
  const target = useMAStore((s) => s.targetCompany)
  const acquirer = useMAStore((s) => s.acquirerCompany)
  const setTarget = useMAStore((s) => s.setTargetCompany)
  const setAcquirer = useMAStore((s) => s.setAcquirerCompany)
  const selectedCompany = useLedgerStore((s) => s.selectedCompany)

  // Build MACompanyInput for all sample companies
  const companyMap = useMemo(() => {
    const map = new Map<string, MACompanyInput>()
    for (const sc of SAMPLE_COMPANIES) {
      map.set(sc.name, buildMACompanyInput(sc, CHART_OF_ACCOUNTS))
    }
    return map
  }, [])

  // Default acquirer to ledger's currently loaded company
  const defaultAcquirerName = selectedCompany?.name ?? null

  const handleTargetChange = (name: string) => {
    if (!name) {
      setTarget(null)
      return
    }
    setTarget(companyMap.get(name) ?? null)
  }

  const handleAcquirerChange = (name: string) => {
    if (!name) {
      setAcquirer(null)
      return
    }
    setAcquirer(companyMap.get(name) ?? null)
  }

  // On first render, if acquirer not set but we have a default, set it
  useMemo(() => {
    if (!acquirer && defaultAcquirerName) {
      const defaultInput = companyMap.get(defaultAcquirerName)
      if (defaultInput) setAcquirer(defaultInput)
    }
  }, [defaultAcquirerName]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Target selector */}
      <StatementPanel title="Target Company" subtitle="The company to be acquired">
        <div className="flex flex-col gap-4">
          <select
            value={target?.name ?? ''}
            onChange={(e) => handleTargetChange(e.target.value)}
            className="w-full px-3 py-2 rounded text-sm"
            style={{
              border: '1px solid var(--color-border)',
              background: 'var(--color-base)',
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text)',
            }}
          >
            <option value="">Select target company...</option>
            {SAMPLE_COMPANIES.map((sc) => (
              <option key={sc.name} value={sc.name} disabled={sc.name === acquirer?.name}>
                {sc.name} ({sc.industry})
              </option>
            ))}
          </select>
          {target && <CompanySummary company={target} />}
        </div>
      </StatementPanel>

      {/* Acquirer selector */}
      <StatementPanel title="Acquirer Company" subtitle="The company making the acquisition">
        <div className="flex flex-col gap-4">
          <select
            value={acquirer?.name ?? ''}
            onChange={(e) => handleAcquirerChange(e.target.value)}
            className="w-full px-3 py-2 rounded text-sm"
            style={{
              border: '1px solid var(--color-border)',
              background: 'var(--color-base)',
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text)',
            }}
          >
            <option value="">Select acquirer company...</option>
            {SAMPLE_COMPANIES.map((sc) => (
              <option key={sc.name} value={sc.name} disabled={sc.name === target?.name}>
                {sc.name} ({sc.industry})
              </option>
            ))}
          </select>
          {acquirer && <CompanySummary company={acquirer} />}
        </div>
      </StatementPanel>
    </div>
  )
}
