const Doctor = require('../models/Doctor')
const {
  getSpecialtyForDisease,
  normalizeDiseaseName,
  normalizeSpecialty,
} = require('../config/diseaseSpecialtyMap')

const specialtyQuery = (specialty) => ({ specialty: normalizeSpecialty(specialty) })

const prioritizeSeedDoctors = (doctors) => [...doctors].sort((a, b) => {
  const aIsSeed = /^doc-\d+$/i.test(String(a.id || ''))
  const bIsSeed = /^doc-\d+$/i.test(String(b.id || ''))
  if (aIsSeed !== bIsSeed) return aIsSeed ? -1 : 1
  if (aIsSeed && bIsSeed) return String(a.id).localeCompare(String(b.id), undefined, { numeric: true })
  return 0
})

/** GET /api/doctors/by-disease/:disease */
const getDoctorsByDisease = async (req, res, next) => {
  try {
    const disease = normalizeDiseaseName(req.params.disease)

    if (!disease) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Disease name is required.',
      })
    }

    const specialty = getSpecialtyForDisease(disease)
    if (!specialty) {
      return res.status(404).json({
        success: false,
        error: 'DISEASE_NOT_FOUND',
        message: `No specialty mapping found for disease "${disease}".`,
      })
    }

    const doctors = prioritizeSeedDoctors(await Doctor.find(specialtyQuery(specialty)).lean())

    if (!doctors.length) {
      return res.status(404).json({
        success: false,
        error: 'NO_DOCTORS_FOUND',
        message: `No doctors found for specialty "${specialty}".`,
        data: {
          disease,
          specialty,
          doctors: [],
        },
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        disease,
        specialty,
        doctors,
      },
    })
  } catch (err) {
    next(err)
  }
}

const lookupDoctorsByDisease = async (diseaseName) => {
  const disease = normalizeDiseaseName(diseaseName)
  if (!disease) {
    return { found: false, disease: '', specialty: null, doctors: [] }
  }

  const specialty = getSpecialtyForDisease(disease)
  if (!specialty) {
    return { found: false, disease, specialty: null, doctors: [] }
  }

  const doctors = prioritizeSeedDoctors(await Doctor.find(specialtyQuery(specialty)).lean())

  return {
    found: true,
    disease,
    specialty,
    doctors,
  }
}

module.exports = { getDoctorsByDisease, lookupDoctorsByDisease }
