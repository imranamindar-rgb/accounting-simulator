import SimulationWrapper from '../../components/shared/SimulationWrapper'
import LeaseClassifier from '../../components/simulations/LeaseClassifier'
export default function Zone2() {
  return (
    <SimulationWrapper title="Lease Classifier" description="Walk through the ASC 842 decision tree to classify leases as operating or finance. Compute the right-of-use asset, lease liability, and see the journal entries for each type.">
      <LeaseClassifier />
    </SimulationWrapper>
  )
}
