import { useState, useRef, useEffect, useCallback } from 'react'
import { callAI, getAISettings } from '../../engines/aiClient'
import { formatCurrency } from './FormatCurrency'

interface NumberStoryProps {
  value: number
  label: string
  context?: string
  children: React.ReactNode
}

type PopoverState =
  | { kind: 'closed' }
  | { kind: 'loading' }
  | { kind: 'result'; text: string }
  | { kind: 'error'; message: string }
  | { kind: 'no-key' }

export default function NumberStoryPopover({
  value,
  label,
  context,
  children,
}: NumberStoryProps) {
  const [state, setState] = useState<PopoverState>({ kind: 'closed' })
  const [position, setPosition] = useState<'below' | 'above'>('below')
  const triggerRef = useRef<HTMLSpanElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (state.kind === 'closed') return

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setState({ kind: 'closed' })
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [state.kind])

  // Determine popover position (above or below) based on available space
  useEffect(() => {
    if (state.kind === 'closed' || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    setPosition(spaceBelow < 220 ? 'above' : 'below')
  }, [state.kind])

  const handleClick = useCallback(async () => {
    if (state.kind !== 'closed') {
      setState({ kind: 'closed' })
      return
    }

    const settings = getAISettings()
    if (!settings.apiKey) {
      setState({ kind: 'no-key' })
      return
    }

    setState({ kind: 'loading' })

    const systemPrompt =
      'You are a friendly accounting professor. Explain financial metrics simply and concisely.'

    const prompt = [
      `Explain this financial metric simply:`,
      ``,
      `Metric: ${label}`,
      `Value: ${formatCurrency(value)}`,
      context ? `Context: ${context}` : '',
      ``,
      `In 2-3 sentences, explain what this number means, whether it's good/bad, and what drives it. Use simple language a student would understand.`,
    ]
      .filter(Boolean)
      .join('\n')

    try {
      const text = await callAI(prompt, systemPrompt)
      setState({ kind: 'result', text })
    } catch (err) {
      setState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Failed to get explanation',
      })
    }
  }, [state.kind, label, value, context])

  return (
    <span className="relative inline-block" ref={triggerRef}>
      <span
        role="button"
        tabIndex={0}
        onClick={() => void handleClick()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            void handleClick()
          }
        }}
        className="cursor-pointer underline decoration-dotted decoration-1 underline-offset-2"
        style={{ textDecorationColor: 'var(--color-gold)' }}
        title="Click for AI explanation"
      >
        {children}
      </span>

      {state.kind !== 'closed' && (
        <div
          ref={popoverRef}
          className="absolute z-50 rounded-lg shadow-lg"
          style={{
            width: '18rem',
            left: '50%',
            transform: 'translateX(-50%)',
            ...(position === 'below'
              ? { top: 'calc(100% + 8px)' }
              : { bottom: 'calc(100% + 8px)' }),
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: 10,
              height: 10,
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              ...(position === 'below'
                ? { top: -5, borderTop: '1px solid', borderLeft: '1px solid' }
                : { bottom: -5, borderBottom: '1px solid', borderRight: '1px solid' }),
            }}
          />

          {/* Header */}
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <span
              className="text-xs font-semibold"
              style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}
            >
              Number Story
            </span>
            <button
              type="button"
              onClick={() => setState({ kind: 'closed' })}
              className="text-sm leading-none cursor-pointer"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="Close popover"
            >
              &times;
            </button>
          </div>

          {/* Content */}
          <div className="px-3 py-3">
            {state.kind === 'loading' && (
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full animate-spin"
                  style={{
                    border: '2px solid var(--color-border)',
                    borderTopColor: 'var(--color-accent)',
                  }}
                />
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Asking the professor...
                </span>
              </div>
            )}

            {state.kind === 'result' && (
              <p className="text-sm leading-relaxed m-0" style={{ color: 'var(--color-text)' }}>
                {state.text}
              </p>
            )}

            {state.kind === 'error' && (
              <p className="text-sm m-0 text-red-600">{state.message}</p>
            )}

            {state.kind === 'no-key' && (
              <p className="text-sm m-0" style={{ color: 'var(--color-text-muted)' }}>
                Configure AI in settings to unlock explanations.
              </p>
            )}
          </div>
        </div>
      )}
    </span>
  )
}
