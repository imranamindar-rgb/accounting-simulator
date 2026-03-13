import SimulationWrapper from '../../components/shared/SimulationWrapper'
import AdjustingEntryWorkshop from '../../components/simulations/AdjustingEntryWorkshop'
export default function Zone2() {
  return (
    <SimulationWrapper title="Adjusting Entry Workshop" description="Start with an unadjusted trial balance and identify the adjusting entries needed. Post accruals, deferrals, and depreciation, then watch the adjusted trial balance update automatically.">
      <AdjustingEntryWorkshop />
    </SimulationWrapper>
  )
}
