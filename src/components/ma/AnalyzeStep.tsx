import { useMAStore } from '../../store/maStore'
import HealthDashboard from './HealthDashboard'
import DCFModel from './DCFModel'
import ComparableCompanies from './ComparableCompanies'

export default function AnalyzeStep() {
  const target = useMAStore((s) => s.targetCompany)

  if (!target) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
        No target company selected. Go back to Import step.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <HealthDashboard company={target} />
      <DCFModel company={target} />
      <ComparableCompanies company={target} />
    </div>
  )
}
