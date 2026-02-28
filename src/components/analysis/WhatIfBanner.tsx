/**
 * WhatIfBanner -- shown at the top of StatementsPage when what-if mode is active.
 *
 * Displays a prominent banner indicating that the user is in what-if mode
 * with an "Exit What-If" button that restores the ledger and switches back
 * to transaction mode.
 */

import { useUIStore } from '../../store/uiStore'

interface WhatIfBannerProps {
  onExit: () => void
}

export default function WhatIfBanner({ onExit }: WhatIfBannerProps) {
  const mode = useUIStore((s) => s.mode)

  if (mode !== 'whatif') return null

  return (
    <div
      className="flex items-center justify-between px-5 py-3 rounded-lg mb-4"
      style={{
        background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
        color: '#2D3748',
        boxShadow: '0 2px 8px rgba(218,165,32,0.3)',
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="text-lg"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
        >
          What-If Mode
        </span>
        <span
          className="text-sm"
          style={{ fontFamily: 'var(--font-body)', opacity: 0.8 }}
        >
          Adjust account balances freely. Changes are temporary.
        </span>
      </div>
      <button
        type="button"
        onClick={onExit}
        className="px-4 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer"
        style={{
          fontFamily: 'var(--font-body)',
          background: 'rgba(255,255,255,0.9)',
          color: 'var(--color-accent)',
          border: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#FFFFFF'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.9)'
        }}
      >
        Exit What-If
      </button>
    </div>
  )
}
