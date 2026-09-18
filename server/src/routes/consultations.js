const express = require('express')
const router = express.Router()
const Consultation = require('../models/Consultation')
const { loadPatient, optionalPatient } = require('../middleware/patientAuth')
const { loadDoctor, requireDoctor } = require('../middleware/doctorAuth')

const requireConsultationViewer = async (req, res, next) => {
  try {
    if (!req.headers.authorization) return res.status(401).json({ success: false, message: 'Authentication is required.' })
    const [patient, doctor] = await Promise.all([loadPatient(req), loadDoctor(req)])
    if (!patient && !doctor) return res.status(401).json({ success: false, message: 'Invalid or expired session.' })
    req.patient = patient
    req.doctor = doctor
    next()
  } catch (error) { next(error) }
}

const requireDoctorMutation = async (req, res, next) => {
  try {
    const doctor = await loadDoctor(req)
    if (doctor) {
      req.doctor = doctor
      return next()
    }
    if (req.headers.authorization && await loadPatient(req)) {
      return res.status(403).json({ success: false, message: 'Patients cannot modify consultations.' })
    }
    return res.status(401).json({ success: false, message: 'Doctor login is required.' })
  } catch (error) { next(error) }
}

function uuid() {
  return `cons-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

router.post('/consultations', optionalPatient, async (req, res, next) => {
  try {
    const {
      doctorId, doctorName, doctorSpecialty, patientName, patientAge, patientGender,
      patientLang, patientPhone, patientContact, patientSymptoms, symptoms, aiResult, slot, consultationType,
    } = req.body
    if (!doctorId || !patientName) {
      return res.status(400).json({ success: false, message: 'doctorId and patientName are required.' })
    }

    const id = uuid()
    const consultation = await Consultation.create({
      id, requestId: id, roomId: `consultation_${id}`, status: 'waiting', doctorId,
      doctorName: doctorName || '', doctorSpecialty: doctorSpecialty || '', patientId: req.patient?.patientId || null, patientName,
      patientAge: patientAge || '', patientGender: patientGender || '', patientLang: patientLang || 'English',
      patientPhone: patientPhone || '', patientContact: patientContact || patientPhone || '',
      patientSymptoms: patientSymptoms || symptoms || '', symptoms: symptoms || patientSymptoms || '',
      aiResult: aiResult || null, slot: slot || '', consultationType: consultationType || 'in_person',
      createdAt: new Date(), notes: null, prescription: null,
    })
    console.log(`[consultations] Created: ${consultation.id} for doctor ${doctorId} (patient: ${patientName})`)
    res.status(201).json({ success: true, consultation: consultation.toObject() })
  } catch (error) { next(error) }
})

router.get('/consultations', requireDoctor, async (req, res, next) => {
  try {
    const consultations = await Consultation.find({ doctorId: req.doctor.id }).sort({ createdAt: -1 }).lean()
    res.json({ success: true, consultations })
  } catch (error) { next(error) }
})

router.get('/consultations/:id', requireConsultationViewer, async (req, res, next) => {
  try {
    const consultation = await Consultation.findOne({ id: req.params.id }).lean()
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found.' })
    const ownsAsPatient = req.patient && consultation.patientId === req.patient.patientId
    const ownsAsDoctor = req.doctor && consultation.doctorId === req.doctor.id
    if (!ownsAsPatient && !ownsAsDoctor) return res.status(403).json({ success: false, message: 'You are not authorized to access this consultation.' })
    res.json({ success: true, consultation })
  } catch (error) { next(error) }
})

router.patch('/consultations/:id', requireDoctorMutation, async (req, res, next) => {
  try {
    const consultation = await Consultation.findOne({ id: req.params.id })
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found.' })
    if (consultation.doctorId !== req.doctor.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to modify this consultation.' })
    }

    const { status, notes, prescription } = req.body
    if (status === 'accepted') {
      consultation.status = 'accepted'
      consultation.acceptedAt = new Date()
    } else if (status === 'rejected') {
      consultation.status = 'rejected'
    } else if (status === 'completed' || notes) {
      if (notes) consultation.notes = notes
      consultation.status = 'completed'
      consultation.completedAt = new Date()
    }
    if (prescription) consultation.prescription = prescription

    await consultation.save()
    console.log(`[consultations] Updated ${req.params.id} -> status=${consultation.status}`)
    res.json({ success: true, consultation: consultation.toObject() })
  } catch (error) { next(error) }
})

router.post('/consultations/seed', requireDoctor, async (req, res, next) => {
  try {
    const { doctorId } = req.body
    if (doctorId && doctorId !== req.doctor.id) return res.status(403).json({ success: false, message: 'You are not authorized to seed another doctor.' })
    const doctor = req.doctor.id
    const existing = await Consultation.countDocuments({ doctorId: doctor })
    if (existing > 0) return res.json({ success: true, seeded: false, message: 'Consultations already exist.' })

    const now = Date.now()
    const makeDemo = (offset, data) => {
      const id = uuid()
      return { id, requestId: id, roomId: `consultation_${id}`, doctorId: doctor, createdAt: new Date(now - offset), ...data, _isDemo: true }
    }
    const demos = [
      makeDemo(15 * 60000, { status: 'waiting', patientName: 'Ravi Kumar', patientAge: '45', patientGender: 'Male', patientLang: 'Kannada', patientPhone: '+91 98001 11001', slot: '10:00 AM', symptoms: 'Chest pain and shortness of breath for 2 days', aiResult: { possibleDiseases: ['Angina', 'Cardiac Arrhythmia'], recommendedSpecialist: 'Cardiologist', severity: 'High', confidence: 88, emergencyFlag: true, urgencyNote: 'Seek immediate medical attention.' }, notes: null, prescription: null }),
      makeDemo(20 * 60000, { status: 'waiting', patientName: 'Sunita Devi', patientAge: '60', patientGender: 'Female', patientLang: 'Hindi', patientPhone: '+91 98002 22002', slot: '11:00 AM', symptoms: 'Persistent headache and dizziness for 3 days', aiResult: { possibleDiseases: ['Hypertension', 'Migraine'], recommendedSpecialist: 'Neurologist', severity: 'Moderate', confidence: 74, emergencyFlag: false, urgencyNote: 'Consult within 24 hours.' }, notes: null, prescription: null }),
      makeDemo(2 * 3600000, { status: 'completed', patientName: 'Meghana Patil', patientAge: '28', patientGender: 'Female', patientLang: 'English', patientPhone: '+91 98003 33003', slot: '09:00 AM', symptoms: 'Fever, cough and body ache for 3 days', aiResult: { possibleDiseases: ['Viral Fever', 'Influenza'], recommendedSpecialist: 'General Physician', severity: 'Low', confidence: 82, emergencyFlag: false, urgencyNote: 'Rest and hydration advised.' }, notes: { diagnosis: 'Viral fever with mild respiratory symptoms', medicines: [{ name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '3 days' }], advice: 'Rest, drink plenty of fluids', followUp: '3 days' }, prescription: null }),
    ]
    await Consultation.insertMany(demos)
    res.json({ success: true, seeded: true, count: demos.length })
  } catch (error) { next(error) }
})

router.delete('/consultations', async (_req, res, next) => {
  try {
    await Consultation.deleteMany({})
    res.json({ success: true, message: 'All consultations cleared.' })
  } catch (error) { next(error) }
})

module.exports = router
