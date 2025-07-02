"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { JetBrains_Mono, Inter } from "next/font/google"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, ArrowLeft, Target } from "lucide-react"
import "./battlefield-map.css"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const checkpoints = [
  { id: 1, name: "The Industry Battlefield", pos: { top: "15%", left: "18%" } },
  { id: 2, name: "The Company Identity", pos: { top: "35%", left: "35%" } },
  { id: 3, name: "The Strategy", pos: { top: "28%", left: "60%" } },
  { id: 4, name: "The Strategy in Action", pos: { top: "55%", left: "50%" } },
  { id: 5, name: "The Machine", pos: { top: "65%", left: "75%" } },
  { id: 6, name: "The Future Foresight", pos: { top: "80%", left: "60%" } },
]

export default function BattlefieldMapPage() {
  const [timestamp, setTimestamp] = useState("")
  const [activeCheckpoint, setActiveCheckpoint] = useState<number | null>(null)
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

  return (
    <main className={`${inter.className} min-h-screen bg-black text-white overflow-hidden`}>
      {/* Header with responsive layout */}
      <div className="relative z-20 flex flex-col lg:flex-row justify-between items-start lg:items-center p-4 sm:p-6 lg:p-8 bg-black/80 backdrop-blur-sm border-b border-green-500/30">
        <div className={`${jetbrainsMono.className} text-green-400 text-xs sm:text-sm tracking-wider mb-2 lg:mb-0 order-2 lg:order-1`}>
          GRID REF: 74B-KILO-29 | AO: SECURE
        </div>
        <div className={`${jetbrainsMono.className} text-green-400 text-xs sm:text-sm order-3 lg:order-2`}>
          {timestamp}
        </div>
        <div className="flex items-center gap-4 mb-4 lg:mb-0 order-1 lg:order-3">
          <button 
            onClick={() => router.push("/mission-accepted")} 
            className={`${jetbrainsMono.className} flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-green-400 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold tracking-wider transition-all duration-300 border border-green-500/30 hover:border-green-500/50`}
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Return to Dependencies</span>
            <span className="sm:hidden">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className={`${jetbrainsMono.className} text-red-400 text-xs sm:text-sm font-bold tracking-wider`}>
              LIVE FEED
            </span>
          </div>
        </div>
      </div>

      {/* Main title section */}
      <div className="relative z-20 text-center py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Target className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
          <h1 className={`${jetbrainsMono.className} text-green-400 text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-wider`}>
            TACTICAL BATTLEFIELD MAP
          </h1>
          <Target className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
        </div>
        <p className={`${inter.className} text-gray-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed`}>
          Strategic deployment zones identified. Select your target location to establish basecamp operations.
        </p>
      </div>

      {/* Map container with responsive design */}
      <div className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden">
        {/* Background map image */}
        <div className="absolute inset-0">
          <Image
            src="/images/user-battle-map.jpg"
            alt="Topographic battlefield map"
            fill
            style={{ objectFit: "cover" }}
            className="opacity-80"
            priority
          />
          {/* Dark overlay for better contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/50"></div>
        </div>

        {/* Connector lines - responsive SVG */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none z-10" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
        >
          {checkpoints.slice(0, -1).map((cp, index) => {
            const nextCp = checkpoints[index + 1]
            return (
              <motion.line
                key={`line-${cp.id}`}
                x1={Number.parseFloat(cp.pos.left)}
                y1={Number.parseFloat(cp.pos.top)}
                x2={Number.parseFloat(nextCp.pos.left)}
                y2={Number.parseFloat(nextCp.pos.top)}
                stroke="rgba(255, 107, 0, 0.7)"
                strokeWidth="0.3"
                strokeDasharray="2 1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 1 + index * 0.5, ease: "easeInOut" }}
              />
            )
          })}
        </svg>

        {/* Checkpoints with responsive positioning */}
        {checkpoints.map((cp, index) => (
          <Link key={cp.id} href={`/basecamp/${cp.id}`} passHref>
            <motion.div
              className="absolute z-20 cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
              style={{ 
                top: cp.pos.top, 
                left: cp.pos.left,
                minWidth: "40px",
                minHeight: "40px"
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.5 + index * 0.5 }}
              onMouseEnter={() => setActiveCheckpoint(cp.id)}
              onMouseLeave={() => setActiveCheckpoint(null)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Checkpoint pin */}
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full border-2 border-red-300 shadow-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                
                {/* Pulse animation */}
                <div className="absolute inset-0 bg-red-500/30 rounded-full animate-ping"></div>
                
                {/* Checkpoint number */}
                <div className={`${jetbrainsMono.className} absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 text-black text-xs sm:text-sm font-bold rounded-full flex items-center justify-center`}>
                  {cp.id}
                </div>
              </div>
              
              {/* Checkpoint label - responsive display */}
              <AnimatePresence>
                {activeCheckpoint === cp.id && (
                  <motion.div
                    className={`${jetbrainsMono.className} absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-black/90 backdrop-blur-sm border border-green-500/50 rounded-lg p-2 sm:p-3 whitespace-nowrap z-30`}
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-amber-400 text-xs sm:text-sm font-bold mb-1">
                      BASECAMP 0{cp.id}
                    </div>
                    <div className="text-green-400 text-xs sm:text-sm leading-tight max-w-[200px] sm:max-w-[250px]">
                      {cp.name}
                    </div>
                    {/* Arrow pointing to checkpoint */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-black/90"></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Mission briefing section - responsive layout */}
      <div className="relative z-20 bg-gradient-to-t from-black via-black/90 to-transparent p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            
            {/* Mission status */}
            <div className="bg-black/60 backdrop-blur-sm border border-green-500/30 rounded-lg p-4 sm:p-6">
              <h3 className={`${jetbrainsMono.className} text-green-400 text-sm sm:text-base font-bold mb-3 sm:mb-4 tracking-wider`}>
                MISSION STATUS
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`${inter.className} text-gray-300 text-xs sm:text-sm`}>Deployment</span>
                  <span className={`${jetbrainsMono.className} text-green-400 text-xs sm:text-sm font-bold`}>ACTIVE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${inter.className} text-gray-300 text-xs sm:text-sm`}>Basecamps</span>
                  <span className={`${jetbrainsMono.className} text-amber-400 text-xs sm:text-sm font-bold`}>6 ZONES</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${inter.className} text-gray-300 text-xs sm:text-sm`}>Clearance</span>
                  <span className={`${jetbrainsMono.className} text-red-400 text-xs sm:text-sm font-bold`}>ULTRA</span>
                </div>
              </div>
            </div>

            {/* Tactical objectives */}
            <div className="bg-black/60 backdrop-blur-sm border border-amber-500/30 rounded-lg p-4 sm:p-6">
              <h3 className={`${jetbrainsMono.className} text-amber-400 text-sm sm:text-base font-bold mb-3 sm:mb-4 tracking-wider`}>
                TACTICAL OBJECTIVES
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                <li className={`${inter.className} text-gray-300 text-xs sm:text-sm flex items-start gap-2`}>
                  <span className="text-green-400 font-bold">•</span>
                  Establish strategic basecamps
                </li>
                <li className={`${inter.className} text-gray-300 text-xs sm:text-sm flex items-start gap-2`}>
                  <span className="text-green-400 font-bold">•</span>
                  Conduct battlefield analysis
                </li>
                <li className={`${inter.className} text-gray-300 text-xs sm:text-sm flex items-start gap-2`}>
                  <span className="text-green-400 font-bold">•</span>
                  Execute tactical deployment
                </li>
              </ul>
            </div>

            {/* Intel summary */}
            <div className="bg-black/60 backdrop-blur-sm border border-red-500/30 rounded-lg p-4 sm:p-6">
              <h3 className={`${jetbrainsMono.className} text-red-400 text-sm sm:text-base font-bold mb-3 sm:mb-4 tracking-wider`}>
                INTEL SUMMARY
              </h3>
              <p className={`${inter.className} text-gray-300 text-xs sm:text-sm leading-relaxed`}>
                Six strategic zones identified for systematic organizational analysis. Each basecamp provides critical intelligence for mission success.
              </p>
            </div>
          </div>

          {/* Instructions for mobile users */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className={`${jetbrainsMono.className} text-green-400 text-xs sm:text-sm animate-pulse`}>
              &gt; SELECT BASECAMP TO BEGIN TACTICAL ANALYSIS &lt;
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
