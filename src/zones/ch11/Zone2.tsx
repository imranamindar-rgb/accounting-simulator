import SimulationWrapper from '../../components/shared/SimulationWrapper'
import FinancialStatementBuilder from '../../components/simulations/FinancialStatementBuilder'
export default function Zone2() {
  return (
    <SimulationWrapper title="Financial Statement Builder" description="Drag accounts to the correct financial statement — Balance Sheet, Income Statement, or Statement of Equity. The accounting equation validates your placements in real time.">
      <FinancialStatementBuilder />
    </SimulationWrapper>
  )
}
