import SimulationWrapper from '../../components/shared/SimulationWrapper'
import SimulationPlayer from '../../components/simulation/SimulationPlayer'

export default function Zone2() {
  return (
    <SimulationWrapper
      title="Liabilities & Off-Balance-Sheet Simulation"
      description="Explore the 'Liabilities & Financing' scenarios. See how borrowings flow through the balance sheet and how the interest expense appears on the income statement vs principal repayment in financing activities."
    >
      <SimulationPlayer />
    </SimulationWrapper>
  )
}
