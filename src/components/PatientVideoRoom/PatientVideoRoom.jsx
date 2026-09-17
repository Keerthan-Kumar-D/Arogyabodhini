import React, { useState, useEffect, useRef, useCallback } from 'react'
import './PatientVideoRoom.css'
import VideoCallRoom from '../../doctor/components/VideoCallRoom/VideoCallRoom'
import consultationService from '../../doctor/services/consultationService'

/**
 * PatientVideoRoom
 * Shown when a patient wants to join their confirmed video consultation.
 *
 * ISSUE 3 FIX: onEnd does NOT navigate home. The patient STAYS on this screen
 * even if the video call ends or errors. They see "Consultation Ended" inside
 * the VideoCallRoom overlay, with a manual "Back to Home" button here.
 *
 * Props:
 *   consultationId {string}
 *   patientName    {string}
 *   onBack         {fn}
 *   onHome         {fn}
 */
const PatientVideoRoom = ({ consultationId, patientName, onBack, onHome }) => {
  const [consult,   setConsult]   = useState(null)
  const [checking,  setChecking]  = useState(true)
  const [callEnded, setCallEnded] = useState(false)
  const [fetchError,setFetchError]= useState('')
  const mountedRef = useRef(true)

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true
    let cancelled = false
    consultationService.getById(consultationId).then(c => {
      if (!cancelled && mountedRef.current) {
        if (c) {
          setConsult(c)
          setFetchError('')
        } else {
          setFetchError('Consultation not found. Please go back and try again.')
        }
        setChecking(false)
      }
    }).catch(() => {
      if (!cancelled && mountedRef.current) {
        setFetchError('Unable to reach the server. Make sure the backend is running.')
        setChecking(false)
      }
    })
    return () => { cancelled = true }
  }, [consultationId])

  // Poll for doctor acceptance every 3 seconds (async)
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const c = await consultationService.getById(consultationId)
        if (mountedRef.current && c) {
          setConsult(c)
          setFetchError('')
        }
      } catch {
        /* backend unavailable — keep last known consult, keep polling */
      }
    }, 3000)
    return () => clearInterval(id)
  }, [consultationId])

  useEffect(() => {
    return () => { mountedRef.current = false }
  }, [])

  // When the video call ends, stay on this screen — never auto-navigate home.
  const handleCallEnd = useCallback(() => {
    setCallEnded(true)
  }, [])

  const handleRetryFetch = async () => {
    setChecking(true)
    setFetchError('')
    try {
      const c = await consultationService.getById(consultationId)
      if (c) {
        setConsult(c)
      } else {
        setFetchError('Consultation not found. Please go back and try again.')
      }
    } catch {
      setFetchError('Unable to reach the server. Make sure the backend is running.')
    } finally {
      setChecking(false)
    }
  }

  if (checking) {
    return (
      <div className="pvr-root">
        <div className="pvr-loading">
          <div className="pvr-spinner" />
          <p>Checking consultation status...</p>
        </div>
      </div>
    )
  }

  const doctorAccepted = consult?.status === 'accepted' || consult?.status === 'completed'

  return (
    <div className="pvr-root">
      {/* Header */}
      <div className="pvr-header">
        <button id="pvr-back-btn" className="pvr-back-btn" onClick={onBack}>← Back</button>
        <span className="pvr-title">Video Consultation</span>
      </div>

      <div className="pvr-body">

        {/* Info card */}
        <div className="pvr-info-card">
          <div className="pvr-info-row">
            <span className="pvr-info-label">Doctor</span>
            <span className="pvr-info-val">{consult?.doctorName || 'Your Doctor'}</span>
          </div>
          <div className="pvr-info-row">
            <span className="pvr-info-label">Patient</span>
            <span className="pvr-info-val">{patientName}</span>
          </div>
          <div className="pvr-info-row">
            <span className="pvr-info-label">Slot</span>
            <span className="pvr-info-val">{consult?.slot || '–'}</span>
          </div>
          <div className="pvr-info-row">
            <span className="pvr-info-label">Status</span>
            <span className={`pvr-status-chip pvr-status-chip--${consult?.status}`}>
              {consult?.status === 'waiting'  ? '⏳ Waiting for doctor to accept'  : ''}
              {consult?.status === 'accepted' ? '✅ Doctor accepted — Join now!'    : ''}
              {consult?.status === 'completed'? '✅ Consultation completed'         : ''}
              {consult?.status === 'rejected' ? '✗ Request was rejected'            : ''}
              {!consult?.status               ? '⚠️ Consultation not found'         : ''}
            </span>
          </div>
        </div>

        {/* Server / fetch error — stay on this screen with retry */}
        {fetchError && !checking && (
          <div className="pvr-rejected">
            <div className="pvr-rejected__icon">⚠️</div>
            <h3>Unable to Connect</h3>
            <p>{fetchError}</p>
            <button className="pvr-home-btn" onClick={handleRetryFetch}>🔄 Retry</button>
          </div>
        )}

        {/* Enter the shared room immediately; the doctor can join after accepting. */}
        {!fetchError && (consult?.status === 'waiting' || doctorAccepted) && !callEnded && (
          <div className="pvr-video-section">
            <VideoCallRoom
              key={consultationId}
              consultationId={consultationId}
              role="patient"
              userName={patientName || 'Patient'}
              autoJoin
              onEnd={handleCallEnd}
            />
          </div>
        )}

        {/* ISSUE 3 FIX: Call ended — stay on this screen, show home button */}
        {callEnded && (
          <div className="pvr-ended">
            <div className="pvr-ended__icon">✅</div>
            <h3>Consultation Ended</h3>
            <p>The video call has been completed.</p>
            <button className="pvr-home-btn" onClick={onHome}>🏠 Back to Home</button>
          </div>
        )}

        {/* Rejected */}
        {consult?.status === 'rejected' && (
          <div className="pvr-rejected">
            <div className="pvr-rejected__icon">✗</div>
            <h3>Request Rejected</h3>
            <p>The doctor has declined this consultation. Please go back and try another doctor.</p>
            <button className="pvr-home-btn" onClick={onHome}>🏠 Back to Home</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientVideoRoom
