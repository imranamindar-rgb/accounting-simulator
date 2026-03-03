import SimulationWrapper from '../../components/shared/SimulationWrapper'
import CovenantStressTester from '../../components/simulations/CovenantStressTester'
export default function Zone2() {
  return (
    <SimulationWrapper title="Covenant Stress Tester" description="Set your debt structure and covenant thresholds, then drag EBITDA down to see when interest coverage and leverage covenants breach. This is how credit analysts model downside scenarios.">
      <CovenantStressTester />
    </SimulationWrapper>
  )
}
