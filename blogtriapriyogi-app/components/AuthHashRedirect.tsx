"use client";

import { useEffect } from "react";

const STUDIO_ORIGIN = "https://studio.triapriyogi.com";

export default function AuthHashRedirect() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash || "";

    if (!hash.includes("access_token")) return;

    window.history.replaceState(
      {},
      document.title,
      window.location.pathname + window.location.search
    );

    window.location.replace(`${STUDIO_ORIGIN}/auth/callback${hash}`);
  }, []);

  return null;
}
