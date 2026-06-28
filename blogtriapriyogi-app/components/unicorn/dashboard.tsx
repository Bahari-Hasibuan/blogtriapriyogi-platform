"use client"

import { FadeUp, ScaleCard } from "./animated"

export default function UnicornDashboard() {
  return (
    <div className="min-h-screen bg-black text-white p-8">

      <FadeUp>
        <h1 className="text-4xl font-bold">
          Unicorn SaaS OS
        </h1>
        <p className="text-purple-400">
          Vercel-class • Cloudflare-speed • Linear-design
        </p>
      </FadeUp>

      <div className="grid grid-cols-3 gap-4 mt-10">

        <ScaleCard>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            AI Engine
          </div>
        </ScaleCard>

        <ScaleCard>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            Multi Tenant
          </div>
        </ScaleCard>

        <ScaleCard>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            Edge API
          </div>
        </ScaleCard>

      </div>

    </div>
  )
}
