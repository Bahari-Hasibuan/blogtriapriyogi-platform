import { generateArticle } from "@/core/ai/writer"

export async function POST(req: Request) {
  const body = await req.json()

  const result = await generateArticle(body.prompt)

  return Response.json(result)
}
