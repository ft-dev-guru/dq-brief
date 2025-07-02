"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { JetBrains_Mono, Inter } from "next/font/google"
import { Play, Pause, Volume2, SkipForward, SkipBack } from "lucide-react"
import "./mission-accepted.css"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

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
        Dependencies Overview
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
        src="/operational dependencies.wav"
        preload="auto"
      />
    </div>
  )
}

export default function MissionAcceptedPage() {
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

  const goToLevel1 = () => {
    router.push("/battlefield-map")
  }

  const proceedToBattlefield = () => {
    router.push("/battlefield-map")
  }

  return (
    <main className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-black`}>
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
        
        {/* Mission accepted header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className={`${jetbrainsMono.className} text-green-500 text-lg sm:text-xl lg:text-2xl font-bold tracking-wider mb-2 sm:mb-4 animate-pulse`}>
            ✓ MISSION ACCEPTED ✓
          </div>
          <h1 className={`${jetbrainsMono.className} text-amber-400 text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-wider mb-4 sm:mb-6`}>
            OPERATIONAL DEPENDENCIES
          </h1>
          <p className={`${inter.className} text-gray-300 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed px-4`}>
            Mission parameters confirmed. Proceeding with operational briefing. Study the dependencies below before battlefield deployment.
          </p>
        </div>

        {/* Audio briefing section with responsive design */}
        <div className="mb-8 sm:mb-12">
          <div className={`${jetbrainsMono.className} text-amber-400 text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 flex items-center justify-center gap-2 sm:gap-3`}>
            <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
            OPERATIONAL DEPENDENCY BRIEFING
          </div>
          
          <div className="bg-black/60 backdrop-blur-sm border-2 border-amber-500/30 rounded-lg p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            <TacticalAudioPlayer />
          </div>
        </div>

        {/* Building blocks section with responsive grid */}
        <div className="mb-8 sm:mb-12">
          <h2 className={`${jetbrainsMono.className} text-amber-400 text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 sm:mb-8 lg:mb-10`}>
            BUILDING BLOCKS FOR HIGH-PERFORMANCE ORGANIZATION
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            {[
              { title: "Clear Vision", description: "Shared understanding of organizational direction and purpose", level: "CRITICAL" },
              { title: "Strong Leadership", description: "Decisive leadership that drives execution and accountability", level: "CRITICAL" },
              { title: "Aligned Strategy", description: "Cohesive strategic approach across all organizational levels", level: "CRITICAL" },
              { title: "Effective Communication", description: "Clear, consistent messaging throughout the organization", level: "STANDARD" },
              { title: "Performance Culture", description: "Culture that rewards results and continuous improvement", level: "STANDARD" },
              { title: "Operational Excellence", description: "Optimized processes and systematic execution capabilities", level: "STANDARD" }
            ].map((block, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${
                  block.level === 'CRITICAL' 
                    ? 'from-red-900/30 to-red-800/30 border-red-500/50' 
                    : 'from-amber-900/30 to-amber-800/30 border-amber-500/50'
                } backdrop-blur-sm border-2 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`${jetbrainsMono.className} text-xs sm:text-sm font-bold tracking-wider ${
                    block.level === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {block.level}
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    block.level === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'
                  } animate-pulse`} />
                </div>
                
                <h3 className={`${jetbrainsMono.className} text-white text-base sm:text-lg font-bold mb-3 sm:mb-4`}>
                  {block.title}
                </h3>
                
                <p className={`${inter.className} text-gray-300 text-xs sm:text-sm leading-relaxed`}>
                  {block.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission timeline with responsive layout */}
        <div className="mb-8 sm:mb-12">
          <h2 className={`${jetbrainsMono.className} text-green-400 text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 sm:mb-8 lg:mb-10`}>
            MISSION TIMELINE
          </h2>
          
          <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
            {[
              { phase: "PHASE 1", title: "Strategic Assessment", duration: "Week 1-2", status: "ACTIVE" },
              { phase: "PHASE 2", title: "Battlefield Analysis", duration: "Week 3-4", status: "PENDING" },
              { phase: "PHASE 3", title: "Tactical Deployment", duration: "Week 5-8", status: "PENDING" },
              { phase: "PHASE 4", title: "Mission Completion", duration: "Week 9-12", status: "PENDING" }
            ].map((phase, index) => (
              <div
                key={index}
                className={`flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm border-2 rounded-lg transition-all duration-300 ${
                  phase.status === 'ACTIVE' 
                    ? 'border-green-500/50 shadow-lg shadow-green-500/20' 
                    : 'border-gray-500/30'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-0 sm:mr-6">
                  <div className={`w-4 h-4 rounded-full ${
                    phase.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                  }`} />
                  <div className={`${jetbrainsMono.className} text-xs sm:text-sm font-bold tracking-wider ${
                    phase.status === 'ACTIVE' ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {phase.phase}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className={`${jetbrainsMono.className} text-white text-base sm:text-lg font-bold mb-1 sm:mb-2`}>
                    {phase.title}
                  </h3>
                  <p className={`${inter.className} text-gray-300 text-xs sm:text-sm`}>
                    Duration: {phase.duration}
                  </p>
                </div>
                
                <div className={`${jetbrainsMono.className} text-xs sm:text-sm font-bold mt-2 sm:mt-0 ${
                  phase.status === 'ACTIVE' ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {phase.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons with responsive layout */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center max-w-2xl mx-auto">
          <button
            onClick={proceedToBattlefield}
            className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-black font-bold py-3 sm:py-4 px-6 sm:px-8 lg:px-12 rounded-lg transition-all duration-300 text-sm sm:text-base lg:text-lg tracking-wider hover:shadow-lg hover:shadow-green-500/30"
          >
            PROCEED TO BATTLEFIELD
          </button>
          
          <button
            onClick={() => router.push("/classified")}
            className="w-full sm:w-auto bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 lg:px-12 rounded-lg transition-all duration-300 text-sm sm:text-base lg:text-lg tracking-wider hover:shadow-lg hover:shadow-gray-500/30"
          >
            REVIEW BRIEFING
          </button>
        </div>

        {/* Status indicator */}
        <div className="text-center mt-6 sm:mt-8">
          <div className={`${jetbrainsMono.className} text-green-400 text-xs sm:text-sm animate-pulse`}>
            &gt; READY FOR DEPLOYMENT...
          </div>
        </div>
      </div>
    </main>
  )
}
