import React, { useState } from 'react'
import './AppointmentScreen.css'
import { useLanguage } from '../../i18n/LanguageContext'
import BilingualText from '../BilingualText/BilingualText'
import consultationService from '../../doctor/services/consultationService'
import doctorStatusService from '../../doctor/services/doctorStatusService'

const AppointmentScreen = ({ doctor, mode, result, lang, onBack, onHome, onJoinVideoRoom }) => {
  const { en } = useLanguage()
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [confirmed, setConfirmed]           = useState(false)
  const [confirmedConsultId, setConfirmedConsultId] = useState(null)
  const [submitError, setSubmitError]       = useState('')
  const [doctorActive, setDoctorActive]     = useState(false)
  const [name, setName]                 = useState('')
  const [age,  setAge]                  = useState('')
  const [gender, setGender]             = useState('')
  const [phone, setPhone]               = useState('')

  const isVideo = mode === 'video'

  const handleConfirm = async (e) => {
    e.preventDefault()
    if ((!isVideo && !selectedSlot) || !name.trim()) return
    setSubmitError('')

    // For video consultations: create a consultation request on the doctor's dashboard
    if (isVideo && doctor && result) {
      try {
        const req = await consultationService.createRequest({
          doctorId:      doctor.id,
          patientName:   name.trim(),
          patientAge:    age.trim(),
          patientGender: gender,
          patientLang:   lang?.label || 'English',
          patientPhone:  phone.trim(),
          symptoms:      result?.transcript || result?.symptoms || 'Not provided',
          aiResult:      result,
          slot:          '',
          consultationType: 'video',
        })
        setConfirmedConsultId(req.id)
        const isActive = await doctorStatusService.get(doctor.id).catch(() => false)
        setDoctorActive(isActive)
        if (isActive) onJoinVideoRoom?.(req.id, name.trim())
        return
      } catch (err) {
        setSubmitError(err.message || 'Unable to send the video consultation request.')
      }
    }

    setConfirmed(true)
  }

  if (!doctor) return null

  return (
    <div className="appt-screen anim-in">

      {/* Top bar */}
      <div className="appt-topbar">
        <button id="appt-back-btn" className="appt-back-btn" onClick={onBack}>
          ← Back
        </button>
        <span className="appt-topbar__title">
          {isVideo ? 'Video Consultation' : 'Book Appointment'}
        </span>
      </div>

      <div className="appt-inner">

        {confirmed ? (
          /* ── Success state ── */
          <div className="appt-success anim-in" role="alert" aria-live="assertive">
            <div className="appt-success__icon" aria-hidden="true">✓</div>
            <h2 className="appt-success__title">
              <BilingualText tKey="booked" enText={isVideo ? 'Video Consultation Booked!' : 'Appointment Booked!'} as="span" size="lg" />
            </h2>
            <div className="appt-success__card">
              <p><strong>Doctor:</strong> {doctor.name}</p>
              <p><strong>Specialization:</strong> {doctor.spec}</p>
              <p><strong>Hospital:</strong> {doctor.hospital}</p>
              <p><strong>Type:</strong> {isVideo ? '🎥 Video Consultation' : '🏥 In-person Visit'}</p>
              {!isVideo && selectedSlot && <p><strong>Time:</strong> {selectedSlot}</p>}
              <p><strong>Patient:</strong> {name}{age && `, ${age} yrs`}{gender && `, ${gender}`}</p>
              {phone && <p><strong>Contact:</strong> {phone}</p>}
              <p><strong>Consultation Fee:</strong> {doctor.fee}</p>
              {isVideo && confirmedConsultId && <p className="appt-success__video-note">🎥 Your request has been sent.</p>}
            </div>

            {/* For video: show Join Call button; for in-person: show Home button */}
            {isVideo && confirmedConsultId && doctorActive ? (
              <div className="appt-success__actions">
                <button
                  id="appt-join-call-btn"
                  className="appt-join-call-btn"
                  onClick={() => onJoinVideoRoom?.(confirmedConsultId, name)}
                >
                  🎥 Join Video Call Room
                </button>
                <button id="appt-home-btn" className="appt-home-btn-secondary" onClick={onHome}>
                  🏠 <BilingualText tKey="backHome" as="span" size="sm" />
                </button>
              </div>
            ) : (
              <>
                <p className="appt-success__note">
                  A confirmation will be sent to you. Please arrive 10 minutes early.
                </p>
                <button id="appt-home-btn" className="appt-home-btn" onClick={onHome}>
                  🏠 <BilingualText tKey="backHome" as="span" size="sm" />
                </button>
              </>
            )}
          </div>
        ) : (
          /* ── Booking form ── */
          <>
            {/* Doctor summary card */}
            <div className="appt-doc-card">
              <div className="appt-doc-avatar" style={{ background: doctor.bgColor }}>
                {doctor.initials}
              </div>
              <div className="appt-doc-info">
                <h3>{doctor.name}</h3>
                <p>{doctor.spec} · {doctor.hospital}</p>
                <p className="appt-doc-fee">Consultation Fee: <strong>{doctor.fee}</strong></p>
              </div>
              <div className={`appt-mode-badge ${isVideo ? 'appt-mode-badge--video' : 'appt-mode-badge--visit'}`}>
                {isVideo ? '🎥 Video' : '🏥 Visit'}
              </div>
            </div>

            <form className="appt-form" onSubmit={handleConfirm} noValidate>

              {/* Patient name */}
              <div className="appt-field">
                <label htmlFor="appt-name" className="appt-label">
                  Patient Name <span className="appt-required">*</span>
                </label>
                <input
                  id="appt-name"
                  className="appt-input"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  aria-required="true"
                />
              </div>

              {/* Age & Gender row */}
              <div className="appt-field-row">
                <div className="appt-field">
                  <label htmlFor="appt-age" className="appt-label">Age</label>
                  <input
                    id="appt-age"
                    className="appt-input"
                    type="number"
                    min="1" max="120"
                    placeholder="e.g. 45"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                  />
                </div>
                <div className="appt-field">
                  <label htmlFor="appt-gender" className="appt-label">Gender</label>
                  <select
                    id="appt-gender"
                    className="appt-input appt-select"
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Phone */}
              <div className="appt-field">
                <label htmlFor="appt-phone" className="appt-label">
                  Mobile Number
                </label>
                <input
                  id="appt-phone"
                  className="appt-input"
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>

              {!isVideo && (
                <div className="appt-field">
                  <label className="appt-label">
                    Select Time Slot <span className="appt-required">*</span>
                  </label>
                  <div className="appt-slots">
                    {doctor.slots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        id={`slot-${slot.replace(/\s|:/g, '-')}`}
                        className={`appt-slot ${selectedSlot === slot ? 'appt-slot--selected' : ''}`}
                        onClick={() => setSelectedSlot(slot)}
                        aria-pressed={selectedSlot === slot}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability note */}
              <div className="appt-avail-note">
                📅 {doctor.availLabel} · {isVideo ? 'Online session' : doctor.hospital}
              </div>

              {/* Submit */}
              <button
                type="submit"
                id="appt-confirm-btn"
                className="appt-confirm-btn"
                disabled={(!isVideo && !selectedSlot) || !name.trim()}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Confirm {isVideo ? 'Video Consultation' : 'Appointment'}
              </button>
              {submitError && <p className="appt-error" role="alert">{submitError}</p>}
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default AppointmentScreen
