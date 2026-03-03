import SimulationWrapper from '../../components/shared/SimulationWrapper'
import SimulationPlayer from '../../components/simulation/SimulationPlayer'

export default function Zone2() {
  return (
    <SimulationWrapper
      title="Cash Flow Statement Simulation"
      description="Run through the 'Adjusting Entries' scenarios and then revisit scenarios from other categories. Focus on which section of the cash flow statement each transaction affects — and why CFO can diverge from net income."
    >
      <SimulationPlayer />
    </SimulationWrapper>
  )
}
