import React, { useState } from 'react'
import PatientApp from './App'
import DoctorApp  from './DoctorApp'
import './styles/portal.css'

/**
 * PortalRouter
 * Reads ?portal=doctor from the URL on load.
 * Falls back to a landing screen where user can choose their role.
 * No external routing library needed.
 */
function PortalRouter() {
  const initPortal = () => {
    const params = new URLSearchParams(window.location.search)
    return params.get('portal') || null
  }

  const [portal, setPortal] = useState(initPortal)

  const goDoctor  = () => {
    window.history.pushState({}, '', '?portal=doctor')
    setPortal('doctor')
  }
  const goPatient = () => {
    window.history.pushState({}, '', '?portal=patient')
    setPortal('patient')
  }

  if (portal === 'doctor')  return <DoctorApp  onSwitchToPatient={goPatient} />
  if (portal === 'patient') return <PatientApp />

  // Landing / Portal Selection
  return (
    <div className="portal-root">
      <div className="portal-brand">
        <svg width="56" height="56" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <rect width="40" height="40" rx="10" fill="#1565c0"/>
          <rect x="17" y="6" width="6" height="28" rx="2" fill="white"/>
          <rect x="6"  y="17" width="28" height="6" rx="2" fill="white"/>
        </svg>
        <div>
          <h1>AROGYABODHINI</h1>
          <p>AI Multilingual Healthcare Assistant</p>
        </div>
      </div>

      <h2 className="portal-heading">Select Your Portal</h2>
      <p className="portal-sub">Are you a patient or a doctor?</p>

      <div className="portal-cards">
        <button id="portal-patient-btn" className="portal-card" onClick={goPatient}>
          <span className="portal-card__icon">🧑‍🤝‍🧑</span>
          <h3>Patient Portal</h3>
          <p>Describe your symptoms, get AI analysis, and connect with a doctor</p>
          <span className="portal-card__cta">Enter →</span>
        </button>

        <button id="portal-doctor-btn" className="portal-card portal-card--doctor" onClick={goDoctor}>
          <span className="portal-card__icon">👨‍⚕️</span>
          <h3>Doctor Portal</h3>
          <p>View patient requests, conduct video consultations, write prescriptions</p>
          <span className="portal-card__cta">Sign In →</span>
        </button>
      </div>

      <p className="portal-footer">Arogyabodhini v2.0 · Free & Secure · Government Healthcare Initiative</p>
    </div>
  )
}

export default PortalRouter
