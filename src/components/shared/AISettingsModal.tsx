import { useState, useEffect, useCallback } from 'react'
import type { AISettings } from '../../engines/aiClient'
import { getAISettings, saveAISettings, callAI, clearAICache } from '../../engines/aiClient'

const OPENAI_MODELS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
]

const ANTHROPIC_MODELS = [
  { value: 'claude-sonnet-4-5-20250514', label: 'Claude Sonnet 4.5' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
  { value: 'claude-opus-4-5-20250514', label: 'Claude Opus 4.5' },
]

interface AISettingsModalProps {
  open: boolean
  onClose: () => void
}

export default function AISettingsModal({ open, onClose }: AISettingsModalProps) {
  const [settings, setSettings] = useState<AISettings>(getAISettings)
  const [showKey, setShowKey] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState('')

  useEffect(() => {
    if (open) {
      setSettings(getAISettings())
      setTestStatus('idle')
      setTestMessage('')
      setShowKey(false)
    }
  }, [open])

  const models = settings.provider === 'anthropic' ? ANTHROPIC_MODELS : OPENAI_MODELS

  // Reset model when switching provider
  function handleProviderChange(provider: AISettings['provider']) {
    const defaultModel = provider === 'anthropic' ? 'claude-sonnet-4-5-20250514' : 'gpt-4o-mini'
    setSettings((prev) => ({ ...prev, provider, model: defaultModel }))
  }

  function handleSave() {
    saveAISettings(settings)
    clearAICache()
    onClose()
  }

  const handleTestConnection = useCallback(async () => {
    setTestStatus('loading')
    setTestMessage('')

    // Temporarily save settings so callAI picks them up
    const previousSettings = getAISettings()
    saveAISettings(settings)

    try {
      const result = await callAI('Say "Connection successful!" in exactly those words.')
      if (result) {
        setTestStatus('success')
        setTestMessage('Connection successful!')
      }
    } catch (err) {
      setTestStatus('error')
      setTestMessage(err instanceof Error ? err.message : 'Unknown error')
      // Restore previous settings on failure
      saveAISettings(previousSettings)
    }
  }, [settings])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose],
  )

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
      onClick={handleBackdropClick}
    >
      <div
        className="rounded-lg shadow-xl w-full max-w-md mx-4"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          fontFamily: 'var(--font-body)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent)' }}
          >
            AI Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xl leading-none cursor-pointer"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-5">
          {/* Provider selector */}
          <fieldset>
            <legend
              className="text-sm font-medium mb-2 block"
              style={{ color: 'var(--color-text)' }}
            >
              Provider
            </legend>
            <div className="flex gap-4">
              {(['openai', 'anthropic'] as const).map((p) => (
                <label
                  key={p}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                  style={{ color: 'var(--color-text)' }}
                >
                  <input
                    type="radio"
                    name="ai-provider"
                    checked={settings.provider === p}
                    onChange={() => handleProviderChange(p)}
                    className="accent-[var(--color-accent)]"
                  />
                  {p === 'openai' ? 'OpenAI' : 'Anthropic'}
                </label>
              ))}
            </div>
          </fieldset>

          {/* API Key */}
          <div>
            <label
              className="text-sm font-medium mb-1 block"
              style={{ color: 'var(--color-text)' }}
              htmlFor="ai-api-key"
            >
              API Key
            </label>
            <div className="flex gap-2">
              <input
                id="ai-api-key"
                type={showKey ? 'text' : 'password'}
                value={settings.apiKey}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, apiKey: e.target.value }))
                }
                placeholder={
                  settings.provider === 'openai' ? 'sk-...' : 'sk-ant-...'
                }
                className="flex-1 rounded px-3 py-1.5 text-sm outline-none"
                style={{
                  border: '1px solid var(--color-border)',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text)',
                  background: 'var(--color-base)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey((prev) => !prev)}
                className="rounded px-3 py-1.5 text-sm cursor-pointer"
                style={{
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-muted)',
                  background: 'var(--color-surface)',
                }}
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Model selector */}
          <div>
            <label
              className="text-sm font-medium mb-1 block"
              style={{ color: 'var(--color-text)' }}
              htmlFor="ai-model"
            >
              Model
            </label>
            <select
              id="ai-model"
              value={settings.model}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, model: e.target.value }))
              }
              className="w-full rounded px-3 py-1.5 text-sm outline-none cursor-pointer"
              style={{
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                background: 'var(--color-base)',
              }}
            >
              {models.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Test connection */}
          <div>
            <button
              type="button"
              onClick={() => void handleTestConnection()}
              disabled={!settings.apiKey || testStatus === 'loading'}
              className="rounded px-4 py-1.5 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--color-accent)',
                color: '#FAF0D4',
                fontWeight: 500,
              }}
            >
              {testStatus === 'loading' ? 'Testing...' : 'Test Connection'}
            </button>
            {testStatus === 'success' && (
              <span className="ml-3 text-sm" style={{ color: 'var(--color-green)' }}>
                {testMessage}
              </span>
            )}
            {testStatus === 'error' && (
              <span className="ml-3 text-sm text-red-600">
                {testMessage}
              </span>
            )}
          </div>

          {/* Privacy note */}
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Your API key is stored locally and never sent to our servers.
          </p>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-3 px-5 py-3"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="rounded px-4 py-1.5 text-sm cursor-pointer"
            style={{
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              background: 'var(--color-surface)',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded px-4 py-1.5 text-sm cursor-pointer"
            style={{
              background: 'var(--color-accent)',
              color: '#FAF0D4',
              fontWeight: 600,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
