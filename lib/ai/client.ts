type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || ""
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"

async function openaiRequest(path: string, body: Record<string, unknown>) {
  if (!OPENAI_API_KEY) {
    return {
      ok: false,
      message: "OPENAI_API_KEY belum diatur di environment.",
      output_text: "",
      choices: [
        {
          message: {
            content:
              "AI belum aktif. Tambahkan OPENAI_API_KEY di environment Vercel atau .env.local.",
          },
        },
      ],
    }
  }

  const response = await fetch(`https://api.openai.com/v1${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    return {
      ok: false,
      message: data?.error?.message || "OpenAI request failed",
      output_text: "",
      raw: data,
      choices: [
        {
          message: {
            content: data?.error?.message || "OpenAI request failed",
          },
        },
      ],
    }
  }

  return data
}

function normalizeMessages(input: any) {
  if (Array.isArray(input?.messages)) {
    return input.messages
  }

  if (typeof input?.prompt === "string") {
    return [{ role: "user", content: input.prompt }]
  }

  if (typeof input?.input === "string") {
    return [{ role: "user", content: input.input }]
  }

  return [{ role: "user", content: "Buatkan konten singkat." }]
}

export const openai = {
  chat: {
    completions: {
      create: async (input: any = {}) => {
        const messages = normalizeMessages(input)

        return openaiRequest("/chat/completions", {
          model: input.model || OPENAI_MODEL,
          messages,
          temperature: input.temperature ?? 0.7,
          max_tokens: input.max_tokens || input.max_completion_tokens || 800,
        })
      },
    },
  },

  responses: {
    create: async (input: any = {}) => {
      const prompt =
        typeof input.input === "string"
          ? input.input
          : typeof input.prompt === "string"
            ? input.prompt
            : Array.isArray(input.messages)
              ? input.messages.map((m: any) => m.content).join("\n")
              : "Buatkan konten singkat."

      const data: any = await openaiRequest("/chat/completions", {
        model: input.model || OPENAI_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: input.temperature ?? 0.7,
        max_tokens: input.max_tokens || input.max_output_tokens || 800,
      })

      const text =
        data?.choices?.[0]?.message?.content ||
        data?.output_text ||
        data?.message ||
        ""

      return {
        ...data,
        output_text: text,
      }
    },
  },
}

export async function generateText(prompt: string, options: Record<string, unknown> = {}) {
  const result: any = await openai.chat.completions.create({
    model: options.model || OPENAI_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens || 800,
  })

  return (
    result?.choices?.[0]?.message?.content ||
    result?.output_text ||
    result?.message ||
    ""
  )
}

export const aiConfig = {
  model: OPENAI_MODEL,
  enabled: Boolean(OPENAI_API_KEY),
}
