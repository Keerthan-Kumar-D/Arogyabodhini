import React from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import BilingualText from '../BilingualText/BilingualText'
import './AppHeader.css'

const AppHeader = ({ onChangeLang }) => {
  const { t, en, lang } = useLanguage()

  return (
    <header className="ab-header" role="banner">
      <div className="ab-header__inner">
        <div className="ab-header__logo" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" fill="#1565c0"/>
            <rect x="13" y="5" width="6" height="22" rx="2" fill="white"/>
            <rect x="5" y="13" width="22" height="6" rx="2" fill="white"/>
          </svg>
        </div>

        <div className="ab-header__brand">
          {/* App name – bilingual */}
          <span className="ab-header__name">
            <BilingualText tKey="appName" as="span" size="sm" />
          </span>
          <span className="ab-header__tagline">
            <BilingualText tKey="appTagline" as="span" size="sm" />
          </span>
        </div>

        <div className="ab-header__right">
          <div className="ab-header__badge" aria-label={en('freeSecure')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            {en('freeSecure')}
          </div>

          <button
            id="change-lang-btn"
            className="ab-header__lang-btn"
            onClick={onChangeLang}
            aria-label={en('changeLanguage')}
            title={en('changeLanguage')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span className="ab-header__lang-code">{lang?.nativeLabel || '🌐'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default AppHeader
