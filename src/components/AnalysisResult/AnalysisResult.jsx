import React from 'react'
import './AnalysisResult.css'

const SEVERITY_CONFIG = {
  High:     { color: '#ef4444', bg: 'rgba(239,68,68,.1)',   border: 'rgba(239,68,68,.25)',   icon: '🚨', label: 'High Severity'     },
  Moderate: { color: '#f59e0b', bg: 'rgba(245,158,11,.1)',  border: 'rgba(245,158,11,.25)',  icon: '⚠️', label: 'Moderate Severity' },
  Low:      { color: '#10b981', bg: 'rgba(16,185,129,.1)',  border: 'rgba(16,185,129,.25)',  icon: '✅', label: 'Low Severity'      },
}

const SPECIALIST_ICONS = {
  'Cardiologist':         '🫀',
  'Neurologist':          '🧠',
  'General Physician':    '🩺',
  'Gastroenterologist':   '🔬',
  'Orthopedic Surgeon':   '🦴',
  'Dermatologist':        '💊',
  'Ophthalmologist':      '👁️',
  'Urologist':            '🧪',
  'Psychiatrist':         '🧘',
  'Endocrinologist':      '⚗️',
}

const AnalysisResult = ({ result, onReset }) => {
  if (!result) return null

  const sev = SEVERITY_CONFIG[result.severity] || SEVERITY_CONFIG.Low
  const specialistIcon = SPECIALIST_ICONS[result.recommendedSpecialist] || '👨‍⚕️'

  return (
    <div className="result-panel anim-up" role="region" aria-label="Analysis Results" aria-live="polite">

      {/* ── Header ── */}
      <div className="result-panel__header">
        <div className="result-panel__header-left">
          <div className="result-panel__pulse" aria-hidden="true" />
          <div>
            <h3 className="result-panel__title">AI Analysis Complete</h3>
            <p className="result-panel__ts">
              {new Date(result.analyzedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Confidence meter */}
        <div className="result-confidence" aria-label={`Confidence: ${result.confidence}%`}>
          <div className="result-confidence__ring">
            <svg viewBox="0 0 44 44" aria-hidden="true">
              <circle cx="22" cy="22" r="18" className="result-confidence__track" />
              <circle
                cx="22" cy="22" r="18"
                className="result-confidence__fill"
                strokeDasharray={`${(result.confidence / 100) * 113} 113`}
              />
            </svg>
            <span className="result-confidence__val">{result.confidence}%</span>
          </div>
          <span className="result-confidence__lbl">Confidence</span>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="result-grid">

        {/* Possible diseases */}
        <div className="result-card result-card--diseases">
          <div className="result-card__label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            Possible Conditions
          </div>
          <ul className="result-diseases" aria-label="Possible conditions">
            {result.possibleDiseases.map((d, i) => (
              <li key={d} className="result-disease" style={{ animationDelay: `${i * 0.08}s` }}>
                <span className="result-disease__dot" aria-hidden="true" />
                {d}
              </li>
            ))}
          </ul>
        </div>

        {/* Specialist recommendation */}
        <div className="result-card result-card--specialist">
          <div className="result-card__label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Recommended Specialist
          </div>
          <div className="result-specialist">
            <span className="result-specialist__icon" aria-hidden="true">{specialistIcon}</span>
            <span className="result-specialist__name">{result.recommendedSpecialist}</span>
          </div>
        </div>

        {/* Severity */}
        <div
          className="result-card result-card--severity"
          style={{ background: sev.bg, borderColor: sev.border }}
        >
          <div className="result-card__label" style={{ color: sev.color }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Severity Level
          </div>
          <div className="result-severity" style={{ color: sev.color }}>
            <span className="result-severity__icon" aria-hidden="true">{sev.icon}</span>
            <span className="result-severity__label">{sev.label}</span>
          </div>
        </div>
      </div>

      {/* ── Urgency note ── */}
      {result.urgencyNote && (
        <div
          className={`result-note ${result.emergencyFlag ? 'result-note--emergency' : ''}`}
          role="note"
          aria-label="Medical advice"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{result.urgencyNote}</p>
        </div>
      )}

      {/* ── Disclaimer ── */}
      <p className="result-disclaimer">
        ⚕️ This is an AI-powered preliminary assessment. It does not replace professional medical advice.
        Always consult a qualified doctor for diagnosis and treatment.
      </p>

      {/* ── Actions ── */}
      <div className="result-actions">
        <a href="#doctors" className="btn btn--primary btn--lg" id="result-find-specialist">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Find {result.recommendedSpecialist}
        </a>
        <button
          className="btn btn--secondary btn--lg"
          id="result-analyze-again"
          onClick={onReset}
          aria-label="Analyze different symptoms"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.68"/></svg>
          Analyze Again
        </button>
      </div>
    </div>
  )
}

export default AnalysisResult
