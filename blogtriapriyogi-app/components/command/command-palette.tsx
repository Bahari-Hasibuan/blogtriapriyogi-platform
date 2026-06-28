"use client"

import { useEffect, useState } from "react"

export default function CommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && e.metaKey) {
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", down)
    return () => window.removeEventListener("keydown", down)
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="w-[500px] bg-white rounded-xl p-4 shadow-xl">
        <input
          className="w-full p-2 border rounded-lg"
          placeholder="Search command..."
        />
      </div>
    </div>
  )
}
