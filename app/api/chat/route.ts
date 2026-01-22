import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages = body.messages ?? []

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
      temperature: 0.7,
    })

    const answer =
      completion.choices[0]?.message?.content ??
      "Пустой ответ от модели"

    return Response.json({ content: answer })
  } catch (e) {
    console.error(e)
    return Response.json(
      { content: "Ошибка при обращении к OpenAI" },
      { status: 500 }
    )
  }
}
