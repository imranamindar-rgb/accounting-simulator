import SimulationWrapper from '../../components/shared/SimulationWrapper'
import EPSDilutionCalculator from '../../components/simulations/EPSDilutionCalculator'
export default function Zone2() {
  return (
    <SimulationWrapper title="EPS Dilution Calculator" description="Layer in options, RSUs, and convertible debt to see the treasury stock method in action. Watch basic EPS decay into diluted EPS — and understand why the gap matters for valuation.">
      <EPSDilutionCalculator />
    </SimulationWrapper>
  )
}
