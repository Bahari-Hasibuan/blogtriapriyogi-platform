"use client"

import { useState } from "react"

export default function EditorPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  const saveDraft = async () => {
    await fetch("/api/posts", {
      method: "POST",
      body: JSON.stringify({ title, content })
    })
  }

  const publish = async () => {
    const res = await fetch("/api/posts", {
      method: "POST",
      body: JSON.stringify({ title, content })
    })

    const post = await res.json()

    await fetch("/api/posts/publish", {
      method: "POST",
      body: JSON.stringify({ slug: post.slug })
    })
  }

  return (
    <div className="p-6">
      <input
        className="border p-2 w-full mb-2"
        placeholder="Title"
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="border p-2 w-full h-60"
        placeholder="Write content..."
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="flex gap-2 mt-3">
        <button onClick={saveDraft} className="bg-gray-500 text-white px-3 py-2">
          Save Draft
        </button>

        <button onClick={publish} className="bg-black text-white px-3 py-2">
          Publish
        </button>
      </div>
    </div>
  )
}
