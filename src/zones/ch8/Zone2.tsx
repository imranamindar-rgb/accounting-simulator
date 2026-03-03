import SimulationWrapper from '../../components/shared/SimulationWrapper'
import DuPontExplorer from '../../components/simulations/DuPontExplorer'
export default function Zone2() {
  return (
    <SimulationWrapper title="DuPont Analysis Explorer" description="Decompose Return on Equity into its three drivers. Adjust the sliders to see how margin, efficiency, and leverage each contribute — and use the presets to explore real companies.">
      <DuPontExplorer />
    </SimulationWrapper>
  )
}
