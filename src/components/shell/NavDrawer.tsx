import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { CHAPTERS } from '../../data/toc'
import { TEXTBOOK_CHAPTERS, TEXTBOOK_APPENDICES } from '../../data/textbookToc'
import { useProgressStore } from '../../store/progressStore'

export default function NavDrawer() {
  const [open, setOpen] = useState(false)
  const getChapterStars = useProgressStore(s => s.getChapterStars)
  const getChapterPct = useProgressStore(s => s.getChapterPct)
  const location = useLocation()
  const isTextbookMode = location.pathname.startsWith('/textbook')

  return (
    <>
      {/* Hamburger toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed top-3 left-3 z-50 w-9 h-9 flex flex-col gap-1.5 items-center justify-center rounded-lg hover:bg-[var(--color-border)] transition-colors"
        aria-label="Toggle navigation"
      >
        <span className={`block w-5 h-0.5 bg-[var(--color-text)] transition-all duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block w-5 h-0.5 bg-[var(--color-text)] transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-5 h-0.5 bg-[var(--color-text)] transition-all duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/25"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <nav
        className={`fixed top-0 left-0 h-full z-40 w-72 overflow-y-auto transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', fontFamily: 'var(--font-body)' }}
      >
        {/* Header */}
        <div className="px-5 pt-14 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent)', fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
            Financial Accounting
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', margin: '2px 0 0' }}>
            EMBA Learning Platform
          </p>
        </div>

        <div className="px-3 py-3">
          {/* Home */}
          <NavLink
            to={isTextbookMode ? '/textbook' : '/'}
            end
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg mb-1 text-sm font-medium transition-colors"
            style={({ isActive }) => ({
              background: isActive ? 'var(--color-accent)' : 'transparent',
              color: isActive ? 'white' : 'var(--color-text)',
            })}
          >
            🏠 Home
          </NavLink>

          {/* Progress */}
          <NavLink
            to="/progress"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg mb-1 text-sm font-medium transition-colors"
            style={({ isActive }) => ({
              background: isActive ? 'var(--color-accent)' : 'transparent',
              color: isActive ? 'white' : 'var(--color-text)',
            })}
          >
            📊 My Progress
          </NavLink>

          {/* Company Analyzer */}
          <NavLink
            to="/analyze"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3 text-sm font-medium transition-colors"
            style={({ isActive }) => ({
              background: isActive ? 'var(--color-accent)' : 'transparent',
              color: isActive ? 'white' : 'var(--color-text)',
            })}
          >
            🔍 Company Analyzer
          </NavLink>

          {/* Mode-aware chapter list */}
          {isTextbookMode ? (
            <>
              {/* Textbook chapters */}
              <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-muted)', padding: '0 12px 6px', textTransform: 'uppercase' }}>
                Textbook Chapters
              </div>

              <div className="space-y-0.5">
                {TEXTBOOK_CHAPTERS.map(ch => {
                  const pct = getChapterPct(ch.dataChapterId)
                  const stars = getChapterStars(ch.dataChapterId)
                  return (
                    <NavLink
                      key={ch.tbId}
                      to={`/textbook/${ch.tbId}`}
                      onClick={() => setOpen(false)}
                      className="block px-3 py-2.5 rounded-lg transition-colors hover:bg-[var(--color-base)]"
                      style={({ isActive }) => ({
                        background: isActive ? 'var(--color-base)' : 'transparent',
                        borderLeft: isActive ? `3px solid ${ch.color}` : '3px solid transparent',
                      })}
                    >
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', minWidth: '2rem' }}>
                          TB{ch.tbId}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text)', fontWeight: 500, flex: 1 }}>
                          {ch.title}
                        </span>
                        {stars > 0 && (
                          <span style={{ color: 'var(--color-gold)', fontSize: '0.7rem' }}>
                            {'★'.repeat(Math.min(3, Math.ceil(stars / 5)))}
                          </span>
                        )}
                      </div>
                      {pct > 0 && (
                        <div className="mt-1.5 h-1 rounded-full" style={{ background: 'var(--color-border)' }}>
                          <div
                            className="h-1 rounded-full transition-all"
                            style={{ width: `${pct}%`, background: ch.color }}
                          />
                        </div>
                      )}
                    </NavLink>
                  )
                })}
              </div>

              {/* Textbook Appendices */}
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-muted)', padding: '0 12px 6px', textTransform: 'uppercase' }}>
                  Book Appendices
                </div>
                {TEXTBOOK_APPENDICES.map(app => (
                  <NavLink
                    key={app.id}
                    to={`/textbook/appendix/${app.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-[var(--color-base)]"
                    style={({ isActive }) => ({
                      background: isActive ? 'var(--color-base)' : 'transparent',
                      borderLeft: isActive ? `3px solid ${app.color}` : '3px solid transparent',
                    })}
                  >
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', minWidth: '2rem' }}>App{app.id}</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text)', fontWeight: 500 }}>{app.title}</span>
                  </NavLink>
                ))}
              </div>

              {/* Link back to simulator */}
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                <NavLink
                  to="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--color-base)]"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  ← Back to Simulator
                </NavLink>
              </div>
            </>
          ) : (
            <>
              {/* Original simulator chapters */}
              <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-muted)', padding: '0 12px 6px', textTransform: 'uppercase' }}>
                Chapters
              </div>

              <div className="space-y-0.5">
                {CHAPTERS.map(ch => {
                  const pct = getChapterPct(ch.id)
                  const stars = getChapterStars(ch.id)
                  return (
                    <NavLink
                      key={ch.id}
                      to={`/chapter/${ch.id}`}
                      onClick={() => setOpen(false)}
                      className="block px-3 py-2.5 rounded-lg transition-colors hover:bg-[var(--color-base)]"
                      style={({ isActive }) => ({
                        background: isActive ? 'var(--color-base)' : 'transparent',
                        borderLeft: isActive ? `3px solid ${ch.color}` : '3px solid transparent',
                      })}
                    >
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', minWidth: '2rem' }}>
                          Ch{ch.id}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text)', fontWeight: 500, flex: 1 }}>
                          {ch.title}
                        </span>
                        {stars > 0 && (
                          <span style={{ color: 'var(--color-gold)', fontSize: '0.7rem' }}>
                            {'★'.repeat(Math.min(3, Math.ceil(stars / 5)))}
                          </span>
                        )}
                      </div>
                      {pct > 0 && (
                        <div className="mt-1.5 h-1 rounded-full" style={{ background: 'var(--color-border)' }}>
                          <div
                            className="h-1 rounded-full transition-all"
                            style={{ width: `${pct}%`, background: ch.color }}
                          />
                        </div>
                      )}
                    </NavLink>
                  )
                })}
              </div>

              {/* Appendix section */}
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-muted)', padding: '0 12px 6px', textTransform: 'uppercase' }}>
                  Appendix
                </div>
                {[
                  { id: '1', label: 'All Simulations' },
                  { id: '2', label: 'Case Library' },
                  { id: '3', label: 'Statements Simulator' },
                  { id: '4', label: 'Transaction Flow' },
                ].map(({ id, label }) => (
                  <NavLink
                    key={id}
                    to={`/appendix/${id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-[var(--color-base)]"
                    style={({ isActive }) => ({
                      background: isActive ? 'var(--color-base)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--color-accent)' : '3px solid transparent',
                    })}
                  >
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', minWidth: '2rem' }}>A{id}</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text)', fontWeight: 500 }}>{label}</span>
                  </NavLink>
                ))}
              </div>

              {/* Link to textbook mode */}
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                <NavLink
                  to="/textbook"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--color-base)]"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  📖 Financial Accounting (Textbook) →
                </NavLink>
              </div>
            </>
          )}
        </div>
      </nav>
    </>
  )
}
