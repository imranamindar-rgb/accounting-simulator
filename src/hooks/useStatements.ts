/**
 * Stable hook for consuming computed financial statements.
 *
 * Calling getStatements() inside a Zustand selector creates a new object
 * every render, which causes infinite re-render loops. This hook instead
 * calls getStatements() outside the selector and memoises the result with
 * useMemo keyed on a change counter that increments when the ledger
 * actually mutates.
 *
 * ledgerVersion is bumped by WhatIfMode when sliders are adjusted,
 * ensuring statements recompute even though the ledger object reference
 * doesn't change.
 */
import { useMemo } from 'react'
import { useLedgerStore } from '../store/ledgerStore'

/**
 * Returns memoised financial statements.  Safe to call during render.
 */
export function useStatements() {
  const ledger = useLedgerStore((s) => s.ledger)
  const beginningBalances = useLedgerStore((s) => s.beginningBalances)
  const sharesOutstanding = useLedgerStore((s) => s.sharesOutstanding)
  const ledgerVersion = useLedgerStore((s) => s.ledgerVersion)
  const getStatements = useLedgerStore((s) => s.getStatements)

  return useMemo(
    () => getStatements(),
    [ledger, beginningBalances, sharesOutstanding, ledgerVersion, getStatements],
  )
}

/**
 * Returns memoised financial ratios.  Safe to call during render.
 */
export function useRatios() {
  const getRatios = useLedgerStore((s) => s.getRatios)
  const ledger = useLedgerStore((s) => s.ledger)
  const beginningBalances = useLedgerStore((s) => s.beginningBalances)
  const ledgerVersion = useLedgerStore((s) => s.ledgerVersion)

  return useMemo(() => getRatios(), [ledger, beginningBalances, ledgerVersion, getRatios])
}
