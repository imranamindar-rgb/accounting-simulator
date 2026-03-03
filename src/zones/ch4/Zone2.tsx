import SimulationWrapper from '../../components/shared/SimulationWrapper'
import DepreciationScheduleBuilder from '../../components/simulations/DepreciationScheduleBuilder'
export default function Zone2() {
  return (
    <SimulationWrapper title="Depreciation Schedule Builder" description="Enter asset cost, salvage value, and useful life. Compare Straight-Line, Double-Declining Balance, and Sum-of-Years Digits year by year. See how management's method and life assumptions directly drive reported earnings.">
      <DepreciationScheduleBuilder />
    </SimulationWrapper>
  )
}
