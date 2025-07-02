"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { JetBrains_Mono, Inter } from "next/font/google"
import { Shield, Target, AlertTriangle, CheckCircle, ArrowLeft, Loader2 } from "lucide-react"
import "./mission-rules.css"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

interface ApiSection {
  section_title: string
  section_content: string
  section_index: number
  total_sections: number
}

interface ApiRule {
  id?: string
  category?: string
  title?: string
  content?: string
  level?: string
  mission_rules?: string
  [key: string]: any // Allow for flexible API response structure
}

interface ParsedSection {
  id: string
  title: string
  content: string
  level: 'CRITICAL' | 'STANDARD'
  category: string
  index: number
  totalSections: number
  isHero?: boolean
  isEmotional?: boolean
  isRemember?: boolean
}

export default function MissionRulesPage() {
  const [timestamp, setTimestamp] = useState("")
  const [apiData, setApiData] = useState<ApiRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [parsedSections, setParsedSections] = useState<ParsedSection[]>([])
  const [draftCountdown, setDraftCountdown] = useState("28:00:00:00")
  const [perfectionCountdown, setPerfectionCountdown] = useState("14:00:00:00")
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [agentsExpanded, setAgentsExpanded] = useState(false)
  const router = useRouter()

  // Function to parse the new API structure into sections
  const parseApiSections = (apiSections: ApiSection[]): ParsedSection[] => {
    if (!apiSections || apiSections.length === 0) return []
    
    return apiSections.map((section) => {
      const title = section.section_title
      const content = section.section_content
      
      // Determine criticality and special types
      const isHero = title.toLowerCase().includes('dq design rules document')
      const isEmotional = title.toLowerCase().includes('emotional')
      const isRemember = title.toLowerCase().includes('remember')
      const isCritical = title.toLowerCase().includes('fundamental') ||
                        title.toLowerCase().includes('philosophy') ||
                        isEmotional ||
                        title.toLowerCase().includes('intensity') ||
                        title.toLowerCase().includes('final') ||
                        title.toLowerCase().includes('checklist') ||
                        isRemember ||
                        content.toLowerCase().includes('critical') ||
                        content.toLowerCase().includes('urgent')
      
      // Extract category from title
      let category = 'STRATEGIC PROTOCOL'
      if (isHero) category = 'MISSION BRIEFING'
      else if (isEmotional) category = 'PSYCHOLOGICAL WARFARE'
      else if (isRemember) category = 'FINAL ORDERS'
      else if (title.toLowerCase().includes('design')) category = 'DESIGN PROTOCOL'
      else if (title.toLowerCase().includes('visual') || title.toLowerCase().includes('mri')) category = 'VISUAL PROTOCOL'
      else if (title.toLowerCase().includes('data')) category = 'DATA PROTOCOL'
      else if (title.toLowerCase().includes('personas')) category = 'PSYCHOLOGICAL PROTOCOL'
      else if (title.toLowerCase().includes('technical')) category = 'TECHNICAL PROTOCOL'
      else if (title.toLowerCase().includes('quality') || title.toLowerCase().includes('checklist')) category = 'QUALITY PROTOCOL'
      else if (title.toLowerCase().includes('intensity') || title.toLowerCase().includes('score')) category = 'ASSESSMENT PROTOCOL'
      else if (title.toLowerCase().includes('brand') || title.toLowerCase().includes('fast track')) category = 'BRAND PROTOCOL'
      
      return {
        id: `RULE-${String(section.section_index + 1).padStart(3, '0')}`,
        title: title,
        content: content,
        level: isCritical ? 'CRITICAL' : 'STANDARD',
        category,
        index: section.section_index,
        totalSections: section.total_sections,
        isHero,
        isEmotional,
        isRemember
      }
    })
  }

  // Legacy function for old markdown format (keeping for backwards compatibility)
  const parseMissionRules = (markdownContent: string): ParsedSection[] => {
    if (!markdownContent) return []
    
    const sections: ParsedSection[] = []
    
    // Split by main headings (##)
    const mainSections = markdownContent.split(/^## /gm).filter(section => section.trim())
    
    mainSections.forEach((section, index) => {
      const lines = section.split('\n')
      const title = lines[0]?.trim() || `Section ${index + 1}`
      
      // Determine criticality based on keywords
      const isCritical = title.toLowerCase().includes('fundamental') ||
                        title.toLowerCase().includes('philosophy') ||
                        title.toLowerCase().includes('emotional') ||
                        title.toLowerCase().includes('intensity') ||
                        title.toLowerCase().includes('final') ||
                        section.toLowerCase().includes('critical') ||
                        section.toLowerCase().includes('urgent')
      
      // Extract category from title or content
      let category = 'STRATEGIC PROTOCOL'
      if (title.toLowerCase().includes('design')) category = 'DESIGN PROTOCOL'
      else if (title.toLowerCase().includes('visual')) category = 'VISUAL PROTOCOL'
      else if (title.toLowerCase().includes('data')) category = 'DATA PROTOCOL'
      else if (title.toLowerCase().includes('emotional')) category = 'PSYCHOLOGICAL PROTOCOL'
      else if (title.toLowerCase().includes('technical')) category = 'TECHNICAL PROTOCOL'
      else if (title.toLowerCase().includes('quality')) category = 'QUALITY PROTOCOL'
      
      // Get content (everything after the title)
      const content = lines.slice(1).join('\n').trim()
      
      sections.push({
        id: `RULE-${String(index + 1).padStart(3, '0')}`,
        title: title.replace(/^#+\s*/, ''), // Remove any remaining # symbols
        content: content || 'No additional details provided.',
        level: isCritical ? 'CRITICAL' : 'STANDARD',
        category,
        index: index,
        totalSections: mainSections.length
      })
    })
    
    return sections
  }

  // Function to parse hero section (DQ DESIGN RULES DOCUMENT)
  const parseHeroContent = (content: string) => {
    const deadlineMatch = content.match(/\*\*Deadline:\*\*\s*([^*]+)/)
    const budgetMatch = content.match(/\*\*Budget:\*\*\s*([^*]+)/)
    const stakesMatch = content.match(/\*\*Stakes:\*\*\s*([^*]+)/)
    const questionsMatch = content.match(/\*\*Questions\?\*\*\s*([^*]+)/)
    
    return {
      deadline: deadlineMatch ? deadlineMatch[1].trim() : '',
      budget: budgetMatch ? budgetMatch[1].trim() : '',
      stakes: stakesMatch ? stakesMatch[1].trim() : '',
      questions: questionsMatch ? questionsMatch[1].trim() : '',
      outro: content.split('Now go create something that breaks the industry.')[1]?.trim() || 'Now go create something that breaks the industry.'
    }
  }

  // Function to parse emotional journey content
  const parseEmotionalContent = (content: string) => {
    const wowMatch = content.match(/### 🔥 WOW[\s\S]*?(?=### 😰 FEAR|$)/)
    const fearMatch = content.match(/### 😰 FEAR[\s\S]*?(?=### ⚡ EXCITEMENT|$)/)
    const excitementMatch = content.match(/### ⚡ EXCITEMENT[\s\S]*?(?=\*\*Design rule:|$)/)
    
    return {
      wow: wowMatch ? wowMatch[0] : '',
      fear: fearMatch ? fearMatch[0] : '',
      excitement: excitementMatch ? excitementMatch[0] : ''
    }
  }

  // Enhanced function to format markdown content for display
  const formatContent = (content: string): string => {
    return content
      // Convert **bold** to <strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert *italic* to <em> (but not if already in strong tags)
      .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
      // Convert ### to <h3>
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      // Convert - bullet points to <li>
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      // Convert numbered lists 1. to <li>
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      // Convert emojis and special formatting
      .replace(/🔥/g, '<span class="emoji-fire">🔥</span>')
      .replace(/😰/g, '<span class="emoji-fear">😰</span>')
      .replace(/⚡/g, '<span class="emoji-excitement">⚡</span>')
      .replace(/🟩/g, '<span class="status-healthy">🟩</span>')
      .replace(/🟧/g, '<span class="status-danger">🟧</span>')
      .replace(/🟥/g, '<span class="status-critical">🟥</span>')
      // Convert double line breaks to paragraph breaks
      .replace(/\n\n/g, '</p><p>')
      // Convert single line breaks to <br>
      .replace(/\n/g, '<br>')
      // Wrap content in paragraphs
      .replace(/^(.*)/, '<p>$1')
      .replace(/(.*)$/, '$1</p>')
      // Wrap multiple <li> in <ul>
      .replace(/(<li>.*?<\/li>(?:<br><li>.*?<\/li>)*)/g, '<ul>$1</ul>')
      // Clean up extra <br> tags
      .replace(/<br><ul>/g, '<ul>')
      .replace(/<\/ul><br>/g, '</ul>')
      .replace(/<p><\/p>/g, '')
      .replace(/<br><\/p>/g, '</p>')
  }

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

  // Update countdown timers every second
  useEffect(() => {
    // Set the draft deadline to 28 days from now
    const draftDeadline = new Date()
    draftDeadline.setDate(draftDeadline.getDate() + 28)
    
    const updateCountdowns = () => {
      const now = new Date()
      
      // Calculate time left for draft phase
      const draftTimeLeft = draftDeadline.getTime() - now.getTime()
      
      if (draftTimeLeft > 0) {
        // Draft phase is still active
        const draftDays = Math.floor(draftTimeLeft / (1000 * 60 * 60 * 24))
        const draftHours = Math.floor((draftTimeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const draftMinutes = Math.floor((draftTimeLeft % (1000 * 60 * 60)) / (1000 * 60))
        const draftSeconds = Math.floor((draftTimeLeft % (1000 * 60)) / 1000)
        
        const draftCountdownStr = `${String(draftDays).padStart(2, '0')}:${String(draftHours).padStart(2, '0')}:${String(draftMinutes).padStart(2, '0')}:${String(draftSeconds).padStart(2, '0')}`
        setDraftCountdown(draftCountdownStr)
        
        // Perfection phase stays static until draft is complete
        setPerfectionCountdown("14:00:00:00")
      } else {
        // Draft phase is complete, now start perfection phase
        setDraftCountdown("00:00:00:00")
        
        // Calculate perfection deadline (14 days from when draft phase ended)
        const perfectionDeadline = new Date(draftDeadline.getTime() + (14 * 24 * 60 * 60 * 1000))
        const perfectionTimeLeft = perfectionDeadline.getTime() - now.getTime()
        
        if (perfectionTimeLeft > 0) {
          const perfectionDays = Math.floor(perfectionTimeLeft / (1000 * 60 * 60 * 24))
          const perfectionHours = Math.floor((perfectionTimeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const perfectionMinutes = Math.floor((perfectionTimeLeft % (1000 * 60 * 60)) / (1000 * 60))
          const perfectionSeconds = Math.floor((perfectionTimeLeft % (1000 * 60)) / 1000)
          
          const perfectionCountdownStr = `${String(perfectionDays).padStart(2, '0')}:${String(perfectionHours).padStart(2, '0')}:${String(perfectionMinutes).padStart(2, '0')}:${String(perfectionSeconds).padStart(2, '0')}`
          setPerfectionCountdown(perfectionCountdownStr)
        } else {
          // Both phases complete
          setPerfectionCountdown("00:00:00:00")
        }
      }
    }

    updateCountdowns()
    const interval = setInterval(updateCountdowns, 1000)
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchMissionRules = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('https://n8n-reports.fasttrack-diagnostic.com/webhook/1f7104c7-b9b7-414e-9bd7-83f40e0cc014')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('API Response:', data) // Debug log
        
        // Handle different possible response structures
        if (Array.isArray(data)) {
          console.log('Array data received, first item keys:', Object.keys(data[0] || {})) // Debug log
          
          // Check if first item has a 'data' property with sections
          if (data[0]?.data && Array.isArray(data[0].data)) {
            console.log('Found data property with sections:', data[0].data.length) // Debug log
            const sections = data[0].data as ApiSection[]
            const parsed = parseApiSections(sections)
            console.log('Parsed sections from data property:', parsed) // Debug log
            setParsedSections(parsed)
            setApiData([]) // Clear old format data
          }
          // Check if it's the direct new structured format
          else if (data[0]?.section_title && data[0]?.section_content) {
            console.log('Parsing direct new structured format:', data.length, 'sections') // Debug log
            const parsed = parseApiSections(data as ApiSection[])
            console.log('Parsed sections:', parsed) // Debug log
            setParsedSections(parsed)
            setApiData([]) // Clear old format data
          } else {
            console.log('Using old format or unrecognized structure') // Debug log
            setApiData(data)
            // Check if first item has mission_rules content (old format)
            if (data[0]?.mission_rules) {
              const parsed = parseMissionRules(data[0].mission_rules)
              setParsedSections(parsed)
            }
          }
        } else if (data.rules && Array.isArray(data.rules)) {
          console.log('Data has rules property') // Debug log
          setApiData(data.rules)
        } else if (data.data && Array.isArray(data.data)) {
          console.log('Data has data property (single object)') // Debug log
          const sections = data.data as ApiSection[]
          const parsed = parseApiSections(sections)
          console.log('Parsed sections from single object data property:', parsed) // Debug log
          setParsedSections(parsed)
          setApiData([]) // Clear old format data
        } else {
          console.log('Single object, keys:', Object.keys(data)) // Debug log
          
          // Check if this single object has the new structured format properties
          if (data.section_title && data.section_content) {
            console.log('Single object with new structure format - treating as single section') // Debug log
            const parsed = parseApiSections([data as ApiSection])
            console.log('Parsed single section:', parsed) // Debug log
            setParsedSections(parsed)
            setApiData([]) // Clear old format data
          } else {
            // If it's a single object, wrap it in an array
            setApiData([data])
            // Check if it has mission_rules content (old format)
            if (data.mission_rules) {
              const parsed = parseMissionRules(data.mission_rules)
              setParsedSections(parsed)
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch mission rules:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch mission rules')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMissionRules()
  }, [])

  // Fallback rules in case API fails
  const fallbackRules = [
    {
      id: "RULE-001",
      category: "VISUAL HIERARCHY",
      title: "Information Priority Protocol",
      content: "All mission-critical data must be presented in order of operational importance. Primary objectives use GREEN terminal color (#00ff41), secondary objectives use AMBER (#ff6b00), alerts use RED (#ff0000).",
      level: "CRITICAL"
    },
    {
      id: "RULE-002", 
      category: "TYPOGRAPHY",
      title: "Communication Standards",
      content: "All classified text must use JetBrains Mono font family for maximum readability under combat conditions. Body text uses Inter for enhanced scanning efficiency.",
      level: "STANDARD"
    },
    {
      id: "RULE-003",
      category: "INTERACTION",
      title: "User Engagement Protocol", 
      content: "Every interactive element must provide immediate visual feedback. Hover states indicate system responsiveness, click states confirm action execution.",
      level: "STANDARD"
    }
  ]

  // Use parsed sections if available, otherwise API data, otherwise fallback rules
  const rules = parsedSections.length > 0 ? parsedSections : 
                (apiData.length > 0 ? apiData : (error ? fallbackRules : []))

  // Calculate stats from current rules
  const criticalCount = rules.filter(rule => {
    const level = rule.level || ''
    return level.toUpperCase() === 'CRITICAL'
  }).length
  const standardCount = rules.filter(rule => {
    const level = rule.level || ''
    return level.toUpperCase() === 'STANDARD'
  }).length
  const totalCount = rules.length

  return (
    <main className={`${inter.className} mission-rules-body`}>
      <div className={`${jetbrainsMono.className} coordinates`}>PROTOCOL SECTOR: ALPHA-1 | CLEARANCE: ULTRA</div>
      <div className={`${jetbrainsMono.className} timestamp`} id="timestamp">
        {timestamp}
      </div>

      <header className="rules-header">
        <div className={`${jetbrainsMono.className} rules-classification`}>CLASSIFIED - DESIGN INTELLIGENCE</div>
        <div className={`${jetbrainsMono.className} rules-title`}>MISSION RULES</div>
        <div className={`${jetbrainsMono.className} rules-subtitle`}>
          {parsedSections.length > 0 && parsedSections[0]?.totalSections ? 
            `DQ Design Rules Document - ${parsedSections[0].totalSections} Protocols Loaded` :
            "Strategic Design Protocols - Standard Operating Procedures"
          }
        </div>
        {parsedSections.length > 0 && parsedSections[0]?.totalSections && (
          <div className={`${jetbrainsMono.className} progress-indicator`}>
            PROTOCOLS: {parsedSections.length}/{parsedSections[0].totalSections} OPERATIONAL
          </div>
        )}
      </header>

      <div className="container">
        <div className="rules-directive">
          <div className="directive-quote">
            {parsedSections.length > 0 ? 
              "You're not making a report. You're building a weapon of clarity. Every page must feel like a revelation." :
              "In the chaos of battle, only the disciplined survive. These protocols ensure our design operations maintain tactical superiority under all conditions."
            }
          </div>
          <div className={`${jetbrainsMono.className} directive-emphasis`}>
            {parsedSections.length > 0 ? 
              "DQ Design Rules Document - Comprehensive Protocol Manual" :
              "Design Command Authority - Strategic Operations Manual"
            }
          </div>
        </div>

        <div className="rules-overview">
          <div className="overview-stats">
            <div className="stat-card critical">
              <div className={`${jetbrainsMono.className} stat-number`}>{criticalCount}</div>
              <div className={`${jetbrainsMono.className} stat-label`}>CRITICAL PROTOCOLS</div>
            </div>
            <div className="stat-card standard">
              <div className={`${jetbrainsMono.className} stat-number`}>{standardCount}</div>
              <div className={`${jetbrainsMono.className} stat-label`}>STANDARD PROTOCOLS</div>
            </div>
            <div className="stat-card total">
              <div className={`${jetbrainsMono.className} stat-number`}>{totalCount}</div>
              <div className={`${jetbrainsMono.className} stat-label`}>TOTAL ACTIVE RULES</div>
            </div>
          </div>
        </div>

        <div className="rules-section">
          <div className="section-header">
            <Shield className="w-6 h-6 text-green-400" />
            <h2 className={`${jetbrainsMono.className} section-title`}>OPERATIONAL PROTOCOLS</h2>
          </div>
          
          {/* Debug info - remove in production */}
          {!isLoading && (
            <div className={`${jetbrainsMono.className}`} style={{color: '#ff6b00', fontSize: '12px', marginBottom: '20px'}}>
              <div>DEBUG: Parsed sections: {parsedSections.length}, API data: {apiData.length}, Rules: {rules.length}</div>
              {apiData.length > 0 && (
                <div style={{marginTop: '5px', fontSize: '10px'}}>
                  API Data Keys: {JSON.stringify(Object.keys(apiData[0] || {}))}
                </div>
              )}
            </div>
          )}
          
          {isLoading ? (
            <div className="loading-state">
              <Loader2 className="w-8 h-8 animate-spin text-green-400" />
              <div className={`${jetbrainsMono.className} loading-text`}>
                DECRYPTING MISSION PROTOCOLS...
              </div>
            </div>
          ) : error ? (
            <div className="error-state">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <div className={`${jetbrainsMono.className} error-text`}>
                COMMUNICATION ERROR: {error}
              </div>
              <div className="error-fallback">
                <div className={`${jetbrainsMono.className} fallback-text`}>
                  ACTIVATING BACKUP PROTOCOLS...
                </div>
              </div>
            </div>
          ) : rules.length === 0 ? (
            <div className="no-data-state">
              <div className={`${jetbrainsMono.className} no-data-text`}>
                NO PROTOCOLS LOADED
              </div>
              {apiData.length > 0 && (
                <div style={{color: '#ccc', fontSize: '12px', marginTop: '10px'}}>
                  Raw API data available but not parsed. Check console for details.
                </div>
              )}
            </div>
          ) : (
            <div className="rules-container">
              {/* Mission Specifics Section - TACTICAL COMMAND CENTER */}
              {rules.filter(rule => 'isHero' in rule && rule.isHero).map((rule, index) => {
                const ruleId = rule.id || `RULE-${String(index + 1).padStart(3, '0')}`
                const heroData = parseHeroContent(rule.content || '')
                return (
                  <div key={ruleId} className="mission-specifics-section">
                    <div className={`${jetbrainsMono.className} mission-specifics-header`}>
                      <div className="specifics-classification">MISSION SPECIFICS</div>
                      <div className="specifics-subtitle">Critical project parameters that determine success or failure</div>
                    </div>
                    
                    <div className="mission-specifics-container">
                      {/* DEADLINE - Mission Clock */}
                      <div className="deadline-terminal">
                        <div className="terminal-header">
                          <div>
                            <div className={`${jetbrainsMono.className} terminal-title`}>DEADLINE - Mission Clock</div>
                            <div className="terminal-subtitle">We move fast here. Four weeks to first draft. Two weeks to perfection.</div>
                          </div>
                        </div>
                        
                        <div className="mission-timeline">
                          <div className={`${jetbrainsMono.className} timeline-label`}>MISSION TIMELINE</div>
                          <div className="countdown-grid">
                            <div className="countdown-phase">
                              <div className={`${jetbrainsMono.className} phase-label`}>DRAFT PHASE</div>
                              <div className="phase-timer">{draftCountdown}</div>
                              <div className="phase-description">DAYS:HRS:MIN:SEC</div>
                            </div>
                            <div className={`countdown-phase ${perfectionCountdown === "14:00:00:00" ? "waiting" : ""}`}>
                              <div className={`${jetbrainsMono.className} phase-label`}>PERFECTION PHASE</div>
                              <div className="phase-timer">{perfectionCountdown}</div>
                              <div className="phase-description">DAYS:HRS:MIN:SEC</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* BUDGET - Resource Allocation */}
                      <div className="budget-terminal">
                        <div className="budget-header">
                          <div>
                            <div className={`${jetbrainsMono.className} budget-title`}>BUDGET - Resource Allocation</div>
                            <div className="budget-subtitle">Whatever it takes to make this legendary</div>
                          </div>
                        </div>
                        
                        <div className="resource-terminal">
                          <div className="terminal-line">
                            <span>RESOURCE STATUS:</span>
                            <span>UNLIMITED</span>
                          </div>
                          <div className="terminal-line">
                            <span>AUTHORIZATION:</span>
                            <span>APPROVED</span>
                          </div>
                          <div className="terminal-line">
                            <span>FUNDING LEVEL:</span>
                            <span>MAXIMUM</span>
                          </div>
                          <div className="terminal-line">
                            <span>PROJECT CODE:</span>
                            <span>LEGENDARY-CLASS</span>
                          </div>
                          <div className="budget-secret">BUDGET CEILING: CLASSIFIED</div>
                        </div>
                      </div>

                      {/* STAKES - Threat Assessment */}
                      <div className="stakes-terminal">
                        <div className="stakes-header">
                          <div>
                            <div className={`${jetbrainsMono.className} stakes-title`}>STAKES - Threat Assessment</div>
                            <div className="stakes-subtitle">This diagnostic will define Fast Track. Make it unforgettable.</div>
                          </div>
                        </div>
                        
                        <div className="threat-matrix">
                          <div className={`${jetbrainsMono.className} matrix-header`}>MISSION CRITICALITY</div>
                          <div className="threat-levels">
                            <div className="threat-level legendary">
                              <div className="threat-indicator">▲</div>
                              <div className="threat-label">LEGENDARY</div>
                            </div>
                            <div className="threat-level">
                              <div className="threat-indicator">▲</div>
                              <div className="threat-label">CRITICAL</div>
                            </div>
                            <div className="threat-level">
                              <div className="threat-indicator">▲</div>
                              <div className="threat-label">HIGH</div>
                            </div>
                            <div className="threat-level">
                              <div className="threat-indicator">▲</div>
                              <div className="threat-label">MODERATE</div>
                            </div>
                            <div className="threat-level">
                              <div className="threat-indicator">▲</div>
                              <div className="threat-label">LOW</div>
                            </div>
                          </div>
                          <div className={`${jetbrainsMono.className} stakes-status`}>STAKES: INDUSTRY DEFINING</div>
                          <div className="failure-warning">FAILURE IS NOT AN OPTION</div>
                        </div>
                      </div>

                      {/* QUESTIONS - Communication Status */}
                      <div className="questions-terminal">
                        <div className="questions-header">
                          <div>
                            <div className={`${jetbrainsMono.className} questions-title`}>QUESTIONS - Communication Status</div>
                            <div className="questions-subtitle">None. You're the best designer in the world. Figure it out.</div>
                          </div>
                        </div>
                        
                        <div className="comm-panel">
                          <div className="comm-line">
                            <span>COMM CHANNEL:</span>
                            <span className="status-closed">CLOSED</span>
                          </div>
                          <div className="comm-line">
                            <span>INCOMING QUERIES:</span>
                            <span>0</span>
                          </div>
                          <div className="comm-line">
                            <span>STATUS:</span>
                            <span>RADIO SILENCE</span>
                          </div>
                          <div className="comm-line">
                            <span>CLEARANCE:</span>
                            <span>FIGURE IT OUT</span>
                          </div>
                          <div className="access-denied">ACCESS DENIED</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* MISSION DIRECTIVE - Command Banner */}
                    <div className="mission-directive-banner">
                      <div className="directive-header">
                        <div className={`${jetbrainsMono.className} directive-title`}>MISSION DIRECTIVE</div>
                      </div>
                      <div className="directive-quote">
                        Now go create something that breaks the industry.
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Mission Success Section - Always First */}
              <div className="mission-success-section">
                <div className={`${jetbrainsMono.className} success-header`}>
                  <div className="success-classification">MISSION SUCCESS CRITERIA</div>
                  <div className="success-title">WHAT SUCCESS LOOKS LIKE</div>
                  <div className="success-subtitle">Victory Definition & Success Metrics</div>
                </div>
                
                <div className="success-objectives">
                  <div className="success-metric-section">
                    <div className={`${jetbrainsMono.className} metric-header`}>IMMEDIATE REACTION</div>
                    <div className="metric-content">
                      CEO opens it and can't put it down. Reads every page. Takes notes. Calls their team.
                    </div>
                  </div>
                  
                  <div className="success-metric-section">
                    <div className={`${jetbrainsMono.className} metric-header`}>24-HOUR TEST</div>
                    <div className="metric-content">
                      They're still thinking about it. Quoting insights. Planning changes.
                    </div>
                  </div>
                  
                  <div className="success-metric-section">
                    <div className={`${jetbrainsMono.className} metric-header`}>30-DAY PROOF</div>
                    <div className="metric-content">
                      They've implemented recommendations. Results are showing. They're telling other CEOs.
                    </div>
                  </div>
                  
                  <div className="success-metric-section ultimate">
                    <div className={`${jetbrainsMono.className} metric-header`}>ULTIMATE WIN</div>
                    <div className="metric-content">
                      They frame a page and hang it in their office.
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Emotional and Remember Sections */}
              {rules.filter(rule => ('isEmotional' in rule && rule.isEmotional) || ('isRemember' in rule && rule.isRemember)).map((rule, index) => {
                const ruleLevel = rule.level || 'STANDARD'
                const ruleId = rule.id || `RULE-${String(index + 1).padStart(3, '0')}`
                const isEmotional = 'isEmotional' in rule ? rule.isEmotional : false
                const isRemember = 'isRemember' in rule ? rule.isRemember : false
                
                // Emotional Journey Section (Interactive Expandable Cards)
                if (isEmotional) {
                  const handleCardClick = (cardType: string) => {
                    setExpandedCard(expandedCard === cardType ? null : cardType)
                  }

                  return (
                    <div key={ruleId} className="emotional-journey-interface">
                      <div className={`${jetbrainsMono.className} journey-header`}>
                        <div className="journey-classification">PSYCHOLOGICAL WARFARE</div>
                        <div className="journey-title">{rule.title}</div>
                        <div className="journey-subtitle">Every page must trigger one of three responses</div>
                      </div>
                      
                      <div className="journey-cards-container">
                        {/* WOW Card */}
                        <div 
                          className={`journey-card wow ${expandedCard === 'wow' ? 'expanded' : ''}`}
                          onClick={() => handleCardClick('wow')}
                        >
                          <div className="card-header">
                            <div className="card-title">WOW</div>
                            <div className="expand-indicator">{expandedCard === 'wow' ? '−' : '+'}</div>
                          </div>
                          <div className="card-preview">"These people cracked my business..."</div>
                          <div className="card-expanded-content">
                            <div className="target-quote">"These people cracked my business like a code"</div>
                            <div className="methods-list">
                              <div className="method-item">• Show insights they've never seen</div>
                              <div className="method-item">• Reveal patterns they missed</div>
                              <div className="method-item">• Connect dots they couldn't</div>
                            </div>
                          </div>
                        </div>

                        {/* FEAR Card */}
                        <div 
                          className={`journey-card fear ${expandedCard === 'fear' ? 'expanded' : ''}`}
                          onClick={() => handleCardClick('fear')}
                        >
                          <div className="card-header">
                            <div className="card-title">FEAR</div>
                            <div className="expand-indicator">{expandedCard === 'fear' ? '−' : '+'}</div>
                          </div>
                          <div className="card-preview">"We're bleeding and I didn't know it..."</div>
                          <div className="card-expanded-content">
                            <div className="target-quote">"We're bleeding and I didn't know it"</div>
                            <div className="methods-list">
                              <div className="method-item">• Expose blind spots killing them</div>
                              <div className="method-item">• Show competitors gaining ground</div>
                              <div className="method-item">• Reveal team misalignment</div>
                            </div>
                          </div>
                        </div>

                        {/* EXCITEMENT Card */}
                        <div 
                          className={`journey-card excitement ${expandedCard === 'excitement' ? 'expanded' : ''}`}
                          onClick={() => handleCardClick('excitement')}
                        >
                          <div className="card-header">
                            <div className="card-title">EXCITEMENT</div>
                            <div className="expand-indicator">{expandedCard === 'excitement' ? '−' : '+'}</div>
                          </div>
                          <div className="card-preview">"If we fix this, we'll crush everyone..."</div>
                          <div className="card-expanded-content">
                            <div className="target-quote">"If we fix this, we'll crush everyone"</div>
                            <div className="methods-list">
                              <div className="method-item">• Show hidden strengths</div>
                              <div className="method-item">• Reveal untapped opportunities</div>
                              <div className="method-item">• Paint the victory picture</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="critical-design-rule">
                        <div className={`${jetbrainsMono.className} rule-text`}>
                          ⚠️ CRITICAL DESIGN RULE: If a page doesn't trigger one of these emotions, delete it.
                        </div>
                      </div>
                    </div>
                  )
                }
                
                // Remember Section (Final Orders)
                if (isRemember) {
                  return (
                    <div key={ruleId} className="remember-section">
                      <div className={`${jetbrainsMono.className} remember-header`}>
                        <div className="remember-classification">FINAL ORDERS</div>
                        <div className="remember-title">{rule.title}</div>
                      </div>
                      
                      <div className="remember-content">
                        <div className="remember-scanning">
                          These people dont read they scan
                        </div>
                        
                        <div className="remember-goal">
                          Make them say: <span className="goal-quote">Holy shit these people see everything</span>
                        </div>
                        
                        <div className="remember-action">
                          Then make them act
                        </div>
                      </div>
                    </div>
                  )
                }
                
                return null
              })}

              {/* Deployed Agents Section */}
              <div className="deployed-agents-section">
                <div className={`${jetbrainsMono.className} agents-header`}>
                  <div className="agents-classification">FIELD OPERATIVES</div>
                  <div className="agents-title">Deployed Agents - Mission Success Records</div>
                  <div className="agents-subtitle">Elite operatives who have executed flawless missions</div>
                </div>
                
                <div className="agents-gallery">
                  <div className="agent-profile">
                    <div className="agent-photo-container">
                      <img 
                        src="/images/jobs_photo.png" 
                        alt="Agent Jobs" 
                        className="agent-photo"
                      />
                    </div>
                    <div className={`${jetbrainsMono.className} agent-codename`}>JOBS</div>
                  </div>
                  
                  <div className="agent-profile">
                    <div className="agent-photo-container">
                      <img 
                        src="/images/ive_photo.png" 
                        alt="Agent Ive" 
                        className="agent-photo"
                      />
                    </div>
                    <div className={`${jetbrainsMono.className} agent-codename`}>IVE</div>
                  </div>
                </div>
                
                <div 
                  className={`tactical-doctrine-card ${agentsExpanded ? 'expanded' : ''}`}
                  onClick={() => setAgentsExpanded(!agentsExpanded)}
                >
                  <div className="doctrine-header">
                    <div className={`${jetbrainsMono.className} doctrine-title`}>TACTICAL DOCTRINE</div>
                    <div className="doctrine-indicator">{agentsExpanded ? '−' : '+'}</div>
                  </div>
                  <div className="doctrine-preview">Core principles from successful field operations</div>
                  <div className="doctrine-expanded-content">
                    <div className="doctrine-principle">
                      <div className="principle-title">Ruthless Simplicity</div>
                      <div className="principle-content">
                        Strip everything that doesn't matter. Complex insights delivered with surgical precision. Empty space speaks louder than clutter.
                      </div>
                    </div>
                    
                    <div className="doctrine-principle">
                      <div className="principle-title">Emotional Minimalism</div>
                      <div className="principle-content">
                        Clean doesn't mean cold. Use restraint to amplify impact. One powerful visual beats ten weak ones.
                      </div>
                    </div>
                    
                    <div className="doctrine-principle">
                      <div className="principle-title">Truth as Beauty</div>
                      <div className="principle-content">
                        Don't decorate data—reveal it. Make ugly truths elegant. Make complex simple.
                      </div>
                    </div>
                    
                    <div className="doctrine-principle">
                      <div className="principle-title">Story-Driven Structure</div>
                      <div className="principle-content">
                        Every page flows to the next. Build tension. Release insight. Create momentum.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Quality Checklist - Moved to bottom */}
              <div className="final-quality-checklist">
                <div className={`${jetbrainsMono.className} checklist-header`}>
                  <div className="checklist-title">FINAL QUALITY CHECKLIST</div>
                  <div className="checklist-subtitle">Before any page is approved, ask:</div>
                </div>
                <div className="checklist-content">
                  <div className="checklist-items">
                    <div className="checklist-item">
                      <div className="checklist-number">1.</div>
                      <div className="checklist-text"><strong>Does it trigger WOW, FEAR, or EXCITEMENT?</strong></div>
                    </div>
                    <div className="checklist-item">
                      <div className="checklist-number">2.</div>
                      <div className="checklist-text"><strong>Can a CEO understand it in 3 seconds?</strong></div>
                    </div>
                    <div className="checklist-item">
                      <div className="checklist-number">3.</div>
                      <div className="checklist-text"><strong>Does it reveal something they didn't know?</strong></div>
                    </div>
                    <div className="checklist-item">
                      <div className="checklist-number">4.</div>
                      <div className="checklist-text"><strong>Will they remember this visual tomorrow?</strong></div>
                    </div>
                    <div className="checklist-item">
                      <div className="checklist-number">5.</div>
                      <div className="checklist-text"><strong>Does it drive immediate action?</strong></div>
                    </div>
                    <div className="checklist-item">
                      <div className="checklist-number">6.</div>
                      <div className="checklist-text"><strong>Is every pixel fighting for its place?</strong></div>
                    </div>
                    <div className="checklist-item">
                      <div className="checklist-number">7.</div>
                      <div className="checklist-text"><strong>Does the intensity match the message?</strong></div>
                    </div>
                    <div className="checklist-item">
                      <div className="checklist-number">8.</div>
                      <div className="checklist-text"><strong>Would they frame this and hang it up?</strong></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Navigation */}
              <div className="navigation">
                <button 
                  className={`${jetbrainsMono.className} nav-button`}
                  onClick={() => router.push("/mission-accepted")}
                >
                  ← Return to Mission Accepted
                </button>
                <button 
                  className={`${jetbrainsMono.className} nav-button primary`}
                  onClick={() => router.push("/battlefield-map")}
                >
                  Proceed to Battlefield Map →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
} 