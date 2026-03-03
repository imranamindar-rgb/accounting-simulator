import SimulationWrapper from '../../components/shared/SimulationWrapper'
import RevenueRecognitionTimer from '../../components/simulations/RevenueRecognitionTimer'
export default function Zone2() {
  return (
    <SimulationWrapper title="Revenue Recognition Timer" description="Choose a contract type and advance through time. See exactly when revenue is recognized vs when cash arrives — and how Deferred Revenue acts as the bridge between the two.">
      <RevenueRecognitionTimer />
    </SimulationWrapper>
  )
}
