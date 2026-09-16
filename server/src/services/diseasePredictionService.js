const { loadSymptomDataset } = require('../data/csvLoader')
const { trainBernoulliNB, predictProba } = require('./bernoulliNaiveBayes')
const { matchSymptomsFromText, toDisplaySymptom } = require('./symptomMatcher')
const { EMERGENCY_PATTERNS } = require('../data/mockData')

const HIGH_SYMPTOMS = new Set([
  'chest_pain', 'breathlessness', 'high_fever', 'coma', 'palpitations',
  'fast_heart_rate', 'acute_liver_failure', 'stomach_bleeding',
  'blood_in_sputum', 'altered_sensorium', 'weakness_of_one_body_side',
  'slurred_speech', 'sunken_eyes', 'dehydration',
])

const MODERATE_SYMPTOMS = new Set([
  'vomiting', 'diarrhoea', 'abdominal_pain', 'dizziness', 'nausea',
  'headache', 'joint_pain', 'blurred_and_distorted_vision', 'mild_fever',
  'burning_micturition', 'yellowish_skin', 'dark_urine',
])

let cachedModel = null

const getModel = () => {
  if (cachedModel) return cachedModel
  const dataset = loadSymptomDataset()
  const nb = trainBernoulliNB(dataset.samples, dataset.featureNames.length)
  const featureIndex = new Map(dataset.featureNames.map((name, i) => [name, i]))
  cachedModel = { dataset, nb, featureIndex }
  return cachedModel
}

const round4 = (value) => Math.round(value * 10000) / 10000

const titleCase = (value) =>
  String(value || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const detectEmergency = (text) => {
  const lower = String(text || '').toLowerCase()
  return EMERGENCY_PATTERNS.some((group) =>
    (Array.isArray(group) ? group : [group]).some((kw) => lower.includes(kw))
  )
}

const inferSeverity = (matchedFeatures, isEmergency) => {
  if (isEmergency || matchedFeatures.some((name) => HIGH_SYMPTOMS.has(name))) return 'High'
  if (matchedFeatures.some((name) => MODERATE_SYMPTOMS.has(name))) return 'Moderate'
  return 'Low'
}

const buildUrgencyNote = (isEmergency, matchedCount) => {
  if (isEmergency) {
    return 'These symptoms may indicate a medical emergency. Call 108 or go to the nearest emergency room. This is a model prediction, not a diagnosis.'
  }
  if (matchedCount === 0) {
    return 'No dataset symptoms could be matched from the description. Please add more specific symptoms and consult a qualified doctor. This is not a diagnosis.'
  }
  return 'These are possible conditions from a symptom model, not a confirmed diagnosis. Please consult a qualified doctor for medical advice.'
}

const predictFromSymptomText = (text) => {
  const { dataset, nb, featureIndex } = getModel()
  const matchedFeatures = matchSymptomsFromText(text, dataset.featureNames)
  const observedIndices = matchedFeatures
    .map((name) => featureIndex.get(name))
    .filter((index) => Number.isInteger(index))

  const isEmergency = detectEmergency(text)
  const severity = inferSeverity(matchedFeatures, isEmergency)
  const matchedSymptoms = matchedFeatures.map(toDisplaySymptom)

  if (observedIndices.length === 0) {
    return {
      possibleDiseases: [],
      matchedSymptoms,
      matchedFeatures,
      confidence: 0,
      severity,
      emergencyFlag: isEmergency,
      urgencyNote: buildUrgencyNote(isEmergency, 0),
    }
  }

  const ranked = predictProba(nb, observedIndices)
    .slice(0, 5)
    .map((item) => ({
      disease: item.disease,
      probability: round4(item.probability),
    }))

  const confidence = Math.min(95, Math.round((ranked[0]?.probability || 0) * 100))

  return {
    possibleDiseases: ranked,
    matchedSymptoms,
    matchedFeatures,
    confidence,
    severity,
    emergencyFlag: isEmergency,
    urgencyNote: buildUrgencyNote(isEmergency, matchedFeatures.length),
    topDisease: ranked[0]?.disease || null,
  }
}

module.exports = {
  predictFromSymptomText,
  getModel,
  titleCase,
}
