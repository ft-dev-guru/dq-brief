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
  const [activeCheckpoint, setActiveCheckpoint] = useState(null)
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
    <main className={`${inter.className} battlefield-page`}>
      <div className={`${jetbrainsMono.className} coordinates`}>GRID REF: 74B-KILO-29 | AO: SECURE</div>
      <div className={`${jetbrainsMono.className} timestamp`}>{timestamp}</div>

      <header className="map-header">
        <button onClick={() => router.push("/mission-accepted")} className={`${jetbrainsMono.className} nav-button`}>
          <ArrowLeft className="w-4 h-4" />
          Return to Dependencies
        </button>
        <div className="header-title-container">
          <Target className="w-8 h-8 text-red-500" />
          <h1 className={`${jetbrainsMono.className} map-title`}>TACTICAL BATTLEFIELD MAP</h1>
        </div>
        <div className="status-indicator">
          <span className="pulse"></span>
          LIVE FEED
        </div>
      </header>

      <div className="map-container">
        <Image
          src="/images/user-battle-map.jpg"
          alt="Topographic battlefield map"
          fill
          style={{ objectFit: "cover" }}
          className="map-image-background"
        />
        <div className="map-vignette"></div>

        <svg className="connector-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
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
                strokeWidth="0.5"
                strokeDasharray="2 1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 1 + index * 0.5, ease: "easeInOut" }}
              />
            )
          })}
        </svg>

        {checkpoints.map((cp, index) => (
          <Link key={cp.id} href={`/basecamp/${cp.id}`} passHref>
            <motion.div
              className="checkpoint"
              style={{ top: cp.pos.top, left: cp.pos.left }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.5 + index * 0.5 }}
              onMouseEnter={() => setActiveCheckpoint(cp.id)}
              onMouseLeave={() => setActiveCheckpoint(null)}
            >
              <div className="checkpoint-pin">
                <MapPin className="pin-icon" />
                <div className="pin-pulse"></div>
              </div>
              <AnimatePresence>
                {activeCheckpoint === cp.id && (
                  <motion.div
                    className={`${jetbrainsMono.className} checkpoint-label`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <span className="label-id">0{cp.id}</span>
                    <span className="label-name">{cp.name}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
        ))}
      </div>
    </main>
  )
}
