"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  id?: string
}

export default function ContentEditor({ id }: Props) {
  const router = useRouter()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    content_type: "post",
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    status: "draft",
    featured_image_url: "",
    meta_title: "",
    meta_description: "",
    canonical_url: "",
  })

  const [loading, setLoading] = useState(false)

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    if (!id) return

    async function load() {
      const res = await fetch(`/api/admin/content/${id}`, { cache: "no-store" })
      const json = await res.json()

      if (json.ok && json.data) {
        setForm({
          content_type: json.data.content_type || "post",
          title: json.data.title || "",
          slug: json.data.slug || "",
          excerpt: json.data.excerpt || "",
          content: json.data.content || "",
          status: json.data.status || "draft",
          featured_image_url: json.data.featured_image_url || "",
          meta_title: json.data.meta_title || "",
          meta_description: json.data.meta_description || "",
          canonical_url: json.data.canonical_url || "",
        })
      }
    }

    load()
  }, [id])

  async function save(status?: string) {
    setLoading(true)

    const payload = {
      ...form,
      status: status || form.status,
    }

    const res = await fetch(isEdit ? `/api/admin/content/${id}` : "/api/admin/content", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const json = await res.json()
    setLoading(false)

    if (!json.ok) {
      alert(json.error || "Gagal menyimpan")
      return
    }

    router.push("/admin/content")
    router.refresh()
  }

  async function action(act: string) {
    if (!id) return
    setLoading(true)

    const res = await fetch(`/api/admin/content/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: act }),
    })

    const json = await res.json()
    setLoading(false)

    if (!json.ok) {
      alert(json.error || "Gagal menjalankan aksi")
      return
    }

    router.push("/admin/content")
    router.refresh()
  }

  return (
    <main style={{ padding: 32, fontFamily: "Arial, sans-serif", maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>
        {isEdit ? "Edit Konten" : "Buat Konten Baru"}
      </h1>

      <p style={{ color: "#667085", marginBottom: 24 }}>
        Tulis artikel atau page, atur SEO, lalu simpan sebagai draft atau publish.
      </p>

      <div style={{ display: "grid", gap: 16 }}>
        <label>
          Tipe Konten
          <select
            value={form.content_type}
            onChange={(e) => update("content_type", e.target.value)}
            style={inputStyle}
          >
            <option value="post">Post</option>
            <option value="page">Page</option>
          </select>
        </label>

        <label>
          Judul
          <input value={form.title} onChange={(e) => update("title", e.target.value)} style={inputStyle} />
        </label>

        <label>
          Slug
          <input value={form.slug} onChange={(e) => update("slug", e.target.value)} style={inputStyle} />
        </label>

        <label>
          Excerpt
          <textarea value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} style={textareaStyle} />
        </label>

        <label>
          Isi Konten
          <textarea
            value={form.content}
            onChange={(e) => update("content", e.target.value)}
            style={{ ...textareaStyle, minHeight: 260 }}
          />
        </label>

        <label>
          Featured Image URL
          <input
            value={form.featured_image_url}
            onChange={(e) => update("featured_image_url", e.target.value)}
            style={inputStyle}
          />
        </label>

        <h2>SEO Center</h2>

        <label>
          Meta Title
          <input value={form.meta_title} onChange={(e) => update("meta_title", e.target.value)} style={inputStyle} />
        </label>

        <label>
          Meta Description
          <textarea value={form.meta_description} onChange={(e) => update("meta_description", e.target.value)} style={textareaStyle} />
        </label>

        <label>
          Canonical URL
          <input value={form.canonical_url} onChange={(e) => update("canonical_url", e.target.value)} style={inputStyle} />
        </label>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <button disabled={loading} onClick={() => save("draft")} style={buttonStyle}>
            Simpan Draft
          </button>

          <button disabled={loading} onClick={() => save("published")} style={buttonDarkStyle}>
            Publish
          </button>

          {isEdit && (
            <>
              <button disabled={loading} onClick={() => action("archive")} style={buttonStyle}>
                Archive
              </button>
              <button disabled={loading} onClick={() => action("restore")} style={buttonStyle}>
                Restore
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

const inputStyle = {
  width: "100%",
  padding: 12,
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  marginTop: 6,
} as const

const textareaStyle = {
  width: "100%",
  padding: 12,
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  marginTop: 6,
  minHeight: 110,
} as const

const buttonStyle = {
  padding: "12px 18px",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  background: "white",
  cursor: "pointer",
} as const

const buttonDarkStyle = {
  padding: "12px 18px",
  border: "1px solid #111827",
  borderRadius: 12,
  background: "#111827",
  color: "white",
  cursor: "pointer",
} as const
