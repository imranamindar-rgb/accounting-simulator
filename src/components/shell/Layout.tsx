import { Outlet } from 'react-router-dom'
import { Toolbar } from './Toolbar'
import { TabNav } from './TabNav'
import { TransactionDrawer } from '../transaction/TransactionDrawer'
import SensitivityPanel from '../analysis/SensitivityPanel'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'

export function Layout() {
  useKeyboardShortcuts()

  return (
    <div className="min-h-screen bg-[var(--color-base)]">
      <Toolbar />
      <TabNav />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
      <TransactionDrawer />
      <SensitivityPanel />
    </div>
  )
}
