"use client";

import { useEffect } from "react";

export default function AuthCallbackPage() {
  useEffect(() => {
    window.location.href = "https://studio.triapriyogi.com/dashboard";
  }, []);

  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      fontFamily: "system-ui"
    }}>
      <p>Sedang masuk ke studio...</p>
    </main>
  );
}
