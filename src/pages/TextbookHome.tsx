import { Link } from 'react-router-dom'
import { TEXTBOOK_CHAPTERS, TEXTBOOK_APPENDICES } from '../data/textbookToc'
import { useProgressStore } from '../store/progressStore'
import ModeSwitch from '../components/shell/ModeSwitch'

export default function TextbookHome() {
  const getChapterStars = useProgressStore(s => s.getChapterStars)
  const getChapterPct = useProgressStore(s => s.getChapterPct)

  return (
    <div className="min-h-screen pl-0 pt-12" style={{ background: 'var(--color-base)' }}>
      {/* Hero */}
      <div className="px-8 py-10 max-w-5xl mx-auto">
        <ModeSwitch />
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          EMBA &middot; Financial Accounting
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--color-accent)', margin: '4px 0 8px' }}>
          Financial Accounting
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: '0 0 12px', letterSpacing: '0.04em' }}>
          Designed by Imran Dar
        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', maxWidth: '520px' }}>
          12 chapters following Hanlon et al. textbook structure. Interactive simulations and concept deep-dives.
        </p>
      </div>

      {/* Chapter grid */}
      <div className="px-8 pb-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEXTBOOK_CHAPTERS.map(ch => {
            const pct = getChapterPct(ch.dataChapterId)
            const stars = getChapterStars(ch.dataChapterId)
            const maxStars = 15

            return (
              <Link
                key={ch.tbId}
                to={`/textbook/${ch.tbId}/zone/1`}
                className="block rounded-xl overflow-hidden transition-shadow hover:shadow-lg"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                {/* Color bar */}
                <div style={{ background: ch.color, height: '4px' }} />

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        TB Ch {ch.tbId}
                      </div>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)', margin: '2px 0 2px' }}>
                        {ch.title}
                      </h2>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                        {ch.subtitle}
                      </p>
                    </div>

                    {/* Star badge */}
                    <div className="flex-shrink-0 text-right">
                      {stars > 0 ? (
                        <>
                          <div style={{ color: 'var(--color-gold)', fontSize: '0.9rem' }}>
                            {'★'.repeat(Math.min(5, Math.ceil(stars / 3)))}{'☆'.repeat(5 - Math.min(5, Math.ceil(stars / 3)))}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {stars}/{maxStars} pts
                          </div>
                        </>
                      ) : (
                        <span
                          className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                          style={{ background: ch.color + '18', color: ch.color }}
                        >
                          Start
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 rounded-full" style={{ background: 'var(--color-border)' }}>
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%`, background: ch.color }}
                    />
                  </div>
                  {pct > 0 && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                      {pct}% complete
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Appendix section */}
      <div className="px-8 pb-12 max-w-5xl mx-auto">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Appendix
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEXTBOOK_APPENDICES.map(app => (
            <Link
              key={app.id}
              to={`/textbook/appendix/${app.id}`}
              className="block rounded-xl overflow-hidden transition-shadow hover:shadow-lg"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div style={{ background: app.color, height: '4px' }} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Appendix {app.id}
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)', margin: '2px 0 2px' }}>
                      {app.title}
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                      {app.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
