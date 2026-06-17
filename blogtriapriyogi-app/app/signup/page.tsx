"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

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
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        display: "grid",
        placeItems: "center",
        background: "#f7f7fb",
      }}
    >
      <form
        onSubmit={handleSignup}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "white",
          padding: 24,
          borderRadius: 18,
          boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ marginBottom: 8 }}>Daftar Akun</h1>

        <p style={{ marginBottom: 20, color: "#666" }}>
          Buat akun untuk masuk ke platform TriApriyogi.
        </p>

        <label>Nama lengkap</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nama lengkap"
          required
          style={{
            width: "100%",
            padding: 14,
            marginTop: 6,
            marginBottom: 14,
            borderRadius: 10,
            border: "1px solid #ddd",
          }}
        />

        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@contoh.com"
          type="email"
          required
          style={{
            width: "100%",
            padding: 14,
            marginTop: 6,
            marginBottom: 14,
            borderRadius: 10,
            border: "1px solid #ddd",
          }}
        />

        <label>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimal 6 karakter"
          type="password"
          required
          minLength={6}
          style={{
            width: "100%",
            padding: 14,
            marginTop: 6,
            marginBottom: 16,
            borderRadius: 10,
            border: "1px solid #ddd",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 14,
            border: "0",
            borderRadius: 10,
            background: "#111827",
            color: "white",
            fontWeight: 700,
          }}
        >
          {loading ? "Mendaftarkan..." : "Daftar"}
        </button>

        {message && <p style={{ marginTop: 14, color: "#444" }}>{message}</p>}

        <p style={{ marginTop: 18 }}>
          Sudah punya akun? <Link href="/login">Masuk</Link>
        </p>
      </form>
    </main>
  );
}
