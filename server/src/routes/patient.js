const express = require('express')
const router = express.Router()
const Consultation = require('../models/Consultation')
const { requirePatient } = require('../middleware/patientAuth')

router.get('/patient/consultations', requirePatient, async (req, res, next) => {
  try {
    const consultations = await Consultation.find({ patientId: req.patient.patientId }).sort({ createdAt: -1 }).lean()
    res.json({ success: true, consultations })
  } catch (error) { next(error) }
})

router.get('/patient/prescriptions', requirePatient, async (req, res, next) => {
  try {
    const consultations = await Consultation.find({ patientId: req.patient.patientId, prescription: { $ne: null } }).sort({ createdAt: -1 }).lean()
    res.json({ success: true, prescriptions: consultations.map((consultation) => ({
      consultationId: consultation.id,
      prescription: consultation.prescription,
      doctorName: consultation.doctorName,
      doctorSpecialty: consultation.doctorSpecialty || consultation.aiResult?.recommendedSpecialist || '',
      consultationDate: consultation.createdAt,
      diagnosis: consultation.notes?.diagnosis || consultation.prescription?.diagnosis || '',
    })) })
  } catch (error) { next(error) }
})

module.exports = router