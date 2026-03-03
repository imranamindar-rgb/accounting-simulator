import SimulationWrapper from '../../components/shared/SimulationWrapper'
import SimulationPlayer from '../../components/simulation/SimulationPlayer'

export default function Zone2() {
  return (
    <SimulationWrapper
      title="Fixed Assets & Capitalization Simulation"
      description="Work through the 'Assets & Investing' scenarios. Notice how capitalized costs appear in investing activities (not operating) and how depreciation flows as a non-cash operating charge."
    >
      <SimulationPlayer />
    </SimulationWrapper>
  )
}
