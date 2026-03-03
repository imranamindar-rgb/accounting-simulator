import SimulationWrapper from '../../components/shared/SimulationWrapper'
import SimulationPlayer from '../../components/simulation/SimulationPlayer'

export default function Zone2() {
  return (
    <SimulationWrapper
      title="Equity & EPS Simulation"
      description="Work through the 'Equity & Ownership' scenarios. Track how share issuances, buybacks, and dividends affect total equity — and how the share count changes drive EPS."
    >
      <SimulationPlayer />
    </SimulationWrapper>
  )
}
