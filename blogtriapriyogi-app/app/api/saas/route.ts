import { openai } from "@/lib/ai/client"

export async function POST(req: Request) {
  const { prompt, tenantId } = await req.json()

  const ai = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: `You are SaaS AI for tenant ${tenantId}` },
      { role: "user", content: prompt }
    ]
  })

  return Response.json({
    result: ai.choices[0].message.content,
    tenant: tenantId
  })
}
