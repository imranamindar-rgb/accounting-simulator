import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { CHAPTERS } from '../data/toc'

type ZoneNum = 1 | 2 | 3 | 4 | 5

// Lazily loaded zone components per chapter
const zones: Record<string, Record<ZoneNum, React.LazyExoticComponent<() => React.ReactElement>>> = {
  '1':  { 1: lazy(() => import('../zones/ch1/Zone1')),  2: lazy(() => import('../zones/ch1/Zone2')),  3: lazy(() => import('../zones/ch1/Zone3')),  4: lazy(() => import('../zones/ch1/Zone4')),  5: lazy(() => import('../zones/ch1/Zone5'))  },
  '2':  { 1: lazy(() => import('../zones/ch2/Zone1')),  2: lazy(() => import('../zones/ch2/Zone2')),  3: lazy(() => import('../zones/ch2/Zone3')),  4: lazy(() => import('../zones/ch2/Zone4')),  5: lazy(() => import('../zones/ch2/Zone5'))  },
  '3':  { 1: lazy(() => import('../zones/ch3/Zone1')),  2: lazy(() => import('../zones/ch3/Zone2')),  3: lazy(() => import('../zones/ch3/Zone3')),  4: lazy(() => import('../zones/ch3/Zone4')),  5: lazy(() => import('../zones/ch3/Zone5'))  },
  '4':  { 1: lazy(() => import('../zones/ch4/Zone1')),  2: lazy(() => import('../zones/ch4/Zone2')),  3: lazy(() => import('../zones/ch4/Zone3')),  4: lazy(() => import('../zones/ch4/Zone4')),  5: lazy(() => import('../zones/ch4/Zone5'))  },
  '5':  { 1: lazy(() => import('../zones/ch5/Zone1')),  2: lazy(() => import('../zones/ch5/Zone2')),  3: lazy(() => import('../zones/ch5/Zone3')),  4: lazy(() => import('../zones/ch5/Zone4')),  5: lazy(() => import('../zones/ch5/Zone5'))  },
  '6':  { 1: lazy(() => import('../zones/ch6/Zone1')),  2: lazy(() => import('../zones/ch6/Zone2')),  3: lazy(() => import('../zones/ch6/Zone3')),  4: lazy(() => import('../zones/ch6/Zone4')),  5: lazy(() => import('../zones/ch6/Zone5'))  },
  '7':  { 1: lazy(() => import('../zones/ch7/Zone1')),  2: lazy(() => import('../zones/ch7/Zone2')),  3: lazy(() => import('../zones/ch7/Zone3')),  4: lazy(() => import('../zones/ch7/Zone4')),  5: lazy(() => import('../zones/ch7/Zone5'))  },
  '8':  { 1: lazy(() => import('../zones/ch8/Zone1')),  2: lazy(() => import('../zones/ch8/Zone2')),  3: lazy(() => import('../zones/ch8/Zone3')),  4: lazy(() => import('../zones/ch8/Zone4')),  5: lazy(() => import('../zones/ch8/Zone5'))  },
  '9':  { 1: lazy(() => import('../zones/ch9/Zone1')),  2: lazy(() => import('../zones/ch9/Zone2')),  3: lazy(() => import('../zones/ch9/Zone3')),  4: lazy(() => import('../zones/ch9/Zone4')),  5: lazy(() => import('../zones/ch9/Zone5'))  },
  '10': { 1: lazy(() => import('../zones/ch10/Zone1')), 2: lazy(() => import('../zones/ch10/Zone2')), 3: lazy(() => import('../zones/ch10/Zone3')), 4: lazy(() => import('../zones/ch10/Zone4')), 5: lazy(() => import('../zones/ch10/Zone5')) },
}

export default function ChapterPage() {
  const { id = '1', zone = '1' } = useParams<{ id: string; zone: string }>()
  const zoneId = Math.max(1, Math.min(5, Number(zone))) as ZoneNum
  const chapter = CHAPTERS.find(c => c.id === Number(id))
  const ZoneComponent = zones[id]?.[zoneId]

  if (!chapter || !ZoneComponent) {
    return <div style={{ color: 'var(--color-text-muted)', padding: '2rem' }}>Content coming soon.</div>
  }

  return (
    <Suspense fallback={<div style={{ color: 'var(--color-text-muted)', padding: '2rem' }}>Loading…</div>}>
      <ZoneComponent />
    </Suspense>
  )
}
