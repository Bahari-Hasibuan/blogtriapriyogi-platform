const providers = [
  { name: "Google", icon: "G" },
  { name: "Microsoft", icon: "M" },
  { name: "Apple", icon: "" },
  { name: "LinkedIn", icon: "in" },
  { name: "GitHub", icon: "GH" },
];

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, #ede9fe 0, transparent 34%), radial-gradient(circle at top right, #dbeafe 0, transparent 30%), #f7f5ff",
        color: "#151525",
        padding: 22,
        display: "grid",
        placeItems: "center",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 1180,
          display: "grid",
          gridTemplateColumns: "1fr 500px",
          gap: 22,
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            minHeight: 680,
            borderRadius: 36,
            padding: 46,
            color: "white",
            background:
              "radial-gradient(circle at 20% 20%, rgba(124,58,237,.42), transparent 34%), radial-gradient(circle at 80% 30%, rgba(6,182,212,.24), transparent 32%), linear-gradient(135deg, #14101f, #26145f 58%, #5b21b6)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden",
          }}
        >
          <div>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                color: "white",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 18,
                  display: "grid",
                  placeItems: "center",
                  background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                  fontWeight: 900,
                }}
              >
                TA
              </div>

              <div>
                <strong style={{ display: "block", fontSize: 21 }}>
                  TriApriyogi
                </strong>
                <small style={{ color: "rgba(255,255,255,.62)", letterSpacing: 3 }}>
                  STUDIO
                </small>
              </div>
            </a>

            <div style={{ marginTop: 76 }}>
              <span
                style={{
                  display: "inline-flex",
                  padding: "9px 14px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,.12)",
                  border: "1px solid rgba(255,255,255,.16)",
                  fontWeight: 900,
                  fontSize: 13,
                }}
              >
                Secure enterprise login
              </span>

              <h1
                style={{
                  margin: "24px 0 0",
                  fontSize: "clamp(44px, 7vw, 82px)",
                  lineHeight: 0.94,
                  letterSpacing: "-0.075em",
                  maxWidth: 760,
                }}
              >
                Satu akun untuk mengelola seluruh platform publikasi Anda.
              </h1>

              <p
                style={{
                  maxWidth: 660,
                  marginTop: 24,
                  color: "rgba(255,255,255,.74)",
                  lineHeight: 1.8,
                  fontSize: 18,
                }}
              >
                Masuk dengan Google, Microsoft, Apple, LinkedIn, GitHub, atau
                email untuk mengelola blog, domain, artikel, analytics, dan AI
                Assistant.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            {[
              ["SSO", "Multi provider"],
              ["SSL", "Secure access"],
              ["AI", "Creator tools"],
            ].map(([title, desc]) => (
              <div
                key={title}
                style={{
                  padding: 18,
                  borderRadius: 22,
                  background: "rgba(255,255,255,.11)",
                  border: "1px solid rgba(255,255,255,.14)",
                  backdropFilter: "blur(14px)",
                }}
              >
                <b style={{ display: "block", fontSize: 24 }}>{title}</b>
                <small style={{ color: "rgba(255,255,255,.65)" }}>{desc}</small>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            borderRadius: 36,
            padding: 34,
            background: "rgba(255,255,255,.94)",
            border: "1px solid #eeeaff",
            boxShadow: "0 30px 90px rgba(40,30,90,.14)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <a
            href="/"
            style={{
              color: "#7c3aed",
              fontWeight: 900,
              textDecoration: "none",
              marginBottom: 28,
            }}
          >
            ← Kembali ke Beranda
          </a>

          <h2
            style={{
              margin: 0,
              fontSize: 42,
              lineHeight: 1,
              letterSpacing: "-0.06em",
            }}
          >
            Masuk ke dashboard
          </h2>

          <p style={{ color: "#6f6b80", lineHeight: 1.7, marginBottom: 24 }}>
            Pilih metode masuk untuk melanjutkan ke TriApriyogi Studio.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 10,
              marginBottom: 22,
            }}
          >
            {providers.map((provider) => (
              <a
                key={provider.name}
                href="/dashboard"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  padding: 14,
                  borderRadius: 16,
                  background: "white",
                  border: "1px solid #e5e0ff",
                  color: "#151525",
                  fontWeight: 900,
                  textDecoration: "none",
                  boxShadow: "0 10px 30px rgba(40,30,90,.04)",
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 9,
                    display: "grid",
                    placeItems: "center",
                    background: "#f4f0ff",
                    color: "#6d28d9",
                    fontWeight: 900,
                    fontSize: 13,
                  }}
                >
                  {provider.icon}
                </span>
                Lanjutkan dengan {provider.name}
              </a>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "#9a96aa",
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            <div style={{ height: 1, background: "#eeeaff", flex: 1 }} />
            ATAU EMAIL
            <div style={{ height: 1, background: "#eeeaff", flex: 1 }} />
          </div>

          <label style={{ fontWeight: 900, marginBottom: 8 }}>Email</label>
          <input
            placeholder="anda@triapriyogi.com"
            style={{
              width: "100%",
              padding: 16,
              marginBottom: 16,
              borderRadius: 16,
              border: "1px solid #e5e0ff",
              outline: "none",
              background: "#faf9ff",
            }}
          />

          <label style={{ fontWeight: 900, marginBottom: 8 }}>Kata sandi</label>
          <input
            placeholder="••••••••"
            type="password"
            style={{
              width: "100%",
              padding: 16,
              marginBottom: 14,
              borderRadius: 16,
              border: "1px solid #e5e0ff",
              outline: "none",
              background: "#faf9ff",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 22,
              fontSize: 14,
              color: "#6f6b80",
            }}
          >
            <label>
              <input type="checkbox" /> Ingat saya
            </label>
            <a href="/contact" style={{ color: "#7c3aed", fontWeight: 900 }}>
              Lupa sandi?
            </a>
          </div>

          <a
            href="/dashboard"
            style={{
              display: "block",
              textAlign: "center",
              padding: 17,
              borderRadius: 16,
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              color: "white",
              fontWeight: 900,
              textDecoration: "none",
              boxShadow: "0 18px 45px rgba(124,58,237,.3)",
            }}
          >
            Masuk Dashboard →
          </a>

          <p
            style={{
              textAlign: "center",
              color: "#6f6b80",
              marginTop: 22,
              lineHeight: 1.6,
            }}
          >
            Belum punya akun?{" "}
            <a href="/contact" style={{ color: "#7c3aed", fontWeight: 900 }}>
              Ajukan akses beta
            </a>
          </p>

          <div
            style={{
              marginTop: 22,
              padding: 16,
              borderRadius: 18,
              background: "#f6f2ff",
              border: "1px solid #eeeaff",
              color: "#6f6b80",
              lineHeight: 1.6,
              fontSize: 14,
            }}
          >
            <b style={{ color: "#151525" }}>Mode demo:</b> tombol login sosial
            sekarang mengarah ke dashboard demo. Login asli akan disambungkan
            di tahap backend/authentication.
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 920px) {
          main > section {
            grid-template-columns: 1fr !important;
          }

          main > section > div:first-child {
            min-height: 560px !important;
            padding: 30px !important;
          }
        }
      `}</style>
    </main>
  );
}
