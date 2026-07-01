"use client"

import { useEffect, useState } from "react"

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/posts")
      .then(res => res.json())
      .then(setPosts)
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Blog Feed</h1>

      {posts.map((post) => (
        <div key={post.id} className="border p-4 mb-3 rounded">
          <h2 className="font-bold text-lg">{post.title}</h2>
          <p className="text-sm text-gray-600">
            {post.excerpt || post.content?.slice(0, 120)}
          </p>

          <div className="text-xs text-gray-400 mt-2">
            Version: {post.version}
          </div>
        </div>
      ))}
    </div>
  )
}
