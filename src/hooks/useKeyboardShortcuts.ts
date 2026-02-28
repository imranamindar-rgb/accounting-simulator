import { useEffect } from 'react'
import { useLedgerStore } from '../store/ledgerStore'

export function useKeyboardShortcuts() {
  const undo = useLedgerStore((s) => s.undo)
  const redo = useLedgerStore((s) => s.redo)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      // Ctrl+Y or Cmd+Shift+Z = Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])
}
