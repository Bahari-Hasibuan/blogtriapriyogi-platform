"use client"

import { Home, FileText, Settings } from "lucide-react"
import WorkspaceSwitcher from "../workspace/workspace-switcher"

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen border-r bg-white flex flex-col">
      
      <div className="p-4 font-bold text-xl border-b">
        TriSaaS
      </div>

      <WorkspaceSwitcher />

      <nav className="flex flex-col p-2 gap-2 text-sm">

        <a className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
          <Home size={16}/> Dashboard
        </a>

        <a className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
          <FileText size={16}/> Posts
        </a>

        <a className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
          <Settings size={16}/> Settings
        </a>

      </nav>

    </aside>
  )
}
