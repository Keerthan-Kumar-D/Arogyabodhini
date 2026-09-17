/**
 * autoSeed.js
 * -----------
 * Called automatically on server startup (from server.js).
 * Seeds doctors and provisions doctor access if needed.
 * Idempotent — safe to call every time the server starts.
 */

const mongoose = require('mongoose')
const Doctor = require('../models/Doctor')
const { hashPassword } = require('../services/doctorAuth')
const { DOCTORS } = require('../data/doctorsData')
const { normalizeDoctorSpecialty } = require('../config/diseaseSpecialtyMap')

const slugify = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')

const seededDoctors = DOCTORS.map((doctor) => ({
  ...doctor,
  specialty: normalizeDoctorSpecialty(doctor.specialty),
}))

const provisionDoctorAccess = async () => {
  const defaultPassword = process.env.DOCTOR_DEFAULT_PASSWORD
  const defaultPasswordHash = defaultPassword ? hashPassword(defaultPassword) : null
  const doctors = await Doctor.find({}).select('_id name entry_id email passwordHash availability availabilityStatus').lean()

  const operations = doctors.map((doctor) => {
    const email = doctor.email || `doctor-${slugify(doctor.name)}-${doctor.entry_id || doctor._id}@arogyabodhini.com`
    const set = {
      email,
      availability: doctor.availability || 'Not Available',
      availabilityStatus: doctor.availabilityStatus || 'unavailable',
    }
    if (!doctor.passwordHash && defaultPasswordHash) set.passwordHash = defaultPasswordHash

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

// ─── Auto-seed ───────────────────────────────────────────────────────────────

const autoSeed = async () => {
  try {
    await Doctor.bulkWrite(
      seededDoctors.map((doctor) => ({
        updateOne: {
          filter: { id: doctor.id },
          update: { $set: doctor },
          upsert: true,
        },
      }))
    )

    for (const doctor of seededDoctors) {
      const records = await Doctor.find({
        id: doctor.id,
      }).sort({ _id: 1 }).select('_id').lean()

      if (records.length > 1) {
        await Doctor.deleteMany({
          _id: { $in: records.slice(1).map((record) => record._id) },
        })
      }
    }

    const doctorAccessCount = await provisionDoctorAccess()

    console.log(`[seed] Verified ${seededDoctors.length} seed doctors and access for ${doctorAccessCount} database doctors`)
  } catch (err) {
    console.error('[seed] Auto-seed failed:', err.message)
    // Non-fatal — server continues even if seed fails
  }
}

module.exports = autoSeed
