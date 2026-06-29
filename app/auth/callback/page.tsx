"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [message, setMessage] = useState("Memproses login...")

  useEffect(() => {
    async function run() {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setMessage(error.message)
        return
      }

      if (!data.session) {
        router.replace("/login")
        return
      }

      router.replace("/admin")
    }

    run()
  }, [router])

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <p>{message}</p>
    </main>
  )
}
