/**
 * MediAI API Service — Phase 2
 *
 * Centralises all backend calls. Swap the BASE_URL for production deployment.
 * In Phase 3, extend with auth headers, retry logic, and response caching.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api`

/**
 * Analyze patient symptoms.
 *
 * @param {string} symptoms  - Free-text symptom description
 * @param {string} language  - ISO language code (en, hi, kn, ta, te…)
 * @returns {Promise<Object>} - Structured analysis result
 */
export const analyzeSymptoms = async (symptoms, language = 'en') => {
  const response = await fetch(`${BASE_URL}/analyze-symptoms`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ symptoms, language }),
  })

  const payload = await response.json()

  if (!response.ok || !payload.success) {
    // Surface backend validation / server errors to the UI
    throw new Error(payload.message || `Request failed with status ${response.status}`)
  }

  return payload.data
}
