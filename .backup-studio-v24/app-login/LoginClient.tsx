"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { createSupabaseBrowser } from "@/lib/supabase/browser"

type Mode = "login" | "signup"

export default function LoginClient({ mode = "login" }: { mode?: Mode }) {
  const supabase = useMemo(() => createSupabaseBrowser(), [])
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState("")
  const [message, setMessage] = useState("")

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || ""

  async function loginWithGoogle() {
    setLoading("google")
    setMessage("")

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=/dashboard`,
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    })

    if (error) {
      setMessage(error.message)
      setLoading("")
    }
  }

  async function loginWithLinkedIn() {
    setLoading("linkedin")
    setMessage("")

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "linkedin_oidc" as any,
      options: {
        redirectTo: `${origin}/auth/callback?next=/dashboard`,
        scopes: "openid profile email",
      },
    })

    if (error) {
      setMessage(error.message)
      setLoading("")
    }
  }

  async function submitEmail() {
    setLoading("email")
    setMessage("")

    if (!email || !password) {
      setMessage("Email dan password wajib diisi.")
      setLoading("")
      return
    }

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
          data: {
            full_name: name,
            brand: "Tri Apriyogi Studio",
          },
        },
      })

      if (error) {
        setMessage(error.message)
      } else {
        setMessage("Akun berhasil dibuat. Cek email jika verifikasi aktif.")
      }

      setLoading("")
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading("")
      return
    }

    window.location.href = "/dashboard"
  }

  return (
    <main className="auth-screen">
      <section className="auth-shell">
        <div className="auth-brand-panel">
          <div className="auth-badge">Akses eksklusif</div>
          <h1>
            Masuk ke pusat kendali.
            <span>Kelola semuanya.</span>
          </h1>
          <p>
            Ruang kerja modern untuk mengelola artikel, halaman, domain,
            analytics, dan AI tools dalam satu dashboard.
          </p>

          <div className="auth-mini">
            <div className="mini-top">
              <span />
              <span />
              <span />
              <strong>triapriyogi.com/dashboard</strong>
            </div>
            <div className="mini-body">
              <b>Selamat datang kembali</b>
              <small>Konten, SEO, analytics, dan publikasi siap dikelola.</small>
              <div className="mini-grid">
                <div>24<span>Total post</span></div>
                <div>12.8K<span>Kunjungan</span></div>
                <div>18<span>Dipublikasi</span></div>
                <div>6<span>Draft</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-head">
            <div>
              <span className="eyebrow">
                {mode === "signup" ? "Buat akun" : "Akses dashboard"}
              </span>
              <h2>{mode === "signup" ? "Buat akun baru." : "Selamat datang."}</h2>
            </div>
            <span className="secure">Secure Auth</span>
          </div>

          <p className="auth-desc">
            {mode === "signup"
              ? "Daftar untuk mulai mengelola blog, halaman, konten, dan dashboard."
              : "Masuk dengan Google, LinkedIn, atau email untuk membuka ruang kerja."}
          </p>

          <button className="oauth google" onClick={loginWithGoogle} disabled={!!loading}>
            <span>G</span>
            {loading === "google" ? "Menghubungkan..." : mode === "signup" ? "Daftar dengan Google" : "Lanjutkan dengan Google"}
          </button>

          <button className="oauth linkedin" onClick={loginWithLinkedIn} disabled={!!loading}>
            <span>in</span>
            {loading === "linkedin" ? "Menghubungkan..." : mode === "signup" ? "Daftar dengan LinkedIn" : "Lanjutkan dengan LinkedIn"}
          </button>

          <div className="divider"><span>atau gunakan email</span></div>

          {mode === "signup" && (
            <label className="field">
              <span>Nama</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" />
            </label>
          )}

          <label className="field">
            <span>Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@domain.com" type="email" />
          </label>

          <label className="field">
            <span>Password</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
          </label>

          <button className="primary-auth" onClick={submitEmail} disabled={!!loading}>
            {loading === "email"
              ? "Memproses..."
              : mode === "signup"
                ? "Buat akun"
                : "Masuk dashboard"}
          </button>

          <div className="auth-links">
            {mode === "login" ? (
              <>
                <Link href="/forgot-password">Lupa password?</Link>
                <Link href="/signup">Daftar gratis</Link>
              </>
            ) : (
              <Link href="/login">Sudah punya akun? Login</Link>
            )}
          </div>

          {message && <div className="auth-message">{message}</div>}

          <div className="auth-safe">
            Login diamankan dengan OAuth, email session, dan callback terenkripsi.
          </div>
        </div>
      </section>
    </main>
  )
}
