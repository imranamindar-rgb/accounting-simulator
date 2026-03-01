import { useCallback, useMemo } from 'react'
import { useUIStore } from '../../store/uiStore'
import { useLedgerStore } from '../../store/ledgerStore'
import { computeReviewPack } from '../../engines/reviewPack'
import { formatCurrency } from '../shared/FormatCurrency'

export default function ReviewPackModal() {
  const open = useUIStore((s) => s.reviewPackOpen)
  const periodIndex = useUIStore((s) => s.reviewPackPeriodIndex)
  const openReviewPack = useUIStore((s) => s.openReviewPack)
  const closeReviewPack = useUIStore((s) => s.closeReviewPack)

  const selectedCompany = useLedgerStore((s) => s.selectedCompany)
  const scale = selectedCompany?.scale ?? 'ones'
  const currentPeriod = useLedgerStore((s) => s.currentPeriod)
  const beginningBalances = useLedgerStore((s) => s.beginningBalances)
  const periods = useLedgerStore((s) => s.periods)
  const ledger = useLedgerStore((s) => s.ledger)
  const ledgerVersion = useLedgerStore((s) => s.ledgerVersion)
  const getStatements = useLedgerStore((s) => s.getStatements)

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) closeReviewPack()
    },
    [closeReviewPack],
  )

  const review = useMemo(() => {
    if (!open) return null

    if (periodIndex === null) {
      const endingSnapshot = ledger.takeSnapshot()
      const statements = getStatements()
      return computeReviewPack({
        label: `Period ${currentPeriod} (To Date)`,
        beginningSnapshot: beginningBalances,
        endingSnapshot,
        balanceSheet: statements.balanceSheet,
        incomeStatement: statements.incomeStatement,
      })
    }

    const p = periods[periodIndex]
    if (!p) return null
    return computeReviewPack({
      label: p.label,
      beginningSnapshot: p.beginningSnapshot,
      endingSnapshot: p.endingSnapshot,
      balanceSheet: p.statements.balanceSheet,
      incomeStatement: p.statements.incomeStatement,
    })
  }, [open, periodIndex, periods, beginningBalances, ledger, ledgerVersion, currentPeriod, getStatements])

  if (!open) return null

  const periodOptions = [
    { value: 'current', label: `Current (Period ${currentPeriod})` },
    ...periods.map((p, idx) => ({ value: String(idx), label: p.label })),
  ]

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
      onClick={handleBackdropClick}
    >
      <div
        className="rounded-lg shadow-xl w-full max-w-5xl mx-4"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          fontFamily: 'var(--font-body)',
          maxHeight: '85vh',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div>
            <h2
              className="text-lg font-semibold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent)' }}
            >
              CFO Review Pack
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Bridges and drivers, not just statements {scale === 'millions' ? '· ($ in millions)' : ''}
            </div>
          </div>
          <button
            type="button"
            onClick={closeReviewPack}
            className="text-xl leading-none cursor-pointer"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4" style={{ overflowY: 'auto', maxHeight: 'calc(85vh - 80px)' }}>
          <div className="flex flex-wrap items-center gap-3">
            <label style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Period
            </label>
            <select
              value={periodIndex === null ? 'current' : String(periodIndex)}
              onChange={(e) => {
                const v = e.target.value
                openReviewPack(v === 'current' ? null : Number(v))
              }}
              className="rounded px-3 py-2 text-sm outline-none cursor-pointer"
              style={{
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                background: 'var(--color-base)',
              }}
            >
              {periodOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {review && (
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {review.label}
              </div>
            )}
          </div>

          {!review ? (
            <div className="mt-4 rounded-lg p-4" style={{ background: 'var(--color-base)', border: '1px dashed var(--color-border)', color: 'var(--color-text-muted)' }}>
              No data yet. Record transactions and close a period to generate a review pack.
            </div>
          ) : (
            <div className="mt-4 space-y-5">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: 'Net Income', value: review.incomeStatement.netIncome, color: 'var(--color-gold)' },
                  { label: 'Operating Cash Flow (CFO)', value: review.cashFlow.totalOperating, color: 'var(--color-green)' },
                  { label: 'Net Change in Cash', value: review.cashFlow.netChange, color: 'var(--color-accent)' },
                ].map((k) => (
                  <div
                    key={k.label}
                    className="rounded-lg p-4"
                    style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
                  >
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{k.label}</div>
                    <div
                      className="mt-1"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: k.color, fontWeight: 700 }}
                    >
                      {formatCurrency(k.value, scale)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bridges */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div
                  className="rounded-lg p-4"
                  style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
                >
                  <div className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                    Net Income → CFO Bridge (Indirect)
                  </div>
                  <div style={{ marginTop: 10, fontSize: '0.85rem' }}>
                    <div className="flex items-center justify-between py-1">
                      <span style={{ color: 'var(--color-text-muted)' }}>Net Income</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency(review.incomeStatement.netIncome, scale)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span style={{ color: 'var(--color-text-muted)' }}>Non-cash adjustments</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency(review.noncashTotal, scale)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span style={{ color: 'var(--color-text-muted)' }}>Working capital changes</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency(review.workingCapitalTotal, scale)}
                      </span>
                    </div>
                    <div
                      className="flex items-center justify-between py-2 mt-2"
                      style={{ borderTop: '1px solid var(--color-border)' }}
                    >
                      <span className="font-semibold">Operating Cash Flow (CFO)</span>
                      <span className="font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency(review.cashFlow.totalOperating, scale)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2" style={{ fontSize: '0.8rem' }}>
                    {review.cfoToNetIncome !== null && (
                      <div className="flex items-center justify-between">
                        <span style={{ color: 'var(--color-text-muted)' }}>CFO / Net Income</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>
                          {review.cfoToNetIncome.toFixed(2)}×
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--color-text-muted)' }}>Beginning Cash</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(review.cashFlow.beginningCash, scale)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--color-text-muted)' }}>Ending Cash</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(review.cashFlow.endingCash, scale)}</span>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-lg p-4"
                  style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
                >
                  <div className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                    Working Capital Drivers
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                    Cash impacts use indirect-method sign convention (asset ↑ uses cash, liability ↑ provides cash).
                  </div>

                  <div className="mt-3 space-y-2">
                    {review.workingCapitalDrivers.map((d) => (
                      <div
                        key={d.account}
                        className="rounded px-3 py-2"
                        style={{ background: 'var(--color-base)', border: '1px solid var(--color-border)' }}
                      >
                        <div className="flex items-center justify-between">
                          <span style={{ fontWeight: 600 }}>{d.account}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                            Δ {formatCurrency(d.change, scale)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between" style={{ fontSize: '0.78rem', marginTop: 2 }}>
                          <span style={{ color: 'var(--color-text-muted)' }}>Cash impact (CFO)</span>
                          <span style={{ fontFamily: 'var(--font-mono)', color: d.cashImpact >= 0 ? 'var(--color-green)' : '#B91C1C' }}>
                            {formatCurrency(d.cashImpact, scale)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Flags */}
              {review.flags.length > 0 && (
                <div className="rounded-lg p-4" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
                  <div className="font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#92400E' }}>
                    CFO Flags
                  </div>
                  <ul className="mt-2 space-y-1" style={{ fontSize: '0.85rem', color: '#92400E' }}>
                    {review.flags.map((f, idx) => (
                      <li key={idx}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

