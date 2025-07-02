"use client"

import { usePathname } from "next/navigation"
import QualityChecklist from "./quality-checklist"

export default function QualityChecklistWrapper() {
  const pathname = usePathname()
  
  // Only show the quality checklist AFTER the mission-accepted screen
  // Don't show on: home page, classified screen, mission-accepted screen
  const excludedPaths = ["/", "/classified", "/mission-accepted"]
  
  if (excludedPaths.includes(pathname)) {
    return null
  }

  return <QualityChecklist />
} 