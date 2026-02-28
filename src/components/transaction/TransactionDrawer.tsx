import { useState, useCallback, useEffect, useRef } from 'react'
import { useUIStore } from '../../store/uiStore'
import { useLedgerStore } from '../../store/ledgerStore'
import { TOPICS } from '../../data/topics'
import { TRANSACTION_TEMPLATES } from '../../data/transactionTemplates'
import type { TransactionTemplate, LedgerChange } from '../../engines/types'
import { JournalEntryPreview } from './JournalEntryPreview'
import { InsightPanel } from './InsightPanel'

export function TransactionDrawer() {
  const drawerOpen = useUIStore((s) => s.drawerOpen)
  const toggleDrawer = useUIStore((s) => s.toggleDrawer)
  const selectedTopic = useUIStore((s) => s.selectedTopic)
  const setSelectedTopic = useUIStore((s) => s.setSelectedTopic)
  const unlockedTiers = useUIStore((s) => s.unlockedTiers)

  const selectedCompany = useLedgerStore((s) => s.selectedCompany)
  const recordTransaction = useLedgerStore((s) => s.recordTransaction)
  const ledger = useLedgerStore((s) => s.ledger)

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [params, setParams] = useState<Record<string, number>>({})
  const [lastRecorded, setLastRecorded] = useState<{
    template: TransactionTemplate
    params: Record<string, number>
    changes: LedgerChange[]
  } | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Filter templates by topic
  const filteredTemplates = selectedTopic
    ? TRANSACTION_TEMPLATES.filter((t) => t.topic === selectedTopic)
    : TRANSACTION_TEMPLATES

  // Get the selected template object
  const selectedTemplate = selectedTemplateId
    ? TRANSACTION_TEMPLATES.find((t) => t.id === selectedTemplateId) ?? null
    : null

  // Check if a template is locked
  const isLocked = useCallback(
    (template: TransactionTemplate): boolean => {
      return !!template.tier && !unlockedTiers.has(template.tier)
    },
    [unlockedTiers],
  )

  // When template selection changes, reset params
  useEffect(() => {
    if (selectedTemplate) {
      const initial: Record<string, number> = {}
      for (const p of selectedTemplate.params) {
        if (p.type === 'number') {
          initial[p.key] = 0
        }
      }
      setParams(initial)
      setLastRecorded(null)
    }
  }, [selectedTemplate])

  // Clear success message after a delay
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
      }
    }
  }, [])

  function handleParamChange(key: string, value: string) {
    const num = parseFloat(value)
    setParams((prev) => ({
      ...prev,
      [key]: isNaN(num) ? 0 : num,
    }))
  }

  function handleRecord() {
    if (!selectedTemplate || !selectedCompany) return

    // Take before-snapshot for account changes
    const beforeSnapshot = new Map<string, number>()
    for (const d of selectedTemplate.debits) {
      try {
        const acct = ledger.getAccount(d.account)
        beforeSnapshot.set(d.account, acct.balance)
      } catch {
        beforeSnapshot.set(d.account, 0)
      }
    }
    for (const c of selectedTemplate.credits) {
      try {
        const acct = ledger.getAccount(c.account)
        beforeSnapshot.set(c.account, acct.balance)
      } catch {
        beforeSnapshot.set(c.account, 0)
      }
    }

    // Record the transaction
    recordTransaction(selectedTemplate.id, params)

    // Build changes array for the InsightPanel
    const changes: LedgerChange[] = []
    const allAccounts = [
      ...selectedTemplate.debits.map((d) => d.account),
      ...selectedTemplate.credits.map((c) => c.account),
    ]
    const seen = new Set<string>()
    for (const accountName of allAccounts) {
      if (seen.has(accountName)) continue
      seen.add(accountName)

      const before = beforeSnapshot.get(accountName) ?? 0
      let after = before
      try {
        const acct = ledger.getAccount(accountName)
        after = acct.balance
      } catch {
        // leave as before
      }

      const isDebit = selectedTemplate.debits.some((d) => d.account === accountName)
      changes.push({
        account: accountName,
        side: isDebit ? 'debit' : 'credit',
        amount: Math.abs(after - before),
        before,
        after,
      })
    }

    setLastRecorded({
      template: selectedTemplate,
      params: { ...params },
      changes,
    })

    // Show success message
    setSuccessMessage('Transaction recorded successfully!')
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current)
    }
    successTimeoutRef.current = setTimeout(() => {
      setSuccessMessage(null)
    }, 3000)

    // Reset param values for next transaction
    const resetParams: Record<string, number> = {}
    for (const p of selectedTemplate.params) {
      if (p.type === 'number') {
        resetParams[p.key] = 0
      }
    }
    setParams(resetParams)
  }

  // Can record? All number params must be > 0
  const canRecord =
    !!selectedTemplate &&
    !!selectedCompany &&
    selectedTemplate.params
      .filter((p) => p.type === 'number')
      .every((p) => (params[p.key] ?? 0) > 0)

  // Also check debits/credits balance
  const totalDebits = selectedTemplate
    ? selectedTemplate.debits.reduce((sum, d) => sum + (params[d.param] || 0), 0)
    : 0
  const totalCredits = selectedTemplate
    ? selectedTemplate.credits.reduce((sum, c) => sum + (params[c.param] || 0), 0)
    : 0
  const isBalanced = totalDebits === totalCredits && totalDebits > 0

  function handleTopicChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedTopic(e.target.value || null)
    setSelectedTemplateId(null)
  }

  function handleTemplateChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value || null
    if (id) {
      const tmpl = TRANSACTION_TEMPLATES.find((t) => t.id === id)
      if (tmpl && isLocked(tmpl)) return
    }
    setSelectedTemplateId(id)
  }

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && drawerOpen) {
        toggleDrawer()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [drawerOpen, toggleDrawer])

  return (
    <>
      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 transition-opacity duration-300"
          style={{ background: 'rgba(0, 0, 0, 0.3)' }}
          onClick={toggleDrawer}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-40 overflow-y-auto"
        style={{
          width: '400px',
          maxWidth: '100vw',
          background: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          boxShadow: drawerOpen ? '-4px 0 24px rgba(0, 0, 0, 0.15)' : 'none',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms ease-in-out',
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-4 py-3"
          style={{
            background: 'linear-gradient(135deg, #4A0A12 0%, #6B0F1A 100%)',
            color: '#FAF0D4',
          }}
        >
          <span
            className="font-semibold"
            style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}
          >
            Record Transaction
          </span>
          <button
            type="button"
            onClick={toggleDrawer}
            className="rounded p-1 cursor-pointer transition-colors"
            style={{
              color: '#FAF0D4',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              fontSize: '1.1rem',
              lineHeight: 1,
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            }}
          >
            {'\u2715'}
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* No company loaded */}
          {!selectedCompany && (
            <div
              className="rounded-lg p-4 text-center"
              style={{
                background: 'var(--color-base)',
                border: '1px dashed var(--color-border)',
                color: 'var(--color-text-muted)',
                fontSize: '0.85rem',
              }}
            >
              Please select a company from the toolbar to record transactions.
            </div>
          )}

          {selectedCompany && (
            <>
              {/* Topic Filter */}
              <div>
                <label
                  className="block mb-1 font-semibold"
                  style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}
                >
                  Topic
                </label>
                <select
                  value={selectedTopic ?? ''}
                  onChange={handleTopicChange}
                  className="w-full rounded-md px-3 py-2 cursor-pointer"
                  style={{
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                >
                  <option value="">All Topics</option>
                  {TOPICS.map((t) => (
                    <option key={t.id} value={t.id}>
                      Ch.{t.chapter}: {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Selector */}
              <div>
                <label
                  className="block mb-1 font-semibold"
                  style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}
                >
                  Transaction
                </label>
                <select
                  value={selectedTemplateId ?? ''}
                  onChange={handleTemplateChange}
                  className="w-full rounded-md px-3 py-2 cursor-pointer"
                  style={{
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                >
                  <option value="">-- Select a transaction --</option>
                  {filteredTemplates.map((t) => {
                    const locked = isLocked(t)
                    return (
                      <option
                        key={t.id}
                        value={t.id}
                        disabled={locked}
                        style={{
                          color: locked ? '#999' : 'var(--color-text)',
                        }}
                      >
                        {locked ? '\uD83D\uDD12 ' : ''}{t.name} &mdash; {t.description}
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Selected template description */}
              {selectedTemplate && (
                <div
                  className="rounded-md px-3 py-2"
                  style={{
                    background: 'var(--color-base)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.82rem',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {selectedTemplate.description}
                </div>
              )}

              {/* Parameter Inputs */}
              {selectedTemplate && (
                <div className="space-y-3">
                  <div
                    className="font-semibold"
                    style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}
                  >
                    Parameters
                  </div>
                  {selectedTemplate.params.map((p) => (
                    <div key={p.key}>
                      <label
                        className="block mb-1"
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--color-text)',
                          fontWeight: 500,
                        }}
                      >
                        {p.label}
                      </label>
                      {p.type === 'number' && (
                        <div className="relative">
                          <span
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                            style={{
                              color: 'var(--color-text-muted)',
                              fontSize: '0.85rem',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            $
                          </span>
                          <input
                            type="number"
                            min={0}
                            step={100}
                            value={params[p.key] || ''}
                            onChange={(e) => handleParamChange(p.key, e.target.value)}
                            placeholder="0"
                            className="w-full rounded-md py-2 pr-3"
                            style={{
                              paddingLeft: '1.5rem',
                              border: '1px solid var(--color-border)',
                              background: 'var(--color-surface)',
                              color: 'var(--color-text)',
                              fontSize: '0.9rem',
                              fontFamily: 'var(--font-mono)',
                              outline: 'none',
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = 'var(--color-gold)'
                              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(218, 165, 32, 0.15)'
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = 'var(--color-border)'
                              e.currentTarget.style.boxShadow = 'none'
                            }}
                          />
                        </div>
                      )}
                      {p.type === 'text' && (
                        <input
                          type="text"
                          value={params[p.key] ?? ''}
                          onChange={(e) => handleParamChange(p.key, e.target.value)}
                          className="w-full rounded-md px-3 py-2"
                          style={{
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-surface)',
                            color: 'var(--color-text)',
                            fontSize: '0.85rem',
                            outline: 'none',
                          }}
                        />
                      )}
                      {p.type === 'select' && p.options && (
                        <select
                          value={params[p.key] ?? ''}
                          onChange={(e) => handleParamChange(p.key, e.target.value)}
                          className="w-full rounded-md px-3 py-2 cursor-pointer"
                          style={{
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-surface)',
                            color: 'var(--color-text)',
                            fontSize: '0.85rem',
                            outline: 'none',
                          }}
                        >
                          <option value="">-- Select --</option>
                          {p.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Journal Entry Preview */}
              {selectedTemplate && (
                <JournalEntryPreview template={selectedTemplate} params={params} />
              )}

              {/* Explanation callout */}
              {selectedTemplate && (
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: '#FFFBF0',
                    border: '1px solid #E8D5B7',
                    fontSize: '0.8rem',
                    color: 'var(--color-text)',
                    lineHeight: '1.5',
                  }}
                >
                  <div
                    className="font-semibold mb-1"
                    style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}
                  >
                    Explanation
                  </div>
                  {selectedTemplate.explanation}
                </div>
              )}

              {/* Success message */}
              {successMessage && (
                <div
                  className="rounded-md px-3 py-2 text-center font-semibold"
                  style={{
                    background: '#D4EDDA',
                    border: '1px solid #C3E6CB',
                    color: '#155724',
                    fontSize: '0.85rem',
                  }}
                >
                  {successMessage}
                </div>
              )}

              {/* Record Button */}
              {selectedTemplate && (
                <button
                  type="button"
                  onClick={handleRecord}
                  disabled={!canRecord || !isBalanced}
                  className="w-full rounded-md py-2.5 font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: canRecord && isBalanced ? 'var(--color-accent)' : '#999',
                    color: '#FFFFFF',
                    fontSize: '0.9rem',
                    border: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (canRecord && isBalanced) {
                      e.currentTarget.style.background = 'var(--color-accent-light)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (canRecord && isBalanced) {
                      e.currentTarget.style.background = 'var(--color-accent)'
                    }
                  }}
                >
                  Record Transaction
                </button>
              )}

              {/* Insight Panel (after recording) */}
              {lastRecorded && (
                <InsightPanel
                  template={lastRecorded.template}
                  params={lastRecorded.params}
                  changes={lastRecorded.changes}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
