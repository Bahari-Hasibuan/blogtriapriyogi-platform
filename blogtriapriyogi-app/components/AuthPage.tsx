"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import type { Provider } from "@supabase/supabase-js";

type AuthMode = "login" | "signup";

const socialProviders: { name: string; provider: string; icon: string }[] = [
  { name: "GitHub", provider: "github", icon: "GH" },
  { name: "Microsoft", provider: "azure", icon: "MS" },
  { name: "LinkedIn", provider: "linkedin_oidc", icon: "in" },
  { name: "Apple", provider: "apple", icon: "AP" },
  { name: "Facebook", provider: "facebook", icon: "FB" },
  { name: "Discord", provider: "discord", icon: "DC" },
  { name: "GitLab", provider: "gitlab", icon: "GL" },
];

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const isSignup = mode === "signup";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const [message, setMessage] = useState("");

  async function loginWithSocial(provider: string, name: string) {
    setMessage("");
    setSocialLoading(name);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: { redirectTo },
    });

    if (error) {
      setMessage(`${name} belum aktif. Aktifkan dulu di Supabase Authentication.`);
      setSocialLoading("");
    }
  }

  async function handleEmailAuth(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isSignup) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      setLoading(false);

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Akun berhasil dibuat. Silakan masuk.");
      router.push("/login");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="ta-auth-page">
      <div className="ta-grid" />
      <div className="ta-glow ta-glow-a" />
      <div className="ta-glow ta-glow-b" />

      <header className="ta-auth-topbar">
        <Link href="/" className="ta-brand">
          <span className="ta-brand-logo">TA</span>
          <span>
            <b>TriApriyogi</b>
            <small>STUDIO</small>
          </span>
        </Link>

        <nav className="ta-auth-nav">
          <Link href="/">Beranda</Link>
          <Link href="/pricing">Harga</Link>
          <Link href="/faq">FAQ</Link>
          <Link href={isSignup ? "/login" : "/signup"} className="ta-nav-cta">
            {isSignup ? "Masuk" : "Mulai"}
          </Link>
        </nav>
      </header>

      <section className="ta-auth-layout">
        <div className="ta-auth-hero">
          <div className="ta-badge">✦ Akses Eksklusif</div>

          <h1>
            {isSignup ? "Bangun blog profesional." : "Masuk ke pusat kendali."}
            <span>{isSignup ? " Mulai lebih rapi." : " Kelola semuanya."}</span>
          </h1>

          <p>
            Dashboard modern, editor artikel, AI assistant, analytics real-time,
            domain custom, dan sistem publikasi untuk kreator serius.
          </p>

          <div className="ta-chips">
            <span>✓ Dashboard pengguna</span>
            <span>✓ Editor artikel</span>
            <span>✓ AI workflow</span>
            <span>✓ Analytics</span>
          </div>

          <div className="ta-dashboard-card">
            <div className="ta-window-bar">
              <i />
              <i />
              <i />
              <small>triapriyogi.com/dashboard</small>
            </div>

            <div className="ta-dashboard-body">
              <aside>
                <div className="ta-mini-logo" />
                <b>TriBlog</b>
                <small>Dashboard</small>
                <small>Postingan</small>
                <small>Media</small>
                <small>Analytics</small>
                <small>AI Tools</small>
              </aside>

              <section>
                <div className="ta-welcome">
                  <div>
                    <h3>Selamat datang kembali</h3>
                    <p>Ringkasan blog dan aktivitas terbaru Anda.</p>
                  </div>
                  <strong>aktif</strong>
                </div>

                <div className="ta-stats">
                  <div><b>24</b><small>Total post</small></div>
                  <div><b>12.8K</b><small>Kunjungan</small></div>
                  <div><b>18</b><small>Dipublikasi</small></div>
                  <div><b>6</b><small>Draft</small></div>
                </div>
              </section>
            </div>

            <div className="ta-ai-box">
              <b>AI Assistant</b>
              <small>Generate artikel, rewrite, SEO, image idea.</small>
            </div>
          </div>
        </div>

        <form className="ta-auth-card" onSubmit={handleEmailAuth}>
          <div className="ta-card-top">
            <span>{isSignup ? "Akses baru" : "Akses dashboard"}</span>
            <small>SECURE AUTH</small>
          </div>

          <h2>{isSignup ? "Buat akun." : "Selamat datang."}</h2>

          <p className="ta-subtitle">
            {isSignup
              ? "Daftar dan mulai kelola blog TriApriyogi dengan sistem modern."
              : "Masuk untuk mengelola artikel, dashboard, analytics, dan AI tools."}
          </p>

          <button
            type="button"
            className="ta-google-btn"
            onClick={() => loginWithSocial("google", "Google")}
            disabled={!!socialLoading}
          >
            <span>G</span>
            {socialLoading === "Google" ? "Menghubungkan..." : "Lanjutkan dengan Google"}
          </button>

          <div className="ta-social-grid">
            {socialProviders.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => loginWithSocial(item.provider, item.name)}
                disabled={!!socialLoading}
              >
                <span>{item.icon}</span>
                {item.name}
              </button>
            ))}
          </div>

          <div className="ta-divider">
            <i />
            <small>atau gunakan email</small>
            <i />
          </div>

          {isSignup && (
            <label>
              Nama lengkap
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama lengkap"
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@contoh.com"
              type="email"
              required
            />
          </label>

          <label>
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignup ? "Minimal 6 karakter" : "Password"}
              type="password"
              minLength={isSignup ? 6 : undefined}
              required
            />
          </label>

          <button type="submit" className="ta-submit-btn" disabled={loading}>
            {loading ? "Memproses..." : isSignup ? "Buat akun" : "Masuk dashboard"}
          </button>

          {message && <p className="ta-message">{message}</p>}

          <p className="ta-switch">
            {isSignup ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
            <Link href={isSignup ? "/login" : "/signup"}>
              {isSignup ? "Masuk sekarang" : "Daftar gratis"}
            </Link>
          </p>

          <div className="ta-secure-note">
            🔒 Login diamankan dengan Supabase Auth.
          </div>
        </form>
      </section>
    </main>
  );
}
