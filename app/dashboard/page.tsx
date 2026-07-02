export const dynamic = "force-dynamic";
export const revalidate = 0;

const cards = [
  ["Total Konten", "128", "Artikel, halaman, dan draft."],
  ["Halaman", "42", "Landing, profil, pricing, dan policy."],
  ["Kunjungan", "8.4K", "Performa publik bulan ini."],
  ["Draft", "16", "Menunggu publikasi."],
];

export default function DashboardPage() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      background: "linear-gradient(135deg,#f8f5ff,#eef9ff)",
      color: "#12111f",
      fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
    }}>
      <aside style={{
        width: 300,
        background: "#05040d",
        color: "#fff",
        padding: 28,
        minHeight: "100vh"
      }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 30 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 16,
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(135deg,#7c3aed,#0ea5e9)",
            fontWeight: 900
          }}>TA</div>
          <div>
            <b>Tri Apri Yogi</b>
            <div style={{ fontSize: 11, color: "#aaa4c3", letterSpacing: 2 }}>STUDIO DASHBOARD</div>
          </div>
        </div>

        {[
          "Command Center",
          "Admin Control",
          "Article Studio",
          "Page Builder",
          "Content Library",
          "Growth Analytics",
          "System Settings"
        ].map((item, index) => (
          <div key={item} style={{
            padding: "14px 15px",
            borderRadius: 16,
            marginBottom: 8,
            background: index === 0 ? "linear-gradient(135deg,#7c3aed,#0ea5e9)" : "transparent",
            color: index === 0 ? "#fff" : "#c8c1dc"
          }}>
            {item}
          </div>
        ))}
      </aside>

      <section style={{ flex: 1, padding: "44px min(5vw,70px)" }}>
        <p style={{ color: "#7c3aed", fontWeight: 900, letterSpacing: 4, fontSize: 12 }}>
          CREATOR STUDIO V24
        </p>

        <h1 style={{
          fontSize: "clamp(42px,6vw,80px)",
          lineHeight: .9,
          letterSpacing: "-0.075em",
          margin: 0,
          maxWidth: 900
        }}>
          Dashboard studio sudah benar.
        </h1>

        <p style={{ color: "#6b647d", lineHeight: 1.7, maxWidth: 720, fontSize: 16 }}>
          Jika halaman ini tampil, berarti studio.triapriyogi.com sudah tidak memakai landing page publik.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
          gap: 16,
          marginTop: 28
        }}>
          {cards.map(([label, value, help]) => (
            <div key={label} style={{
              background: "rgba(255,255,255,.92)",
              borderRadius: 30,
              padding: 24,
              boxShadow: "0 22px 70px rgba(30,20,70,.08)"
            }}>
              <span style={{ color: "#8b849b", fontSize: 13 }}>{label}</span>
              <strong style={{
                display: "block",
                margin: "12px 0 8px",
                fontSize: 38,
                letterSpacing: "-0.06em"
              }}>
                {value}
              </strong>
              <p style={{ color: "#6b647d", margin: 0 }}>{help}</p>
            </div>
          ))}
        </div>

        <section style={{
          background: "rgba(255,255,255,.92)",
          borderRadius: 34,
          padding: 30,
          marginTop: 20,
          boxShadow: "0 22px 70px rgba(30,20,70,.08)"
        }}>
          <h2 style={{ fontSize: 30, marginTop: 0 }}>Routing status</h2>
          <p>triapriyogi.com = landing publik.</p>
          <p>triapriyogi.com/login = login utama.</p>
          <p>studio.triapriyogi.com = dashboard studio.</p>
        </section>
      </section>
    </main>
  );
}
