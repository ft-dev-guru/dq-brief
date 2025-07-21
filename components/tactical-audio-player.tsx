"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, Volume2, AlertCircle, Download } from "lucide-react"

interface TacticalAudioPlayerProps {
  audioSrc: string
  title?: string
}

export const TacticalAudioPlayer = ({ audioSrc, title = "Mission Audio" }: TacticalAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoaded, setIsLoaded] = useState(true) // Start as ready like working audio players
  const [audioError, setAudioError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [formatUnsupported, setFormatUnsupported] = useState(false)
  
  // Check if browser supports the audio format
  const checkAudioSupport = () => {
    const audio = document.createElement('audio')
    const canPlayWav = audio.canPlayType('audio/wav')
    const canPlayWebm = audio.canPlayType('audio/webm')
    const canPlayMp3 = audio.canPlayType('audio/mpeg')
    
    console.log('Audio format support:', {
      wav: canPlayWav,
      webm: canPlayWebm,
      mp3: canPlayMp3
    })
    
    return {
      wav: canPlayWav !== '',
      webm: canPlayWebm !== '',
      mp3: canPlayMp3 !== ''
    }
  }
  
  useEffect(() => {
    const audio = audioRef.current
    const canvas = canvasRef.current
    
    if (!audio || !canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)
    
    // Check audio format support
    const support = checkAudioSupport()
    console.log('Checking audio support for:', audioSrc)
    
    // Set a loading timeout for large files
    loadTimeoutRef.current = setTimeout(() => {
      if (!isLoaded && !audioError) {
        console.warn('Audio loading timeout - trying to enable anyway')
        setIsLoaded(true)
        setAudioError(null)
      }
    }, 5000) // 5 second timeout (reduced for faster fallback)
    
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration)
        setIsLoaded(true)
        setAudioError(null)
        setFormatUnsupported(false)
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current)
          loadTimeoutRef.current = null
        }
        console.log('Audio duration loaded:', audio.duration)
      }
    }

    const handleLoadedMetadata = () => {
      console.log('Audio metadata loaded')
      updateDuration()
    }
    
    const handleLoadedData = () => {
      console.log('Audio data loaded')
      updateDuration()
    }
    
    const handleCanPlay = () => {
      console.log('Audio can play')
      updateDuration()
    }
    
    const handleCanPlayThrough = () => {
      console.log('Audio can play through')
      updateDuration()
    }
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      // Also check for duration on every time update as a fallback
      if (!duration && audio.duration) {
        updateDuration()
      }
    }
    
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }
    
    const handleError = (e: Event) => {
      console.error('Audio loading error:', e)
      const target = e.target as HTMLAudioElement
      let errorMessage = 'Failed to load audio file'
      
      if (target?.error) {
        switch (target.error.code) {
          case target.error.MEDIA_ERR_ABORTED:
            errorMessage = 'Audio loading was aborted'
            break
          case target.error.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error loading audio'
            break
          case target.error.MEDIA_ERR_DECODE:
            errorMessage = 'Audio file format is not compatible with this browser'
            setFormatUnsupported(true)
            break
          case target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio format is not supported by this browser'
            setFormatUnsupported(true)
            break
        }
      }
      
      setAudioError(errorMessage)
      // Only disable for format errors, keep optimistic for other errors
      if (target?.error && (target.error.code === target.error.MEDIA_ERR_DECODE || 
          target.error.code === target.error.MEDIA_ERR_SRC_NOT_SUPPORTED)) {
        setIsLoaded(false)
      }
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
        loadTimeoutRef.current = null
      }
    }
    
    const handleLoadStart = () => {
      setAudioError(null)
      setLoadingProgress(0)
      setFormatUnsupported(false)
      console.log('Audio loading started for:', audioSrc)
    }
    
    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1)
        const duration = audio.duration || 0
        if (duration > 0) {
          const progress = (bufferedEnd / duration) * 100
          setLoadingProgress(Math.min(progress, 100))
        }
      }
    }
    
    const handleSuspend = () => {
      console.log('Audio loading suspended (normal for large files)')
    }
    
    const handleWaiting = () => {
      console.log('Audio waiting for data')
    }
    
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('canplaythrough', handleCanPlayThrough)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('progress', handleProgress)
    audio.addEventListener('suspend', handleSuspend)
    audio.addEventListener('waiting', handleWaiting)
    
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
      }
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('canplaythrough', handleCanPlayThrough)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('progress', handleProgress)
      audio.removeEventListener('suspend', handleSuspend)
      audio.removeEventListener('waiting', handleWaiting)
    }
  }, [audioSrc, duration, isLoaded, audioError])
  
  const initializeAudioContext = async () => {
    const audio = audioRef.current
    if (!audio || audioContextRef.current) return
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Resume audio context if it's suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }
      
      const source = audioContext.createMediaElementSource(audio)
      const analyser = audioContext.createAnalyser()
      
      analyser.fftSize = 128
      analyser.smoothingTimeConstant = 0.8
      
      source.connect(analyser)
      analyser.connect(audioContext.destination)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
      sourceRef.current = source
      
      setIsInitialized(true)
      console.log('Audio context initialized successfully')
    } catch (error) {
      console.error('Failed to initialize audio context:', error)
      // Continue without Web Audio API visualization
      setIsInitialized(true)
    }
  }
  
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
      try {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current)
        audioData = dataArrayRef.current
      } catch (error) {
        // Fallback to animated bars if Web Audio API fails
        console.warn('Web Audio API data retrieval failed, using fallback animation')
      }
    }
    
    // Draw waveform
    const totalBars = 60
    const barWidth = width / totalBars
    const progress = duration > 0 ? currentTime / duration : 0
    
    // Calculate center position for active audio data
    const audioBars = audioData ? Math.min(audioData.length, 32) : 0
    const centerStart = Math.floor((totalBars - audioBars) / 2)
    
    // Draw progress indicator line in the center
    const progressX = (progress * totalBars) * barWidth
    ctx.strokeStyle = '#9ca3af'
    ctx.lineWidth = 2
    ctx.shadowColor = '#9ca3af'
    ctx.shadowBlur = 4
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
          const intensity = amplitude > 0.3 ? 0.8 : 0.5 + amplitude * 0.3
          ctx.fillStyle = `rgba(156, 163, 175, ${intensity})`
          ctx.shadowColor = '#9ca3af'
          ctx.shadowBlur = amplitude > 0.5 ? 4 : 2
        } else {
          // Standard for animated bars
          ctx.fillStyle = 'rgba(156, 163, 175, 0.6)'
          ctx.shadowColor = '#9ca3af'
          ctx.shadowBlur = 1
        }
      } else {
        ctx.fillStyle = 'rgba(156, 163, 175, 0.2)'
        ctx.shadowBlur = 0
      }
      
      ctx.fillRect(x, y, barWidth - 2, barHeight)
    }
    
    // Continue animation if playing
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(drawWaveform)
    }
  }
  
  const togglePlayPause = async () => {
    if (!audioRef.current) return
    
    try {
      if (isPlaying) {
        await audioRef.current.pause()
        setIsPlaying(false)
      } else {
        // Initialize audio context on first play (required by browsers)
        if (!isInitialized) {
          await initializeAudioContext()
        }
        
        // Resume audio context if it's suspended (required by browsers)
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume()
        }
        
        await audioRef.current.play()
        setIsPlaying(true)
        setAudioError(null)
      }
    } catch (error) {
      console.error('Error controlling audio playback:', error)
      setAudioError('Failed to play audio. Please try again.')
      setIsPlaying(false)
    }
  }
  
  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !duration || !audioRef.current) return
    
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const progress = x / canvas.offsetWidth
    const newTime = progress * duration
    
    try {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    } catch (error) {
      console.error('Error seeking audio:', error)
    }
  }
  
  const getButtonTitle = () => {
    if (audioError) return 'Audio failed to load'
    if (isLoaded) return 'Play/Pause'
    if (loadingProgress > 0) return `Loading... ${Math.round(loadingProgress)}%`
    return 'Loading...'
  }
  
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = audioSrc
    link.download = `${title}.wav`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  return (
    <div className="tactical-audio-player">
      <div className="audio-player-container">
        <div className="audio-header">
          <div className="audio-title">
            <Volume2 className="audio-icon" />
            <span>{title}</span>
          </div>
          <div className="audio-time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
        
        {audioError && (
          <div className="audio-error">
            <AlertCircle className="error-icon" />
            <span>{audioError}</span>
            {formatUnsupported && (
              <div className="format-help">
                <p>This audio file uses a WAV format that isn't supported by web browsers.</p>
                <button onClick={handleDownload} className="download-btn">
                  <Download className="download-icon" />
                  Download Audio File
                </button>
              </div>
            )}
          </div>
        )}
        
        {!isLoaded && !audioError && loadingProgress > 0 && (
          <div className="loading-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <span className="progress-text">Loading... {Math.round(loadingProgress)}%</span>
          </div>
        )}
        
        <div className="audio-controls">
          <button 
            className="play-pause-btn"
            onClick={togglePlayPause}
            disabled={!isLoaded && !audioError}
            title={getButtonTitle()}
          >
            {isPlaying ? <Pause className="control-icon" /> : <Play className="control-icon" />}
          </button>
          
          <div className="waveform-container">
            <canvas 
              ref={canvasRef}
              className="waveform-canvas"
              onClick={handleCanvasClick}
            />
          </div>
        </div>
        
        <audio 
          ref={audioRef}
          src={audioSrc}
          preload="auto"
        />
      </div>
      
      <style jsx>{`
        .tactical-audio-player {
          margin: 2rem 0;
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid #4b5563;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        
        .audio-player-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .audio-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .audio-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #d1d5db;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
          font-size: 0.9rem;
        }
        
        .audio-icon {
          width: 18px;
          height: 18px;
        }
        
        .audio-time {
          color: #9ca3af;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          opacity: 0.8;
        }
        
        .audio-error {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          color: #ff6b6b;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          background: rgba(255, 107, 107, 0.1);
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid rgba(255, 107, 107, 0.3);
        }
        
        .error-icon {
          width: 14px;
          height: 14px;
        }
        
        .format-help {
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 107, 107, 0.3);
        }
        
        .format-help p {
          margin: 0 0 0.5rem 0;
          font-size: 0.75rem;
          opacity: 0.9;
        }
        
        .download-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 107, 107, 0.2);
          border: 1px solid rgba(255, 107, 107, 0.5);
          color: #ff6b6b;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .download-btn:hover {
          background: rgba(255, 107, 107, 0.3);
          border-color: #ff6b6b;
        }
        
        .download-icon {
          width: 12px;
          height: 12px;
        }
        
        .loading-progress {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #d1d5db;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
        }
        
        .progress-bar {
          flex: 1;
          height: 4px;
          background: rgba(107, 114, 128, 0.3);
          border-radius: 2px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: #6b7280;
          transition: width 0.3s ease;
        }
        
        .progress-text {
          white-space: nowrap;
          opacity: 0.8;
        }
        
        .audio-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .play-pause-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 2px solid #6b7280;
          background: rgba(0, 0, 0, 0.3);
          color: #d1d5db;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }
        
        .play-pause-btn:hover:not(:disabled) {
          background: rgba(0, 0, 0, 0.5);
          border-color: #9ca3af;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
        }
        
        .play-pause-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .control-icon {
          width: 20px;
          height: 20px;
        }
        
        .waveform-container {
          flex: 1;
          height: 80px;
          border: 1px solid #4b5563;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.8);
          overflow: hidden;
          cursor: pointer;
        }
        
        .waveform-canvas {
          width: 100%;
          height: 100%;
          display: block;
        }
      `}</style>
    </div>
  )
} 