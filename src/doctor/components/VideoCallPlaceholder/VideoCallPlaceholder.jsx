import React from 'react'
import './VideoCallPlaceholder.css'
import useVideoCall from '../../hooks/useVideoCall'

/**
 * VideoCallPlaceholder
 * Reusable, SDK-agnostic video call UI component.
 *
 * Props:
 *   roomId     {string}  - unique consultation ID used as the room
 *   userId     {string}  - current user's ID
 *   role       {string}  - 'doctor' | 'patient'
 *   doctorName {string}
 *   patientName{string}
 *   onEnd      {fn}      - called when user ends the call
 *
 * To integrate ZEGOCLOUD: replace videoCallService.js internals only.
 * This component needs NO changes.
 */
const VideoCallPlaceholder = ({ roomId, userId, role = 'doctor', doctorName, patientName, onEnd }) => {
  const {
    status, micMuted, cameraOff, participants, formattedDuration,
    join, leave, toggleMic, toggleCamera,
  } = useVideoCall({ roomId, userId, role })

  const remoteName = role === 'doctor' ? patientName : doctorName
  const remoteJoined = participants.length > 0

  const handleEnd = async () => {
    await leave()
    onEnd?.()
  }

  return (
    <div className="vcall-root">

      {/* Remote video area */}
      <div className="vcall-remote" aria-label="Remote participant video">
        {status === 'idle' && (
          <div className="vcall-idle">
            <div className="vcall-idle__icon" aria-hidden="true">🎥</div>
            <p>Video call not started</p>
            <button id="vcall-join-btn" className="vcall-join-btn" onClick={join}>
              Start Video Call
            </button>
          </div>
        )}

        {status === 'connecting' && (
          <div className="vcall-connecting">
            <div className="vcall-spinner" aria-hidden="true"/>
            <p>Connecting...</p>
          </div>
        )}

        {(status === 'connected' || status === 'ended') && (
          <>
            {remoteJoined ? (
              <div className="vcall-remote__avatar">
                <span>{remoteName?.charAt(0).toUpperCase()}</span>
                <p className="vcall-remote__name">{remoteName}</p>
                <p className="vcall-remote__status">🟢 Connected</p>
              </div>
            ) : (
              <div className="vcall-waiting">
                <div className="vcall-waiting__spinner" aria-hidden="true"/>
                <p>Waiting for {remoteName} to join...</p>
              </div>
            )}
          </>
        )}

        {status === 'error' && (
          <div className="vcall-error">
            <p>⚠️ Failed to connect. Check your network.</p>
            <button className="vcall-join-btn" onClick={join}>Retry</button>
          </div>
        )}

        {/* Duration badge */}
        {status === 'connected' && (
          <div className="vcall-duration" aria-live="polite">
            🔴 {formattedDuration}
          </div>
        )}
      </div>

      {/* Local video (self-view) */}
      <div className="vcall-local" aria-label="Your video">
        <div className="vcall-local__face">
          {cameraOff ? '📷' : role.charAt(0).toUpperCase()}
        </div>
        <p className="vcall-local__label">You {cameraOff ? '(Camera off)' : ''}</p>
      </div>

      {/* Controls */}
      {status === 'connected' && (
        <div className="vcall-controls" role="toolbar" aria-label="Call controls">
          <button
            id="vcall-mic-btn"
            className={`vcall-ctrl-btn ${micMuted ? 'vcall-ctrl-btn--off' : ''}`}
            onClick={toggleMic}
            aria-label={micMuted ? 'Unmute microphone' : 'Mute microphone'}
            aria-pressed={micMuted}
          >
            {micMuted ? '🔇' : '🎙️'}
            <span>{micMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button
            id="vcall-cam-btn"
            className={`vcall-ctrl-btn ${cameraOff ? 'vcall-ctrl-btn--off' : ''}`}
            onClick={toggleCamera}
            aria-label={cameraOff ? 'Turn camera on' : 'Turn camera off'}
            aria-pressed={cameraOff}
          >
            {cameraOff ? '📷' : '📹'}
            <span>{cameraOff ? 'Start Video' : 'Stop Video'}</span>
          </button>

          <button
            id="vcall-end-btn"
            className="vcall-ctrl-btn vcall-ctrl-btn--end"
            onClick={handleEnd}
            aria-label="End call"
          >
            📵
            <span>End Call</span>
          </button>
        </div>
      )}

      {/* ZEGOCLOUD integration note */}
      <p className="vcall-note">
        📌 Video integration ready · Plug in ZEGOCLOUD in videoCallService.js
      </p>
    </div>
  )
}

export default VideoCallPlaceholder
