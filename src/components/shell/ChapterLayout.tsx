import { useEffect } from 'react'
import { Outlet, useParams, useNavigate } from 'react-router-dom'
import { CHAPTERS } from '../../data/toc'
import { useProgressStore } from '../../store/progressStore'
import ZoneNav from './ZoneNav'

export default function ChapterLayout() {
  const { id, zone } = useParams<{ id: string; zone?: string }>()
  const navigate = useNavigate()
  const markVisited = useProgressStore(s => s.markVisited)

  const chapterId = Number(id)
  const zoneId = Number(zone ?? 1)
  const chapter = CHAPTERS.find(c => c.id === chapterId)

  // Redirect /chapter/:id → /chapter/:id/zone/1
  useEffect(() => {
    if (!zone && chapterId) {
      void navigate(`/chapter/${chapterId}/zone/1`, { replace: true })
    }
  }, [zone, chapterId, navigate])

  useEffect(() => {
    if (chapterId && zoneId) markVisited(chapterId, zoneId)
  }, [chapterId, zoneId, markVisited])

  if (!chapter) {
    return <div className="p-8" style={{ color: 'var(--color-text-muted)' }}>Chapter not found.</div>
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-base)' }}>
      {/* Chapter header */}
      <div
        className="px-6 py-4 pl-16"
        style={{ background: chapter.color, color: 'white' }}
      >
        <div style={{ fontSize: '0.7rem', opacity: 0.7, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
          Chapter {chapter.id}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, margin: '2px 0 0', color: 'white' }}>
          {chapter.title}
        </h1>
        <p style={{ fontSize: '0.82rem', opacity: 0.8, margin: '2px 0 0' }}>
          {chapter.subtitle}
        </p>
      </div>

      {/* Zone navigation */}
      <ZoneNav chapterId={chapterId} color={chapter.color} />

      {/* Zone content */}
      <div className="px-6 py-6 max-w-5xl mx-auto">
        <Outlet />
      </div>
    </div>
  )
}
