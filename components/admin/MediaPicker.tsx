"use client"

import { useEffect, useState } from "react"

type MediaAsset = {
  id: string
  url: string
  filename: string
  original_filename?: string
  kind: string
  mime_type?: string
  size_bytes?: number
  alt_text?: string
  caption?: string
}

type Props = {
  value?: string
  onChange: (url: string) => void
}

export default function MediaPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<MediaAsset[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  async function load() {
    const res = await fetch("/api/admin/media?kind=image", {
      cache: "no-store",
    })

    const json = await res.json()
    setItems(json.data || [])
  }

  async function upload() {
    if (!file) {
      alert("Pilih gambar dulu")
      return
    }

    setLoading(true)

    const form = new FormData()
    form.append("file", file)
    form.append("folder", "featured")
    form.append("alt_text", file.name)

    const res = await fetch("/api/admin/media", {
      method: "POST",
      body: form,
    })

    const json = await res.json()

    setLoading(false)

    if (!json.ok) {
      alert(json.error || "Upload gagal")
      return
    }

    onChange(json.data.url)
    setFile(null)
    setOpen(false)
    await load()
  }

  useEffect(() => {
    if (open) load()
  }, [open])

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="URL gambar unggulan"
        style={{
          width: "100%",
          padding: 12,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
        }}
      />

      {value ? (
        <img
          src={value}
          alt="Featured"
          style={{
            width: "100%",
            maxHeight: 260,
            objectFit: "cover",
            borderRadius: 16,
            border: "1px solid #e5e7eb",
          }}
        />
      ) : null}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={buttonStyle}
        >
          Pilih dari Media
        </button>

        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            style={dangerButtonStyle}
          >
            Hapus Gambar
          </button>
        ) : null}
      </div>

      {open ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.35)",
            zIndex: 9999,
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              width: "min(980px, 100%)",
              maxHeight: "88vh",
              overflow: "auto",
              background: "white",
              borderRadius: 22,
              padding: 22,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>Pilih Gambar</h2>
                <p style={{ color: "#667085", margin: "6px 0 0" }}>
                  Upload gambar baru atau pilih dari library. JPG dan PNG otomatis jadi WebP.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                style={buttonStyle}
              >
                Tutup
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gap: 10,
                padding: 14,
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                marginBottom: 18,
              }}
            >
              <strong>Upload Gambar Baru</strong>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />

              <button
                type="button"
                onClick={upload}
                disabled={loading}
                style={buttonDarkStyle}
              >
                {loading ? "Mengupload..." : "Upload & Pakai"}
              </button>
            </div>

            {items.length === 0 ? (
              <div
                style={{
                  padding: 24,
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  color: "#667085",
                }}
              >
                Belum ada gambar di media library.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
                  gap: 14,
                }}
              >
                {items.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      onChange(item.url)
                      setOpen(false)
                    }}
                    style={{
                      textAlign: "left",
                      border: "1px solid #e5e7eb",
                      borderRadius: 16,
                      overflow: "hidden",
                      background: "white",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={item.url}
                      alt={item.alt_text || item.filename}
                      style={{
                        width: "100%",
                        height: 130,
                        objectFit: "cover",
                        background: "#f3f4f6",
                      }}
                    />

                    <div style={{ padding: 10 }}>
                      <strong
                        style={{
                          display: "block",
                          fontSize: 13,
                          wordBreak: "break-word",
                        }}
                      >
                        {item.original_filename || item.filename}
                      </strong>

                      <span style={{ fontSize: 12, color: "#667085" }}>
                        {item.mime_type || "image"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

const buttonStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "white",
  cursor: "pointer",
} as const

const buttonDarkStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  cursor: "pointer",
  width: 160,
} as const

const dangerButtonStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #fecaca",
  background: "#fff1f2",
  color: "#be123c",
  cursor: "pointer",
} as const
