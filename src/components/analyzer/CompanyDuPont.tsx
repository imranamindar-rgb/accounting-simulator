/**
 * CompanyDuPont -- DuPont decomposition panel for the Live Company Analyzer.
 *
 * Reads dupont and roe from useAnalyzerStore and renders the existing
 * DuPontChart component with a titled wrapper card.
 */

import DuPontChart from '../analysis/DuPontChart'
import { useAnalyzerStore } from '../../store/analyzerStore'

// ── Component ────────────────────────────────────────────────────────

export default function CompanyDuPont() {
  const ratios = useAnalyzerStore((s) => s.ratios)

  if (!ratios) return null

  return (
    <div>
      {/* Section header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
          paddingBottom: 6,
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--color-text)',
            margin: 0,
          }}
        >
          DuPont Analysis
        </h3>
      </div>

      {/* DuPontChart from the shared analysis components */}
      <DuPontChart
        dupont={ratios.dupont}
        roe={ratios.roe}
      />
    </div>
  )
}
