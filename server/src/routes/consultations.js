/**
 * consultations.js — Express routes for consultation CRUD
 *
 * Replaces localStorage as the cross-browser/cross-device source of truth.
 * Uses in-memory storage (suitable for demo; swap with a database for production).
 *
 * Routes:
 *   POST   /api/consultations          — create a new request
 *   GET    /api/consultations?doctorId= — list consultations for a doctor
 *   GET    /api/consultations/:id       — get single consultation
 *   PATCH  /api/consultations/:id       — update status / save notes / save prescription
 *   DELETE /api/consultations           — clear all (testing only)
 */

const express = require('express')
const router  = express.Router()

// ── In-memory store (demo) ──────────────────────────────────────────────────
// Replace with MongoDB / PostgreSQL for production.
const consultations = []

function uuid() {
  return `cons-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ── CREATE ──────────────────────────────────────────────────────────────────
router.post('/consultations', (req, res) => {
  const {
    doctorId, doctorName, patientName, patientAge, patientGender,
    patientLang, patientPhone, patientContact, patientSymptoms, symptoms, aiResult, slot, consultationType,
  } = req.body

  if (!doctorId || !patientName) {
    return res.status(400).json({ success: false, message: 'doctorId and patientName are required.' })
  }

  const consultation = {
    id: uuid(),
    requestId: null,
    roomId: null,
    status: 'waiting',
    doctorId,
    doctorName:     doctorName || '',
    patientName,
    patientAge:    patientAge    || '',
    patientGender: patientGender || '',
    patientLang:   patientLang   || 'English',
    patientPhone:  patientPhone  || '',
    patientContact: patientContact || patientPhone || '',
    patientSymptoms: patientSymptoms || symptoms || '',
    symptoms:      symptoms      || patientSymptoms || '',
    aiResult:      aiResult      || null,
    slot:          slot          || '',
    consultationType: consultationType || 'in_person',
    createdAt:     new Date().toISOString(),
    notes:         null,
    prescription:  null,
  }

  consultation.requestId = consultation.id
  consultation.roomId = `consultation_${consultation.id}`

  consultations.unshift(consultation)
  console.log(`[consultations] Created: ${consultation.id} for doctor ${doctorId} (patient: ${patientName})`)
  res.status(201).json({ success: true, consultation })
})

// ── LIST by doctor ──────────────────────────────────────────────────────────
router.get('/consultations', (req, res) => {
  const { doctorId } = req.query
  let result = consultations

  if (doctorId) {
    result = consultations.filter(c => c.doctorId === doctorId)
  }

  // Always return newest first
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json({ success: true, consultations: result })
})

// ── GET single ──────────────────────────────────────────────────────────────
router.get('/consultations/:id', (req, res) => {
  const c = consultations.find(x => x.id === req.params.id)
  if (!c) {
    return res.status(404).json({ success: false, message: 'Consultation not found.' })
  }
  res.json({ success: true, consultation: c })
})

// ── UPDATE (accept / reject / complete / save notes / save prescription) ────
router.patch('/consultations/:id', (req, res) => {
  const idx = consultations.findIndex(x => x.id === req.params.id)
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Consultation not found.' })
  }

  const { status, notes, prescription } = req.body

  if (status === 'accepted') {
    consultations[idx].status     = 'accepted'
    consultations[idx].acceptedAt = new Date().toISOString()
  } else if (status === 'rejected') {
    consultations[idx].status = 'rejected'
  } else if (status === 'completed' || notes) {
    if (notes) consultations[idx].notes = notes
    consultations[idx].status      = 'completed'
    consultations[idx].completedAt = new Date().toISOString()
  }

  if (prescription) {
    consultations[idx].prescription = prescription
  }

  console.log(`[consultations] Updated ${req.params.id} → status=${consultations[idx].status}`)
  res.json({ success: true, consultation: consultations[idx] })
})

// ── SEED demo data ──────────────────────────────────────────────────────────
router.post('/consultations/seed', (req, res) => {
  const { doctorId } = req.body
  if (!doctorId) {
    return res.status(400).json({ success: false, message: 'doctorId is required.' })
  }

  // Only seed if zero consultations exist for this doctor
  const existing = consultations.filter(c => c.doctorId === doctorId)
  if (existing.length > 0) {
    return res.json({ success: true, seeded: false, message: 'Consultations already exist.' })
  }

  const demos = [
    {
      id: uuid(), status: 'waiting', doctorId,
      patientName: 'Ravi Kumar', patientAge: '45', patientGender: 'Male',
      patientLang: 'Kannada', patientPhone: '+91 98001 11001', slot: '10:00 AM',
      symptoms: 'Chest pain and shortness of breath for 2 days',
      aiResult: { possibleDiseases: ['Angina', 'Cardiac Arrhythmia'], recommendedSpecialist: 'Cardiologist', severity: 'High', confidence: 88, emergencyFlag: true, urgencyNote: 'Seek immediate medical attention.' },
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      notes: null, prescription: null, _isDemo: true,
    },
    {
      id: uuid(), status: 'waiting', doctorId,
      patientName: 'Sunita Devi', patientAge: '60', patientGender: 'Female',
      patientLang: 'Hindi', patientPhone: '+91 98002 22002', slot: '11:00 AM',
      symptoms: 'Persistent headache and dizziness for 3 days',
      aiResult: { possibleDiseases: ['Hypertension', 'Migraine'], recommendedSpecialist: 'Neurologist', severity: 'Moderate', confidence: 74, emergencyFlag: false, urgencyNote: 'Consult within 24 hours.' },
      createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
      notes: null, prescription: null, _isDemo: true,
    },
    {
      id: uuid(), status: 'completed', doctorId,
      patientName: 'Meghana Patil', patientAge: '28', patientGender: 'Female',
      patientLang: 'English', patientPhone: '+91 98003 33003', slot: '09:00 AM',
      symptoms: 'Fever, cough and body ache for 3 days',
      aiResult: { possibleDiseases: ['Viral Fever', 'Influenza'], recommendedSpecialist: 'General Physician', severity: 'Low', confidence: 82, emergencyFlag: false, urgencyNote: 'Rest and hydration advised.' },
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      notes: { diagnosis: 'Viral fever with mild respiratory symptoms', medicines: [{ name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '3 days' }], advice: 'Rest, drink plenty of fluids', followUp: '3 days' },
      prescription: null, _isDemo: true,
    },
  ]

  consultations.push(...demos)
  console.log(`[consultations] Seeded ${demos.length} demo consultations for ${doctorId}`)
  res.json({ success: true, seeded: true, count: demos.length })
})

// ── CLEAR ALL (testing) ─────────────────────────────────────────────────────
router.delete('/consultations', (_req, res) => {
  consultations.length = 0
  res.json({ success: true, message: 'All consultations cleared.' })
})

module.exports = router
