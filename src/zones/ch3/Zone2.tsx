import SimulationWrapper from '../../components/shared/SimulationWrapper'
import InventoryCostComparator from '../../components/simulations/InventoryCostComparator'
export default function Zone2() {
  return (
    <SimulationWrapper title="Inventory Cost Flow Comparator" description="Enter purchase lots and units sold to see FIFO, LIFO, and Weighted Average Cost methods side by side. See how cost flow assumptions change COGS, gross profit, and ending inventory — with identical underlying economics.">
      <InventoryCostComparator />
    </SimulationWrapper>
  )
}
