import SimulationWrapper from '../../components/shared/SimulationWrapper'
import BondAmortizationExplorer from '../../components/simulations/BondAmortizationExplorer'
import CovenantStressTester from '../../components/simulations/CovenantStressTester'

export default function Zone2() {
  return (
    <div>
      <SimulationWrapper
        title="Bond Pricing & Amortization Explorer"
        description="Set face value, coupon rate, and market rate to see how bonds are priced, whether they sell at premium or discount, and how the effective interest method amortizes the difference over time. Toggle between coupon and zero-coupon bonds."
      >
        <BondAmortizationExplorer />
      </SimulationWrapper>

      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid var(--color-border)' }}>
        <SimulationWrapper
          title="Covenant Stress Tester"
          description="Set your debt structure and covenant thresholds, then drag EBITDA down to see when interest coverage and leverage covenants breach. This is how credit analysts model downside scenarios."
        >
          <CovenantStressTester />
        </SimulationWrapper>
      </div>
    </div>
  )
}
