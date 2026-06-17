"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function completeLogin() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }

      router.replace("/dashboard");
    }

    completeLogin();
  }, [router]);

  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: 24,
      background: "linear-gradient(135deg, #f5f3ff, #eef2ff)"
    }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
        padding: 28,
        borderRadius: 28,
        background: "white",
        boxShadow: "0 30px 90px rgba(49,46,129,.16)",
        textAlign: "center"
      }}>
        <h1>Memproses login...</h1>
        <p>Mohon tunggu, Anda sedang diarahkan ke dashboard.</p>
      </div>
    </main>
  );
}
