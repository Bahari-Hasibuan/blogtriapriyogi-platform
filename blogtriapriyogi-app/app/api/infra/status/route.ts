import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function hasEnv(name: string) {
  return Boolean(process.env[name] && process.env[name]?.trim())
}

function fileExists(target: string) {
  return fs.existsSync(path.join(process.cwd(), target))
}

export async function GET() {
  try {
    const checks = {
      app: true,
      database_url: hasEnv("DATABASE_URL"),
      supabase_url: hasEnv("NEXT_PUBLIC_SUPABASE_URL"),
      supabase_anon_key: hasEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      jwt_secret: hasEnv("JWT_SECRET"),
      stripe_secret_key: hasEnv("STRIPE_SECRET_KEY"),
      openai_api_key: hasEnv("OPENAI_API_KEY"),
      worker_file: fileExists("services/worker/index.ts"),
      package_json: fileExists("package.json"),
      next_config: fileExists("next.config.js") || fileExists("next.config.mjs"),
      env_local: fileExists(".env.local")
    }

    return NextResponse.json({
      ok: true,
      service: "TriApriyogi Platform",
      status: "healthy",
      checks,
      time: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || String(error)
      },
      { status: 500 }
    )
  }
}
