"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

type ContentItem = {
  id: string
  title: string
  slug: string
  status: string
  content_type: string
  excerpt?: string
  updated_at?: string
}

export default function ContentManager() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")

  async function load() {
    setLoading(true)
    const url = filter ? `/api/admin/content?status=${filter}` : "/api/admin/content"
    const res = await fetch(url, { cache: "no-store" })
    const json = await res.json()
    setItems(json.data || [])
    setLoading(false)
  }

  async function action(id: string, act: string) {
    await fetch(`/api/admin/content/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: act }),
    })
    await load()
  }

  async function remove(id: string) {
    const ok = confirm("Yakin ingin hapus konten ini?")
    if (!ok) return

    await fetch(`/api/admin/content/${id}`, {
      method: "DELETE",
    })
    await load()
  }

  useEffect(() => {
    load()
  }, [filter])

  return (
    <main style={{ padding: 32, fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 32, margin: 0 }}>Content Manager</h1>
          <p style={{ color: "#667085" }}>Kelola artikel, page, draft, publish, archive, dan delete.</p>
        </div>

        <Link
          href="/admin/content/new"
          style={{
            background: "#111827",
            color: "white",
            padding: "12px 18px",
            borderRadius: 12,
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          + Buat Konten
        </Link>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        {["", "draft", "published", "archived"].map((x) => (
          <button
            key={x || "all"}
            onClick={() => setFilter(x)}
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              border: "1px solid #e5e7eb",
              background: filter === x ? "#111827" : "white",
              color: filter === x ? "white" : "#111827",
              cursor: "pointer",
            }}
          >
            {x || "Semua"}
          </button>
        ))}
      </div>

      <section style={{ marginTop: 24, display: "grid", gap: 14 }}>
        {loading ? (
          <p>Memuat data...</p>
        ) : items.length === 0 ? (
          <div style={{ padding: 24, border: "1px solid #e5e7eb", borderRadius: 16 }}>
            Belum ada konten.
          </div>
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              style={{
                padding: 18,
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                background: "white",
                display: "grid",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <strong style={{ fontSize: 18 }}>{item.title}</strong>
                  <p style={{ margin: "6px 0", color: "#667085" }}>
                    /{item.slug} · {item.content_type} · {item.status}
                  </p>
                  <p style={{ margin: 0, color: "#667085" }}>{item.excerpt || "Tanpa excerpt"}</p>
                </div>

                <Link
                  href={`/admin/content/${item.id}`}
                  style={{ color: "#111827", fontWeight: 700 }}
                >
                  Edit
                </Link>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => action(item.id, "publish")}>Publish</button>
                <button onClick={() => action(item.id, "draft")}>Draft</button>
                <button onClick={() => action(item.id, "archive")}>Archive</button>
                <button onClick={() => action(item.id, "restore")}>Restore</button>
                <button onClick={() => remove(item.id)} style={{ color: "#dc2626" }}>Delete</button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  )
}
