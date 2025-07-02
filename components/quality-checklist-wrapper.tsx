"use client"

import { usePathname } from "next/navigation"
import QualityChecklist from "./quality-checklist"

export default function QualityChecklistWrapper() {
  const pathname = usePathname()
  
  // Don't show the quality checklist on the mission-rules page
  if (pathname === "/mission-rules") {
    return null
  }

  return <QualityChecklist />
} 