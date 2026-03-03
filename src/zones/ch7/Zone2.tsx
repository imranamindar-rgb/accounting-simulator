import SimulationWrapper from '../../components/shared/SimulationWrapper'
import CFOBridgeBuilder from '../../components/simulations/CFOBridgeBuilder'
export default function Zone2() {
  return (
    <SimulationWrapper title="CFO Bridge Builder" description="Start from Net Income and toggle non-cash add-backs and working capital changes to build the indirect-method cash flow statement from scratch. Watch the CFO/NI ratio — the Beneish fraud signal — update in real time.">
      <CFOBridgeBuilder />
    </SimulationWrapper>
  )
}
