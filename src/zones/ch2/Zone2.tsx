import SimulationWrapper from '../../components/shared/SimulationWrapper'
import SimulationPlayer from '../../components/simulation/SimulationPlayer'

export default function Zone2() {
  return (
    <SimulationWrapper
      title="Revenue Recognition Simulation"
      description="Work through the 'Revenue & Sales' scenarios. Pay close attention to when cash is received vs when revenue is recognized — and how Deferred Revenue flows through the balance sheet."
    >
      <SimulationPlayer />
    </SimulationWrapper>
  )
}
