import { useState } from 'react'
import type { PredictionPromptData } from '../../data/conceptTypes'
import { useProgressStore } from '../../store/progressStore'

interface PredictionPromptProps {
  prompt: PredictionPromptData
  chapterId: number
  zoneId: number
}

type AnswerState =
  | { kind: 'unanswered' }
  | { kind: 'answered'; selectedId: string; wasCorrect: boolean }

const OPTION_LABELS = ['A', 'B', 'C'] as const

export default function PredictionPrompt({ prompt, chapterId, zoneId }: PredictionPromptProps) {
  const [state, setState] = useState<AnswerState>({ kind: 'unanswered' })
  const [revealCorrect, setRevealCorrect] = useState(false)
  const recordPrediction = useProgressStore(s => s.recordPrediction)

  function handleSelect(optionId: string) {
    if (state.kind === 'answered') return

    const option = prompt.options.find(o => o.id === optionId)
    if (!option) return

    const wasCorrect = option.correct

    recordPrediction({
      id: `ch${chapterId}-z${zoneId}-${optionId}-${Date.now()}`,
      chapterId,
      zoneId,
      prediction: optionId,
      wasCorrect,
      timestamp: Date.now(),
    })

    setState({ kind: 'answered', selectedId: optionId, wasCorrect })
  }

  const answered = state.kind === 'answered'

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '0.5rem',
        padding: '1.25rem',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-gold)',
          fontFamily: 'var(--font-mono)',
          marginBottom: '0.6rem',
        }}
      >
        Prediction Check
      </div>

      {/* Question */}
      <p
        style={{
          fontSize: '0.9rem',
          fontWeight: 600,
          color: 'var(--color-text)',
          lineHeight: 1.5,
          margin: '0 0 1rem',
          fontFamily: 'var(--font-display)',
        }}
      >
        {prompt.question}
      </p>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {prompt.options.map((option, idx) => {
          const label = OPTION_LABELS[idx] ?? String.fromCharCode(65 + idx)
          const isSelected = answered && state.selectedId === option.id
          const isCorrect = option.correct
          const showAsCorrect = answered && (revealCorrect || isSelected) && isCorrect
          const showAsWrong = answered && isSelected && !isCorrect

          let borderColor = 'var(--color-border)'
          let bgColor = 'transparent'
          let textColor = 'var(--color-text)'

          if (showAsCorrect) {
            borderColor = '#2D6A4F'
            bgColor = 'rgba(45,106,79,0.08)'
            textColor = '#1b4332'
          } else if (showAsWrong) {
            borderColor = '#991b1b'
            bgColor = 'rgba(153,27,27,0.08)'
            textColor = '#7c2d12'
          } else if (answered && !isSelected) {
            textColor = 'var(--color-text-muted)'
          }

          return (
            <div key={option.id}>
              <button
                type="button"
                disabled={answered}
                onClick={() => handleSelect(option.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  background: bgColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '0.375rem',
                  cursor: answered ? 'default' : 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.15s',
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: '1.375rem',
                    height: '1.375rem',
                    borderRadius: '50%',
                    background: showAsCorrect
                      ? '#2D6A4F'
                      : showAsWrong
                        ? '#991b1b'
                        : 'var(--color-accent)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontSize: '0.84rem',
                    color: textColor,
                    lineHeight: 1.5,
                    paddingTop: '0.1rem',
                  }}
                >
                  {option.text}
                </span>
              </button>

              {/* Explanation */}
              {answered && (isSelected || (revealCorrect && isCorrect)) && (
                <div
                  style={{
                    marginTop: '0.35rem',
                    padding: '0.5rem 0.75rem',
                    background: isCorrect
                      ? 'rgba(45,106,79,0.06)'
                      : 'rgba(153,27,27,0.06)',
                    border: `1px solid ${isCorrect ? 'rgba(45,106,79,0.2)' : 'rgba(153,27,27,0.2)'}`,
                    borderRadius: '0.375rem',
                    fontSize: '0.78rem',
                    color: isCorrect ? '#1b4332' : '#7c2d12',
                    lineHeight: 1.55,
                  }}
                >
                  {option.explanation}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Post-answer controls */}
      {answered && (
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: state.wasCorrect ? '#2D6A4F' : '#991b1b',
            }}
          >
            {state.wasCorrect ? 'Correct!' : 'Incorrect'}
          </span>

          {!state.wasCorrect && !revealCorrect && (
            <button
              type="button"
              onClick={() => setRevealCorrect(true)}
              style={{
                padding: '0.3rem 0.75rem',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Reveal Answer
            </button>
          )}
        </div>
      )}
    </div>
  )
}
