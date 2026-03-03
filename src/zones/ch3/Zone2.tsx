import SimulationWrapper from '../../components/shared/SimulationWrapper'
import SimulationPlayer from '../../components/simulation/SimulationPlayer'

export default function Zone2() {
  return (
    <SimulationWrapper
      title="Inventory & COGS Simulation"
      description="Explore the 'Inventory & COGS' scenarios. Watch how FIFO vs LIFO choices affect both the income statement (COGS) and balance sheet (ending inventory value) simultaneously."
    >
      <SimulationPlayer />
    </SimulationWrapper>
  )
}
