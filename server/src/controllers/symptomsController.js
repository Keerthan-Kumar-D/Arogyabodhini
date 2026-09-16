const { predictFromSymptomText, titleCase } = require('../services/diseasePredictionService')
const { lookupDoctorsByDiseases } = require('./doctorsController')

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

    const prediction = predictFromSymptomText(symptoms.trim())
    const lookup = await lookupDoctorsByDiseases(prediction.possibleDiseases)

    const recommendedSpecialist = lookup.specialty
      ? titleCase(lookup.specialty)
      : 'General Physician'

    res.status(200).json({
      success: true,
      data: {
        possibleDiseases:      prediction.possibleDiseases,
        matchedSymptoms:       prediction.matchedSymptoms,
        recommendedSpecialist,
        severity:              prediction.severity,
        urgencyNote:           prediction.urgencyNote,
        emergencyFlag:         prediction.emergencyFlag,
        confidence:            prediction.confidence,
        recommendedDoctors:    lookup.doctors || [],
        language:              language || 'en',
        analyzedAt:            new Date().toISOString(),
      },
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { analyzeSymptoms }
