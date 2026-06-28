"use client"

import Link from "next/link"

export default function Navbar() {
  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "16px 24px",
      borderBottom: "1px solid #eee",
      background: "#fff"
    }}>
      <div style={{ fontWeight: 700 }}>
        Triapriyogi
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        <Link href="/">Beranda</Link>
        <Link href="/harga">Harga</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/login">Masuk</Link>

        <Link href="/dashboard" style={{
          padding: "6px 12px",
          background: "#6d28d9",
          color: "#fff",
          borderRadius: 8
        }}>
          Dasbor
        </Link>
      </div>
    </nav>
  )
}
