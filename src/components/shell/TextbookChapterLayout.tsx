import { useEffect } from 'react'
import { Outlet, useParams, useNavigate } from 'react-router-dom'
import { TEXTBOOK_CHAPTERS } from '../../data/textbookToc'
import { useProgressStore } from '../../store/progressStore'
import TextbookZoneNav from './TextbookZoneNav'

export default function TextbookChapterLayout() {
  const { tbId, zone } = useParams<{ tbId: string; zone?: string }>()
  const navigate = useNavigate()
  const markVisited = useProgressStore(s => s.markVisited)

  const tbIdNum = Number(tbId)
  const zoneId = Number(zone ?? 1)
  const chapter = TEXTBOOK_CHAPTERS.find(c => c.tbId === tbIdNum)

  // Redirect /textbook/:tbId → /textbook/:tbId/zone/1
  useEffect(() => {
    if (!zone && tbIdNum) {
      void navigate(`/textbook/${tbIdNum}/zone/1`, { replace: true })
    }
  }, [zone, tbIdNum, navigate])

  useEffect(() => {
    if (chapter && zoneId) markVisited(chapter.dataChapterId, zoneId)
  }, [chapter, zoneId, markVisited])

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
          Textbook Chapter {chapter.tbId}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, margin: '2px 0 0', color: 'white' }}>
          {chapter.title}
        </h1>
        <p style={{ fontSize: '0.82rem', opacity: 0.8, margin: '2px 0 0' }}>
          {chapter.subtitle}
        </p>
      </div>

      {/* Zone navigation */}
      <TextbookZoneNav tbId={tbIdNum} color={chapter.color} />

      {/* Zone content */}
      <div className="px-6 py-6 max-w-5xl mx-auto">
        <Outlet />
      </div>
    </div>
  )
}
