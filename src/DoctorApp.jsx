import React, { useState } from 'react'
import { DoctorProvider, useDoctorAuth } from './doctor/context/DoctorContext'
import DoctorLogin        from './doctor/components/DoctorLogin/DoctorLogin'
import DoctorDashboard    from './doctor/components/DoctorDashboard/DoctorDashboard'
import ConsultationRoom   from './doctor/components/ConsultationRoom/ConsultationRoom'

const DSCREENS = { DASHBOARD: 'dashboard', CONSULTATION: 'consultation' }

function DoctorAppInner({ onSwitchToPatient }) {
  const { doctor } = useDoctorAuth()
  const [dScreen,      setDScreen]      = useState(DSCREENS.DASHBOARD)
  const [activeConsult, setActiveConsult] = useState(null)

  if (!doctor) {
    return <DoctorLogin onSwitchToPatient={onSwitchToPatient} />
  }

  return (
    <>
      {dScreen === DSCREENS.DASHBOARD && (
        <DoctorDashboard
          onOpenConsultation={(consult) => {
            setActiveConsult(consult)
            setDScreen(DSCREENS.CONSULTATION)
          }}
        />
      )}

      {dScreen === DSCREENS.CONSULTATION && activeConsult && (
        <ConsultationRoom
          consultation={activeConsult}
          onBack={() => {
            setActiveConsult(null)
            setDScreen(DSCREENS.DASHBOARD)
          }}
        />
      )}
    </>
  )
}

export default function DoctorApp({ onSwitchToPatient }) {
  return (
    <DoctorProvider>
      <DoctorAppInner onSwitchToPatient={onSwitchToPatient} />
    </DoctorProvider>
  )
}
