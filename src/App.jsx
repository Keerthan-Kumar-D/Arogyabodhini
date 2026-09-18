import React, { useState, useRef, useCallback, useEffect } from 'react'
import { LanguageProvider, useLanguage } from './i18n/LanguageContext'
import LanguageSelectScreen from './components/LanguageSelectScreen/LanguageSelectScreen'
import HomeScreen           from './components/HomeScreen/HomeScreen'
import ListeningScreen      from './components/ListeningScreen/ListeningScreen'
import AnalyzingScreen      from './components/AnalyzingScreen/AnalyzingScreen'
import ResultScreen         from './components/ResultScreen/ResultScreen'
import DoctorListScreen     from './components/DoctorListScreen/DoctorListScreen'
import DoctorDetailScreen   from './components/DoctorDetailScreen/DoctorDetailScreen'
import AppointmentScreen    from './components/AppointmentScreen/AppointmentScreen'
import PatientVideoRoom     from './components/PatientVideoRoom/PatientVideoRoom'
import AppHeader            from './components/AppHeader/AppHeader'
import PatientAccount       from './components/PatientAccount/PatientAccount'
import { usePatientAuth }   from './patient/context/PatientContext'
import { PatientProvider } from './patient/context/PatientContext'
import { analyzeSymptoms as analyzeAPI } from './services/api'
import './styles/App.css'

const SCREENS = {
  HOME:              'home',
  LISTENING:         'listening',
  ANALYZING:         'analyzing',
  RESULT:            'result',
  DOCTORS:           'doctors',
  DOCTOR_DETAIL:     'doctor_detail',
  APPOINTMENT:       'appointment',
  PATIENT_VIDEO:     'patient_video',
}

const VIDEO_SESSION_KEY = 'ab_active_video_session'

function loadVideoSession() {
  try {
    const raw = sessionStorage.getItem(VIDEO_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveVideoSession(consultId, patientName) {
  try {
    sessionStorage.setItem(VIDEO_SESSION_KEY, JSON.stringify({ consultId, patientName }))
  } catch {}
}

function clearVideoSession() {
  try { sessionStorage.removeItem(VIDEO_SESSION_KEY) } catch {}
}

/* Inner app — runs inside LanguageProvider so it can call useLanguage */
function AppInner() {
  const { lang, setLang } = useLanguage()
  const { patient } = usePatientAuth()

  // ALL hooks called unconditionally
  const [screen,          setScreen]          = useState(() => {
    const saved = loadVideoSession()
    return saved?.consultId ? SCREENS.PATIENT_VIDEO : SCREENS.HOME
  })
  const [activeLang,      setActiveLang]      = useState(null)
  const [result,          setResult]          = useState(null)
  const [apiError,        setApiError]        = useState(null)
  const [showLangPicker,  setShowLangPicker]  = useState(false)
  const [showPatientAuth, setShowPatientAuth] = useState(false)
  const [selectedDoctor,  setSelectedDoctor]  = useState(null)
  const [appointmentMode, setAppointmentMode] = useState('book')
  const [retryText,       setRetryText]       = useState('')
  const [videoConsultId,  setVideoConsultId]  = useState(() => loadVideoSession()?.consultId || null)
  const [videoPatientName,setVideoPatientName]= useState(() => loadVideoSession()?.patientName || '')
  const transcriptRef = useRef('')

  // Keep patient on video screen across remounts / refresh during active consultation
  useEffect(() => {
    if (screen === SCREENS.PATIENT_VIDEO && videoConsultId) {
      saveVideoSession(videoConsultId, videoPatientName)
    }
  }, [screen, videoConsultId, videoPatientName])

  // ── Language ──
  const handleChangeLang = useCallback((l) => {
    setLang(l)
    setActiveLang(l)
    setShowLangPicker(false)
  }, [setLang])

  // ── Voice ──
  const handleStartListening = useCallback((selectedLang) => {
    setActiveLang(selectedLang)
    transcriptRef.current = ''
    setResult(null); setApiError(null)
    setScreen(SCREENS.LISTENING)
  }, [])

  // ── Text submit ──
  const handleTextSubmit = useCallback(async (text, selectedLang) => {
    setActiveLang(selectedLang)
    setApiError(null); setResult(null)
    transcriptRef.current = text
    setRetryText(text)
    setScreen(SCREENS.ANALYZING)
    try {
      const data = await analyzeAPI(text, selectedLang.code)
      setResult({ ...data, inputSymptoms: text }); setScreen(SCREENS.RESULT)
    } catch (err) {
      setApiError(err.message || 'Unable to reach the server.')
      setScreen(SCREENS.HOME)
    }
  }, [])

  // ── Listening done ──
  const handleListeningDone = useCallback(async (transcript) => {
    transcriptRef.current = transcript
    setRetryText(transcript)
    setScreen(SCREENS.ANALYZING)
    const currentLang = activeLang || lang
    try {
      const data = await analyzeAPI(transcript, currentLang.code)
      setResult({ ...data, inputSymptoms: transcript }); setScreen(SCREENS.RESULT)
    } catch (err) {
      setApiError(err.message || 'Unable to reach the server.')
      setScreen(SCREENS.HOME)
    }
  }, [activeLang, lang])

  // ── Reset to home ──
  const handleReset = useCallback(() => {
    clearVideoSession()
    transcriptRef.current = ''
    setResult(null); setApiError(null)
    setSelectedDoctor(null)
    setVideoConsultId(null)
    setVideoPatientName('')
    setRetryText('')
    setScreen(SCREENS.HOME)
  }, [])

  const handleLeaveVideoRoom = useCallback(() => {
    clearVideoSession()
    setVideoConsultId(null)
    setVideoPatientName('')
    setScreen(SCREENS.APPOINTMENT)
  }, [])

  const handleVideoHome = useCallback(() => {
    clearVideoSession()
    setVideoConsultId(null)
    setVideoPatientName('')
    transcriptRef.current = ''
    setResult(null); setApiError(null)
    setSelectedDoctor(null)
    setScreen(SCREENS.HOME)
  }, [])

  // ── Doctor navigation ──
  const handleViewDoctor = useCallback((doctor) => {
    setSelectedDoctor(doctor)
    setScreen(SCREENS.DOCTOR_DETAIL)
  }, [])

  const handleBookAppointment = useCallback((doctor) => {
    setSelectedDoctor(doctor)
    setAppointmentMode('book')
    setScreen(SCREENS.APPOINTMENT)
  }, [])

  const handleVideoConsult = useCallback((doctor) => {
    setSelectedDoctor(doctor)
    setAppointmentMode('video')
    if (patient) setScreen(SCREENS.APPOINTMENT)
    else setShowPatientAuth(true)
  }, [patient])

  const handlePatientAuthenticated = useCallback(() => {
    setShowPatientAuth(false)
    setAppointmentMode('video')
    setScreen(SCREENS.APPOINTMENT)
  }, [])

  // ── No language saved yet → show picker ──
  if (!lang) {
    return (
      <div className="ab-app">
        <LanguageSelectScreen onSelect={handleChangeLang} />
      </div>
    )
  }

  const currentLang = activeLang || lang

  return (
    <div className="ab-app">
      {showLangPicker && <LanguageSelectScreen onSelect={handleChangeLang} />}

      <AppHeader onChangeLang={() => setShowLangPicker(true)} />
      {showPatientAuth && (
        <PatientAccount
          initialMode="login"
          showVideoPrompt
          onClose={() => setShowPatientAuth(false)}
          onAuthenticated={handlePatientAuthenticated}
        />
      )}

      <main className="ab-main">
        {screen === SCREENS.HOME && (
          <HomeScreen
            apiError={apiError}
            initialText={retryText}
            onStartListening={handleStartListening}
            onTextSubmit={handleTextSubmit}
          />
        )}

        {screen === SCREENS.LISTENING && (
          <ListeningScreen lang={currentLang} onDone={handleListeningDone} onCancel={handleReset} />
        )}

        {screen === SCREENS.ANALYZING && <AnalyzingScreen />}

        {screen === SCREENS.RESULT && result && (
          <ResultScreen
            result={result}
            lang={currentLang}
            onSpeakAgain={handleReset}
            onTryAgain={() => setScreen(SCREENS.HOME)}
            onFindDoctors={() => setScreen(SCREENS.DOCTORS)}
          />
        )}

        {screen === SCREENS.DOCTORS && result && (
          <DoctorListScreen
            result={result}
            lang={currentLang}
            onBack={() => setScreen(SCREENS.RESULT)}
            onHome={handleReset}
            onViewDoctor={handleViewDoctor}
          />
        )}

        {screen === SCREENS.DOCTOR_DETAIL && selectedDoctor && (
          <DoctorDetailScreen
            doctor={selectedDoctor}
            lang={currentLang}
            onBack={() => setScreen(SCREENS.DOCTORS)}
            onBookAppointment={handleBookAppointment}
            onVideoConsult={handleVideoConsult}
          />
        )}

        {screen === SCREENS.APPOINTMENT && selectedDoctor && (
          <AppointmentScreen
            doctor={selectedDoctor}
            mode={appointmentMode}
            result={result}
            lang={currentLang}
            onBack={() => setScreen(SCREENS.DOCTOR_DETAIL)}
            onHome={handleReset}
            onJoinVideoRoom={(consultId, patientName) => {
              setVideoConsultId(consultId)
              setVideoPatientName(patientName)
              saveVideoSession(consultId, patientName)
              setScreen(SCREENS.PATIENT_VIDEO)
            }}
          />
        )}

        {screen === SCREENS.PATIENT_VIDEO && videoConsultId && (
          <PatientVideoRoom
            consultationId={videoConsultId}
            patientName={videoPatientName}
            onBack={handleLeaveVideoRoom}
            onHome={handleVideoHome}
          />
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <PatientProvider>
      <LanguageProvider>
        <AppInner />
      </LanguageProvider>
    </PatientProvider>
  )
}
