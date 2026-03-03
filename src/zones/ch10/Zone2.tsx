import SimulationWrapper from '../../components/shared/SimulationWrapper'
import BenfordDetector from '../../components/simulations/BenfordDetector'
export default function Zone2() {
  return (
    <SimulationWrapper title="Benford's Law Fraud Detector" description="Compare first-digit distributions against Benford's Law. Fabricated financial data deviates from the expected distribution — the chi-squared test quantifies how suspicious the numbers are.">
      <BenfordDetector />
    </SimulationWrapper>
  )
}
