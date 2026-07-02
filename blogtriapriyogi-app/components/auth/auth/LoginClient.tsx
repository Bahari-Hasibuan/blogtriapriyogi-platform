"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";

const dashboardUrl = "https://studio.triapriyogi.com/dashboard";

export default function LoginClient() {
  const supabase = createBrowserSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  async function loginWithEmail() {
    if (!supabase) {
      setStatus("Env Supabase public belum lengkap.");
      return;
    }

    if (!email || !password) {
      setStatus("Email dan password wajib diisi.");
      return;
    }

    setStatus("Memproses login...");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    window.location.href = dashboardUrl;
  }

  async function loginWithProvider(provider: "google" | "linkedin_oidc") {
    if (!supabase) {
      setStatus("Env Supabase public belum lengkap.");
      return;
    }

    setStatus("Membuka halaman login...");

    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: 28,
      background: "linear-gradient(135deg,#f7f4ff,#eef8ff)",
      fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif",
      color: "#111827"
    }}>
      <section style={{
        width: "min(1080px,100%)",
        display: "grid",
        gridTemplateColumns: "1fr .9fr",
        gap: 34,
        alignItems: "stretch"
      }}>
        <div style={{
          borderRadius: 34,
          padding: 46,
          color: "#fff",
          background: "radial-gradient(circle at top right,rgba(168,85,247,.65),transparent 38%),linear-gradient(135deg,#09051f,#2d0f7c 55%,#7c3aed)",
          boxShadow: "0 30px 90px rgba(50,20,120,.22)"
        }}>
          <div style={{
            display: "inline-flex",
            padding: "9px 14px",
            borderRadius: 999,
            background: "rgba(255,255,255,.12)",
            fontSize: 13,
            marginBottom: 34
          }}>
            Akses dashboard
          </div>

          <h1 style={{
            fontSize: "clamp(42px,6vw,76px)",
            lineHeight: .95,
            letterSpacing: "-.07em",
            margin: 0
          }}>
            Masuk ke pusat kendali.
          </h1>

          <p style={{
            marginTop: 24,
            color: "rgba(255,255,255,.74)",
            fontSize: 17,
            lineHeight: 1.85,
            maxWidth: 520
          }}>
            Kelola artikel, halaman, analitik, draft, dan pengaturan dari satu ruang kerja.
          </p>
        </div>

        <div style={{
          borderRadius: 34,
          background: "rgba(255,255,255,.94)",
          padding: 42,
          boxShadow: "0 30px 90px rgba(30,20,70,.12)",
          alignSelf: "center"
        }}>
          <h2 style={{
            fontSize: 42,
            lineHeight: 1,
            letterSpacing: "-.06em",
            margin: "0 0 12px"
          }}>
            Selamat datang.
          </h2>

          <p style={{
            color: "#6b7280",
            lineHeight: 1.75,
            marginBottom: 24
          }}>
            Pilih metode masuk. Setelah berhasil, kamu akan diarahkan ke studio.
          </p>

          <div style={{ display: "grid", gap: 13 }}>
            <button onClick={() => loginWithProvider("google")} style={buttonDark}>
              Lanjutkan dengan Google
            </button>

            <button onClick={() => loginWithProvider("linkedin_oidc")} style={buttonBlue}>
              Lanjutkan dengan LinkedIn
            </button>

            <div style={{
              textAlign: "center",
              color: "#9ca3af",
              fontSize: 13,
              margin: "7px 0"
            }}>
              atau gunakan email
            </div>

            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@domain.com"
              style={input}
            />

            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              type="password"
              style={input}
            />

            <button onClick={loginWithEmail} style={buttonPrimary}>
              Masuk dengan Email
            </button>

            {status ? (
              <div style={{
                padding: 14,
                borderRadius: 16,
                background: "#f5f3ff",
                color: "#6d28d9",
                lineHeight: 1.6,
                fontSize: 14
              }}>
                {status}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

const input = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: 16,
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  fontSize: 15,
};

const buttonDark = {
  padding: 16,
  borderRadius: 16,
  border: 0,
  background: "#111827",
  color: "#fff",
  fontWeight: 850,
  cursor: "pointer",
};

const buttonBlue = {
  padding: 16,
  borderRadius: 16,
  border: 0,
  background: "#0a66c2",
  color: "#fff",
  fontWeight: 850,
  cursor: "pointer",
};

const buttonPrimary = {
  padding: 16,
  borderRadius: 16,
  border: 0,
  background: "linear-gradient(135deg,#7c3aed,#a855f7)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};
