export default function LoginPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f7f5ff" }}>
      <section style={{ width: "100%", maxWidth: 460, background: "white", borderRadius: 28, padding: 32, boxShadow: "0 24px 70px rgba(40,30,90,.12)" }}>
        <a href="/" style={{ color: "#7c3aed", fontWeight: 800 }}>← Kembali</a>
        <h1 style={{ fontSize: 38, marginBottom: 8 }}>Masuk ke TriApriyogi</h1>
        <p style={{ color: "#6f6b80" }}>Kelola blog, artikel, analytics, dan AI Assistant.</p>

        <label>Email</label>
        <input placeholder="anda@triapriyogi.com" style={{ width: "100%", padding: 16, margin: "8px 0 16px", borderRadius: 14, border: "1px solid #e5e0ff" }} />

        <label>Password</label>
        <input placeholder="••••••••" type="password" style={{ width: "100%", padding: 16, margin: "8px 0 22px", borderRadius: 14, border: "1px solid #e5e0ff" }} />

        <a href="/dashboard" style={{ display: "block", textAlign: "center", padding: 16, borderRadius: 14, background: "#7c3aed", color: "white", fontWeight: 900 }}>
          Masuk Dashboard
        </a>
      </section>
    </main>
  );
}
