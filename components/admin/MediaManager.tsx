"use client"

import { useEffect, useState } from "react"

type MediaAsset = {
  id: string
  url: string
  filename: string
  original_filename?: string
  mime_type?: string
  size_bytes: number
  kind: string
  alt_text?: string
  caption?: string
  folder?: string
  created_at?: string
}

function formatSize(size: number) {
  if (!size) return "0 B"
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

export default function MediaManager() {
  const [items, setItems] = useState<MediaAsset[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [altText, setAltText] = useState("")
  const [caption, setCaption] = useState("")
  const [folder, setFolder] = useState("root")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function load() {
    const res = await fetch("/api/admin/media", { cache: "no-store" })
    const json = await res.json()
    setItems(json.data || [])
  }

  async function upload() {
    if (!file) {
      alert("Pilih file dulu")
      return
    }

    setLoading(true)
    setMessage("")

    const data = new FormData()
    data.append("file", file)
    data.append("alt_text", altText)
    data.append("caption", caption)
    data.append("folder", folder || "root")

    const res = await fetch("/api/admin/media", {
      method: "POST",
      body: data,
    })

    const json = await res.json()

    setLoading(false)

    if (!json.ok) {
      alert(json.error || "Upload gagal")
      return
    }

    setFile(null)
    setAltText("")
    setCaption("")
    setFolder("root")
    setMessage("Media berhasil diupload")
    await load()
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      alert("URL media disalin")
    } catch {
      prompt("Salin URL ini", url)
    }
  }

  async function remove(id: string) {
    const ok = confirm("Yakin ingin menghapus media ini?")
    if (!ok) return

    const res = await fetch(`/api/admin/media/${id}`, {
      method: "DELETE",
    })

    const json = await res.json()

    if (!json.ok) {
      alert(json.error || "Gagal menghapus media")
      return
    }

    await load()
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <main style={{ padding: 32, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: 34, marginBottom: 8 }}>Manajer Media</h1>
      <p style={{ color: "#667085", marginBottom: 24 }}>
        Unggah gambar, ambil URL, lalu pakai sebagai featured image artikel atau halaman.
      </p>

      <section
        style={{
          padding: 20,
          border: "1px solid #e5e7eb",
          borderRadius: 18,
          marginBottom: 28,
          background: "white",
        }}
      >
        <h2 style={{ fontSize: 20, marginTop: 0 }}>Upload Media</h2>

        <div style={{ display: "grid", gap: 12 }}>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <input
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            placeholder="Folder, contoh: artikel"
            style={inputStyle}
          />

          <input
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Alt text gambar"
            style={inputStyle}
          />

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption media"
            style={textareaStyle}
          />

          <button
            onClick={upload}
            disabled={loading}
            style={{
              width: 160,
              padding: "12px 16px",
              borderRadius: 12,
              background: "#111827",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            {loading ? "Mengunggah..." : "Upload"}
          </button>

          {message ? <p style={{ color: "#047857" }}>{message}</p> : null}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 22 }}>Library Media</h2>

        {items.length === 0 ? (
          <div style={{ padding: 24, border: "1px solid #e5e7eb", borderRadius: 18 }}>
            Belum ada media.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            {items.map((item) => (
              <article
                key={item.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 18,
                  overflow: "hidden",
                  background: "white",
                }}
              >
                {item.kind === "image" ? (
                  <img
                    src={item.url}
                    alt={item.alt_text || item.filename}
                    style={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                      background: "#f3f4f6",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: 160,
                      display: "grid",
                      placeItems: "center",
                      background: "#f3f4f6",
                      color: "#667085",
                    }}
                  >
                    {item.kind}
                  </div>
                )}

                <div style={{ padding: 14 }}>
                  <strong style={{ display: "block", wordBreak: "break-word" }}>
                    {item.original_filename || item.filename}
                  </strong>

                  <p style={{ color: "#667085", margin: "8px 0" }}>
                    {item.kind} · {formatSize(item.size_bytes)}
                  </p>

                  <p style={{ color: "#667085", margin: "8px 0", fontSize: 13 }}>
                    Folder: {item.folder || "root"}
                  </p>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => copyUrl(item.url)}>Salin URL</button>
                    <button onClick={() => remove(item.id)} style={{ color: "#dc2626" }}>
                      Hapus
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

const inputStyle = {
  width: "100%",
  padding: 12,
  border: "1px solid #e5e7eb",
  borderRadius: 12,
} as const

const textareaStyle = {
  width: "100%",
  padding: 12,
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  minHeight: 90,
} as const
