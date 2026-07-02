import Link from "next/link";

export default function LoginPage() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f7f4ff 0%, #eef8ff 100%)",
      display: "grid",
      placeItems: "center",
      padding: "32px",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      color: "#111827"
    }}>
      <section style={{
        width: "min(1120px, 100%)",
        display: "grid",
        gridTemplateColumns: "1fr 0.92fr",
        gap: "36px",
        alignItems: "stretch"
      }}>
        <div style={{
          borderRadius: "34px",
          background:
            "radial-gradient(circle at top right, rgba(168,85,247,.65), transparent 38%), linear-gradient(135deg, #09051f 0%, #2d0f7c 55%, #7c3aed 100%)",
          color: "#fff",
          padding: "48px",
          position: "relative",
          overflow: "hidden",
          minHeight: "560px",
          boxShadow: "0 30px 90px rgba(50, 20, 120, .22)"
        }}>
          <div style={{
            display: "inline-flex",
            padding: "9px 14px",
            borderRadius: "999px",
            background: "rgba(255,255,255,.12)",
            fontSize: "13px",
            marginBottom: "34px"
          }}>
            Akses eksklusif
          </div>

          <h1 style={{
            fontSize: "clamp(44px, 6vw, 78px)",
            lineHeight: ".95",
            letterSpacing: "-0.07em",
            margin: 0,
            maxWidth: "560px"
          }}>
            Masuk ke pusat kendali. <br />
            <span style={{ color: "#b7ffd8" }}>Kelola semuanya.</span>
          </h1>

          <p style={{
            marginTop: "26px",
            color: "rgba(255,255,255,.74)",
            fontSize: "17px",
            lineHeight: "1.8",
            maxWidth: "520px"
          }}>
            Ruang kerja modern untuk mengelola artikel, halaman, domain, analytics,
            dan AI tools dalam satu dashboard.
          </p>

          <div style={{
            position: "absolute",
            left: "48px",
            bottom: "48px",
            width: "360px",
            borderRadius: "28px",
            background: "rgba(255,255,255,.13)",
            border: "1px solid rgba(255,255,255,.16)",
            padding: "24px",
            backdropFilter: "blur(14px)"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
              color: "rgba(255,255,255,.68)",
              marginBottom: "20px"
            }}>
              <span>Selamat datang kembali</span>
              <span>triapriyogi.com/dashboard</span>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px"
            }}>
              {[
                ["24", "Total post"],
                ["12.8K", "Kunjungan"],
                ["18", "Dipublikasi"],
                ["6", "Draft"]
              ].map(([value, label]) => (
                <div key={label} style={{
                  background: "rgba(255,255,255,.9)",
                  color: "#151321",
                  borderRadius: "18px",
                  padding: "18px"
                }}>
                  <strong style={{
                    display: "block",
                    fontSize: "26px",
                    marginBottom: "6px"
                  }}>
                    {value}
                  </strong>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          borderRadius: "34px",
          background: "rgba(255,255,255,.92)",
          padding: "44px",
          boxShadow: "0 30px 90px rgba(30, 20, 70, .12)",
          alignSelf: "center"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "28px"
          }}>
            <div style={{
              display: "inline-flex",
              padding: "9px 14px",
              borderRadius: "999px",
              background: "#f3e8ff",
              color: "#7c3aed",
              fontSize: "13px",
              fontWeight: 800
            }}>
              Akses dashboard
            </div>
            <div style={{
              fontSize: "11px",
              color: "#6b7280",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontWeight: 800
            }}>
              Secure<br />Auth
            </div>
          </div>

          <h2 style={{
            fontSize: "44px",
            lineHeight: "1",
            letterSpacing: "-0.06em",
            margin: "0 0 12px"
          }}>
            Selamat datang.
          </h2>

          <p style={{
            color: "#6b7280",
            lineHeight: "1.7",
            marginBottom: "26px"
          }}>
            Masuk dengan Google, LinkedIn, atau email untuk membuka ruang kerja.
          </p>

          <div style={{ display: "grid", gap: "12px" }}>
            <Link href="/dashboard" style={{
              display: "block",
              textAlign: "center",
              padding: "15px",
              borderRadius: "14px",
              background: "#111827",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 800
            }}>
              Lanjutkan dengan Google
            </Link>

            <Link href="/dashboard" style={{
              display: "block",
              textAlign: "center",
              padding: "15px",
              borderRadius: "14px",
              background: "#0a66c2",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 800
            }}>
              Lanjutkan dengan LinkedIn
            </Link>

            <div style={{
              textAlign: "center",
              color: "#9ca3af",
              fontSize: "13px",
              margin: "8px 0"
            }}>
              atau gunakan email
            </div>

            <input
              placeholder="email@domain.com"
              style={{
                padding: "16px",
                borderRadius: "15px",
                border: "1px solid #e5e7eb",
                fontSize: "15px"
              }}
            />

            <input
              placeholder="Password"
              type="password"
              style={{
                padding: "16px",
                borderRadius: "15px",
                border: "1px solid #e5e7eb",
                fontSize: "15px"
              }}
            />

            <Link href="/dashboard" style={{
              display: "block",
              textAlign: "center",
              padding: "16px",
              borderRadius: "15px",
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 900,
              boxShadow: "0 18px 40px rgba(124,58,237,.24)"
            }}>
              Masuk dashboard
            </Link>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
              marginTop: "8px"
            }}>
              <Link href="/forgot-password" style={{ color: "#7c3aed", textDecoration: "none" }}>
                Lupa password?
              </Link>
              <Link href="/signup" style={{ color: "#7c3aed", textDecoration: "none" }}>
                Daftar gratis
              </Link>
            </div>

            <div style={{
              marginTop: "14px",
              padding: "14px",
              borderRadius: "16px",
              background: "#f5f3ff",
              color: "#7c3aed",
              textAlign: "center",
              fontSize: "13px"
            }}>
              Login sementara langsung masuk dashboard. Auth asli disambung setelah UI stabil.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
