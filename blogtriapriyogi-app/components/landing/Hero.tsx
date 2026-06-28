"use client"

import { motion } from "framer-motion"
import PageTransition from "../motion/page-transition"

export default function Hero() {
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-6">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl space-y-6"
        >
          
          <h1 className="text-6xl font-semibold tracking-tight">
            Build SaaS Blog seperti Notion
          </h1>

          <p className="text-gray-500 text-lg">
            Editor, AI, analytics, dan publishing system dalam satu platform modern.
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <button className="px-6 py-3 rounded-xl bg-black text-white hover:scale-105 transition">
              Mulai Gratis
            </button>

            <button className="px-6 py-3 rounded-xl border hover:bg-gray-50 transition">
              Lihat Demo
            </button>
          </div>

        </motion.div>

      </div>
    </PageTransition>
  )
}
