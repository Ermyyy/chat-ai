export const runtime = "nodejs"

type InMsg = {
  role: "user" | "assistant" | "system"
  content: string
}

export async function POST(req: Request) {
  try {
    if (!process.env.GROK_API_KEY) {
      return Response.json(
        { content: "GROK_API_KEY is not set" },
        { status: 500 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const rawMessages = Array.isArray(body?.messages) ? body.messages : []
    
    const messages: InMsg[] = rawMessages
      .filter((m: any) => typeof m?.content === "string")
      .map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }))

    if (messages.length === 0) {
      return Response.json(
        { content: "Пустой запрос" },
        { status: 400 }
      )
    }

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-2-latest",
        messages: [
          {
            role: "system",
            content:
              "Ты полезный и понятный AI-ассистент. Отвечай кратко и по делу.",
          },
          ...messages,
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      return Response.json(
        { content: `Grok API error: HTTP ${response.status}\n${text}` },
        { status: 500 }
      )
    }

    const data = await response.json()

    const answer =
      data?.choices?.[0]?.message?.content ??
      "Пустой ответ от Grok"

    return Response.json({ content: answer })
  } catch (e) {
    return Response.json(
      { content: "Ошибка сервера при обращении к Grok" },
      { status: 500 }
    )
  }
}
