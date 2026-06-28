"use client"

import { useState } from "react"

export default function WorkspaceSwitcher() {
  const [active, setActive] = useState("Personal")

  const workspaces = ["Personal", "Team", "Startup"]

  return (
    <div className="p-2 border-b">
      <div className="text-xs text-gray-500 mb-2">Workspace</div>

      {workspaces.map((ws) => (
        <button
          key={ws}
          onClick={() => setActive(ws)}
          className={`block w-full text-left p-2 rounded-lg text-sm ${
            active === ws ? "bg-black text-white" : "hover:bg-gray-100"
          }`}
        >
          {ws}
        </button>
      ))}
    </div>
  )
}
