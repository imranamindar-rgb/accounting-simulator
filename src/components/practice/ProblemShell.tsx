import { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Problem, ProblemOption } from '../../data/chapterProblems'
import { useProgressStore } from '../../store/progressStore'
import { CHAPTERS } from '../../data/toc'

interface ProblemShellProps {
  problems: Problem[]
  zoneId: 3 | 4
  title: string
  subtitle: string
}

interface ProblemState {
  selectedOption: string | null
  submitted: boolean
  hintsRevealed: number
  answered: boolean
  calcInput: string
  calcSubmitted: boolean
}

function defaultState(): ProblemState {
  return { selectedOption: null, submitted: false, hintsRevealed: 0, answered: false, calcInput: '', calcSubmitted: false }
}

function OptionButton({ option, selected, submitted, onSelect }: {
  option: ProblemOption
  selected: boolean
  submitted: boolean
  onSelect: () => void
}) {
  let bg = 'var(--color-surface)'
  let border = 'var(--color-border)'
  let textColor = 'var(--color-text)'

  if (submitted) {
    if (option.correct) { bg = '#1b433218'; border = '#1b4332'; textColor = '#1b4332' }
    else if (selected && !option.correct) { bg = '#dc262618'; border = '#dc2626'; textColor = '#dc2626' }
  } else if (selected) {
    bg = 'rgba(74,10,18,0.06)'; border = 'var(--color-accent)'; textColor = 'var(--color-accent)'
  }

  return (
    <button
      onClick={submitted ? undefined : onSelect}
      disabled={submitted}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
        width: '100%', textAlign: 'left', padding: '0.75rem 1rem',
        background: bg, border: `1px solid ${border}`, borderRadius: '0.5rem',
        cursor: submitted ? 'default' : 'pointer', color: textColor,
        fontFamily: 'var(--font-body)', fontSize: '0.83rem', lineHeight: 1.55,
        transition: 'all 0.15s',
      }}
    >
      <span style={{
        flexShrink: 0, width: '1.25rem', height: '1.25rem', borderRadius: '50%',
        border: `1.5px solid ${submitted && option.correct ? '#1b4332' : submitted && selected ? '#dc2626' : border}`,
        background: selected ? (submitted && option.correct ? '#1b4332' : submitted ? '#dc2626' : 'var(--color-accent)') : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: '0.6rem', fontWeight: 700, marginTop: '1px',
      }}>
        {submitted && option.correct ? '✓' : submitted && selected ? '✗' : option.id.toUpperCase()}
      </span>
      {option.text}
    </button>
  )
}

function SingleProblem({ problem, chapterId, zoneId, color, index, total }: {
  problem: Problem; chapterId: number; zoneId: 3 | 4; color: string; index: number; total: number
}) {
  const [state, setState] = useState<ProblemState>(defaultState())
  const recordAttempt = useProgressStore(s => s.recordAttempt)

  const isCorrect = problem.type === 'multiple-choice'
    ? problem.options?.find(o => o.id === state.selectedOption)?.correct ?? false
    : Math.abs(Number(state.calcInput) - (problem.answer ?? 0)) / (problem.answer ?? 1) < 0.02  // 2% tolerance

  const submitted = state.submitted || state.calcSubmitted
  const selectedOption = problem.options?.find(o => o.id === state.selectedOption)

  const handleSubmit = () => {
    const correct = isCorrect
    recordAttempt(chapterId, zoneId, correct, state.hintsRevealed)
    if (problem.type === 'multiple-choice') setState(s => ({ ...s, submitted: true, answered: true }))
    else setState(s => ({ ...s, calcSubmitted: true, answered: true }))
  }

  const difficultyColor = ['', '#1b4332', '#d97706', '#dc2626'][problem.difficulty]
  const difficultyLabel = ['', 'Foundational', 'Intermediate', 'Advanced'][problem.difficulty]

  return (
    <div style={{
      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
      borderRadius: '0.75rem', overflow: 'hidden', marginBottom: '1.5rem',
    }}>
      {/* Header */}
      <div style={{
        padding: '0.875rem 1.25rem', background: `${color}08`,
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
            color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            Q{index + 1} / {total}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
            color, textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {problem.concept}
          </span>
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.6rem', padding: '2px 8px',
          borderRadius: '9999px', background: `${difficultyColor}18`, color: difficultyColor, fontWeight: 600,
        }}>
          {difficultyLabel}
        </span>
      </div>

      {/* Question */}
      <div style={{ padding: '1.125rem 1.25rem' }}>
        <p style={{ margin: '0 0 1rem', fontSize: '0.88rem', color: 'var(--color-text)', lineHeight: 1.7, fontWeight: 500 }}>
          {problem.question}
        </p>

        {/* Multiple choice options */}
        {problem.type === 'multiple-choice' && problem.options && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {problem.options.map(opt => (
              <OptionButton
                key={opt.id} option={opt}
                selected={state.selectedOption === opt.id}
                submitted={state.submitted}
                onSelect={() => !state.submitted && setState(s => ({ ...s, selectedOption: opt.id }))}
              />
            ))}
          </div>
        )}

        {/* Calculation input */}
        {problem.type === 'calculation' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <input
              type="number"
              value={state.calcInput}
              onChange={e => setState(s => ({ ...s, calcInput: e.target.value }))}
              disabled={state.calcSubmitted}
              placeholder="Your answer"
              style={{
                padding: '0.5rem 0.875rem', borderRadius: '0.5rem',
                border: state.calcSubmitted
                  ? `1px solid ${isCorrect ? '#1b4332' : '#dc2626'}`
                  : '1px solid var(--color-border)',
                fontFamily: 'var(--font-mono)', fontSize: '0.88rem',
                background: state.calcSubmitted ? (isCorrect ? '#1b433210' : '#dc262610') : 'var(--color-base)',
                color: 'var(--color-text)', width: '140px',
              }}
            />
            {problem.unit && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                {problem.unit}
              </span>
            )}
            {state.calcSubmitted && (
              <span style={{ fontSize: '0.8rem', color: isCorrect ? '#1b4332' : '#dc2626', fontWeight: 600 }}>
                {isCorrect ? '✓ Correct!' : `✗ Expected: ${problem.answer} ${problem.unit ?? ''}`}
              </span>
            )}
          </div>
        )}

        {/* Feedback after submission */}
        {state.submitted && selectedOption && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem',
            background: isCorrect ? '#1b433212' : '#dc262612',
            border: `1px solid ${isCorrect ? '#1b433230' : '#dc262630'}`,
            fontSize: '0.82rem', color: 'var(--color-text)', lineHeight: 1.65,
          }}>
            <strong style={{ color: isCorrect ? '#1b4332' : '#dc2626' }}>
              {isCorrect ? '✓ Correct — ' : '✗ Not quite — '}
            </strong>
            {selectedOption.explanation}
          </div>
        )}

        {/* Hints */}
        {problem.hints.length > 0 && !submitted && (
          <div style={{ marginBottom: '1rem' }}>
            {state.hintsRevealed < problem.hints.length && (
              <button
                onClick={() => setState(s => ({ ...s, hintsRevealed: s.hintsRevealed + 1 }))}
                style={{
                  padding: '0.375rem 0.875rem', borderRadius: '0.375rem',
                  border: '1px solid var(--color-border)', background: 'transparent',
                  color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)',
                  fontSize: '0.75rem', cursor: 'pointer',
                }}
              >
                Reveal Hint {state.hintsRevealed + 1} of {problem.hints.length}
              </button>
            )}
            {state.hintsRevealed > 0 && (
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {problem.hints.slice(0, state.hintsRevealed).map((hint, i) => (
                  <div key={i} style={{
                    padding: '0.5rem 0.75rem', borderRadius: '0.375rem',
                    background: 'rgba(74,10,18,0.04)', border: '1px solid rgba(74,10,18,0.12)',
                    fontSize: '0.8rem', color: 'var(--color-text-muted)',
                  }}>
                    <span style={{ color: 'var(--color-accent)', fontWeight: 600, marginRight: '0.375rem' }}>Hint {i + 1}:</span>
                    {hint}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Submit button */}
        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={problem.type === 'multiple-choice' ? !state.selectedOption : !state.calcInput}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none',
              background: color, color: '#fff', fontFamily: 'var(--font-body)',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', opacity: (problem.type === 'multiple-choice' ? !state.selectedOption : !state.calcInput) ? 0.45 : 1,
            }}
          >
            Submit Answer
          </button>
        )}

        {/* Solution (shown after submission) */}
        {submitted && (
          <details style={{ marginTop: '0.875rem' }}>
            <summary style={{
              cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
              color: 'var(--color-accent)', fontFamily: 'var(--font-body)', userSelect: 'none',
            }}>
              Full Solution Walkthrough
            </summary>
            <div style={{
              marginTop: '0.5rem', padding: '0.875rem 1rem',
              background: 'var(--color-base)', borderRadius: '0.5rem',
              border: '1px solid var(--color-border)',
              fontSize: '0.82rem', color: 'var(--color-text)', lineHeight: 1.7,
            }}>
              {problem.solution}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}

export default function ProblemShell({ problems, zoneId, title, subtitle }: ProblemShellProps) {
  const { id = '1' } = useParams<{ id: string }>()
  const chapterId = Number(id)
  const chapter = CHAPTERS.find(c => c.id === chapterId)
  const markVisited = useProgressStore(s => s.markVisited)
  const color = chapter?.color ?? 'var(--color-accent)'

  // Mark zone visited on mount
  useState(() => {
    markVisited(chapterId, zoneId)
  })

  return (
    <div style={{ maxWidth: '720px' }}>
      {/* Zone header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.25rem',
        }}>
          Zone {zoneId} · {zoneId === 3 ? 'Practice' : 'Mastery'}
        </div>
        <h2 style={{ margin: '0 0 0.25rem', fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-accent)' }}>
          {title}
        </h2>
        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
          {subtitle}
        </p>
      </div>

      {/* Problems */}
      {problems.map((p, i) => (
        <SingleProblem
          key={p.id} problem={p} chapterId={chapterId} zoneId={zoneId}
          color={color} index={i} total={problems.length}
        />
      ))}
    </div>
  )
}
