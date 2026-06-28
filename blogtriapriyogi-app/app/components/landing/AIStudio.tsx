"use client"

export default function AIStudio() {
  return (
    <div style={{
      padding: 24,
      borderRadius: 16,
      background: "linear-gradient(135deg,#6d28d9,#111827)",
      color: "#fff"
    }}>
      <h2>AI Studio</h2>
      <p>Generate artikel, SEO, dan ide konten otomatis.</p>

      <button style={{
        marginTop: 12,
        padding: "10px 14px",
        borderRadius: 8,
        border: "none",
        background: "#fff",
        color: "#111"
      }}>
        Aktifkan AI
      </button>
    </div>
  )
}
