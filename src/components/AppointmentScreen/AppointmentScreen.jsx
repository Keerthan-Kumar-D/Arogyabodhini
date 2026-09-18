import React, { useEffect, useState } from 'react'
import './AppointmentScreen.css'
import { useLanguage } from '../../i18n/LanguageContext'
import BilingualText from '../BilingualText/BilingualText'
import consultationService from '../../doctor/services/consultationService'
import { usePatientAuth } from '../../patient/context/PatientContext'

const AppointmentScreen = ({ doctor, mode, result, lang, onBack, onHome, onJoinVideoRoom }) => {
  const { en } = useLanguage()
  const { patient } = usePatientAuth()
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [confirmedConsultId, setConfirmedConsultId] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [phone, setPhone] = useState('')
  const [editingSavedDetails, setEditingSavedDetails] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const isVideo = mode === 'video'

  useEffect(() => {
    if (!patient) return
    setName(patient.name || '')
    setAge(patient.age || '')
    setGender(patient.gender || '')
    setPhone(patient.phone || '')
  }, [patient])

  const submitConsultation = async () => {
    if ((!isVideo && !selectedSlot) || !name.trim()) return
    setSubmitError('')
    setSubmitting(true)
    if (isVideo && doctor && result) {
      try {
        const severity = typeof result.severity === 'object' ? result.severity.label : result.severity
        const patientSymptoms = result.inputSymptoms || result.matchedSymptoms?.join(', ') || 'Not provided'
        const request = await consultationService.createRequest({
          doctorId: doctor.id,
          doctorName: doctor.name,
          doctorSpecialty: doctor.spec,
          patientName: name.trim(),
          patientAge: age.trim(),
          patientGender: gender,
          patientLang: lang?.label || 'English',
          patientPhone: phone.trim(),
          patientContact: phone.trim(),
          patientSymptoms,
          symptoms: patientSymptoms,
          aiResult: {
            predictedDisease: result.predictedDisease || null,
            possibleDiseases: (result.possibleDiseases || []).map(item => typeof item === 'string' ? item : item.disease).filter(Boolean),
            recommendedSpecialist: result.recommendedSpecialist || null,
            severity: severity || null,
            confidence: result.confidence || 0,
            emergencyFlag: result.emergencyFlag === true,
            urgencyNote: result.urgencyNote || '',
          },
          slot: '',
          consultationType: 'video',
        })
        setConfirmedConsultId(request.id)
        onJoinVideoRoom?.(request.id, name.trim())
      } catch (error) {
        setSubmitError(error.message || 'Unable to send the video consultation request.')
      } finally {
        setSubmitting(false)
      }
      return
    }
    setConfirmed(true)
    setSubmitting(false)
  }

  if (!doctor) return null

  return (
    <div className="appt-screen anim-in">
      <div className="appt-topbar">
        <button id="appt-back-btn" className="appt-back-btn" onClick={onBack}>← Back</button>
        <span className="appt-topbar__title">{isVideo ? 'Video Consultation' : 'Book Appointment'}</span>
      </div>
      <div className="appt-inner">
        {confirmed ? (
          <div className="appt-success anim-in" role="alert" aria-live="assertive">
            <div className="appt-success__icon" aria-hidden="true">✓</div>
            <h2 className="appt-success__title"><BilingualText tKey="booked" enText={isVideo ? 'Video Consultation Booked!' : 'Appointment Booked!'} as="span" size="lg" /></h2>
            <div className="appt-success__card">
              <p><strong>Doctor:</strong> {doctor.name}</p><p><strong>Specialization:</strong> {doctor.spec}</p><p><strong>Hospital:</strong> {doctor.hospital}</p>
              <p><strong>Type:</strong> {isVideo ? '🎥 Video Consultation' : '🏥 In-person Visit'}</p>
              {!isVideo && selectedSlot && <p><strong>Time:</strong> {selectedSlot}</p>}
              <p><strong>Patient:</strong> {name}{age && `, ${age} yrs`}{gender && `, ${gender}`}</p>
              {phone && <p><strong>Contact:</strong> {phone}</p>}<p><strong>Consultation Fee:</strong> {doctor.fee}</p>
              {isVideo && confirmedConsultId && <p className="appt-success__video-note">🎥 Your request has been sent.</p>}
            </div>
            <button id="appt-home-btn" className="appt-home-btn" onClick={onHome}>🏠 <BilingualText tKey="backHome" as="span" size="sm" /></button>
          </div>
        ) : (
          <>
            <div className="appt-doc-card"><div className="appt-doc-avatar" style={{ background: doctor.bgColor }}>{doctor.initials}</div><div className="appt-doc-info"><h3>{doctor.name}</h3><p>{doctor.spec} · {doctor.hospital}</p><p className="appt-doc-fee">Consultation Fee: <strong>{doctor.fee}</strong></p></div><div className={`appt-mode-badge ${isVideo ? 'appt-mode-badge--video' : 'appt-mode-badge--visit'}`}>{isVideo ? '🎥 Video' : '🏥 Visit'}</div></div>
            {isVideo && patient && !editingSavedDetails ? (
              <div className="appt-saved-details">
                <h3>Your saved details</h3><p><strong>Name:</strong> {patient.name}</p><p><strong>Age:</strong> {patient.age || 'Not provided'}</p><p><strong>Gender:</strong> {patient.gender || 'Not provided'}</p><p><strong>Mobile:</strong> {patient.phone}</p>
                <div className="appt-saved-details__actions"><button type="button" className="appt-edit-btn" onClick={() => setEditingSavedDetails(true)}>Edit details</button><button type="button" className="appt-confirm-btn" onClick={submitConsultation} disabled={submitting || !name.trim()}>{submitting ? 'Sending request...' : 'Continue to Video Consultation'}</button></div>
              </div>
            ) : (
              <form className="appt-form" onSubmit={event => { event.preventDefault(); submitConsultation() }} noValidate>
                <div className="appt-field"><label htmlFor="appt-name" className="appt-label">Patient Name <span className="appt-required">*</span></label><input id="appt-name" className="appt-input" type="text" placeholder="Enter your full name" value={name} onChange={event => setName(event.target.value)} required /></div>
                <div className="appt-field-row"><div className="appt-field"><label htmlFor="appt-age" className="appt-label">Age</label><input id="appt-age" className="appt-input" type="number" min="1" max="120" placeholder="e.g. 45" value={age} onChange={event => setAge(event.target.value)} /></div><div className="appt-field"><label htmlFor="appt-gender" className="appt-label">Gender</label><select id="appt-gender" className="appt-input appt-select" value={gender} onChange={event => setGender(event.target.value)}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></div></div>
                <div className="appt-field"><label htmlFor="appt-phone" className="appt-label">Mobile Number</label><input id="appt-phone" className="appt-input" type="tel" placeholder="+91 XXXXX XXXXX" value={phone} onChange={event => setPhone(event.target.value)} /></div>
                {!isVideo && <div className="appt-field"><label className="appt-label">Select Time Slot <span className="appt-required">*</span></label><div className="appt-slots">{doctor.slots.map(slot => <button key={slot} type="button" className={`appt-slot ${selectedSlot === slot ? 'appt-slot--selected' : ''}`} onClick={() => setSelectedSlot(slot)} aria-pressed={selectedSlot === slot}>{slot}</button>)}</div></div>}
                <div className="appt-avail-note">📅 {doctor.availLabel} · {isVideo ? 'Online session' : doctor.hospital}</div>
                <button type="submit" id="appt-confirm-btn" className="appt-confirm-btn" disabled={submitting || (!isVideo && !selectedSlot) || !name.trim()}>{submitting ? 'Sending request...' : `Confirm ${isVideo ? 'Video Consultation' : 'Appointment'}`}</button>
                {submitError && <p className="appt-error" role="alert">{submitError}</p>}
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AppointmentScreen
