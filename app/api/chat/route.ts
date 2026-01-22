import OpenAI from "openai"

export const runtime = "nodejs"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

type InMsg = {
  role: "system" | "user" | "assistant"
  content: string
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { content: "OPENAI_API_KEY is not set" },
        { status: 500 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const rawMessages = Array.isArray(body?.messages) ? body.messages : []
    const messages: InMsg[] = rawMessages
      .filter((m: any) => typeof m?.content === "string")
      .slice(-8)
      .map((m: any) => ({
        role:
          m.role === "assistant"
            ? "assistant"
            : m.role === "system"
            ? "system"
            : "user",
        content: m.content,
      }))

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Ты полезный и понятный AI-ассистент. Отвечай кратко и по делу.",
        },
        ...messages,
      ],
      temperature: 0.6,
    })

    const answer =
      completion.choices[0]?.message?.content ??
      "Пустой ответ от модели"

    return Response.json({ content: answer })
    } catch (e: any) {
    console.error("OPENAI ERROR:", e)
    return Response.json(
      {
        content:
          e?.error?.message ||
          e?.message ||
          "Ошибка при обращении к OpenAI",
      },
      { status: 500 }
    )
  }

}
