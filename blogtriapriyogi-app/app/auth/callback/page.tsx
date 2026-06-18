"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const ROOT_ORIGIN = "https://triapriyogi.com";
const STUDIO_ORIGIN = "https://studio.triapriyogi.com";

function needsOnboarding(blogName?: string | null) {
  return (
    !blogName ||
    blogName === "Blog TriApriyogi" ||
    blogName.trim().length < 3
  );
}

function buildSessionHash(accessToken: string, refreshToken: string) {
  return `#access_token=${encodeURIComponent(accessToken)}&refresh_token=${encodeURIComponent(
    refreshToken
  )}&token_type=bearer`;
}

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function finishLogin() {
      const isStudio =
        typeof window !== "undefined" &&
        window.location.hostname === "studio.triapriyogi.com";

      let code = "";

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        code = url.searchParams.get("code") || "";

        const hash = window.location.hash || "";

        if (hash.includes("access_token")) {
          const params = new URLSearchParams(hash.replace(/^#/, ""));
          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");

          window.history.replaceState({}, document.title, "/auth/callback");

          if (access_token && refresh_token) {
            await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
          }
        }
      }

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }

      const sessionResult = await supabase.auth.getSession();
      const session = sessionResult.data.session;

      if (!session?.access_token || !session.refresh_token) {
        window.location.replace(`${ROOT_ORIGIN}/login`);
        return;
      }

      if (!isStudio) {
        window.location.replace(
          `${STUDIO_ORIGIN}/auth/callback${buildSessionHash(
            session.access_token,
            session.refresh_token
          )}`
        );
        return;
      }

      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.replace(`${ROOT_ORIGIN}/login`);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("blog_name")
        .eq("id", data.user.id)
        .single();

      if (needsOnboarding(profile?.blog_name)) {
        router.replace("/onboarding");
        return;
      }

      router.replace("/");
    }

    finishLogin();
  }, [router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(180deg, #f7f3ff, #eef2ff)",
        color: "#111827",
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{
          width: "min(420px, 92vw)",
          padding: 28,
          borderRadius: 28,
          background: "white",
          boxShadow: "0 24px 80px rgba(49,46,129,.14)",
          textAlign: "center",
        }}
      >
        <b>Memproses login...</b>
        <p style={{ color: "#64748b" }}>
          Mengarahkan ke ruang kerja Studio.
        </p>
      </div>
    </main>
  );
}
