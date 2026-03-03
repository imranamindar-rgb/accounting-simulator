import SimulationWrapper from '../../components/shared/SimulationWrapper'
import SimulationPlayer from '../../components/simulation/SimulationPlayer'

export default function Zone2() {
  return (
    <SimulationWrapper
      title="Double-Entry Simulation"
      description="Watch how every transaction creates equal and offsetting effects across all four financial statements. Focus on 'Revenue & Sales' and 'Expenses & Operations' to see the accounting equation in action."
    >
      <SimulationPlayer />
    </SimulationWrapper>
  )
}
