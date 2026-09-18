/**
 * consultationService.js
 * Manages consultation requests via the backend REST API.
 * Acts as the bridge between Patient UI and Doctor Dashboard.
 *
 * All data flows through the Express backend (/api/consultations)
 * so requests work CROSS-BROWSER and CROSS-DEVICE.
 *
 * The interface stays identical to the original localStorage version
 * so no changes are needed in DoctorDashboard.jsx or AppointmentScreen.jsx.
 *
 * Methods return Promises (async) — callers that previously used synchronous
 * returns are updated to handle async via .then() or await.
 */

import { apiUrl } from '../../services/apiBase'
import patientService from '../../patient/services/patientService'

const API = apiUrl('/api/consultations')
const patientHeaders = () => {
  const token = patientService.getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
const doctorHeaders = () => {
  const token = localStorage.getItem('ab_doctor_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const consultationService = {

  /** Create a new consultation request (called from Patient AppointmentScreen) */
  async createRequest({ doctorId, doctorName, doctorSpecialty, patientName, patientAge, patientGender, patientLang, patientPhone, patientContact, patientSymptoms, symptoms, aiResult, slot, consultationType }) {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...patientHeaders() },
      body: JSON.stringify({ doctorId, doctorName, doctorSpecialty, patientName, patientAge, patientGender, patientLang, patientPhone, patientContact, patientSymptoms, symptoms, aiResult, slot, consultationType }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.message || 'Failed to create consultation request.')
    return data.consultation
  },

  /** Get all consultations for a doctor */
  async getByDoctor(doctorId) {
  const res  = await fetch(`${API}?doctorId=${encodeURIComponent(doctorId)}`, { headers: doctorHeaders() })
    const data = await res.json()
    return data.success ? data.consultations : []
  },

  /** Get a single consultation */
  async getById(id) {
  const res  = await fetch(`${API}/${encodeURIComponent(id)}`, { headers: doctorHeaders() })
    if (!res.ok) return null
    const data = await res.json()
    return data.success ? data.consultation : null
  },

  /** Accept a consultation request */
  async accept(id) {
    const res = await fetch(`${API}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...doctorHeaders() },
      body: JSON.stringify({ status: 'accepted' }),
    })
    const data = await res.json()
    return data.success ? data.consultation : null
  },

  /** Reject a consultation request */
  async reject(id) {
    const res = await fetch(`${API}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...doctorHeaders() },
      body: JSON.stringify({ status: 'rejected' }),
    })
    const data = await res.json()
    return data.success ? data.consultation : null
  },

  /** Save consultation notes + mark completed */
  async saveNotes(id, notes) {
    const res = await fetch(`${API}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...doctorHeaders() },
      body: JSON.stringify({ status: 'completed', notes }),
    })
    const data = await res.json()
    return data.success ? data.consultation : null
  },

  /** Save prescription */
  async savePrescription(id, prescription) {
    const res = await fetch(`${API}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...doctorHeaders() },
      body: JSON.stringify({ prescription }),
    })
    const data = await res.json()
    return data.success ? data.consultation : null
  },

  /** Seed demo data (calls backend seed endpoint) */
  async seedDemoData(doctorId) {
    await fetch(`${API}/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...doctorHeaders() },
      body: JSON.stringify({ doctorId }),
    })
  },

  /** Clear all (for testing) */
  async clear() {
    await fetch(API, { method: 'DELETE' })
  },
}

export default consultationService
