"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

function needsOnboarding(blogName?: string | null) {
  return (
    !blogName ||
    blogName === "Blog TriApriyogi" ||
    blogName.trim().length < 3
  );
}

export default function AuthHashRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function handleHashSession() {
      if (typeof window === "undefined") return;

      const hash = window.location.hash || "";
      if (!hash.includes("access_token")) return;

      const params = new URLSearchParams(hash.replace(/^#/, ""));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search
      );

      if (!access_token || !refresh_token) {
        router.replace("/login");
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        router.replace("/login");
        return;
      }

      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/login");
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

      router.replace("/dashboard");
    }

    handleHashSession();
  }, [router]);

  return null;
}
