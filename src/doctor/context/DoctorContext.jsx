import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import authService from '../services/authService'

const DoctorContext = createContext(null)

export const DoctorProvider = ({ children }) => {
  const [doctor,  setDoctor]  = useState(() => authService.restoreSession())
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const login = useCallback(async (email, password) => {
    setLoading(true); setError(null)
    // Small artificial delay for realism
    await new Promise(r => setTimeout(r, 600))
    const result = authService.login(email, password)
    if (result.success) {
      setDoctor(result.doctor)
    } else {
      setError(result.error)
    }
    setLoading(false)
    return result.success
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setDoctor(null)
  }, [])

  return (
    <DoctorContext.Provider value={{ doctor, login, logout, loading, error }}>
      {children}
    </DoctorContext.Provider>
  )
}

export const useDoctorAuth = () => {
  const ctx = useContext(DoctorContext)
  if (!ctx) throw new Error('useDoctorAuth must be used inside DoctorProvider')
  return ctx
}

export default DoctorContext
