import { NavLink } from 'react-router-dom'
import { ZONES } from '../../data/toc'
import { TEXTBOOK_CHAPTERS } from '../../data/textbookToc'
import { useProgressStore } from '../../store/progressStore'

interface Props {
  tbId: number
  color: string
}

export default function TextbookZoneNav({ tbId, color }: Props) {
  const getZone = useProgressStore(s => s.getZone)
  const chapter = TEXTBOOK_CHAPTERS.find(c => c.tbId === tbId)
  const dataChapterId = chapter?.dataChapterId ?? tbId

  return (
    <div
      className="flex gap-0 border-b"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
    >
      {ZONES.map(zone => {
        const progress = getZone(dataChapterId, zone.id)
        return (
          <NavLink
            key={zone.id}
            to={`/textbook/${tbId}/zone/${zone.id}`}
            className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
            style={({ isActive }) => ({
              borderBottomColor: isActive ? color : 'transparent',
              color: isActive ? color : 'var(--color-text-muted)',
              background: 'transparent',
            })}
          >
            <span>{zone.icon}</span>
            <span>{zone.label}</span>
            {progress.stars > 0 && (
              <span style={{ color: 'var(--color-gold)', fontSize: '0.65rem' }}>
                {'★'.repeat(progress.stars)}
              </span>
            )}
          </NavLink>
        )
      })}
    </div>
  )
}
