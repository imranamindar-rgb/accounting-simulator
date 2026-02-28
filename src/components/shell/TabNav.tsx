import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'

const TABS = [
  { id: 'statements' as const, label: 'Statements', path: '/' },
  { id: 'ma' as const, label: 'M&A Workbench', path: '/ma' },
]

export function TabNav() {
  const activeTab = useUIStore((s) => s.activeTab)
  const setActiveTab = useUIStore((s) => s.setActiveTab)
  const navigate = useNavigate()

  function handleTabClick(tab: (typeof TABS)[number]) {
    setActiveTab(tab.id)
    navigate(tab.path)
  }

  return (
    <nav
      className="flex bg-[var(--color-surface)] px-4"
      style={{ borderBottom: '1px solid var(--color-border)' }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab)}
            className="relative px-4 py-3 transition-colors cursor-pointer bg-transparent border-none"
            style={{
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {tab.label}
            {isActive && (
              <span
                className="absolute bottom-0 left-0 w-full"
                style={{
                  height: 2,
                  background: 'var(--color-gold)',
                }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
