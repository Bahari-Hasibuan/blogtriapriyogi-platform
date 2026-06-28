"use client"

import { motion } from "framer-motion"

export function FadeUp({ children }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  )
}

export function ScaleCard({ children }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      {children}
    </motion.div>
  )
}
