import React, { useState } from 'react'
import './PatientAccount.css'
import { usePatientAuth } from '../../patient/context/PatientContext'
import patientService from '../../patient/services/patientService'

const initialForm = { name: '', age: '', gender: '', phone: '', email: '', password: '', confirmPassword: '', identifier: '' }

const PatientAccount = ({ onClose, onAuthenticated, initialMode = 'login', showVideoPrompt = false }) => {
  const { patient, register, login, logout } = usePatientAuth()
  const [mode, setMode] = useState(initialMode)
  const [view, setView] = useState('profile')
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [items, setItems] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const update = (field, value) => {
    setForm(current => ({ ...current, [field]: value }))
    setErrors(current => ({ ...current, [field]: '', form: '' }))
  }

  const validate = () => {
    const next = {}
    if (mode === 'register') {
      if (!form.name.trim()) next.name = 'Enter your full name.'
      if (!form.phone.trim()) next.phone = 'Enter your mobile number.'
      if (!form.password) next.password = 'Create a password.'
      else if (form.password.length < 6) next.password = 'Use at least 6 characters.'
      if (!form.confirmPassword) next.confirmPassword = 'Confirm your password.'
      else if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match.'
    } else {
      if (!form.identifier.trim()) next.identifier = 'Enter your email or mobile number.'
      if (!form.password) next.password = 'Enter your password.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      if (mode === 'register') await register(form)
      else await login(form.identifier.trim(), form.password)
      onAuthenticated?.()
    } catch (error) {
      setErrors({ form: error.message || 'Unable to complete patient authentication.' })
    } finally {
      setSubmitting(false)
    }
  }

  const showHistory = async (type) => {
    setView(type); setErrors({})
    try {
      const response = type === 'consultations'
        ? await patientService.consultations()
        : await patientService.prescriptions()
      setItems(type === 'consultations' ? response.consultations : response.prescriptions)
    } catch (error) { setErrors({ form: error.message }) }
  }

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setErrors({})
    setForm(initialForm)
  }

  const renderHistoryItem = (item) => {
    if (view === 'consultations') return (
      <article className="patient-history__item" key={item.id}>
        <strong>{item.doctorName}</strong>
        <span>{new Date(item.createdAt).toLocaleDateString('en-IN')} · {item.status} · {item.consultationType}</span>
        <p>{item.symptoms || item.patientSymptoms}</p>
        <small>{item.aiResult?.possibleDiseases?.join(', ')} {item.aiResult?.severity && `· ${item.aiResult.severity} severity`}</small>
        {item.notes?.diagnosis && <p><b>Diagnosis:</b> {item.notes.diagnosis}</p>}
        {item.prescription && <p><b>Prescription:</b> {item.prescription.medicines?.map(medicine => medicine.name).join(', ')}</p>}
      </article>
    )
    return (
      <article className="patient-history__item" key={item.consultationId}>
        <strong>{item.doctorName}</strong>
        <span>{new Date(item.consultationDate).toLocaleDateString('en-IN')}</span>
        <p><b>Diagnosis:</b> {item.diagnosis || 'Not provided'}</p>
        <p>{item.prescription?.medicines?.map(medicine => `${medicine.name} (${medicine.dosage}, ${medicine.frequency}, ${medicine.duration})`).join('; ')}</p>
        <small>{item.prescription?.advice || ''}{item.prescription?.followUp ? ` · Follow-up: ${item.prescription.followUp}` : ''}</small>
      </article>
    )
  }

  if (!patient) return (
    <div className="patient-modal-backdrop" onMouseDown={onClose}>
      <section className="patient-modal" onMouseDown={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="patient-auth-title">
        <button className="patient-modal__close" onClick={onClose} aria-label="Close">×</button>
        <div className="patient-auth-switch" role="tablist" aria-label="Patient account actions">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')} role="tab">Login</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')} role="tab">Create Account</button>
        </div>
        {showVideoPrompt && <div className="patient-video-prompt"><strong>Create a patient account or login to continue</strong><span>Your account lets us save your consultations and prescriptions so you can access them later.</span></div>}
        <h2 id="patient-auth-title">{mode === 'login' ? 'Patient Login' : 'Create Patient Account'}</h2>
        <p className="patient-modal__hint">Save your consultations and prescriptions in one secure place.</p>
        <form onSubmit={submit} className="patient-form" noValidate>
          {mode === 'register' ? <>
            <label>Full name *<input autoComplete="name" placeholder="e.g. Ananya Sharma" value={form.name} onChange={event => update('name', event.target.value)} aria-invalid={!!errors.name} />{errors.name && <small>{errors.name}</small>}</label>
            <div className="patient-form__row"><label>Age<input type="number" min="1" max="120" placeholder="e.g. 34" value={form.age} onChange={event => update('age', event.target.value)} /></label><label>Gender<select value={form.gender} onChange={event => update('gender', event.target.value)}><option value="">Select</option><option>Female</option><option>Male</option><option>Other</option></select></label></div>
            <label>Mobile number *<input autoComplete="tel" type="tel" placeholder="e.g. 9876543210" value={form.phone} onChange={event => update('phone', event.target.value)} aria-invalid={!!errors.phone} />{errors.phone && <small>{errors.phone}</small>}</label>
            <label>Email <span className="patient-form__optional">(optional)</span><input autoComplete="email" type="email" placeholder="you@example.com" value={form.email} onChange={event => update('email', event.target.value)} /></label>
            <label>Password *<span className="patient-password"><input autoComplete="new-password" type={showPassword ? 'text' : 'password'} placeholder="At least 6 characters" value={form.password} onChange={event => update('password', event.target.value)} aria-invalid={!!errors.password} /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button></span>{errors.password && <small>{errors.password}</small>}</label>
            <label>Confirm password *<span className="patient-password"><input autoComplete="new-password" type={showConfirmPassword ? 'text' : 'password'} placeholder="Re-enter your password" value={form.confirmPassword} onChange={event => update('confirmPassword', event.target.value)} aria-invalid={!!errors.confirmPassword} /><button type="button" onClick={() => setShowConfirmPassword(value => !value)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>{showConfirmPassword ? 'Hide' : 'Show'}</button></span>{errors.confirmPassword && <small>{errors.confirmPassword}</small>}</label>
          </> : <>
            <label>Email or mobile number *<input autoComplete="username" placeholder="you@example.com or 9876543210" value={form.identifier} onChange={event => update('identifier', event.target.value)} aria-invalid={!!errors.identifier} />{errors.identifier && <small>{errors.identifier}</small>}</label>
            <label>Password *<span className="patient-password"><input autoComplete="current-password" type={showPassword ? 'text' : 'password'} placeholder="Your password" value={form.password} onChange={event => update('password', event.target.value)} aria-invalid={!!errors.password} /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button></span>{errors.password && <small>{errors.password}</small>}</label>
          </>}
          {errors.form && <p className="patient-form__error" role="alert">{errors.form}</p>}
          <button className="patient-form__submit" disabled={submitting}>{submitting ? 'Signing you in...' : mode === 'login' ? 'Login' : 'Create Account'}</button>
        </form>
        <p className="patient-auth-footer">{mode === 'login' ? 'New to Arogyabodhini?' : 'Already have an account?'} <button onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Create Account' : 'Login'}</button></p>
      </section>
    </div>
  )

  return (
    <div className="patient-modal-backdrop" onMouseDown={onClose}>
      <section className="patient-modal patient-modal--account" onMouseDown={event => event.stopPropagation()} role="dialog" aria-modal="true">
        <button className="patient-modal__close" onClick={onClose} aria-label="Close">×</button>
        <div className="patient-account__top"><div><p className="patient-account__eyebrow">Patient account</p><h2>Hi, {patient.name.split(/\s+/)[0]}</h2></div><span className="patient-account__id">{patient.patientId}</span></div>
        <nav className="patient-account__tabs"><button className={view === 'profile' ? 'active' : ''} onClick={() => setView('profile')}>My Profile</button><button className={view === 'consultations' ? 'active' : ''} onClick={() => showHistory('consultations')}>My Consultations</button><button className={view === 'prescriptions' ? 'active' : ''} onClick={() => showHistory('prescriptions')}>My Prescriptions</button></nav>
        {errors.form && <p className="patient-form__error" role="alert">{errors.form}</p>}
        {view === 'profile' ? <div className="patient-profile-grid">{[['Name', patient.name], ['Age', patient.age || 'Not provided'], ['Gender', patient.gender || 'Not provided'], ['Mobile', patient.phone], ['Email', patient.email || 'Not provided']].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div> : <div className="patient-history">{items.length === 0 && <p className="patient-history__empty">No records yet.</p>}{items.map(renderHistoryItem)}</div>}
        <button className="patient-account__logout" onClick={logout}>Logout</button>
      </section>
    </div>
  )
}

export default PatientAccount
