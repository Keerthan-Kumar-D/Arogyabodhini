import React, { useState, useEffect, useRef } from 'react'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'Home',     href: '#home'         },
  { label: 'Features', href: '#features'     },
  { label: 'Symptoms', href: '#symptom-input'},
  { label: 'Doctors',  href: '#doctors'      },
]

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const close = () => setMenuOpen(false)

  return (
    <nav
      id="navbar"
      ref={ref}
      className={`navbar ${scrolled ? 'navbar--scrolled' : 'navbar--top'}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container navbar__inner">

        {/* Logo */}
        <a href="#home" className="navbar__logo" aria-label="MediAI — go to homepage">
          <div className="navbar__logo-mark" aria-hidden="true">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="9" fill="url(#navGrad)"/>
              <path d="M18 9v18M9 18h18" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
              <defs>
                <linearGradient id="navGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#34d399"/>
                  <stop offset="1" stopColor="#0369a1"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="navbar__logo-text">
            Medi<span className="navbar__logo-accent">AI</span>
          </span>
        </a>

        {/* Desktop links */}
        <ul className="navbar__links" role="list">
          {NAV_LINKS.map(l => (
            <li key={l.label}>
              <a href={l.href} className="navbar__link">{l.label}</a>
            </li>
          ))}
        </ul>

        {/* Desktop auth */}
        <div className="navbar__auth">
          <a href="#patient-login" className="btn btn--ghost btn--sm" id="nav-patient-login">
            Patient Login
          </a>
          <a href="#doctor-login" className="btn btn--primary btn--sm" id="nav-doctor-login">
            Doctor Login
          </a>
        </div>

        {/* Hamburger */}
        <button
          id="navbar-hamburger"
          className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen(p => !p)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span/><span/><span/>
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`navbar__mobile-menu ${menuOpen ? 'navbar__mobile-menu--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <ul>
          {NAV_LINKS.map(l => (
            <li key={l.label}>
              <a href={l.href} className="navbar__mobile-link" onClick={close}>{l.label}</a>
            </li>
          ))}
        </ul>
        <div className="navbar__mobile-auth">
          <a href="#patient-login" className="btn btn--ghost" onClick={close}>Patient Login</a>
          <a href="#doctor-login"  className="btn btn--primary" onClick={close}>Doctor Login</a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
