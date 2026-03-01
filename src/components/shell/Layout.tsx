import { Outlet } from 'react-router-dom'
import { Toolbar } from './Toolbar'
import { TabNav } from './TabNav'
import SensitivityPanel from '../analysis/SensitivityPanel'
import ReviewPackModal from '../executive/ReviewPackModal'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'

export function Layout() {
  useKeyboardShortcuts()

  return (
    <div className="min-h-screen bg-[var(--color-base)]">
      <Toolbar />
      <TabNav />
      <Outlet />
      <SensitivityPanel />
      <ReviewPackModal />
    </div>
  )
}
