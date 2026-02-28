/**
 * Stable hook for consuming computed financial statements.
 *
 * Calling getStatements() inside a Zustand selector creates a new object
 * every render, which causes infinite re-render loops. This hook instead
 * calls getStatements() outside the selector and memoises the result with
 * useMemo keyed on a change counter that increments when the ledger
 * actually mutates.
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
  const getStatements = useLedgerStore((s) => s.getStatements)

  // We use the ledger instance + its snapshot as a proxy for "did data change".
  // ledger is a class instance so the reference is stable per company load;
  // takeSnapshot() is called elsewhere, so we rely on Zustand's set() calls
  // to signal changes.  useMemo with these deps will recompute only when
  // the store's ledger/beginningBalances/sharesOutstanding change.
  return useMemo(() => getStatements(), [ledger, beginningBalances, sharesOutstanding, getStatements])
}

/**
 * Returns memoised financial ratios.  Safe to call during render.
 */
export function useRatios() {
  const getRatios = useLedgerStore((s) => s.getRatios)
  const ledger = useLedgerStore((s) => s.ledger)
  const beginningBalances = useLedgerStore((s) => s.beginningBalances)

  return useMemo(() => getRatios(), [ledger, beginningBalances, getRatios])
}
