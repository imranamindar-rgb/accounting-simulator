import SimulationWrapper from '../../components/shared/SimulationWrapper'
import AccountingEquationBalancer from '../../components/simulations/AccountingEquationBalancer'
export default function Zone2() {
  return (
    <SimulationWrapper title="Accounting Equation Balancer" description="Post journal entries and watch Assets = Liabilities + Equity hold in real time. Every properly formed double-entry preserves the equation — this is the bedrock of all financial reporting.">
      <AccountingEquationBalancer />
    </SimulationWrapper>
  )
}
