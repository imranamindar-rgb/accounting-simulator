import { Link } from 'react-router-dom'
import { CHAPTERS } from '../data/toc'
import { useProgressStore } from '../store/progressStore'

export default function Progress() {
  const getChapterStars = useProgressStore(s => s.getChapterStars)
  const getChapterPct = useProgressStore(s => s.getChapterPct)
  const getZone = useProgressStore(s => s.getZone)
  const resetAll = useProgressStore(s => s.resetAll)

  const totalStars = CHAPTERS.reduce((sum, ch) => sum + getChapterStars(ch.id), 0)
  const maxStars = 150 // 10 chapters × 5 zones × 3 stars

  return (
    <div className="min-h-screen pt-12 px-8 pb-12 max-w-4xl mx-auto" style={{ background: 'var(--color-base)' }}>
      <div className="mb-8">
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Learning Analytics
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-accent)', margin: '4px 0 0' }}>
          My Progress
        </h1>

        {/* Overall */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1 h-3 rounded-full" style={{ background: 'var(--color-border)' }}>
            <div
              className="h-3 rounded-full transition-all"
              style={{ width: `${Math.round((totalStars / maxStars) * 100)}%`, background: 'var(--color-gold)' }}
            />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
            {totalStars} / {maxStars} stars
          </span>
        </div>
      </div>

      {/* Chapter breakdown */}
      <div className="space-y-3">
        {CHAPTERS.map(ch => {
          const pct = getChapterPct(ch.id)
          const stars = getChapterStars(ch.id)

          return (
            <div
              key={ch.id}
              className="rounded-xl p-4"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-2 h-10 rounded-full flex-shrink-0"
                  style={{ background: ch.color }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Ch{ch.id}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>{ch.title}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{pct}% complete · {stars}/15 stars</div>
                </div>
                <Link
                  to={`/chapter/${ch.id}/zone/1`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{ background: ch.color + '18', color: ch.color }}
                >
                  {pct === 0 ? 'Start' : 'Continue'}
                </Link>
              </div>

              {/* Zone dots */}
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(z => {
                  const zp = getZone(ch.id, z)
                  const labels = ['Concepts', 'Simulation', 'Practice', 'Mastery', 'Takeaways']
                  return (
                    <div key={z} className="flex items-center gap-1">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: zp.visited ? ch.color : 'var(--color-border)' }}
                        title={labels[z - 1]}
                      />
                      {zp.stars > 0 && (
                        <span style={{ fontSize: '0.6rem', color: 'var(--color-gold)' }}>
                          {'★'.repeat(zp.stars)}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={() => { if (confirm('Reset all progress?')) resetAll() }}
        className="mt-8 px-4 py-2 rounded-lg text-sm"
        style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', background: 'transparent' }}
      >
        Reset all progress
      </button>
    </div>
  )
}
