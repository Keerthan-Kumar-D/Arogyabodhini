const DISEASE_SPECIALTY_MAP = {
  '(vertigo) paroymsal positional vertigo': 'neurologist',
  'aids': 'general-physician',
  'acne': 'dermatologist',
  'alcoholic hepatitis': 'gastroenterologist',
  'allergy': 'general-physician',
  'arthritis': 'rheumatologist',
  'bronchial asthma': 'pulmonologist',
  'cervical spondylosis': 'orthopedist',
  'chicken pox': 'general-physician',
  'chronic cholestasis': 'gastroenterologist',
  'common cold': 'general-physician',
  'dengue': 'general-physician',
  'diabetes': 'endocrinologist',
  'dimorphic hemmorhoids(piles)': 'surgeon',
  'drug reaction': 'dermatologist',
  'fungal infection': 'dermatologist',
  'gerd': 'gastroenterologist',
  'gastroenteritis': 'gastroenterologist',
  'heart attack': 'cardiologist',
  'hepatitis b': 'gastroenterologist',
  'hepatitis c': 'gastroenterologist',
  'hepatitis d': 'gastroenterologist',
  'hepatitis e': 'gastroenterologist',
  'hypertension': 'cardiologist',
  'hyperthyroidism': 'endocrinologist',
  'hypoglycemia': 'endocrinologist',
  'hypothyroidism': 'endocrinologist',
  'impetigo': 'dermatologist',
  'jaundice': 'gastroenterologist',
  'malaria': 'general-physician',
  'migraine': 'neurologist',
  'osteoarthristis': 'orthopedist',
  'paralysis (brain hemorrhage)': 'neurologist',
  'peptic ulcer diseae': 'gastroenterologist',
  'pneumonia': 'pulmonologist',
  'psoriasis': 'dermatologist',
  'tuberculosis': 'pulmonologist',
  'typhoid': 'general-physician',
  'urinary tract infection': 'urologist',
  'varicose veins': 'vascular-surgeon',
  'hepatitis a': 'gastroenterologist',
}

const normalizeDiseaseName = (disease) => String(disease || '')
  .trim()
  .replace(/\s+/g, ' ')
  .toLowerCase()

const normalizeSpecialty = (specialty) => String(specialty || '')
  .trim()
  .replace(/\s+/g, '-')
  .toLowerCase()

const normalizeDoctorSpecialty = (specialty) => {
  const normalized = normalizeSpecialty(specialty)
  return {
    'orthopedic-surgeon': 'orthopedist',
  }[normalized] || normalized
}

const getSpecialtyForDisease = (disease) =>
  DISEASE_SPECIALTY_MAP[normalizeDiseaseName(disease)] || null

module.exports = {
  getSpecialtyForDisease,
  normalizeDiseaseName,
  normalizeSpecialty,
  normalizeDoctorSpecialty,
}
