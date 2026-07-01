import { uploadMedia } from "@/core/media/manager"

export async function POST(req: Request) {
  const body = await req.json()

  const result = await uploadMedia(body.file)

  return Response.json(result)
}
