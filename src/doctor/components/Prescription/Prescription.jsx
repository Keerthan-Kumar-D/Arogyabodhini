import React, { useState } from 'react'
import './Prescription.css'

const Prescription = ({ doctor, consultation, notes, existing, onSave }) => {
  const now  = new Date()
  const date = now.toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })
  const time = now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })

  const [instructions, setInstructions] = useState(existing?.instructions || '')
  const [saved, setSaved] = useState(!!existing)

  const meds = notes?.medicines || existing?.medicines || []

  const handleSave = () => {
    const rx = {
      doctorName:   doctor?.name,
      doctorSpec:   doctor?.spec,
      doctorReg:    doctor?.regNo,
      hospital:     doctor?.hospital,
      patientName:  consultation?.patientName,
      patientAge:   consultation?.patientAge,
      patientGender:consultation?.patientGender,
      diagnosis:    notes?.diagnosis || existing?.diagnosis || '',
      medicines:    meds,
      advice:       notes?.advice || existing?.advice || '',
      followUp:     notes?.followUp || existing?.followUp || '',
      instructions: instructions.trim(),
      date,
      time,
    }
    onSave(rx)
    setSaved(true)
  }

  if (!notes && !existing) {
    return (
      <div className="rx-root rx-root--empty">
        <div className="rx-empty-icon">💊</div>
        <p>Complete the Consultation Notes first to generate a prescription.</p>
      </div>
    )
  }

  const rx = existing || {}

  return (
    <div className="rx-root">

      {/* Prescription paper */}
      <div className="rx-paper" id="rx-printable">

        {/* Header */}
        <div className="rx-header">
          <div className="rx-header__left">
            <div className="rx-logo" aria-hidden="true">
              <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="6" fill="#1565c0"/>
                <rect x="17" y="6" width="6" height="28" rx="2" fill="white"/>
                <rect x="6"  y="17" width="28" height="6" rx="2" fill="white"/>
              </svg>
            </div>
            <div>
              <h2 className="rx-hospital">{doctor?.hospital || 'Arogyabodhini Health Centre'}</h2>
              <p className="rx-tagline">Arogyabodhini — AI Multilingual Healthcare</p>
            </div>
          </div>
          <div className="rx-header__right">
            <p className="rx-date">Date: <strong>{date}</strong></p>
            <p className="rx-date">Time: <strong>{time}</strong></p>
          </div>
        </div>

        <div className="rx-divider"/>

        {/* Doctor info */}
        <div className="rx-doctor-section">
          <p className="rx-doctor-name">{doctor?.name}</p>
          <p className="rx-doctor-spec">{doctor?.spec}</p>
          <p className="rx-doctor-reg">Reg. No: {doctor?.regNo}</p>
        </div>

        <div className="rx-divider"/>

        {/* Patient info */}
        <div className="rx-patient-row">
          <div>
            <label>Patient Name</label>
            <span>{consultation?.patientName}</span>
          </div>
          <div>
            <label>Age / Gender</label>
            <span>{consultation?.patientAge || '–'} yrs / {consultation?.patientGender || '–'}</span>
          </div>
          <div>
            <label>Date of Consultation</label>
            <span>{date}</span>
          </div>
        </div>

        <div className="rx-divider"/>

        {/* Diagnosis */}
        <div className="rx-diagnosis">
          <label>Diagnosis</label>
          <p>{notes?.diagnosis || rx.diagnosis}</p>
        </div>

        {/* Rx symbol + medicines */}
        <div className="rx-medicines">
          <div className="rx-symbol">℞</div>
          <table className="rx-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {meds.map((m, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{m.name}</td>
                  <td>{m.dosage}</td>
                  <td>{m.frequency}</td>
                  <td>{m.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Instructions */}
        <div className="rx-instructions-section">
          <label>Special Instructions</label>
          {saved ? (
            <p>{instructions || rx.instructions || 'None'}</p>
          ) : (
            <textarea
              className="rx-instructions-input"
              rows={2}
              placeholder="Any special instructions..."
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
            />
          )}
        </div>

        {/* Advice + Follow-up */}
        {(notes?.advice || rx.advice) && (
          <div className="rx-advice">
            <label>Advice</label>
            <p>{notes?.advice || rx.advice}</p>
          </div>
        )}
        {(notes?.followUp || rx.followUp) && (
          <div className="rx-advice">
            <label>Follow-up</label>
            <p>{notes?.followUp || rx.followUp}</p>
          </div>
        )}

        {/* Signature */}
        <div className="rx-signature">
          <div className="rx-sig-box">
            <p className="rx-sig-label">Doctor's Signature</p>
            {/* Digital signature placeholder — replace with actual signature in next phase */}
            <div className="rx-sig-line"/>
            <p className="rx-sig-name">{doctor?.name}</p>
            <p className="rx-sig-spec">{doctor?.spec}</p>
          </div>
          <div className="rx-seal">
            <div className="rx-seal__circle">
              <span>OFFICIAL</span>
              <span>SEAL</span>
            </div>
          </div>
        </div>

        <p className="rx-disclaimer">
          This prescription is generated by Arogyabodhini AI Healthcare Assistant. Valid for one-time use only.
          For emergencies, call 108.
        </p>
      </div>

      {/* Actions */}
      <div className="rx-actions">
        {!saved && (
          <button id="rx-save-btn" className="rx-save-btn" onClick={handleSave}>
            💾 Save Prescription
          </button>
        )}
        <button id="rx-print-btn" className="rx-print-btn" onClick={() => window.print()}>
          🖨️ Print / Save PDF
        </button>
      </div>

      {saved && (
        <div className="rx-saved-note">✅ Prescription saved. PDF generation will be available in the next phase.</div>
      )}
    </div>
  )
}

export default Prescription
