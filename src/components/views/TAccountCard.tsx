/**
 * Single T-Account card for visualizing an account's balance.
 *
 * Renders a classic T-shaped layout with the account name header,
 * debit/credit columns, and the balance shown on its normal side
 * (or opposite side for contra accounts).
 */

import type { Account } from '../../engines/Account'
import type { AccountType } from '../../engines/types'

export interface TAccountCardProps {
  account: Account
}

const TYPE_COLORS: Record<AccountType, string> = {
  Asset: '#EBF5FB',
  Liability: '#FDEDEC',
  Equity: '#F4ECF7',
  Revenue: '#EAFAF1',
  Expense: '#FEF5E7',
}

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function TAccountCard({ account }: TAccountCardProps) {
  const bgColor = TYPE_COLORS[account.type]
  const isZero = account.balance === 0

  // Contra accounts show balance on the opposite side
  const balanceSide = account.contra
    ? account.normalSide === 'debit'
      ? 'credit'
      : 'debit'
    : account.normalSide

  const debitBalance = !isZero && balanceSide === 'debit' ? formatCurrency(account.balance) : null
  const creditBalance =
    !isZero && balanceSide === 'credit' ? formatCurrency(account.balance) : null

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
      }}
      data-testid={`t-account-${account.name}`}
    >
      {/* Account name header */}
      <div
        className="px-3 py-2 text-center"
        style={{
          background: bgColor,
          borderBottom: '1px solid var(--color-border)',
          fontFamily: 'var(--font-display)',
        }}
      >
        <span
          className="text-sm font-semibold"
          style={{ color: 'var(--color-text)' }}
        >
          {account.name}
        </span>
        {account.contra && (
          <span
            className="ml-1 text-xs"
            style={{ color: 'var(--color-text-muted)' }}
          >
            (contra)
          </span>
        )}
      </div>

      {/* Column headers */}
      <div
        className="grid grid-cols-2 text-center text-xs font-semibold tracking-wide"
        style={{
          borderBottom: '1px solid var(--color-border)',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <div
          className="px-3 py-1.5"
          style={{ borderRight: '1px solid var(--color-border)' }}
        >
          DEBIT
        </div>
        <div className="px-3 py-1.5">CREDIT</div>
      </div>

      {/* Balance row */}
      <div
        className="grid grid-cols-2 text-sm"
        style={{
          borderBottom: '1px solid var(--color-border)',
          fontFamily: 'var(--font-mono)',
          minHeight: '2rem',
        }}
      >
        <div
          className="px-3 py-1.5 text-right"
          style={{ borderRight: '1px solid var(--color-border)' }}
        />
        <div className="px-3 py-1.5 text-right" />
      </div>

      {/* Balance footer */}
      <div
        className="grid grid-cols-2 text-sm font-bold"
        style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text)',
          background: 'var(--color-base)',
        }}
      >
        <div
          className="px-3 py-2 text-right"
          style={{ borderRight: '1px solid var(--color-border)' }}
        >
          {isZero ? (
            <span style={{ color: 'var(--color-text-muted)' }}>&mdash;</span>
          ) : debitBalance ? (
            <span>Bal: {debitBalance}</span>
          ) : null}
        </div>
        <div className="px-3 py-2 text-right">
          {isZero ? (
            <span style={{ color: 'var(--color-text-muted)' }}>&mdash;</span>
          ) : creditBalance ? (
            <span>Bal: {creditBalance}</span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
