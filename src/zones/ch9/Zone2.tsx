import SimulationWrapper from '../../components/shared/SimulationWrapper'
import PPACalculator from '../../components/simulations/PPACalculator'
export default function Zone2() {
  return (
    <SimulationWrapper title="Acquisition Accounting Calculator" description="Walk through a purchase price allocation (PPA). Adjust deal parameters to see how goodwill is calculated — and what percentage becomes an intangible that must survive annual impairment tests.">
      <PPACalculator />
    </SimulationWrapper>
  )
}
