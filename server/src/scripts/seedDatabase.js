/**
 * seedDatabase.js
 * ----------------
 * Seeds MongoDB with:
 *   1. doctor_specialization — CSV disease names -> specialty
 *   2. doctors               — doctor profiles from doctorsData.js
 *
 * Run: node src/scripts/seedDatabase.js
 */

require('dotenv').config()
const mongoose = require('mongoose')
const { DOCTORS } = require('../data/doctorsData')

// --- Models ------------------------------------------------------------------

const DoctorSpecialization = mongoose.model(
  'DoctorSpecialization',
  new mongoose.Schema({ disease: String, specialty: String }, {
    collection: 'doctor_specialization',
    strict: false,
  })
)

const Doctor = mongoose.model(
  'Doctor',
  new mongoose.Schema({}, { collection: 'doctors', strict: false })
)

// --- Disease -> Specialty Map (aligned with CSV prognosis column) -------------

const DISEASE_SPECIALTY_MAP = [
  // Skin / Dermatology
  { disease: 'Fungal infection', specialty: 'Dermatologist' },
  { disease: 'Allergy', specialty: 'Dermatologist' },
  { disease: 'Drug Reaction', specialty: 'Dermatologist' },
  { disease: 'Acne', specialty: 'Dermatologist' },
  { disease: 'Psoriasis', specialty: 'Dermatologist' },
  { disease: 'Impetigo', specialty: 'Dermatologist' },
  { disease: 'Chicken pox', specialty: 'Dermatologist' },

  // Gastroenterology / Hepatology
  { disease: 'GERD', specialty: 'Gastroenterologist' },
  { disease: 'Chronic cholestasis', specialty: 'Gastroenterologist' },
  { disease: 'Peptic ulcer diseae', specialty: 'Gastroenterologist' },
  { disease: 'Gastroenteritis', specialty: 'Gastroenterologist' },
  { disease: 'hepatitis A', specialty: 'Gastroenterologist' },
  { disease: 'Hepatitis B', specialty: 'Gastroenterologist' },
  { disease: 'Hepatitis C', specialty: 'Gastroenterologist' },
  { disease: 'Hepatitis D', specialty: 'Gastroenterologist' },
  { disease: 'Hepatitis E', specialty: 'Gastroenterologist' },
  { disease: 'Alcoholic hepatitis', specialty: 'Gastroenterologist' },
  { disease: 'Jaundice', specialty: 'Gastroenterologist' },
  { disease: 'Dimorphic hemmorhoids(piles)', specialty: 'Gastroenterologist' },

  // Neurology
  { disease: 'Migraine', specialty: 'Neurologist' },
  { disease: 'Cervical spondylosis', specialty: 'Neurologist' },
  { disease: 'Paralysis (brain hemorrhage)', specialty: 'Neurologist' },
  { disease: '(vertigo) Paroymsal  Positional Vertigo', specialty: 'Neurologist' },

  // Infectious / General Medicine
  { disease: 'AIDS', specialty: 'General Physician' },
  { disease: 'Malaria', specialty: 'General Physician' },
  { disease: 'Dengue', specialty: 'General Physician' },
  { disease: 'Typhoid', specialty: 'General Physician' },
  { disease: 'Common Cold', specialty: 'General Physician' },

  // Pulmonology
  { disease: 'Tuberculosis', specialty: 'Pulmonologist' },
  { disease: 'Pneumonia', specialty: 'Pulmonologist' },
  { disease: 'Bronchial Asthma', specialty: 'Pulmonologist' },

  // Cardiology
  { disease: 'Heart attack', specialty: 'Cardiologist' },
  { disease: 'Hypertension', specialty: 'Cardiologist' },
  { disease: 'Varicose veins', specialty: 'Cardiologist' },

  // Endocrinology
  { disease: 'Diabetes', specialty: 'Endocrinologist' },
  { disease: 'Hypothyroidism', specialty: 'Endocrinologist' },
  { disease: 'Hyperthyroidism', specialty: 'Endocrinologist' },
  { disease: 'Hypoglycemia', specialty: 'Endocrinologist' },

  // Orthopedics
  { disease: 'Osteoarthristis', specialty: 'Orthopedic Surgeon' },
  { disease: 'Arthritis', specialty: 'Orthopedic Surgeon' },

  // Urology
  { disease: 'Urinary tract infection', specialty: 'Urologist' },
]

// --- Seeder ------------------------------------------------------------------

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'arogyabodhini' })
  console.log('Connected to MongoDB')

  // 1. Doctor Specializations
  await DoctorSpecialization.deleteMany({})
  await DoctorSpecialization.insertMany(DISEASE_SPECIALTY_MAP)
  console.log('Seeded', DISEASE_SPECIALTY_MAP.length, 'disease->specialty mappings')

  // 2. Doctors
  await Doctor.deleteMany({})
  await Doctor.insertMany(DOCTORS)
  console.log('Seeded', DOCTORS.length, 'doctor records')

  await mongoose.disconnect()
  console.log('Done.')
}

seed().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
