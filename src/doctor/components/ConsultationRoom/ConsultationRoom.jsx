import React, { useState } from 'react'
import './ConsultationRoom.css'
import { useDoctorAuth } from '../../context/DoctorContext'
import VideoCallRoom        from '../VideoCallRoom/VideoCallRoom'
import ConsultationNotes    from '../ConsultationNotes/ConsultationNotes'
import Prescription         from '../Prescription/Prescription'
import consultationService  from '../../services/consultationService'

const SEV_COLOR = { High:'#c62828', Moderate:'#e65100', Low:'#2e7d32' }
const SEV_BG    = { High:'#ffebee', Moderate:'#fff3e0', Low:'#e8f5e9' }

const ConsultationRoom = ({ consultation, onBack }) => {
  const { doctor } = useDoctorAuth()
  const [panel, setPanel]             = useState('video') // video | notes | prescription
  const [savedNotes, setSavedNotes]   = useState(consultation.notes || null)
  const [savedRx,    setSavedRx]      = useState(consultation.prescription || null)
  const [completed,  setCompleted]    = useState(consultation.status === 'completed')

  if (!consultation) return null
  const { aiResult, patientName, patientAge, patientGender, patientLang, symptoms, slot } = consultation
  const sev = aiResult?.severity || 'Low'

  const handleSaveNotes = async (notes) => {
    const updated = await consultationService.saveNotes(consultation.id, notes)
    setSavedNotes(notes)
    setCompleted(true)
    if (updated?.prescription) setSavedRx(updated.prescription)
  }

  const handleSaveRx = async (rx) => {
    await consultationService.savePrescription(consultation.id, rx)
    setSavedRx(rx)
  }

  return (
    <div className="croom-root">

      {/* Top bar */}
      <div className="croom-topbar">
        <button id="croom-back-btn" className="croom-back-btn" onClick={onBack}>
          ← Dashboard
        </button>
        <div className="croom-topbar__center">
          <span className="croom-topbar__title">Consultation Room</span>
          {completed && <span className="croom-completed-badge">✅ Completed</span>}
        </div>
        <div className="croom-topbar__doc">
          <div className="croom-topbar__avatar" style={{ background: doctor?.bgColor }}>
            {doctor?.initials}
          </div>
          <span>{doctor?.name}</span>
        </div>
      </div>

      <div className="croom-body">

        {/* ── Left panel ── */}
        <div className="croom-left">

          {/* Panel tabs */}
          <div className="croom-tabs">
            {[
              { id:'video',        label:'🎥 Video Call'   },
              { id:'notes',        label:'📝 Notes'        },
              { id:'prescription', label:'💊 Prescription' },
            ].map(t => (
              <button
                key={t.id}
                id={`croom-tab-${t.id}`}
                className={`croom-tab ${panel === t.id ? 'croom-tab--active' : ''}`}
                onClick={() => setPanel(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Keep VideoCallRoom mounted to avoid destroying ZEGO mid-call on tab switch */}
          <div className="croom-video-wrap" style={{ display: panel === 'video' ? 'flex' : 'none' }}>
            <VideoCallRoom
              consultationId={consultation.id}
              role="doctor"
              userName={doctor?.name || 'Doctor'}
            />
          </div>

          {panel === 'notes' && (
            <ConsultationNotes
              existing={savedNotes}
              onSave={handleSaveNotes}
              completed={completed}
            />
          )}

          {panel === 'prescription' && (
            <Prescription
              doctor={doctor}
              consultation={consultation}
              notes={savedNotes}
              existing={savedRx}
              onSave={handleSaveRx}
            />
          )}
        </div>

        {/* ── Right panel: Patient info ── */}
        <div className="croom-right">

          {/* Patient card */}
          <div className="croom-patient-card">
            <h3 className="croom-section-title">👤 Patient Information</h3>
            <div className="croom-info-grid">
              <div><label>Name</label><span>{patientName}</span></div>
              <div><label>Age</label><span>{patientAge || '–'} yrs</span></div>
              <div><label>Gender</label><span>{patientGender || '–'}</span></div>
              <div><label>Language</label><span>{patientLang}</span></div>
              <div><label>Slot</label><span>{slot}</span></div>
            </div>
          </div>

          {/* Symptoms */}
          <div className="croom-symptoms-card">
            <h3 className="croom-section-title">🩺 Reported Symptoms</h3>
            <p className="croom-symptoms-text">{symptoms}</p>
          </div>

          {/* AI Analysis */}
          {aiResult && (
            <div className="croom-ai-card" style={{ borderColor: SEV_COLOR[sev] }}>
              <h3 className="croom-section-title">🤖 AI Analysis</h3>

              <div className="croom-ai-sev"
                style={{ background: SEV_BG[sev], color: SEV_COLOR[sev] }}>
                {sev} Severity · {aiResult.confidence}% confidence
                {aiResult.emergencyFlag && <span> 🚨 EMERGENCY</span>}
              </div>

              <div className="croom-ai-row">
                <label>Possible Conditions</label>
                <div className="croom-chips">
                  {aiResult.possibleDiseases?.map(d => (
                    <span key={d} className="croom-chip">{d}</span>
                  ))}
                </div>
              </div>

              <div className="croom-ai-row">
                <label>Recommended Specialist</label>
                <span className="croom-spec">{aiResult.recommendedSpecialist}</span>
              </div>

              {aiResult.urgencyNote && (
                <div className="croom-urgency">ℹ️ {aiResult.urgencyNote}</div>
              )}
            </div>
          )}

          {/* Saved notes summary */}
          {savedNotes && (
            <div className="croom-notes-summary">
              <h3 className="croom-section-title">📋 Consultation Notes</h3>
              <p><strong>Diagnosis:</strong> {savedNotes.diagnosis}</p>
              {savedNotes.advice    && <p><strong>Advice:</strong> {savedNotes.advice}</p>}
              {savedNotes.followUp  && <p><strong>Follow-up:</strong> {savedNotes.followUp}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConsultationRoom
