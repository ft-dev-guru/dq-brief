"use client"

import { useState, useEffect, useRef } from "react"
import { JetBrains_Mono, Inter } from "next/font/google"
import { useRouter } from "next/navigation"
import { User, Target, Play, Pause, Volume2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import "./classified.css"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const psychologicalProfiles = [
  {
    type: "Target Alpha",
    title: "The Ambitious CEO",
    content:
      "The agony of a vision trapped in chaos. A competitive strategist whose reality is a frustrating paradox: the faster he tries to grow, the more chaotic things become. Haunted by the suspicion that his people are 'going through the motions' because the company's core identity is fuzzy.",
    transformation:
      "The thrill of surgical control. Each Basecamp transforms chaos into the exhilarating feeling of a master strategist finally seeing the entire battlefield with perfect clarity. Vision finally locks onto a clear and conquerable path.",
  },
  {
    type: "Target Beta",
    title: "The Motivated Manager",
    content:
      "The agony of stifled momentum. A racehorse forced to walk. Arrives every morning burning with purpose, only to be submerged in a sea of ambiguity. The silent scream of potential, crushed by invisible walls of bureaucracy and opaque direction.",
    transformation:
      "The exhilaration of unleashed momentum. Invisible walls of bureaucracy dissolve. Ideas, once lost in vague emails, are now seen as critical solutions. Personal agency grows exponentially with each session.",
  },
  {
    type: "Target Gamma",
    title: "The Unmotivated Manager",
    content:
      "The numbness of resigned discontent. Not a bad employee; a dormant one. Core instinct is to resist the very clarity that could reignite purpose. Comfortable with status quo, accepting ambiguity as normal because it creates no waves.",
    transformation:
      "The quiet dawn of purpose. Not disruptive confrontation, but gentle, undeniable awakening. Fog of ambiguity replaced with a clear 'North Star.' Numbness melts away, replaced by the thrill of knowing exactly what to do.",
  },
]

// Tactical Audio Player Component
const TacticalAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoaded, setIsLoaded] = useState(true) // Start as ready
  
  useEffect(() => {
    const audio = audioRef.current
    const canvas = canvasRef.current
    
    if (!audio || !canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)
    
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration)
        setIsLoaded(true)
        console.log('Audio duration loaded:', audio.duration)
      }
    }

    const handleLoadedMetadata = () => {
      updateDuration()
    }
    
    const handleLoadedData = () => {
      updateDuration()
    }
    
    const handleCanPlay = () => {
      updateDuration()
      
      // Set up Web Audio API for real-time analysis
      if (!audioContextRef.current) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const source = audioContext.createMediaElementSource(audio)
        const analyser = audioContext.createAnalyser()
        
        analyser.fftSize = 128
        analyser.smoothingTimeConstant = 0.8
        
        source.connect(analyser)
        analyser.connect(audioContext.destination)
        
        audioContextRef.current = audioContext
        analyserRef.current = analyser
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
      }
    }
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      // Also check for duration on every time update as a fallback
      if (!duration) {
        updateDuration()
      }
    }
    
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }
    
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])
  
  useEffect(() => {
    if (isPlaying) {
      drawWaveform()
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, currentTime])
  
  const drawWaveform = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.offsetWidth
    const height = canvas.offsetHeight
    const centerY = height / 2
    
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.fillRect(0, 0, width, height)
    
    // Get real audio data if available
    let audioData: Uint8Array | null = null
    if (isPlaying && analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current)
      audioData = dataArrayRef.current
    }
    
    // Draw waveform
    const totalBars = 60
    const barWidth = width / totalBars
    const progress = currentTime / duration
    
    // Calculate center position for active audio data
    const audioBars = audioData ? Math.min(audioData.length, 32) : 0
    const centerStart = Math.floor((totalBars - audioBars) / 2)
    
    // Draw progress indicator line in the center
    const progressX = (progress * totalBars) * barWidth
    ctx.strokeStyle = '#00ff41'
    ctx.lineWidth = 2
    ctx.shadowColor = '#00ff41'
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.moveTo(progressX, 0)
    ctx.lineTo(progressX, height)
    ctx.stroke()
    ctx.shadowBlur = 0
    
    for (let i = 0; i < totalBars; i++) {
      const barProgress = i / totalBars
      
      let amplitude: number
      const isInAudioRange = i >= centerStart && i < centerStart + audioBars
      
      if (audioData && isPlaying && isInAudioRange) {
        // Use real audio data for center bars
        const audioIndex = i - centerStart
        amplitude = audioData[audioIndex] / 255.0
      } else {
        // Fallback to animated bars for outer bars or when not playing
        amplitude = Math.sin(currentTime * 2 + i * 0.5) * 0.3 + 
                   Math.sin(currentTime * 3 + i * 0.8) * 0.2 + 
                   Math.sin(currentTime * 5 + i * 1.2) * 0.1
        amplitude = Math.abs(amplitude) * 0.3
      }
      
      const barHeight = amplitude * height * 0.7 + 5
      const x = i * barWidth
      const y = centerY - barHeight / 2
      
      // Enhanced coloring for center audio-responsive bars
      if (barProgress <= progress) {
        if (audioData && isPlaying && isInAudioRange) {
          // Brighter for real audio data
          const intensity = amplitude > 0.3 ? 1 : 0.7 + amplitude * 0.3
          ctx.fillStyle = `rgba(0, 255, 65, ${intensity})`
          ctx.shadowColor = '#00ff41'
          ctx.shadowBlur = amplitude > 0.5 ? 8 : 4
        } else {
          // Standard for animated bars
          ctx.fillStyle = 'rgba(0, 255, 65, 0.6)'
          ctx.shadowColor = '#00ff41'
          ctx.shadowBlur = 2
        }
      } else {
        ctx.fillStyle = 'rgba(0, 255, 65, 0.2)'
        ctx.shadowBlur = 0
      }
      
      ctx.fillRect(x, y, barWidth - 2, barHeight)
    }
    
    animationRef.current = requestAnimationFrame(drawWaveform)
  }
  
  const togglePlayPause = async () => {
    const audio = audioRef.current
    if (!audio) return
    
    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        // Initialize Web Audio API if not already done
        if (!audioContextRef.current) {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const source = audioContext.createMediaElementSource(audio)
          const analyser = audioContext.createAnalyser()
          
          analyser.fftSize = 128
          analyser.smoothingTimeConstant = 0.8
          
          source.connect(analyser)
          analyser.connect(audioContext.destination)
          
          audioContextRef.current = audioContext
          analyserRef.current = analyser
          dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
        }
        
        // Resume audio context if it's suspended (common in modern browsers)
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume()
        }
        await audio.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('Audio playback failed:', error)
      setIsPlaying(false)
    }
  }
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const audio = audioRef.current
    if (!canvas || !audio) {
      console.log('Canvas click blocked:', { canvas: !!canvas, audio: !!audio, isLoaded, duration })
      return
    }
    
    // If duration isn't available yet, try to get it from the audio element directly
    const currentDuration = duration || audio.duration || 0
    if (currentDuration === 0) {
      console.log('Canvas click blocked - no duration:', { duration, audioDuration: audio.duration })
      return
    }
    
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const clickProgress = x / rect.width
    
    // Clamp between 0 and 1
    const clampedProgress = Math.max(0, Math.min(1, clickProgress))
    const newTime = clampedProgress * currentDuration
    
    console.log('Seeking to:', newTime, 'seconds (', Math.round(clampedProgress * 100), '%)')
    
    try {
      audio.currentTime = newTime
      setCurrentTime(newTime)
      // Update our duration state if it wasn't set
      if (!duration && audio.duration) {
        setDuration(audio.duration)
      }
    } catch (error) {
      console.error('Seek failed:', error)
    }
  }


  
  return (
    <div className="tactical-audio-player">
      <div className={`${jetbrainsMono.className} audio-classification`}>
        CLASSIFIED INTEL TRANSMISSION
      </div>
      <div className="audio-title">
        Mission Overview
      </div>
      
      <div className="waveform-container">
        <canvas 
          ref={canvasRef} 
          className="waveform-canvas" 
          onClick={handleCanvasClick}
          style={{ cursor: isLoaded ? 'pointer' : 'default' }}
        />
        <div className="audio-overlay">
          <button 
            className={`play-button ${isPlaying ? 'playing' : ''}`}
            onClick={togglePlayPause}
            disabled={!isLoaded}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          
          <div className="audio-info">
            <div className={`${jetbrainsMono.className} time-display`}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            <div className="transmission-status">
              <Volume2 className="w-4 h-4" />
              <span>{isPlaying ? 'TRANSMITTING' : isLoaded ? 'READY' : 'LOADING...'}</span>
            </div>
          </div>
        </div>
      </div>
      

      
      <audio 
        ref={audioRef} 
        src="/Building Blocks for a High-Performance Organization.wav"
        preload="auto"
      />
    </div>
  )
}

// Declassification Wrapper Component
const DeclassifiedWrapper = ({ 
  children, 
  componentId, 
  declassifiedComponents, 
  setDeclassifiedComponents 
}: {
  children: React.ReactNode
  componentId: string
  declassifiedComponents: Set<string>
  setDeclassifiedComponents: React.Dispatch<React.SetStateAction<Set<string>>>
}) => {
  const [showDeclassified, setShowDeclassified] = useState(false)
  const isClassified = !declassifiedComponents.has(componentId)

  const handleMouseEnter = () => {
    if (isClassified) {
      setDeclassifiedComponents(prev => new Set([...prev, componentId]))
      setShowDeclassified(true)
      // Hide the "DECLASSIFIED" text after animation
      setTimeout(() => setShowDeclassified(false), 2000)
    }
  }

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      style={{ cursor: isClassified ? 'pointer' : 'default' }}
    >
      {/* Content with blur effect */}
      <div 
        className="relative"
        style={{ 
          filter: isClassified ? 'blur(8px)' : 'none',
          transition: 'filter 0.8s ease-out'
        }}
      >
        {children}
      </div>

      {/* CLASSIFIED overlay - positioned outside blur container */}
      {isClassified && (
        <div 
          className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(2px)',
          }}
        >
          <div 
            className={`${jetbrainsMono.className} text-red-500 font-bold text-lg sm:text-xl lg:text-2xl tracking-widest`}
            style={{
              textShadow: '0 0 10px rgba(255, 0, 0, 0.8), 0 0 20px rgba(255, 0, 0, 0.5)',
              animation: 'pulse 2s infinite',
              filter: 'none' // Override any parent blur
            }}
          >
            CLASSIFIED
          </div>
        </div>
      )}
      
      {/* DECLASSIFIED animation overlay */}
      {showDeclassified && !isClassified && (
        <div 
          className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          style={{
            background: 'rgba(0, 255, 65, 0.1)',
            backdropFilter: 'blur(1px)',
          }}
        >
          <div 
            className={`${jetbrainsMono.className} text-green-400 font-bold text-lg sm:text-xl lg:text-2xl tracking-widest declassified-text`}
            style={{
              textShadow: '0 0 10px rgba(0, 255, 65, 0.8), 0 0 20px rgba(0, 255, 65, 0.5)',
              filter: 'none' // Override any parent blur
            }}
          >
            DECLASSIFIED
          </div>
        </div>
      )}
    </div>
  )
}

export default function ClassifiedPage() {
  const [timestamp, setTimestamp] = useState("")
  const [missionAccepted, setMissionAccepted] = useState(false)
  const [isDestructing, setIsDestructing] = useState(false)
  const router = useRouter()
  const [selectedProfile, setSelectedProfile] = useState<{
    type: string;
    title: string;
    content: string;
    transformation: string;
  } | null>(null)
  const [declassifiedComponents, setDeclassifiedComponents] = useState<Set<string>>(new Set())

  useEffect(() => {
    const updateTimestamp = () => {
      const now = new Date()
      const ts = now.toISOString().replace("T", " ").substring(0, 19) + " UTC"
      setTimestamp(`TIMESTAMP: ${ts}`)
    }

    updateTimestamp()
    const intervalId = setInterval(updateTimestamp, 1000)

    return () => clearInterval(intervalId)
  }, [])

  const handleAcceptMission = () => {
    setMissionAccepted(true)
    setTimeout(() => {
      setIsDestructing(true)
      setTimeout(() => {
        router.push("/mission-accepted")
      }, 2000)
    }, 1000)
  }

  const bodyClasses = [
    inter.className,
    "classified-page-body",
    missionAccepted ? "mission-accepted-filter" : "",
    isDestructing ? "fade-out-effect" : "",
  ].join(" ")

  return (
    <main className={bodyClasses}>
      <div className={`${jetbrainsMono.className} coordinates`}>LAT: 42.3601° N, LONG: 71.0589° W</div>
      <div className={`${jetbrainsMono.className} timestamp`} id="timestamp">
        {timestamp}
      </div>

      <header className="classified-header">
        <div className={`${jetbrainsMono.className} classification`}>TOP SECRET - EYES ONLY</div>
        <div className={`${jetbrainsMono.className} operation-title`}>OPERATION DQ: ORCHESTRATING REVELATIONS</div>
      </header>

      <div className="container">
        <TacticalAudioPlayer />
        
        <DeclassifiedWrapper 
          componentId="mission-directive" 
          declassifiedComponents={declassifiedComponents}
          setDeclassifiedComponents={setDeclassifiedComponents}
        >
          <div className="dossier">
            <div className={`${jetbrainsMono.className} section-title`}>Mission Directive</div>
            <div className="mission-statement">
              "We are not in the business of selling software; we are in the business of orchestrating revelations. We are
              commissioned to build a mirror for the soul of an enterprise, and you are the one who will polish its
              surface until the truth is both undeniable and beautiful."
            </div>
            <div
              className="phase-content"
              style={{ color: "#fff", fontSize: "16px", lineHeight: 1.7, textAlign: "center" }}
            >
              The DQ is the journey itself—a complete system designed to deliver{" "}
              <strong style={{ color: "#ff6b00" }}>unforgiving clarity</strong> and a battle plan for{" "}
              <strong style={{ color: "#ff6b00" }}>industry dominance</strong>. Its purpose is to take a leader from a
              state of chaotic frustration to one of supreme confidence and surgical precision.
            </div>
          </div>
        </DeclassifiedWrapper>

        <DeclassifiedWrapper 
          componentId="mission-architecture" 
          declassifiedComponents={declassifiedComponents}
          setDeclassifiedComponents={setDeclassifiedComponents}
        >
          <div className="dossier">
            <div className={`${jetbrainsMono.className} section-title`}>Mission Architecture</div>
            <div className="mission-phases">
              <div className="phase-card" data-phase="PHASE 1">
                <div className={`${jetbrainsMono.className} phase-title`}>The Business MRI</div>
                <div className="phase-content">
                  A non-invasive procedure that bypasses superficial symptoms to reveal the elegant, often brutal, truth
                  of organizational anatomy. It shows exactly where the blockage is, why it exists, and the precise
                  movement needed to clear it.
                  <br />
                  <br />
                  <strong style={{ color: "#00ff41" }}>Not a report. A scan.</strong>
                </div>
              </div>
              <div className="phase-card" data-phase="PHASE 2">
                <div className={`${jetbrainsMono.className} phase-title`}>The Battle Plan</div>
                <div className="phase-content">
                  A high-velocity execution agenda forged from the truth of the MRI. The application of strategic pressure
                  at the weakest points of the old reality. The brutal, 80/20 breakdown of what to do, what to stop, and
                  what's about to cost you everything.
                  <br />
                  <br />
                  <strong style={{ color: "#00ff41" }}>Not suggestions. Strategic conquest.</strong>
                </div>
              </div>
            </div>
          </div>
        </DeclassifiedWrapper>

        <DeclassifiedWrapper 
          componentId="psychological-profiles" 
          declassifiedComponents={declassifiedComponents}
          setDeclassifiedComponents={setDeclassifiedComponents}
        >
          <div className="emotional-profiles">
            <div
              className={`${jetbrainsMono.className} section-title`}
              style={{ color: "#ff6b00", borderLeftColor: "#ff6b00" }}
            >
              Target Psychological Profiles
            </div>
            <Dialog open={!!selectedProfile} onOpenChange={(isOpen) => !isOpen && setSelectedProfile(null)}>
              <div className="profile-grid">
                {psychologicalProfiles.map((profile, index) => (
                  <DialogTrigger asChild key={index} onClick={() => setSelectedProfile(profile)}>
                    <div className="profile-target">
                      <div className="scope-container">
                        <div className="scope-reticle"></div>
                        <div className="scope-avatar">
                          <User className="avatar-icon" />
                        </div>
                      </div>
                      <div className={`${jetbrainsMono.className} profile-type`}>{profile.type}</div>
                      <div className="profile-real-name">{profile.title}</div>
                    </div>
                  </DialogTrigger>
                ))}
              </div>
              <DialogContent className="profile-modal">
                {selectedProfile && (
                  <>
                    <DialogHeader>
                      <DialogTitle className={`${jetbrainsMono.className} profile-modal-title`}>
                        <Target className="w-6 h-6 text-red-500" />
                        Psychological Profile Analysis
                      </DialogTitle>
                    </DialogHeader>
                    <div className="profile-modal-content">
                      <div className={`${jetbrainsMono.className} profile-modal-type`}>{selectedProfile.type}</div>
                      <div className="profile-modal-subtitle">{selectedProfile.title}</div>
                      <div className="problem-section">
                        <div className={`${jetbrainsMono.className} problem-label`}>→ Problem</div>
                        <p className="profile-modal-text">{selectedProfile.content}</p>
                      </div>
                      <div className="transformation-protocol">
                        <div className={`${jetbrainsMono.className} transformation-label`}>→ Transformation Protocol</div>
                        <p className="transformation-text">{selectedProfile.transformation}</p>
                      </div>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </DeclassifiedWrapper>

        {/* Show accept mission only when all components are declassified */}
        {(() => {
          const requiredComponents = ["mission-directive", "mission-architecture", "psychological-profiles"]
          const allDeclassified = requiredComponents.every(id => declassifiedComponents.has(id))
          
          return allDeclassified && (
            <div className="accept-mission mission-revealed">
              <button
                className={`${jetbrainsMono.className} mission-button ${missionAccepted ? "accepted" : ""}`}
                onClick={handleAcceptMission}
                disabled={missionAccepted}
              >
                {missionAccepted ? "MISSION ACCEPTED" : "DO YOU ACCEPT THIS MISSION?"}
              </button>
              <div className="warning-text">
                WARNING: This briefing will self-destruct in 30 seconds after acceptance.
                <br />
                Proceed only if authorized for Strategic Revelation Protocol.
                <br />
                <strong>Mission Success Rate: CLASSIFIED</strong>
              </div>
            </div>
          )
        })()}
      </div>
    </main>
  )
}
