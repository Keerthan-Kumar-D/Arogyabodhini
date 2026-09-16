/**
 * autoSeed.js
 * -----------
 * Called automatically on server startup (from server.js).
 * Seeds doctor_specialization and doctors collections if they are empty.
 * Idempotent — safe to call every time the server starts.
 */

const mongoose = require('mongoose')
const DoctorSpecialization = require('../models/DoctorSpecialization')
const Doctor = require('../models/Doctor')
const { hashPassword } = require('../services/doctorAuth')
const { DOCTORS } = require('../data/doctorsData')

const slugify = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')

const provisionDoctorAccess = async () => {
  const defaultPassword = process.env.DOCTOR_DEFAULT_PASSWORD || 'Doctor@123'
  const defaultPasswordHash = hashPassword(defaultPassword)
  const doctors = await Doctor.find({}).select('_id name entry_id email passwordHash availability availabilityStatus').lean()

  const operations = doctors.map((doctor) => {
    const email = doctor.email || `doctor-${slugify(doctor.name)}-${doctor.entry_id || doctor._id}@arogyabodhini.com`
    const set = {
      email,
      passwordHash: doctor.passwordHash || defaultPasswordHash,
      availability: doctor.availability || 'Not Available',
      availabilityStatus: doctor.availabilityStatus || 'unavailable',
    }

    return {
      updateOne: {
        filter: { _id: doctor._id },
        update: { $set: set },
      },
    }
  })

  if (operations.length) await Doctor.bulkWrite(operations)
  return doctors.length
}

// ─── Disease → Specialty Map (all 41 CSV disease labels) ─────────────────────

const DISEASE_SPECIALTY_MAP = [
  // Skin / Dermatology
  { disease: 'Fungal infection',     specialty: 'Dermatologist' },
  { disease: 'Allergy',              specialty: 'Dermatologist' },
  { disease: 'Drug Reaction',        specialty: 'Dermatologist' },
  { disease: 'Acne',                 specialty: 'Dermatologist' },
  { disease: 'Psoriasis',            specialty: 'Dermatologist' },
  { disease: 'Impetigo',             specialty: 'Dermatologist' },
  { disease: 'Chicken pox',          specialty: 'Dermatologist' },

  // Gastroenterology / Hepatology
  { disease: 'GERD',                 specialty: 'Gastroenterologist' },
  { disease: 'Chronic cholestasis',  specialty: 'Gastroenterologist' },
  { disease: 'Peptic ulcer diseae',  specialty: 'Gastroenterologist' },
  { disease: 'Gastroenteritis',      specialty: 'Gastroenterologist' },
  { disease: 'hepatitis A',          specialty: 'Gastroenterologist' },
  { disease: 'Hepatitis B',          specialty: 'Gastroenterologist' },
  { disease: 'Hepatitis C',          specialty: 'Gastroenterologist' },
  { disease: 'Hepatitis D',          specialty: 'Gastroenterologist' },
  { disease: 'Hepatitis E',          specialty: 'Gastroenterologist' },
  { disease: 'Alcoholic hepatitis',  specialty: 'Gastroenterologist' },
  { disease: 'Jaundice',             specialty: 'Gastroenterologist' },
  { disease: 'Dimorphic hemmorhoids(piles)', specialty: 'Gastroenterologist' },

  // Neurology
  { disease: 'Migraine',                               specialty: 'Neurologist' },
  { disease: 'Cervical spondylosis',                   specialty: 'Neurologist' },
  { disease: 'Paralysis (brain hemorrhage)',            specialty: 'Neurologist' },
  { disease: '(vertigo) Paroymsal  Positional Vertigo', specialty: 'Neurologist' },

  // Infectious / General
  { disease: 'AIDS',          specialty: 'General Physician' },
  { disease: 'Malaria',       specialty: 'General Physician' },
  { disease: 'Dengue',        specialty: 'General Physician' },
  { disease: 'Typhoid',       specialty: 'General Physician' },
  { disease: 'Common Cold',   specialty: 'General Physician' },

  // Pulmonology
  { disease: 'Tuberculosis',     specialty: 'Pulmonologist' },
  { disease: 'Pneumonia',        specialty: 'Pulmonologist' },
  { disease: 'Bronchial Asthma', specialty: 'Pulmonologist' },

  // Cardiology
  { disease: 'Heart attack',    specialty: 'Cardiologist' },
  { disease: 'Hypertension',    specialty: 'Cardiologist' },
  { disease: 'Varicose veins',  specialty: 'Cardiologist' },

  // Endocrinology
  { disease: 'Diabetes',         specialty: 'Endocrinologist' },
  { disease: 'Hypothyroidism',   specialty: 'Endocrinologist' },
  { disease: 'Hyperthyroidism',  specialty: 'Endocrinologist' },
  { disease: 'Hypoglycemia',     specialty: 'Endocrinologist' },

  // Orthopedics
  { disease: 'Osteoarthristis',  specialty: 'Orthopedic Surgeon' },
  { disease: 'Arthritis',        specialty: 'Orthopedic Surgeon' },

  // Urology
  { disease: 'Urinary tract infection', specialty: 'Urologist' },
]

// ─── Auto-seed ───────────────────────────────────────────────────────────────

const autoSeed = async () => {
  try {
    await DoctorSpecialization.bulkWrite(
      DISEASE_SPECIALTY_MAP.map((mapping) => ({
        updateOne: {
          filter: { disease: mapping.disease },
          update: { $set: mapping },
          upsert: true,
        },
      }))
    )

    await Doctor.bulkWrite(
      DOCTORS.map((doctor) => ({
        updateOne: {
          filter: { name: doctor.name, specialty: doctor.specialty },
          update: { $set: doctor },
          upsert: true,
        },
      }))
    )

    for (const doctor of DOCTORS) {
      const records = await Doctor.find({
        name: doctor.name,
        specialty: doctor.specialty,
      }).sort({ _id: 1 }).select('_id').lean()

      if (records.length > 1) {
        await Doctor.deleteMany({
          _id: { $in: records.slice(1).map((record) => record._id) },
        })
      }
    }

    const doctorAccessCount = await provisionDoctorAccess()

    console.log(`[seed] Verified ${DISEASE_SPECIALTY_MAP.length} disease mappings, ${DOCTORS.length} seed doctors, and access for ${doctorAccessCount} database doctors`)
  } catch (err) {
    console.error('[seed] Auto-seed failed:', err.message)
    // Non-fatal — server continues even if seed fails
  }
}

module.exports = autoSeed
