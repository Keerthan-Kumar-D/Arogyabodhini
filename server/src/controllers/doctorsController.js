const Doctor = require('../models/Doctor')
const DoctorSpecialization = require('../models/DoctorSpecialization')

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const exactInsensitive = (value) => ({
  $regex: `^${escapeRegex(value)}$`,
  $options: 'i',
})

const flexibleInsensitive = (value) => ({
  $regex: `^${String(value)
    .trim()
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(escapeRegex)
    .join('[-_\\s]+')}$`,
  $options: 'i',
})

const specialtyQuery = (specialty) => ({
  $or: [
    { specialty: flexibleInsensitive(specialty) },
    { spec: flexibleInsensitive(specialty) },
    { specialization: flexibleInsensitive(specialty) },
  ],
})

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
    const disease = (req.params.disease || '').trim()

    if (!disease) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Disease name is required.',
      })
    }

    const mapping = await DoctorSpecialization.findOne({
      disease: exactInsensitive(disease),
    }).lean()

    if (!mapping || !mapping.specialty) {
      return res.status(404).json({
        success: false,
        error: 'DISEASE_NOT_FOUND',
        message: `No specialty mapping found for disease "${disease}".`,
      })
    }

    const specialty = mapping.specialty
    const doctors = prioritizeSeedDoctors(await Doctor.find(specialtyQuery(specialty)).lean())

    if (!doctors.length) {
      return res.status(404).json({
        success: false,
        error: 'NO_DOCTORS_FOUND',
        message: `No doctors found for specialty "${specialty}".`,
        data: {
          disease: mapping.disease,
          specialty,
          doctors: [],
        },
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        disease: mapping.disease,
        specialty,
        doctors,
      },
    })
  } catch (err) {
    next(err)
  }
}

const lookupDoctorsByDisease = async (diseaseName) => {
  const disease = (diseaseName || '').trim()
  if (!disease) {
    return { found: false, disease: '', specialty: null, doctors: [] }
  }

  const mapping = await DoctorSpecialization.findOne({
    disease: exactInsensitive(disease),
  }).lean()

  if (!mapping || !mapping.specialty) {
    return { found: false, disease, specialty: null, doctors: [] }
  }

  const doctors = prioritizeSeedDoctors(await Doctor.find(specialtyQuery(mapping.specialty)).lean())

  return {
    found: true,
    disease: mapping.disease,
    specialty: mapping.specialty,
    doctors,
  }
}

const lookupDoctorsByDiseases = async (predictions) => {
  const candidates = Array.isArray(predictions) ? predictions : []
  const mappings = []

  for (const prediction of candidates) {
    const disease = String(prediction?.disease || '').trim()
    if (!disease) continue

    const mapping = await DoctorSpecialization.findOne({
      disease: exactInsensitive(disease),
    }).lean()

    if (mapping?.specialty) {
      mappings.push({
        ...mapping,
        probability: Number(prediction.probability) || 0,
      })
    }
  }

  if (!mappings.length) {
    return { found: false, disease: '', specialty: null, doctors: [] }
  }

  const specialtyScores = new Map()
  for (const mapping of mappings) {
    const key = mapping.specialty.toLowerCase()
    const current = specialtyScores.get(key) || { specialty: mapping.specialty, score: 0, order: mappings.length }
    current.score += mapping.probability
    current.order = Math.min(current.order, mappings.indexOf(mapping))
    specialtyScores.set(key, current)
  }

  const selected = [...specialtyScores.values()].sort((a, b) =>
    b.score - a.score || a.order - b.order
  )[0]
  const selectedMapping = mappings.find(
    (mapping) => mapping.specialty.toLowerCase() === selected.specialty.toLowerCase()
  )
  const doctors = prioritizeSeedDoctors(await Doctor.find(specialtyQuery(selected.specialty)).lean())

  return {
    found: true,
    disease: selectedMapping.disease,
    specialty: selected.specialty,
    doctors,
  }
}

module.exports = { getDoctorsByDisease, lookupDoctorsByDisease, lookupDoctorsByDiseases }
