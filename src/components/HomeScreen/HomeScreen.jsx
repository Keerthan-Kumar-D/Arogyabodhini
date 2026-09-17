import React, { useState, useRef, useCallback, useEffect } from 'react'
import './HomeScreen.css'
import { useLanguage } from '../../i18n/LanguageContext'
import BilingualText from '../BilingualText/BilingualText'

const HomeScreen = ({ apiError, initialText = '', onStartListening, onTextSubmit }) => {
  const { t, en, lang } = useLanguage()
  const [text,    setText]    = useState(initialText)
  const [loading, setLoading] = useState(false)
  const textRef = useRef(null)

  const handleAnalyze = useCallback(async (e) => {
    e.preventDefault()
    if (!text.trim()) { textRef.current?.focus(); return }
    setLoading(true)
    await onTextSubmit(text.trim(), lang)
    setLoading(false)
  }, [text, lang, onTextSubmit])

  const handleVoice = useCallback(() => {
    onStartListening(lang)
  }, [lang, onStartListening])

  useEffect(() => {
    const btn = document.getElementById('home-mic-btn')
    if (!btn) return
    const id = setInterval(() => {
      btn.classList.add('pulse-invite')
      setTimeout(() => btn.classList.remove('pulse-invite'), 700)
    }, 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="home-screen anim-in">
      <div className="home-content">

        {/* Step 1: Voice */}
        <div className="home-step home-step--voice">
          <div className="home-step__number" aria-hidden="true">1</div>
          <h2 className="home-step__title">
            <BilingualText tKey="stepSpeak" as="span" size="lg" />
          </h2>
          <p className="home-step__hint">
            <BilingualText tKey="stepSpeakHint" as="span" size="sm" />
          </p>

          <button
            id="home-mic-btn"
            className="home-mic-btn"
            onClick={handleVoice}
            aria-label={`${en('stepSpeak')} — ${lang?.label}`}
          >
            <span className="home-mic-btn__ripple" aria-hidden="true"/>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8"  y1="23" x2="16" y2="23"/>
            </svg>
          </button>
          <p className="home-mic-label">
            <BilingualText tKey="tapMic" as="span" size="sm" />
          </p>
        </div>

        {/* Divider */}
        <div className="home-divider" aria-hidden="true">
          <div className="home-divider__line"/>
          <span className="home-divider__text">{t('orDivider')}</span>
          <div className="home-divider__line"/>
        </div>

        {/* Step 2: Type */}
        <div className="home-step home-step--text">
          <div className="home-step__number" aria-hidden="true">2</div>
          <h2 className="home-step__title">
            <BilingualText tKey="stepType" as="span" size="lg" />
          </h2>

          <form onSubmit={handleAnalyze} noValidate>
            <textarea
              ref={textRef}
              id="symptom-text"
              className="home-textarea"
              value={text}
              onChange={e => setText(e.target.value.slice(0, 1000))}
              placeholder={lang?.code !== 'en'
                ? `${en('symptomsPlaceholder')}\n${t('symptomsPlaceholder')}`
                : en('symptomsPlaceholder')}
              rows={3}
              aria-label={en('stepType')}
              aria-required="true"
              disabled={loading}
            />

            {apiError && (
              <div className="home-error" role="alert" aria-live="assertive">
                ⚠️ {apiError}
              </div>
            )}

            <button
              type="submit"
              id="analyze-btn"
              className="home-analyze-btn"
              disabled={loading || !text.trim()}
              aria-live="polite"
            >
              {loading ? (
                <>
                  <span className="home-analyze-btn__spinner" aria-hidden="true"/>
                  <BilingualText tKey="analyzingBtn" as="span" size="sm" />
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                    strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <BilingualText tKey="analyzeBtn" as="span" size="sm" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <p className="home-disclaimer">
        <BilingualText tKey="disclaimer" as="span" size="sm" />
      </p>
    </div>
  )
}

export default HomeScreen
