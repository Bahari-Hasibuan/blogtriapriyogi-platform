type CompanyPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
  cta?: string;
};

export default function CompanyPage({
  eyebrow,
  title,
  description,
  items,
  cta = "Kembali ke Beranda",
}: CompanyPageProps) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, #ede9fe 0, transparent 32%), radial-gradient(circle at top right, #dbeafe 0, transparent 28%), #f7f5ff",
        color: "#151525",
        padding: 24,
      }}
    >
      <nav
        style={{
          maxWidth: 1120,
          margin: "0 auto 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 16,
          borderRadius: 24,
          background: "rgba(255,255,255,.85)",
          border: "1px solid #eeeaff",
          boxShadow: "0 20px 70px rgba(40,30,90,.08)",
        }}
      >
        <a href="/" style={{ fontWeight: 900, fontSize: 20 }}>
          TriApriyogi Studio
        </a>

        <div style={{ display: "flex", gap: 18, fontSize: 14 }}>
          <a href="/pricing">Harga</a>
          <a href="/docs">Docs</a>
          <a href="/security">Security</a>
          <a href="/login">Masuk</a>
        </div>
      </nav>

      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 28,
        }}
      >
        <div
          style={{
            padding: 42,
            borderRadius: 34,
            background: "linear-gradient(135deg, #14101f, #26145f 55%, #5b21b6)",
            color: "white",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              padding: "9px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,.12)",
              border: "1px solid rgba(255,255,255,.14)",
              marginBottom: 22,
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {eyebrow}
          </span>

          <h1
            style={{
              margin: 0,
              maxWidth: 820,
              fontSize: "clamp(42px, 7vw, 78px)",
              lineHeight: 0.95,
              letterSpacing: "-0.075em",
            }}
          >
            {title}
          </h1>

          <p
            style={{
              maxWidth: 720,
              marginTop: 24,
              color: "rgba(255,255,255,.74)",
              fontSize: 18,
              lineHeight: 1.8,
            }}
          >
            {description}
          </p>

          <a
            href="/"
            style={{
              display: "inline-flex",
              marginTop: 28,
              padding: "15px 22px",
              borderRadius: 15,
              background: "white",
              color: "#171427",
              fontWeight: 900,
              textDecoration: "none",
            }}
          >
            {cta}
          </a>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {items.map((item, index) => (
            <article
              key={item}
              style={{
                padding: 26,
                borderRadius: 24,
                background: "white",
                border: "1px solid #eeeaff",
                boxShadow: "0 20px 60px rgba(40,30,90,.07)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  display: "grid",
                  placeItems: "center",
                  background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                  color: "white",
                  fontWeight: 900,
                  marginBottom: 18,
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 style={{ margin: 0, fontSize: 20 }}>{item}</h3>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
