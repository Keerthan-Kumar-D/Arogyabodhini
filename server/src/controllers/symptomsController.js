const { SYMPTOM_MAP, EMERGENCY_PATTERNS, DEFAULT_RESPONSE } = require('../data/mockData')
const { DOCTORS } = require('../data/doctorsData')

/** Keyword scoring + emergency override */
const analyzeSymptomText = (text) => {
  const lower = text.toLowerCase()

  // Emergency override check
  const isEmergency = EMERGENCY_PATTERNS.some(group =>
    (Array.isArray(group) ? group : [group]).some(kw => lower.includes(kw))
  )

  // Score each entry
  let best = null, bestScore = 0
  for (const entry of SYMPTOM_MAP) {
    const score = entry.keywords.reduce((acc, kw) => lower.includes(kw) ? acc + 1 : acc, 0)
    if (score > bestScore) { bestScore = score; best = entry }
  }

  if (!best || bestScore === 0) {
    return { ...DEFAULT_RESPONSE, emergencyFlag: isEmergency, matchedKeywords: 0 }
  }

  const confidence = Math.min(95, Math.round(40 + (bestScore / best.keywords.length) * 55))

  return {
    diseases:      best.diseases,
    specialist:    best.specialist,
    severity:      isEmergency ? 'High' : best.severity,
    urgencyNote:   isEmergency
      ? '🚨 EMERGENCY: Your symptoms may indicate a life-threatening condition. Call 108 or go to the nearest emergency room immediately.'
      : best.urgencyNote,
    emergencyFlag: isEmergency || best.emergencyFlag,
    confidence,
    matchedKeywords: bestScore,
  }
}

/** Filter doctors by specialty for the recommendation */
const getRecommendedDoctors = (specialistType, emergencyOnly = false) => {
  let filtered = DOCTORS.filter(d => d.specialty === specialistType)
  if (filtered.length === 0) filtered = DOCTORS.filter(d => d.specialty === 'General Physician')
  if (emergencyOnly) filtered = filtered.filter(d => d.isEmergencyAvailable)
  // Sort: now > today > tomorrow
  const order = { now: 0, today: 1, tomorrow: 2 }
  return filtered.sort((a, b) => (order[a.availabilityStatus] ?? 3) - (order[b.availabilityStatus] ?? 3))
}

/** POST /api/analyze-symptoms */
const analyzeSymptoms = (req, res, next) => {
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

    const result = analyzeSymptomText(symptoms.trim())
    const doctors = getRecommendedDoctors(result.specialist, result.emergencyFlag)

    setTimeout(() => {
      res.status(200).json({
        success: true,
        data: {
          possibleDiseases:      result.diseases,
          recommendedSpecialist: result.specialist,
          severity:              result.severity,
          urgencyNote:           result.urgencyNote,
          emergencyFlag:         result.emergencyFlag,
          confidence:            result.confidence,
          recommendedDoctors:    doctors,
          language:              language || 'en',
          analyzedAt:            new Date().toISOString(),
        },
      })
    }, 700)

  } catch (err) { next(err) }
}

module.exports = { analyzeSymptoms }
