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
        className="fixed left-0 top-1/2 transform -translate-y-1/2 z-40 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white px-4 py-4 sm:px-6 sm:py-6 rounded-r-2xl shadow-2xl font-mono font-bold transition-all duration-300 border-r-4 border-t-4 border-b-4 border-orange-400/50 hover:border-orange-300"
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
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          {/* Icon */}
          <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white rounded-md flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
          
          {/* Main Text */}
          <div className="text-center">
            <div className="text-xs sm:text-sm font-black tracking-wider mb-1">
              QUALITY
            </div>
            <div className="text-xs sm:text-sm font-black tracking-wider">
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
            className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh'
            }}
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
              className="relative bg-gradient-to-br from-slate-900 via-black to-slate-900 border-2 border-orange-500 rounded-2xl p-4 sm:p-6 lg:p-8 w-full max-w-xs sm:max-w-lg lg:max-w-2xl mx-2 sm:mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
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
                className="absolute top-2 right-2 sm:top-4 sm:right-4 text-orange-400 hover:text-orange-300 text-xl sm:text-2xl font-bold transition-colors"
              >
                ×
              </button>

              {/* Header */}
              <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white mb-2 font-mono tracking-wider">
                  FINAL QUALITY CHECKLIST
                </h2>
                <p className="text-orange-400 font-mono text-sm sm:text-base lg:text-lg">
                  Before any page is approved, ask:
                </p>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                {checklist.map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 bg-black/40 border border-orange-500/20 rounded-lg hover:border-orange-500/40 transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02,
                      backgroundColor: "rgba(0, 0, 0, 0.6)"
                    }}
                  >
                    <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-orange-600 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      {index + 1}
                    </div>
                    <p className="text-white text-sm sm:text-base lg:text-lg font-medium leading-relaxed">
                      {item}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <motion.div
                className="mt-4 sm:mt-6 lg:mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <p className="text-orange-400/80 font-mono text-xs sm:text-sm">
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