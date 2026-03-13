import { useNavigate, useLocation } from 'react-router-dom'

export default function ModeSwitch() {
  const navigate = useNavigate()
  const location = useLocation()
  const isTextbook = location.pathname.startsWith('/textbook')

  return (
    <div
      className="flex gap-1 mb-6"
      style={{
        background: 'var(--color-surface)',
        borderRadius: '8px',
        padding: '3px',
        border: '1px solid var(--color-border)',
        display: 'inline-flex',
      }}
    >
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '0.82rem',
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
          cursor: 'pointer',
          border: 'none',
          transition: 'all 0.15s',
          background: !isTextbook ? 'var(--color-accent)' : 'transparent',
          color: !isTextbook ? 'white' : 'var(--color-text-muted)',
        }}
      >
        Accounting Simulator
      </button>
      <button
        onClick={() => navigate('/textbook')}
        style={{
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '0.82rem',
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
          cursor: 'pointer',
          border: 'none',
          transition: 'all 0.15s',
          background: isTextbook ? 'var(--color-accent)' : 'transparent',
          color: isTextbook ? 'white' : 'var(--color-text-muted)',
        }}
      >
        Financial Accounting (Textbook)
      </button>
    </div>
  )
}
