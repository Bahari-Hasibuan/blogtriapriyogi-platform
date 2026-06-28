"use client"

import { useState } from "react"

export default function AICommand() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState("")

  async function runAI() {
    const res = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify({ prompt: input })
    })

    const data = await res.json()
    setResult(data.result)
  }

  return (
    <div className="p-4 border rounded-xl space-y-3">
      <input
        className="w-full p-2 border rounded"
        placeholder="Ask AI anything about your SaaS..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={runAI}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Run AI
      </button>

      {result && (
        <div className="p-3 bg-gray-100 rounded">
          {result}
        </div>
      )}
    </div>
  )
}
