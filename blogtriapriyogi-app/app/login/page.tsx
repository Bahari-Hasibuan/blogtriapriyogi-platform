"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

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
        onSubmit={handleLogin}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "white",
          padding: 24,
          borderRadius: 18,
          boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ marginBottom: 8 }}>Masuk</h1>

        <p style={{ marginBottom: 20, color: "#666" }}>
          Masuk ke dashboard TriApriyogi.
        </p>

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
          placeholder="Password"
          type="password"
          required
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
          {loading ? "Memproses..." : "Masuk"}
        </button>

        {message && <p style={{ marginTop: 14, color: "#444" }}>{message}</p>}

        <p style={{ marginTop: 18 }}>
          Belum punya akun? <Link href="/signup">Daftar</Link>
        </p>
      </form>
    </main>
  );
}
