import { openai } from "@/lib/ai/client"

export async function POST(req: Request) {
  const { prompt } = await req.json()

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are SaaS AI assistant for dashboard system." },
      { role: "user", content: prompt }
    ]
  })

  return Response.json({
    result: completion.choices[0].message.content
  })
}
