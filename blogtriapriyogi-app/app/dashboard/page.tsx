export default function DashboardPage() {
  return (
    <main style={{ minHeight: "100vh", padding: 24, background: "#f7f5ff" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <a href="/" style={{ fontWeight: 900 }}>TriApriyogi Studio</a>
        <div style={{ display: "flex", gap: 12 }}>
          <a href="/editor">Editor</a>
          <a href="/settings">Settings</a>
        </div>
      </nav>

      <h1 style={{ fontSize: 42, marginBottom: 8 }}>Dashboard</h1>
      <p style={{ color: "#6f6b80" }}>Ringkasan performa blog dan aktivitas terbaru.</p>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginTop: 28 }}>
        {[
          ["Total Post", "24"],
          ["Kunjungan", "12.8K"],
          ["Published", "18"],
          ["Draft", "6"],
        ].map(([label, value]) => (
          <div key={label} style={{ background: "white", padding: 24, borderRadius: 22, boxShadow: "0 18px 50px rgba(40,30,90,.08)" }}>
            <p style={{ color: "#6f6b80" }}>{label}</p>
            <h2 style={{ fontSize: 38 }}>{value}</h2>
          </div>
        ))}
      </section>

      <section style={{ background: "white", padding: 24, borderRadius: 24, marginTop: 24 }}>
        <h2>Post terbaru</h2>
        <p>Strategi konten blog 2026 — published</p>
        <p>Panduan SEO untuk pemula — draft</p>
        <p>Membangun personal brand — published</p>
        <a href="/editor" style={{ display: "inline-block", marginTop: 16, padding: 14, borderRadius: 14, background: "#7c3aed", color: "white", fontWeight: 900 }}>
          + Buat Post Baru
        </a>
      </section>
    </main>
  );
}
