export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const lastUser = Array.isArray(body?.messages)
    ? [...body.messages].reverse().find((m: any) => m?.role === 'user')?.content
    : ''

  // Имитируем задержку “ИИ”
  await new Promise(r => setTimeout(r, 600))

  return Response.json({
    content:
      `Я понял вопрос: "${lastUser}".\n\n` +
      `Сейчас я работаю в режиме заглушки. Далее подключим Grok/OpenAI и ответы станут реальными.`
  })
}
