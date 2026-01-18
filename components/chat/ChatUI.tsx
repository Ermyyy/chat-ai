'use client'

import { useEffect, useMemo, useRef, useState } from "react";

type Role = 'user' | 'assistant'
type Msg = {id: string; role: Role; content: string; createdAt: number}

const LS_KEY = 'chat_ai_messages_v1'


function safeParse(json: string | null) {
    if (!json) return null
    try {return JSON.parse(json)} catch { return null}
}

export function ChatUI() {
    const [messages, setMessages] = useState<Msg[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const listRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const data = safeParse(localStorage.getItem(LS_KEY))
        if (Array.isArray(data)) setMessages(data)
    })

    useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify(messages))
    }, [messages])

    useEffect(() => {
        listRef?.current?.scrollTo({top: listRef.current.scrollHeight, behavior: 'smooth'})
    }, [messages, loading])

    const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading])

    async function send() {
        if (!canSend) return
        const text = input.trim()
        setInput('')

        const userMsg: Msg = {
            id: crypto.randomUUID(),
            role: "user",
            content: text,
            createdAt: Date.now()
        }
        setMessages(prev => [...prev, userMsg])
        setLoading(true)
    }

    function clearChat() {
        setMessages([])
        localStorage.removeItem(LS_KEY)
    }
    return (
        <main className="min-h-screen px-4 py-10">
            <div className="
            flex items-center justify-between gap-3 px-6 py-5
            border-b border-white/10">
                <div className="flex flex-col">
                    <span className="
                    text-[13px] tracking-wide text-white/70">MME CHAT</span>
                    <h1 className="
                    text-[18px] font-medium text-white/90">AI Assistant</h1>
                </div>
                <button onClick={clearChat} className="
                rounded-xl border border-white/70 px-3 py-2
                text-sm text-sm text-white/70 hover:text-white/90
                hover:border-white/20 transition">
                    Очистить
                </button>
            </div>

            <div ref={listRef} 
            className="h-[64vh] overflow-y-auto px-6 py-6 space-y-4 bg-[#09090d]">
                {messages.length === 0 && (
                    <div 
                    className="rounded-2xl border border-white/10 bg-[#0d0d14] px-4 py-3">
                        <p className="text-sm text-white/70">
                            Напиши вопрос — история сохранится в браузере и останется после перезагрузки.
                        </p>
                    </div>  
                )}
                {messages.map(m => (
                    <div key={m.id}
                    className={m.role === 'user' ? 'flex justify-end' :
                     'flex justify-start'}>
                        <div
                        className={
                            m.role === 'user'
                            ? `max-w-[78%] rounded-2xl border border-white/10
                            bg-[#141425] px-4 py-3 text-sm text-white/90`
                            : `max-w-[78%] rounded-2xl border border-white/10
                            bg-[#0f0f18] px-4 py-3 text-sm text-white/80`
                        }
                        >
                            <pre className="whitespace-pre-wrap font-sans">{m.content}</pre>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="max-w-[78%] rounded-2xl border border-white/10 bg-[#0f0f18] px-4 py-3">
                            <span className="text-sm text-white/50">Печатает…</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="px-6 py-5 border-t border-white/10 bg-[#0b0b10]">
                <div className="flex gap-3 rounded-2xl border border-white/10 bg-[#0f0f16] p-3">
                    <textarea placeholder="Введите сообщение…" rows={1}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        send()
                        }
                    }}
                     className="flex-1 resize-none bg-transparent text-sm text-white/90
                         placeholder:text-white/40 outline-none" value={input} onChange={e => setInput(e.target.value)}/>
                    <button
                    onClick={send}
                    disabled={!canSend}
                    className="rounded-xl bg-[#2a2352] px-4 py-2 text-sm text-white/90
                                hover:bg-[#342b63] transition disabled:opacity-50 disabled:hover:bg-[#2a2352]"
                    >
                    Отправить
                    </button>  
                </div>
                    <p className="mt-3 text-xs text-white/40">
                        Enter — отправить, Shift+Enter — новая строка
                    </p>
            </div>

            <div className="pointer-events-none fixed inset-0 -z-10 bg-[#050507]" />
                <div
                className="pointer-events-none fixed inset-0 -z-10
                   [background:radial-gradient(1200px_600px_at_50%_-20%,rgba(73,55,145,0.20),transparent_60%)]"
                />
        </main> 
    )
}