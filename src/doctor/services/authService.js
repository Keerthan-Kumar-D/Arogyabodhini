/**
 * authService.js — Doctor Authentication Service (Mock)
 * Replace login() with a real API call in production.
 */

import DOCTOR_ACCOUNTS from '../data/doctorAccounts'

const SESSION_KEY = 'ab_doctor_session'

export const authService = {
  /** Authenticate doctor by email + password */
  login(email, password) {
    const account = DOCTOR_ACCOUNTS.find(
      a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    )
    if (!account) return { success: false, error: 'Invalid email or password.' }
    const session = { ...account, loginAt: new Date().toISOString() }
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)) } catch {}
    return { success: true, doctor: session }
  },

  /** Restore session from localStorage */
  restoreSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  },

  /** Logout */
  logout() {
    try { localStorage.removeItem(SESSION_KEY) } catch {}
  },

  /** Check if a session is active */
  isLoggedIn() {
    return !!authService.restoreSession()
  },
}

export default authService
