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
  const [isFadingOut, setIsFadingOut] = useState(false)
  const router = useRouter()

  useEffect(() => {
    window.scrollTo(0, 0)

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
    alert("Returning to Mission Brief...")
    router.push("/classified")
  }

  const proceedToBattlefield = () => {
    setIsFadingOut(true)
    setTimeout(() => {
      router.push("/battlefield-map")
    }, 1500)
  }

  const bodyClasses = [inter.className, "dependencies-page-body", isFadingOut ? "fade-out-effect" : ""].join(" ")

  return (
    <main className={bodyClasses}>
      <div className={`${jetbrainsMono.className} coordinates`}>INTEL SECTOR: DELTA-9 | CLEARANCE: ULTRA</div>
      <div className={`${jetbrainsMono.className} timestamp`} id="timestamp">
        {timestamp}
      </div>

      <header className="briefing-header">
        <div className={`${jetbrainsMono.className} briefing-classification`}>CLASSIFIED - STRATEGIC INTELLIGENCE</div>
        <div className={`${jetbrainsMono.className} briefing-title`}>OPERATIONAL DEPENDENCIES</div>
        <div className={`${jetbrainsMono.className} briefing-subtitle`}>
          The Logic of the Ascent - Mission Critical Sequencing
        </div>
      </header>

      <div className="container">
        <TacticalAudioPlayer />
        
        <div className="mission-directive">
          <div className="directive-quote">
            "A designer must understand not just the individual notes, but the music of the entire symphony. The
            sequence of these six Basecamps is that symphony."
          </div>
          <div className={`${jetbrainsMono.className} directive-emphasis`}>
            The Sacred, Logical Path to True Understanding
          </div>
        </div>

        <div className="sequence-analysis">
          <div className="analysis-intro">
            It is a journey that investigates the most fundamental questions in the only sequence that makes sense. The
            order is not a matter of convenience; it is the sacred, logical path to true understanding.
          </div>

          <div className="dependency-chain">
            {[
              {
                num: 1,
                sequence: "First, We Begin With",
                title: "Basecamp 1: The Industry Battlefield",
                designation: "External Reconnaissance Protocol",
                content:
                  "We do not start by looking in the mirror. We start by looking out the window at the world as it truly is. We must first map the terrain, understand the weather, and identify the other armies on the field.",
                rationale:
                  "A strategy built on a fantasy of the market is doomed. We start by assessing the unforgiving truth of the external world.",
              },
              {
                num: 2,
                sequence: "Only Then Can We Move To",
                title: "Basecamp 2: The Company Identity",
                designation: "Internal Core Analysis Protocol",
                content:
                  'Having mapped the battlefield, we turn inward to investigate the most crucial question: "Is the soul of this company clear, alive, and shared?" We assess if there is an authentic, unshakable sense of self—if the company\'s dream inspires, if its values are lived, and if its targets are coherent.',
                rationale: "We are investigating the foundation to see if it is solid rock or crumbling sand.",
              },
              {
                num: 3,
                sequence: "With Stark Understanding, We Ascend To",
                title: "Basecamp 3: The Strategy",
                designation: "Weapon Inspection Protocol",
                content:
                  "Here, we inspect the weapons already forged. Is the company's current strategy sharp and coherent, or is it a blunt instrument? We critically evaluate the irresistibility of its value proposition and the clarity of its competitive edge.",
                rationale: "To see if the existing plan is designed to win, or merely to participate.",
              },
              {
                num: 4,
                sequence: "However, This Brings Us To",
                title: "Basecamp 4: The Strategy in Action",
                designation: "Combat Effectiveness Protocol",
                content:
                  "A strategy is merely a ghost until it acts. A weapon is useless until it is wielded. Here, we investigate the link between intent and reality. Is the articulated strategy a living force in the company's products, its pricing, and its marketing?",
                rationale:
                  'This is the detective\'s hunt for the "say-do" gap, revealing where the beautiful theory breaks down on the unforgiving ground of execution.',
              },
              {
                num: 5,
                sequence: "For Sustainability, We Arrive At",
                title: "Basecamp 5: The Machine",
                designation: "Operational Engine Analysis Protocol",
                content:
                  "For action to be sustainable, it requires a powerful engine. For a strategy to endure, it needs a powerful and aligned operational body. Here, we examine the current state of the structures, the people, the processes, and the data that bring the strategy to life every day.",
                rationale:
                  "We investigate to see if the machine is built to power the strategy, or if its gears grind against the company's ambition.",
              },
              {
                num: 6,
                sequence: "Finally, We Look To The Horizon",
                title: "Basecamp 6: The Future Foresight",
                designation: "Tomorrow Readiness Protocol",
                content:
                  'With a powerful machine executing a sharp strategy, we look to the horizon. Having assessed the company as it is today, we ask the ultimate question: "Is it built to dominate tomorrow?" This final stage is the ultimate test of its current resilience, agility, and adaptability.',
                rationale:
                  "We investigate its readiness for the future to see if it is positioned to lead or destined to be replaced.",
              },
            ].map((step, index, arr) => (
              <>
                <div className="dependency-step" key={step.num}>
                  <div className="step-indicator">{step.num}</div>
                  <div className="step-header">
                    <div className={`${jetbrainsMono.className} step-sequence`}>{step.sequence}</div>
                    <div className="step-title">{step.title}</div>
                    <div className={`${jetbrainsMono.className} step-designation`}>{step.designation}</div>
                  </div>
                  <div className="step-content">{step.content}</div>
                  <div className="step-rationale">
                    <div className={`${jetbrainsMono.className} rationale-label`}>Strategic Rationale</div>
                    <div className="rationale-text">{step.rationale}</div>
                  </div>
                </div>
                {index < arr.length - 1 && (
                  <div className="connection-arrow">
                    <div className="arrow-symbol">↓</div>
                  </div>
                )}
              </>
            ))}
          </div>
        </div>

        <div className="strategic-conclusion">
          <div className="conclusion-text">
            This is the logic of our ascent. From the battlefield to the soul, from the soul to the strategy, and from
            the strategy to a machine built to last. Each step of the investigation builds upon the last, ensuring that
            the final <span className="conclusion-emphasis">Battle Plan</span> is not a collection of disparate tactics,
            but a deeply authentic, powerful, and inevitable strategy for dominance.
          </div>
        </div>

        <div className="navigation">
          <button className={`${jetbrainsMono.className} nav-button`} onClick={goToLevel1}>
            ← Return to Mission Brief
          </button>
          <button className={`${jetbrainsMono.className} nav-button primary`} onClick={proceedToBattlefield}>
            Proceed to Battlefield Map →
          </button>
        </div>
      </div>
    </main>
  )
}
