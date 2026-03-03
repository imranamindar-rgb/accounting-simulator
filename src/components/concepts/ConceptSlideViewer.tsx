import { useState } from 'react'
import type { ConceptSlide, FraudCase } from '../../data/conceptTypes'
import FraudSpotlight from './FraudSpotlight'
import PredictionPrompt from './PredictionPrompt'

interface ConceptSlideViewerProps {
  slides: ConceptSlide[]
  fraudCases: FraudCase[]
  skepticsLens: string[]
  chapterId: number
  zoneId?: number
}

type Tab = 'slides' | 'fraud' | 'skeptic'

function DeepDivePanel({ deepDive }: { deepDive: NonNullable<ConceptSlide['deepDive']> }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{
        marginTop: '1.25rem',
        border: '1px solid var(--color-border)',
        borderRadius: '0.375rem',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.6rem 1rem',
          background: open ? 'rgba(74,10,18,0.05)' : 'var(--color-surface)',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--color-accent)',
          textAlign: 'left',
        }}
      >
        <span>Deep Dive</span>
        <span
          style={{
            fontSize: '0.7rem',
            color: 'var(--color-text-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            display: 'inline-block',
            transition: 'transform 0.2s',
          }}
        >
          &#9660;
        </span>
      </button>

      {open && (
        <div
          style={{
            padding: '1rem',
            background: 'rgba(74,10,18,0.02)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {/* Body paragraphs */}
          {deepDive.body.map((paragraph, i) => (
            <p
              key={i}
              style={{
                fontSize: '0.83rem',
                color: 'var(--color-text)',
                lineHeight: 1.7,
                margin: i === 0 ? '0 0 0.75rem' : '0.75rem 0',
              }}
            >
              {paragraph}
            </p>
          ))}

          {/* Key Insights */}
          <div style={{ marginTop: '0.875rem' }}>
            <div
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                fontFamily: 'var(--font-mono)',
                marginBottom: '0.4rem',
              }}
            >
              Key Insights
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 1.25rem' }}>
              {deepDive.keyInsights.map((insight, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--color-text)',
                    lineHeight: 1.6,
                    marginBottom: '0.25rem',
                  }}
                >
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          {/* Real-World Example */}
          <div
            style={{
              marginTop: '0.875rem',
              padding: '0.6rem 0.875rem',
              background: 'rgba(218,165,32,0.08)',
              border: '1px solid rgba(218,165,32,0.3)',
              borderRadius: '0.375rem',
            }}
          >
            <div
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                fontFamily: 'var(--font-mono)',
                marginBottom: '0.35rem',
              }}
            >
              Real-World Example
            </div>
            <p
              style={{
                fontSize: '0.82rem',
                color: 'var(--color-text)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {deepDive.realWorldExample}
            </p>
          </div>

          {/* Common Mistakes */}
          <div style={{ marginTop: '0.875rem' }}>
            <div
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#991b1b',
                fontFamily: 'var(--font-mono)',
                marginBottom: '0.4rem',
              }}
            >
              Common Mistakes
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 1.25rem' }}>
              {deepDive.commonMistakes.map((mistake, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--color-text)',
                    lineHeight: 1.6,
                    marginBottom: '0.25rem',
                  }}
                >
                  {mistake}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

function SlideContent({
  slide,
  chapterId,
  zoneId,
}: {
  slide: ConceptSlide
  chapterId: number
  zoneId: number
}) {
  return (
    <div>
      {/* Section label */}
      <div
        style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-mono)',
          marginBottom: '0.4rem',
        }}
      >
        {slide.sectionLabel}
      </div>

      {/* Title */}
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.35rem',
          fontWeight: 700,
          color: 'var(--color-accent)',
          margin: '0 0 0.875rem',
          lineHeight: 1.25,
        }}
      >
        {slide.title}
      </h2>

      {/* Explanation */}
      <p
        style={{
          fontSize: '0.9rem',
          color: 'var(--color-text)',
          lineHeight: 1.75,
          margin: '0 0 1rem',
        }}
      >
        {slide.explanation}
      </p>

      {/* Formula */}
      {slide.formula && (
        <div
          style={{
            background: 'rgba(74,10,18,0.05)',
            border: '1px solid rgba(74,10,18,0.15)',
            borderRadius: '0.375rem',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '1rem',
            color: 'var(--color-accent)',
            fontWeight: 600,
            textAlign: 'center',
            letterSpacing: '0.02em',
          }}
        >
          {slide.formula}
        </div>
      )}

      {/* Diagram placeholder */}
      {slide.diagram && (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px dashed var(--color-border)',
            borderRadius: '0.375rem',
            padding: '1.5rem',
            marginBottom: '1rem',
            textAlign: 'center',
            fontSize: '0.82rem',
            color: 'var(--color-text-muted)',
            fontStyle: 'italic',
          }}
        >
          {slide.diagram}
        </div>
      )}

      {/* Highlights */}
      {slide.highlights && slide.highlights.length > 0 && (
        <ul
          style={{
            margin: '0 0 1rem',
            padding: '0 0 0 1.25rem',
          }}
        >
          {slide.highlights.map((h, i) => (
            <li
              key={i}
              style={{
                fontSize: '0.85rem',
                color: 'var(--color-text)',
                lineHeight: 1.65,
                marginBottom: '0.35rem',
              }}
            >
              {h}
            </li>
          ))}
        </ul>
      )}

      {/* Deep Dive */}
      {slide.deepDive && <DeepDivePanel deepDive={slide.deepDive} />}

      {/* Prediction Prompt */}
      {slide.predictionPrompt && (
        <div style={{ marginTop: '1.25rem' }}>
          <PredictionPrompt
            prompt={slide.predictionPrompt}
            chapterId={chapterId}
            zoneId={zoneId}
          />
        </div>
      )}
    </div>
  )
}

function SkepticLens({ questions }: { questions: string[] }) {
  return (
    <div>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.1rem',
          fontWeight: 700,
          color: 'var(--color-accent)',
          margin: '0 0 0.5rem',
        }}
      >
        The Skeptic's Lens
      </h3>
      <p
        style={{
          fontSize: '0.82rem',
          color: 'var(--color-text-muted)',
          margin: '0 0 1rem',
          lineHeight: 1.55,
        }}
      >
        Five questions to ask when reading any financial statement for this topic.
      </p>
      <ol
        style={{
          margin: 0,
          padding: '0 0 0 1.4rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {questions.map((q, i) => (
          <li key={i}>
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '0.375rem',
                padding: '0.625rem 0.875rem',
                fontSize: '0.84rem',
                color: 'var(--color-text)',
                lineHeight: 1.6,
              }}
            >
              {q}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function ConceptSlideViewer({
  slides,
  fraudCases,
  skepticsLens,
  chapterId,
  zoneId = 1,
}: ConceptSlideViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [tab, setTab] = useState<Tab>('slides')

  const slide = slides[currentSlide]
  const totalSlides = slides.length

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: '0.5rem 1rem',
    border: 'none',
    borderBottom: `2px solid ${tab === t ? 'var(--color-accent)' : 'transparent'}`,
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: '0.8rem',
    fontWeight: tab === t ? 700 : 400,
    color: tab === t ? 'var(--color-accent)' : 'var(--color-text-muted)',
    transition: 'all 0.15s',
  })

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '1.5rem',
          gap: '0.25rem',
        }}
      >
        <button type="button" style={tabStyle('slides')} onClick={() => setTab('slides')}>
          Concepts
        </button>
        {fraudCases.length > 0 && (
          <button type="button" style={tabStyle('fraud')} onClick={() => setTab('fraud')}>
            Fraud Spotlight
          </button>
        )}
        {skepticsLens.length > 0 && (
          <button type="button" style={tabStyle('skeptic')} onClick={() => setTab('skeptic')}>
            Skeptic's Lens
          </button>
        )}
      </div>

      {/* Slides tab */}
      {tab === 'slides' && slide && (
        <div>
          {/* Slide content */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginBottom: '1.25rem',
              minHeight: '16rem',
            }}
          >
            <SlideContent slide={slide} chapterId={chapterId} zoneId={zoneId} />
          </div>

          {/* Navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            {/* Prev button */}
            <button
              type="button"
              disabled={currentSlide === 0}
              onClick={() => setCurrentSlide(i => Math.max(0, i - 1))}
              style={{
                padding: '0.5rem 1.25rem',
                background: currentSlide === 0 ? 'var(--color-base)' : 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '0.375rem',
                cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.8rem',
                color: currentSlide === 0 ? 'var(--color-text-muted)' : 'var(--color-text)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Previous
            </button>

            {/* Dot indicators */}
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentSlide(i)}
                  style={{
                    width: i === currentSlide ? '1.5rem' : '0.5rem',
                    height: '0.5rem',
                    borderRadius: '9999px',
                    background:
                      i === currentSlide ? 'var(--color-accent)' : 'var(--color-border)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all 0.2s',
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Next button */}
            <button
              type="button"
              disabled={currentSlide === totalSlides - 1}
              onClick={() => setCurrentSlide(i => Math.min(totalSlides - 1, i + 1))}
              style={{
                padding: '0.5rem 1.25rem',
                background:
                  currentSlide === totalSlides - 1
                    ? 'var(--color-base)'
                    : 'var(--color-accent)',
                border: `1px solid ${
                  currentSlide === totalSlides - 1 ? 'var(--color-border)' : 'var(--color-accent)'
                }`,
                borderRadius: '0.375rem',
                cursor: currentSlide === totalSlides - 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.8rem',
                color:
                  currentSlide === totalSlides - 1 ? 'var(--color-text-muted)' : '#ffffff',
                fontFamily: 'var(--font-body)',
                fontWeight: currentSlide === totalSlides - 1 ? 400 : 600,
              }}
            >
              Next
            </button>
          </div>

          {/* Slide counter */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '0.5rem',
              fontSize: '0.72rem',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {currentSlide + 1} / {totalSlides}
          </div>
        </div>
      )}

      {/* Fraud tab */}
      {tab === 'fraud' && <FraudSpotlight cases={fraudCases} />}

      {/* Skeptic tab */}
      {tab === 'skeptic' && <SkepticLens questions={skepticsLens} />}
    </div>
  )
}
