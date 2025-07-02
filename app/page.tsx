"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function HomePage() {
  const router = useRouter()

  const handleFolderClick = () => {
    router.push("/classified")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-black flex items-center justify-center p-2 sm:p-4" style={{ overflow: 'hidden', height: '100vh' }}>
      <div className="relative w-full max-w-2xl">
        {/* Ambient glow effect */}
        <div className="absolute inset-0 bg-amber-400/20 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <motion.div
          className="relative cursor-pointer group"
          onClick={handleFolderClick}
          whileHover={{
            scale: 1.05,
            rotateY: 5,
            rotateX: 2,
          }}
          whileTap={{
            scale: 0.98,
            rotateY: 0,
            rotateX: 0,
          }}
          initial={{
            opacity: 0,
            y: 50,
            rotateX: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
            rotateX: 0,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            type: "spring",
            stiffness: 100,
            damping: 15,
          }}
          style={{
            transformStyle: "preserve-3d",
            perspective: "1000px",
          }}
        >
          {/* Shadow */}
          <motion.div
            className="absolute inset-0 bg-black/40 blur-xl translate-y-8 scale-95 rounded-lg"
            whileHover={{
              scale: 1.1,
              translateY: 12,
              opacity: 0.6,
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Main folder image */}
          <motion.div
            className="relative z-10 w-full h-auto"
            whileHover={{
              filter: "brightness(1.1) contrast(1.05)",
            }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src="/images/operation-dq-folder.png"
              alt="Operation DQ Classified Folder"
              width={600}
              height={600}
              className="rounded-lg shadow-2xl w-full h-auto"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 600px"
            />

            {/* Hover overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-amber-500/10 via-transparent to-amber-300/5 rounded-lg opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          {/* Glowing border effect */}
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-amber-400/0 group-hover:border-amber-400/50"
            whileHover={{
              boxShadow: "0 0 30px rgba(251, 191, 36, 0.3), inset 0 0 30px rgba(251, 191, 36, 0.1)",
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        {/* Click instruction */}
        <motion.p
          className="text-center mt-6 sm:mt-8 text-amber-200/80 font-mono text-xs sm:text-sm tracking-wider px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          {"> CLICK TO ACCESS CLASSIFIED DOCUMENTS <"}
        </motion.p>

        {/* Blinking cursor */}
        <motion.span
          className="inline-block w-2 h-4 bg-amber-400 ml-1"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
        />


      </div>
    </div>
  )
}
