import { NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const supabase = await createSupabaseServer()
  await supabase.auth.signOut()

  const url = new URL("/", request.url)
  return NextResponse.redirect(url)
}
