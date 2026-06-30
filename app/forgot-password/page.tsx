"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { createSupabaseBrowser } from "@/lib/supabase/browser"

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createSupabaseBrowser(), [])
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function resetPassword() {
    setLoading(true)
    setMessage("")

    const origin = window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/settings`,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage("Link reset password sudah dikirim ke email.")
    }

    setLoading(false)
  }

  return (
    <main className="auth-screen">
      <section className="auth-card single">
        <span className="eyebrow">Reset akses</span>
        <h2>Lupa password.</h2>
        <p className="auth-desc">
          Masukkan email akun. Sistem akan mengirim link reset password.
        </p>

        <label className="field">
          <span>Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@domain.com" type="email" />
        </label>

        <button className="primary-auth" onClick={resetPassword} disabled={loading}>
          {loading ? "Mengirim..." : "Kirim link reset"}
        </button>

        <div className="auth-links">
          <Link href="/login">Kembali ke login</Link>
        </div>

        {message && <div className="auth-message">{message}</div>}
      </section>
    </main>
  )
}
