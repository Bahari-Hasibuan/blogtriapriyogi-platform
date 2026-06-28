"use client"

import { useState } from "react"

export default function AIStudio() {
  const [text, setText] = useState("")

  return (
    <div style={{ padding: 40 }}>
      <h1>AI Studio Aktif</h1>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Tulis ide artikel..."
        style={{ width: "100%", height: 200, marginTop: 20 }}
      />

      <button style={{ marginTop: 20 }}>
        Generate
      </button>
    </div>
  )
}
