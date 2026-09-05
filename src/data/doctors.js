/**
 * doctors.js — Mock Doctor Database
 * Covers all specializations that the AI may recommend.
 * Ready for future backend integration: replace this array with an API call.
 */

const DOCTORS = [
  {
    id: 'doc-priya-sharma',
    name: 'Dr. Priya Sharma',
    initials: 'PS',
    bgColor: '#1565c0',
    spec: 'Cardiologist',
    hospital: 'Apollo Hospital, Bangalore',
    exp: '14 years',
    expYears: 14,
    rating: 4.9,
    reviews: 312,
    langs: ['English', 'Hindi', 'Kannada'],
    fee: '₹600',
    online: true,
    availStatus: 'now',
    availLabel: 'Available Now',
    phone: '+91 98765 00001',
    about:
      'Dr. Priya Sharma is a senior cardiologist with 14 years of experience in treating heart diseases, hypertension, and cardiac emergencies. She completed her MD from AIIMS New Delhi and her DM (Cardiology) from PGI Chandigarh.',
    education: [
      'MBBS — AIIMS, New Delhi (2007)',
      'MD Medicine — AIIMS, New Delhi (2010)',
      'DM Cardiology — PGI, Chandigarh (2013)',
    ],
    slots: ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'],
    specializations: ['Coronary Artery Disease', 'Heart Failure', 'Hypertension', 'ECG & Echo'],
  },
  {
    id: 'doc-rajesh-kumar',
    name: 'Dr. Rajesh Kumar',
    initials: 'RK',
    bgColor: '#6a1b9a',
    spec: 'Neurologist',
    hospital: 'Manipal Hospital, Chennai',
    exp: '18 years',
    expYears: 18,
    rating: 4.8,
    reviews: 276,
    langs: ['English', 'Tamil', 'Telugu'],
    fee: '₹800',
    online: false,
    availStatus: 'tomorrow',
    availLabel: 'Tomorrow, 10 AM',
    phone: '+91 98765 00002',
    about:
      'Dr. Rajesh Kumar is a leading neurologist specialising in epilepsy, stroke management, and movement disorders. He has published over 30 research papers and is a Fellow of the Indian Academy of Neurology.',
    education: [
      'MBBS — Stanley Medical College, Chennai (2004)',
      'MD Neurology — Madras Medical College (2009)',
      'Fellowship — NIMHANS, Bangalore (2011)',
    ],
    slots: ['10:00 AM', '11:00 AM', '03:00 PM', '05:00 PM'],
    specializations: ['Epilepsy', 'Stroke', 'Migraine', 'Parkinson\'s Disease'],
  },
  {
    id: 'doc-ananya-reddy',
    name: 'Dr. Ananya Reddy',
    initials: 'AR',
    bgColor: '#2e7d32',
    spec: 'General Physician',
    hospital: 'Fortis Hospital, Hyderabad',
    exp: '9 years',
    expYears: 9,
    rating: 4.9,
    reviews: 488,
    langs: ['English', 'Telugu', 'Kannada'],
    fee: '₹400',
    online: true,
    availStatus: 'now',
    availLabel: 'Available Now',
    phone: '+91 98765 00003',
    about:
      'Dr. Ananya Reddy is a highly rated general physician known for her patient-first approach. She manages a wide range of acute and chronic illnesses, from fever and infections to diabetes and lifestyle diseases.',
    education: [
      'MBBS — Osmania Medical College, Hyderabad (2012)',
      'MD General Medicine — Nizam\'s Institute (2016)',
    ],
    slots: ['08:30 AM', '09:30 AM', '11:00 AM', '01:00 PM', '03:30 PM', '05:30 PM'],
    specializations: ['Fever & Infections', 'Diabetes', 'Hypertension', 'Preventive Care'],
  },
  {
    id: 'doc-meena-iyer',
    name: 'Dr. Meena Iyer',
    initials: 'MI',
    bgColor: '#00838f',
    spec: 'General Physician',
    hospital: 'Kauvery Hospital, Chennai',
    exp: '12 years',
    expYears: 12,
    rating: 4.7,
    reviews: 198,
    langs: ['Tamil', 'English', 'Hindi'],
    fee: '₹500',
    online: true,
    availStatus: 'today',
    availLabel: 'Available Today',
    phone: '+91 98765 00004',
    about:
      'Dr. Meena Iyer is a compassionate physician with 12 years of clinical experience. She is known for her detailed consultations and expertise in managing geriatric and chronic conditions.',
    education: [
      'MBBS — Madurai Medical College (2010)',
      'MD General Medicine — Madras Medical College (2014)',
    ],
    slots: ['02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'],
    specializations: ['Chronic Disease Management', 'Geriatric Care', 'Preventive Health', 'Thyroid'],
  },
  {
    id: 'doc-suresh-nair',
    name: 'Dr. Suresh Nair',
    initials: 'SN',
    bgColor: '#ad1457',
    spec: 'Dermatologist',
    hospital: 'Aster CMI, Bangalore',
    exp: '11 years',
    expYears: 11,
    rating: 4.8,
    reviews: 341,
    langs: ['English', 'Kannada', 'Malayalam'],
    fee: '₹550',
    online: true,
    availStatus: 'now',
    availLabel: 'Available Now',
    phone: '+91 98765 00005',
    about:
      'Dr. Suresh Nair is a board-certified dermatologist with expertise in skin disorders, cosmetic dermatology, and hair loss treatment. He has trained at leading institutions in India and the UK.',
    education: [
      'MBBS — Trivandrum Medical College (2009)',
      'MD Dermatology — JIPMER, Puducherry (2013)',
      'Fellowship — Royal College of Physicians, London (2015)',
    ],
    slots: ['09:30 AM', '11:00 AM', '12:30 PM', '04:00 PM'],
    specializations: ['Acne & Skin Disorders', 'Hair Loss', 'Psoriasis', 'Cosmetic Procedures'],
  },
  {
    id: 'doc-kavitha-rao',
    name: 'Dr. Kavitha Rao',
    initials: 'KR',
    bgColor: '#e65100',
    spec: 'Gastroenterologist',
    hospital: 'Narayana Health, Bangalore',
    exp: '16 years',
    expYears: 16,
    rating: 4.9,
    reviews: 224,
    langs: ['English', 'Kannada', 'Telugu'],
    fee: '₹700',
    online: false,
    availStatus: 'today',
    availLabel: 'Available Today',
    phone: '+91 98765 00006',
    about:
      'Dr. Kavitha Rao is one of South India\'s leading gastroenterologists. She specialises in endoscopy, liver diseases, and inflammatory bowel conditions, with an impeccable diagnostic record.',
    education: [
      'MBBS — St. John\'s Medical College, Bangalore (2005)',
      'MD Medicine — AIIMS, New Delhi (2009)',
      'DM Gastroenterology — SGPGI, Lucknow (2012)',
    ],
    slots: ['10:30 AM', '12:00 PM', '03:30 PM'],
    specializations: ['Endoscopy', 'Liver Disease', 'IBS / IBD', 'Acidity & GERD'],
  },
  {
    id: 'doc-vikram-joshi',
    name: 'Dr. Vikram Joshi',
    initials: 'VJ',
    bgColor: '#37474f',
    spec: 'Orthopedic Surgeon',
    hospital: 'Sparsh Hospital, Bangalore',
    exp: '20 years',
    expYears: 20,
    rating: 4.9,
    reviews: 507,
    langs: ['English', 'Hindi', 'Marathi'],
    fee: '₹900',
    online: false,
    availStatus: 'tomorrow',
    availLabel: 'Tomorrow, 9 AM',
    phone: '+91 98765 00007',
    about:
      'Dr. Vikram Joshi is a highly experienced orthopedic surgeon specialising in joint replacement, sports injuries, and spine surgery. He has performed over 5,000 successful surgeries.',
    education: [
      'MBBS — Grant Medical College, Mumbai (2000)',
      'MS Orthopaedics — KEM Hospital, Mumbai (2004)',
      'Fellowship (Joint Replacement) — Germany (2006)',
    ],
    slots: ['09:00 AM', '10:30 AM', '02:00 PM'],
    specializations: ['Joint Replacement', 'Sports Injuries', 'Spine Surgery', 'Fractures'],
  },
  {
    id: 'doc-deepa-menon',
    name: 'Dr. Deepa Menon',
    initials: 'DM',
    bgColor: '#558b2f',
    spec: 'Ophthalmologist',
    hospital: 'Sankara Eye Hospital, Bangalore',
    exp: '13 years',
    expYears: 13,
    rating: 4.8,
    reviews: 193,
    langs: ['English', 'Malayalam', 'Tamil'],
    fee: '₹450',
    online: true,
    availStatus: 'now',
    availLabel: 'Available Now',
    phone: '+91 98765 00008',
    about:
      'Dr. Deepa Menon is a renowned ophthalmologist with specialisation in cataract surgery, LASIK, and retinal disorders. She has restored vision to thousands of patients across South India.',
    education: [
      'MBBS — Government Medical College, Kozhikode (2008)',
      'MS Ophthalmology — Aravind Eye Hospital (2013)',
    ],
    slots: ['08:00 AM', '09:30 AM', '11:00 AM', '04:00 PM'],
    specializations: ['Cataract Surgery', 'LASIK', 'Retinal Disorders', 'Glaucoma'],
  },
  {
    id: 'doc-rahul-singh',
    name: 'Dr. Rahul Singh',
    initials: 'RS',
    bgColor: '#4527a0',
    spec: 'Psychiatrist',
    hospital: 'NIMHANS, Bangalore',
    exp: '10 years',
    expYears: 10,
    rating: 4.7,
    reviews: 156,
    langs: ['English', 'Hindi', 'Kannada'],
    fee: '₹650',
    online: true,
    availStatus: 'today',
    availLabel: 'Available Today',
    phone: '+91 98765 00009',
    about:
      'Dr. Rahul Singh is a compassionate psychiatrist trained at NIMHANS, specialising in depression, anxiety, OCD, and sleep disorders. He provides evidence-based therapy and medication management.',
    education: [
      'MBBS — Maulana Azad Medical College, Delhi (2010)',
      'MD Psychiatry — NIMHANS, Bangalore (2015)',
    ],
    slots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM'],
    specializations: ['Depression & Anxiety', 'OCD', 'Sleep Disorders', 'Addiction Medicine'],
  },
  {
    id: 'doc-sneha-patil',
    name: 'Dr. Sneha Patil',
    initials: 'SP',
    bgColor: '#00695c',
    spec: 'Endocrinologist',
    hospital: 'Manipal Hospital, Bangalore',
    exp: '8 years',
    expYears: 8,
    rating: 4.8,
    reviews: 178,
    langs: ['English', 'Kannada', 'Marathi'],
    fee: '₹700',
    online: true,
    availStatus: 'now',
    availLabel: 'Available Now',
    phone: '+91 98765 00010',
    about:
      'Dr. Sneha Patil is a specialist in hormonal and metabolic disorders. She manages diabetes, thyroid conditions, PCOS, obesity, and adrenal disorders with a holistic, lifestyle-focused approach.',
    education: [
      'MBBS — BJ Medical College, Pune (2012)',
      'MD Medicine — Seth GS Medical College, Mumbai (2016)',
      'DM Endocrinology — PGI, Chandigarh (2019)',
    ],
    slots: ['09:00 AM', '10:30 AM', '12:00 PM', '03:00 PM'],
    specializations: ['Diabetes', 'Thyroid Disorders', 'PCOS', 'Obesity Management'],
  },
  {
    id: 'doc-arjun-kulkarni',
    name: 'Dr. Arjun Kulkarni',
    initials: 'AK',
    bgColor: '#bf360c',
    spec: 'Urologist',
    hospital: 'Manipal Hospital, Bangalore',
    exp: '15 years',
    expYears: 15,
    rating: 4.7,
    reviews: 209,
    langs: ['English', 'Kannada', 'Marathi', 'Hindi'],
    fee: '₹750',
    online: false,
    availStatus: 'today',
    availLabel: 'Available Today',
    phone: '+91 98765 00011',
    about:
      'Dr. Arjun Kulkarni is a senior urologist with expertise in kidney stone management, prostate disorders, and urological cancers. He is a pioneer in minimally invasive urological procedures in Karnataka.',
    education: [
      'MBBS — Mysore Medical College (2005)',
      'MS General Surgery — KIMS (2010)',
      'MCh Urology — AIIMS, New Delhi (2013)',
    ],
    slots: ['11:00 AM', '01:00 PM', '04:00 PM', '05:30 PM'],
    specializations: ['Kidney Stones', 'Prostate Disorders', 'Urological Cancers', 'Laparoscopy'],
  },
  {
    id: 'doc-lakshmi-bhat',
    name: 'Dr. Lakshmi Bhat',
    initials: 'LB',
    bgColor: '#283593',
    spec: 'Pulmonologist',
    hospital: 'NIMHANS, Bangalore',
    exp: '11 years',
    expYears: 11,
    rating: 4.8,
    reviews: 167,
    langs: ['English', 'Kannada', 'Tulu'],
    fee: '₹600',
    online: true,
    availStatus: 'tomorrow',
    availLabel: 'Tomorrow, 11 AM',
    phone: '+91 98765 00012',
    about:
      'Dr. Lakshmi Bhat is a pulmonologist with deep expertise in asthma, COPD, tuberculosis, and interstitial lung diseases. She is well-known for her research in occupational lung diseases.',
    education: [
      'MBBS — Kasturba Medical College, Manipal (2009)',
      'MD Pulmonology — JIPMER, Puducherry (2014)',
    ],
    slots: ['09:30 AM', '11:00 AM', '03:00 PM', '05:00 PM'],
    specializations: ['Asthma & COPD', 'Tuberculosis', 'Sleep Apnea', 'Interstitial Lung Disease'],
  },
]

/**
 * getDoctorsBySpec — returns doctors matching the recommended specialization.
 * Falls back to General Physicians if no match found.
 */
export function getDoctorsBySpec(spec) {
  if (!spec) return DOCTORS
  const matched = DOCTORS.filter(
    d => d.spec.toLowerCase() === spec.toLowerCase()
  )
  if (matched.length > 0) return matched
  // Fallback: General Physicians
  return DOCTORS.filter(d => d.spec === 'General Physician')
}

/**
 * getDoctorById — returns a single doctor by id.
 */
export function getDoctorById(id) {
  return DOCTORS.find(d => d.id === id) || null
}

/**
 * sortDoctorsByLanguage — sorts so doctors speaking patientLang appear first.
 */
export function sortDoctorsByLanguage(doctors, patientLang) {
  if (!patientLang) return doctors
  return [...doctors].sort((a, b) => {
    const aMatch = a.langs.some(l => l.toLowerCase() === patientLang.toLowerCase()) ? 0 : 1
    const bMatch = b.langs.some(l => l.toLowerCase() === patientLang.toLowerCase()) ? 0 : 1
    if (aMatch !== bMatch) return aMatch - bMatch
    const order = { now: 0, today: 1, tomorrow: 2 }
    return (order[a.availStatus] ?? 3) - (order[b.availStatus] ?? 3)
  })
}

export default DOCTORS
