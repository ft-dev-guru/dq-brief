"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function QualityChecklist() {
  const [isOpen, setIsOpen] = useState(false)

  const checklist = [
    "Does it trigger WOW, FEAR, or EXCITEMENT?",
    "Can a CEO understand it in 3 seconds?",
    "Does it reveal something they didn't know?",
    "Will they remember this visual tomorrow?",
    "Does it drive immediate action?",
    "Is every pixel fighting for its place?",
    "Does the intensity match the message?",
    "Would they frame this and hang it up?"
  ]

  return (
    <>
      {/* Floating Button - Left Side Tab */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed left-0 top-1/2 transform -translate-y-1/2 z-40 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white px-6 py-6 rounded-r-2xl shadow-2xl font-mono font-bold transition-all duration-300 border-r-4 border-t-4 border-b-4 border-orange-400/50 hover:border-orange-300"
        whileHover={{ 
          x: 12,
          scale: 1.05,
          boxShadow: "12px 0 30px rgba(234, 88, 12, 0.5)"
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -150 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.6, type: "spring" }}
      >
        <div className="flex flex-col items-center gap-3">
          {/* Icon */}
          <div className="w-6 h-6 border-2 border-white rounded-md flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
          
          {/* Main Text */}
          <div className="text-center">
            <div className="text-sm font-black tracking-wider mb-1">
              QUALITY
            </div>
            <div className="text-sm font-black tracking-wider">
              CHECKLIST
            </div>
          </div>
          
          {/* Bottom indicator */}
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
            <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            {/* Background */}
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal Content */}
            <motion.div
              className="relative bg-gradient-to-br from-slate-900 via-black to-slate-900 border-2 border-orange-500 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Scanning Line Effect */}
              <motion.div
                className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"
                animate={{ 
                  x: ["-100%", "100%"],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-orange-400 hover:text-orange-300 text-2xl font-bold transition-colors"
              >
                ×
              </button>

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2 font-mono tracking-wider">
                  FINAL QUALITY CHECKLIST
                </h2>
                <p className="text-orange-400 font-mono text-lg">
                  Before any page is approved, ask:
                </p>
              </div>

              {/* Checklist Items */}
              <div className="space-y-4">
                {checklist.map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-black/40 border border-orange-500/20 rounded-lg hover:border-orange-500/40 transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02,
                      backgroundColor: "rgba(0, 0, 0, 0.6)"
                    }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-600 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-white text-lg font-medium leading-relaxed">
                      {item}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <p className="text-orange-400/80 font-mono text-sm">
                  {">"} EXCELLENCE IS NON-NEGOTIABLE {"<"}
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 