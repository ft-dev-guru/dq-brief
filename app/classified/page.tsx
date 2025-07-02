"use client"

import { useState, useEffect, useRef } from "react"
import { JetBrains_Mono, Inter } from "next/font/google"
import { useRouter } from "next/navigation"
import { User, Target, Play, Pause, Volume2, SkipForward, SkipBack } from "lucide-react"
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
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0)
      setIsLoaded(true)
      
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
    }
    
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }
    
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
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
  
  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return
    
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
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
    if (!canvas || !audio || !isLoaded) return
    
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const clickProgress = x / canvas.offsetWidth
    
    // Clamp between 0 and 1
    const clampedProgress = Math.max(0, Math.min(1, clickProgress))
    const newTime = clampedProgress * duration
    
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleProgressBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !isLoaded) return
    
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const clickProgress = x / rect.width
    
    // Clamp between 0 and 1
    const clampedProgress = Math.max(0, Math.min(1, clickProgress))
    const newTime = clampedProgress * duration
    
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const skipForward = () => {
    const audio = audioRef.current
    if (!audio) return
    
    const newTime = Math.min(audio.currentTime + 10, duration)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const skipBackward = () => {
    const audio = audioRef.current
    if (!audio) return
    
    const newTime = Math.max(audio.currentTime - 10, 0)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }
  
  return (
    <div className="tactical-audio-player">
      <div className={`${jetbrainsMono.className} audio-classification`}>
        CLASSIFIED INTEL TRANSMISSION
      </div>
      <div className="audio-title">
        Mission Overview
      </div>
      <div className={`${jetbrainsMono.className} audio-duration`}>
        Total Duration: {formatTime(duration)}
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
              <br />
              <span className="time-remaining">-{formatTime(duration - currentTime)} remaining</span>
            </div>
            <div className="transmission-status">
              <Volume2 className="w-4 h-4" />
              <span>{isPlaying ? 'TRANSMITTING' : isLoaded ? 'READY' : 'LOADING...'}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* YouTube-style control bar */}
      <div className="tactical-controls">
        <div className="progress-section">
          <div className={`${jetbrainsMono.className} time-current`}>
            {formatTime(currentTime)}
          </div>
          <div 
            className="progress-bar-container"
            onClick={handleProgressBarClick}
          >
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
              <div 
                className="progress-handle"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>
          <div className={`${jetbrainsMono.className} time-total`}>
            {formatTime(duration)}
          </div>
        </div>
        
        <div className="control-buttons">
          <button 
            className="control-btn skip-back"
            onClick={skipBackward}
            disabled={!isLoaded}
            title="Skip back 10s"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          
          <button 
            className="control-btn play-pause-main"
            onClick={togglePlayPause}
            disabled={!isLoaded}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          
          <button 
            className="control-btn skip-forward"
            onClick={skipForward}
            disabled={!isLoaded}
            title="Skip forward 10s"
          >
            <SkipForward className="w-5 h-5" />
          </button>
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

export default function ClassifiedPage() {
  const [timestamp, setTimestamp] = useState("")
  const router = useRouter()

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
    router.push("/mission-accepted")
  }

  return (
    <main className={`${inter.className} classified-page min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-black`}>
      {/* Header with responsive layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 lg:p-8 border-b border-green-500/30">
        <div className={`${jetbrainsMono.className} text-green-400 text-xs sm:text-sm tracking-wider mb-2 sm:mb-0`}>
          GRID REF: 74B-KILO-29 | AO: SECURE
        </div>
        <div className={`${jetbrainsMono.className} text-green-400 text-xs sm:text-sm`}>
          {timestamp}
        </div>
      </div>

      {/* Main content container with responsive padding */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
        {/* Classification header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className={`${jetbrainsMono.className} text-red-500 text-sm sm:text-base lg:text-xl font-bold tracking-wider mb-2 sm:mb-4`}>
            ⚠️ CLASSIFIED - EYES ONLY ⚠️
          </div>
          <h1 className={`${jetbrainsMono.className} text-green-400 text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-wider mb-4 sm:mb-6`}>
            PSYCHOLOGICAL WARFARE PROTOCOLS
          </h1>
          <p className={`${inter.className} text-gray-300 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed px-4`}>
            Intelligence briefing on target psychological profiles. Study these patterns. Learn their triggers. Deploy accordingly.
          </p>
        </div>

        {/* Audio briefing section with responsive design */}
        <div className="mb-8 sm:mb-12">
          <div className={`${jetbrainsMono.className} text-green-400 text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 flex items-center justify-center gap-2 sm:gap-3`}>
            <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
            TACTICAL AUDIO BRIEFING
          </div>
          
          <div className="bg-black/60 backdrop-blur-sm border-2 border-green-500/30 rounded-lg p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            <TacticalAudioPlayer />
          </div>
        </div>

        {/* Psychological profiles grid with responsive layout */}
        <div className="mb-8 sm:mb-12">
          <h2 className={`${jetbrainsMono.className} text-green-400 text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 sm:mb-8 lg:mb-10`}>
            TARGET PSYCHOLOGICAL PROFILES
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {psychologicalProfiles.map((profile, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border-2 border-amber-500/30 rounded-lg p-4 sm:p-6 hover:border-amber-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`${jetbrainsMono.className} text-amber-400 text-xs sm:text-sm font-bold tracking-wider`}>
                    {profile.type}
                  </div>
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                </div>
                
                <h3 className={`${jetbrainsMono.className} text-white text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4`}>
                  {profile.title}
                </h3>
                
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <h4 className={`${jetbrainsMono.className} text-red-400 text-sm font-bold mb-2`}>
                      CURRENT STATE:
                    </h4>
                    <p className={`${inter.className} text-gray-300 text-xs sm:text-sm leading-relaxed`}>
                      {profile.content}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className={`${jetbrainsMono.className} text-green-400 text-sm font-bold mb-2`}>
                      TARGET TRANSFORMATION:
                    </h4>
                    <p className={`${inter.className} text-gray-300 text-xs sm:text-sm leading-relaxed`}>
                      {profile.transformation}
                    </p>
                  </div>
                </div>

                {/* More Details Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-bold py-2 sm:py-3 px-4 rounded-lg transition-all duration-300 text-xs sm:text-sm">
                      DEPLOY TACTICAL ANALYSIS
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-amber-500/50 text-white">
                    <DialogHeader>
                      <DialogTitle className={`${jetbrainsMono.className} text-amber-400 text-lg sm:text-xl`}>
                        {profile.type}: {profile.title}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
                      <div>
                        <h4 className={`${jetbrainsMono.className} text-red-400 text-sm sm:text-base font-bold mb-2 sm:mb-3`}>
                          DETAILED PSYCHOLOGICAL ANALYSIS:
                        </h4>
                        <p className={`${inter.className} text-gray-300 text-sm sm:text-base leading-relaxed`}>
                          {profile.content}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className={`${jetbrainsMono.className} text-green-400 text-sm sm:text-base font-bold mb-2 sm:mb-3`}>
                          TRANSFORMATION STRATEGY:
                        </h4>
                        <p className={`${inter.className} text-gray-300 text-sm sm:text-base leading-relaxed`}>
                          {profile.transformation}
                        </p>
                      </div>
                      
                      <div className="bg-black/40 border border-amber-500/30 rounded-lg p-3 sm:p-4">
                        <h4 className={`${jetbrainsMono.className} text-amber-400 text-sm sm:text-base font-bold mb-2`}>
                          MISSION CRITICAL INTELLIGENCE:
                        </h4>
                        <p className={`${inter.className} text-gray-300 text-xs sm:text-sm leading-relaxed`}>
                          Deploy visual and strategic elements that address the specific psychological state. 
                          Monitor for behavioral changes indicating successful transformation. 
                          Adjust tactical approach based on resistance patterns.
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        </div>

        {/* Mission acceptance section with responsive design */}
        <div className="text-center bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-sm border-2 border-red-500/50 rounded-lg p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto">
          <div className={`${jetbrainsMono.className} text-red-400 text-sm sm:text-base font-bold tracking-wider mb-3 sm:mb-4`}>
            MISSION AUTHORIZATION REQUIRED
          </div>
          
          <h2 className={`${jetbrainsMono.className} text-white text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6`}>
            PROCEED TO OPERATIONAL PHASE?
          </h2>
          
          <p className={`${inter.className} text-gray-300 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 max-w-2xl mx-auto px-4`}>
            You have reviewed the psychological warfare protocols. Intelligence has been acquired. 
            Are you prepared to accept this mission and proceed to operational deployment?
          </p>
          
          <button
            onClick={handleAcceptMission}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-black font-bold py-3 sm:py-4 px-6 sm:px-8 lg:px-12 rounded-lg transition-all duration-300 text-sm sm:text-base lg:text-lg tracking-wider hover:shadow-lg hover:shadow-green-500/30 w-full sm:w-auto"
          >
            ACCEPT MISSION
          </button>
          
          <div className={`${jetbrainsMono.className} text-green-400 text-xs sm:text-sm mt-4 sm:mt-6 animate-pulse`}>
            &gt; AWAITING CONFIRMATION...
          </div>
        </div>
      </div>
    </main>
  )
}
