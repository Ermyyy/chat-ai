export const runtime = "nodejs"

type InMsg = { role: "user" | "assistant" | "system"; content: string }

function asText(x: unknown) {
  return typeof x === "string" ? x : JSON.stringify(x)
}

export async function POST(req: Request) {
  try {
    if (!process.env.GROK_API_KEY) {
      return Response.json(
        { content: "Сервер: не задан GROK_API_KEY" },
        { status: 500 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const messages: InMsg[] = Array.isArray(body?.messages) ? body.messages : []

    const model = process.env.GROK_MODEL || "grok-2-latest"

    const r = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "Ты полезный и понятный AI-ассистент. Отвечай кратко и по делу.",
          },
          ...messages,
        ],
        temperature: 0.7,
      }),
    })
    if (!r.ok) {
      const text = await r.text()
      const isHtml = text.trim().startsWith("<!doctype html") || text.includes("<html")
      if (isHtml && text.includes("not available in your region")) {
        return Response.json(
          {
            content:
              "Grok недоступен в текущем регионе выполнения сервера. " +
              "Задеплой проект в Vercel (EU/US) или используй другой провайдер.",
          },
          { status: 500 }
        )
      }
      try {
        const j = JSON.parse(text)
        const msg =
          j?.error?.message ||
          j?.message ||
          `Grok API error: HTTP ${r.status}`
        return Response.json({ content: msg }, { status: 500 })
      } catch {
        return Response.json(
          { content: `Grok API error: HTTP ${r.status}. ${text.slice(0, 400)}` },
          { status: 500 }
        )
      }
    }

    const data = await r.json().catch(() => null)
    const answer =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.text ??
      null

    return Response.json({
      content: answer ?? "null от Grok",
    })
  } catch (e) {
    return Response.json(
      { content: "Ошибка сервера Grok: " + asText(e) },
      { status: 500 }
    )
  }
}
