const { predictFromSymptomText, titleCase } = require('../services/diseasePredictionService')
const { lookupDoctorsByDisease } = require('./doctorsController')
const { getBaselineSeverity } = require('../services/severityService')

/** POST /api/analyze-symptoms */
const analyzeSymptoms = async (req, res, next) => {
  try {
    const { symptoms, language } = req.body

    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length < 3) {
      return res.status(400).json({
        success: false, error: 'INVALID_INPUT',
        message: 'Field "symptoms" must be a string of at least 3 characters.',
      })
    }
    if (symptoms.length > 2000) {
      return res.status(400).json({
        success: false, error: 'TOO_LONG',
        message: 'Symptom description must be under 2000 characters.',
      })
    }

    const trimmedSymptoms = symptoms.trim()
    const prediction = predictFromSymptomText(trimmedSymptoms)
    const matchedSymptoms = prediction.matchedSymptoms || []

    if (matchedSymptoms.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          noMatch: true,
          noMatchMessage: 'No matching symptoms found. Please describe your symptoms using different words.',
          inputSymptoms: trimmedSymptoms,
          predictions: [],
          possibleDiseases: [],
          predictedDisease: null,
          matchedSymptoms: [],
          recommendedSpecialist: null,
          specialty: null,
          severity: null,
          urgencyNote: null,
          emergencyFlag: false,
          action: null,
          confidence: 0,
          recommendedDoctors: [],
          doctors: [],
          language: language || 'en',
          analyzedAt: new Date().toISOString(),
        },
      })
    }

    const predictedDisease = prediction.predictedDisease || prediction.topDisease || null
    const lookup = await lookupDoctorsByDisease(predictedDisease)
    const specialty = lookup.specialty || 'general-physician'
    const recommendedSpecialist = lookup.specialty
      ? titleCase(lookup.specialty.replace(/-/g, ' '))
      : 'General Physician'

    const predictions = Array.isArray(prediction.possibleDiseases)
      ? prediction.possibleDiseases.map((item) => ({
          ...item,
          baselineSeverity: getBaselineSeverity(item.disease),
        }))
      : []

    const severity = prediction.severity || {
      level: 1,
      label: 'Low',
      baselineLevel: 1,
      redFlagsDetected: false,
      reasons: ['No warning symptoms were identified from the reported symptoms.'],
    }

    res.status(200).json({
      success: true,
      data: {
        predictions,
        possibleDiseases: predictions,
        predictedDisease,
        matchedSymptoms,
        inputSymptoms: trimmedSymptoms,
        recommendedSpecialist,
        specialty,
        severity,
        urgencyNote: prediction.urgencyNote || 'Please consult a qualified doctor for medical advice.',
        emergencyFlag: severity.level >= 4,
        action: prediction.action || {
          type: 'monitor',
          message: 'Your reported symptoms may require prompt medical evaluation.',
        },
        confidence: prediction.confidence || 0,
        recommendedDoctors: lookup.doctors || [],
        doctors: lookup.doctors || [],
        language: language || 'en',
        analyzedAt: new Date().toISOString(),
      },
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { analyzeSymptoms }
