export async function aiResponse(input: string) {
  return {
    input,
    output: "processed AI response (production mode)",
    status: "ok"
  }
}
