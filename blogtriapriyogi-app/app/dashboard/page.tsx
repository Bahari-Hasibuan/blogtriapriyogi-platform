const stats = [
  { label: "Total Artikel", value: "128", change: "+18%" },
  { label: "Kunjungan Bulan Ini", value: "84.2K", change: "+32%" },
  { label: "Artikel Published", value: "96", change: "+12%" },
  { label: "Draft Aktif", value: "14", change: "6 baru" },
];

const posts = [
  { title: "Strategi Konten Blog untuk 2026", status: "Published", views: "12.4K" },
  { title: "Panduan SEO untuk Kreator Pemula", status: "Draft", views: "—" },
  { title: "Cara Membangun Personal Brand", status: "Published", views: "8.7K" },
  { title: "AI Assistant untuk Menulis Artikel", status: "Review", views: "1.2K" },
];

export default function DashboardPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, #ede9fe 0, transparent 34%), radial-gradient(circle at top right, #dbeafe 0, transparent 30%), #f7f5ff",
        color: "#151525",
        padding: 18,
      }}
    >
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: 18,
        }}
      >
        <aside
          style={{
            minHeight: "calc(100vh - 36px)",
            borderRadius: 30,
            background: "#111018",
            color: "white",
            padding: 24,
            position: "sticky",
            top: 18,
          }}
        >
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 16,
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                display: "grid",
                placeItems: "center",
                fontWeight: 900,
              }}
            >
              TA
            </div>
            <div>
              <strong style={{ display: "block" }}>TriApriyogi</strong>
              <small style={{ color: "rgba(255,255,255,.55)", letterSpacing: 3 }}>
                STUDIO
              </small>
            </div>
          </a>

          <nav
            style={{
              display: "grid",
              gap: 10,
              marginTop: 34,
            }}
          >
            {[
              ["Dashboard", "/dashboard"],
              ["Editor Artikel", "/editor"],
              ["Pengaturan", "/settings"],
              ["Dokumentasi", "/docs"],
              ["Keamanan", "/security"],
              ["Kembali ke Website", "/"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                style={{
                  padding: "13px 14px",
                  borderRadius: 14,
                  background: label === "Dashboard" ? "rgba(124,58,237,.9)" : "rgba(255,255,255,.07)",
                  color: "white",
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                {label}
              </a>
            ))}
          </nav>

          <div
            style={{
              marginTop: 34,
              padding: 18,
              borderRadius: 22,
              background: "linear-gradient(135deg, rgba(124,58,237,.35), rgba(6,182,212,.18))",
              border: "1px solid rgba(255,255,255,.1)",
            }}
          >
            <b>AI Credits</b>
            <p style={{ color: "rgba(255,255,255,.65)", lineHeight: 1.6 }}>
              740 dari 1.000 kredit tersedia bulan ini.
            </p>
          </div>
        </aside>

        <section>
          <header
            style={{
              padding: 26,
              borderRadius: 30,
              background: "rgba(255,255,255,.86)",
              border: "1px solid #eeeaff",
              boxShadow: "0 20px 70px rgba(40,30,90,.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 18,
              flexWrap: "wrap",
            }}
          >
            <div>
              <span
                style={{
                  display: "inline-flex",
                  padding: "8px 13px",
                  borderRadius: 999,
                  background: "#ebe7ff",
                  color: "#6d28d9",
                  fontWeight: 900,
                  fontSize: 13,
                  marginBottom: 14,
                }}
              >
                Dashboard Platform
              </span>

              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(34px, 5vw, 58px)",
                  lineHeight: 1,
                  letterSpacing: "-0.07em",
                }}
              >
                Pusat kendali blog profesional Anda.
              </h1>

              <p style={{ color: "#6f6b80", lineHeight: 1.7, maxWidth: 680 }}>
                Pantau performa konten, kelola artikel, gunakan AI Assistant,
                dan siapkan domain kustom dari satu dashboard.
              </p>
            </div>

            <a
              href="/editor"
              style={{
                padding: "15px 20px",
                borderRadius: 16,
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                color: "white",
                fontWeight: 900,
                boxShadow: "0 18px 45px rgba(124,58,237,.28)",
              }}
            >
              + Buat Artikel
            </a>
          </header>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: 16,
              marginTop: 18,
            }}
          >
            {stats.map((item) => (
              <article
                key={item.label}
                style={{
                  padding: 24,
                  borderRadius: 26,
                  background: "white",
                  border: "1px solid #eeeaff",
                  boxShadow: "0 20px 60px rgba(40,30,90,.07)",
                }}
              >
                <p style={{ margin: 0, color: "#6f6b80", fontWeight: 800 }}>
                  {item.label}
                </p>
                <h2
                  style={{
                    margin: "14px 0 8px",
                    fontSize: 42,
                    letterSpacing: "-0.06em",
                  }}
                >
                  {item.value}
                </h2>
                <span style={{ color: "#16a34a", fontWeight: 900 }}>
                  {item.change}
                </span>
              </article>
            ))}
          </section>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr .8fr",
              gap: 18,
              marginTop: 18,
            }}
          >
            <article
              style={{
                padding: 26,
                borderRadius: 30,
                background: "white",
                border: "1px solid #eeeaff",
                boxShadow: "0 20px 60px rgba(40,30,90,.07)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 18,
                }}
              >
                <h2 style={{ margin: 0, letterSpacing: "-0.04em" }}>
                  Artikel terbaru
                </h2>
                <a href="/editor" style={{ color: "#7c3aed", fontWeight: 900 }}>
                  Buat baru →
                </a>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                {posts.map((post) => (
                  <div
                    key={post.title}
                    style={{
                      padding: 16,
                      borderRadius: 18,
                      background: "#faf9ff",
                      border: "1px solid #eeeaff",
                      display: "grid",
                      gridTemplateColumns: "1fr auto auto",
                      gap: 14,
                      alignItems: "center",
                    }}
                  >
                    <b>{post.title}</b>
                    <span
                      style={{
                        padding: "7px 10px",
                        borderRadius: 999,
                        background:
                          post.status === "Published" ? "#dcfce7" : "#f0ebff",
                        color:
                          post.status === "Published" ? "#166534" : "#6d28d9",
                        fontWeight: 900,
                        fontSize: 12,
                      }}
                    >
                      {post.status}
                    </span>
                    <small style={{ color: "#6f6b80", fontWeight: 800 }}>
                      {post.views}
                    </small>
                  </div>
                ))}
              </div>
            </article>

            <article
              style={{
                padding: 26,
                borderRadius: 30,
                color: "white",
                background:
                  "linear-gradient(135deg, #14101f, #26145f 55%, #5b21b6)",
                boxShadow: "0 25px 80px rgba(40,30,90,.18)",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,.12)",
                  border: "1px solid rgba(255,255,255,.16)",
                  fontWeight: 900,
                  fontSize: 13,
                }}
              >
                AI Studio
              </span>

              <h2
                style={{
                  fontSize: 36,
                  lineHeight: 1,
                  letterSpacing: "-0.06em",
                }}
              >
                Tulis artikel lebih cepat dengan AI.
              </h2>

              <p style={{ color: "rgba(255,255,255,.72)", lineHeight: 1.8 }}>
                Generate ide, outline, judul SEO, intro, meta description,
                hingga draft artikel siap edit.
              </p>

              <a
                href="/editor"
                style={{
                  display: "inline-flex",
                  marginTop: 18,
                  padding: "14px 18px",
                  borderRadius: 15,
                  background: "white",
                  color: "#171427",
                  fontWeight: 900,
                }}
              >
                Buka Editor AI
              </a>
            </article>
          </section>

          <section
            style={{
              marginTop: 18,
              padding: 26,
              borderRadius: 30,
              background: "white",
              border: "1px solid #eeeaff",
              boxShadow: "0 20px 60px rgba(40,30,90,.07)",
            }}
          >
            <h2 style={{ marginTop: 0, letterSpacing: "-0.04em" }}>
              Status platform
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 14,
              }}
            >
              {[
                ["Domain", "triapriyogi.com siap diarahkan"],
                ["Deployment", "Vercel production aktif"],
                ["Security", "Cloudflare siap dipasang"],
                ["Database", "Tahap berikutnya"],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  style={{
                    padding: 18,
                    borderRadius: 18,
                    background: "#faf9ff",
                    border: "1px solid #eeeaff",
                  }}
                >
                  <b>{title}</b>
                  <p style={{ color: "#6f6b80", lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}
