import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'

const modelName = 'gemini-1.5-flash'

function makeClient() {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (!key) return null
  return new GoogleGenerativeAI(key)
}

function queueContext(queue) {
  const items = queue.map((f) => ({
    name: f.name,
    type: f.type,
    sizeMB: Number((f.size / (1024 * 1024)).toFixed(2)),
    status: f.status
  }))
  return JSON.stringify({ items })
}

function assistantSystemPrompt(queue, stats) {
  const ctx = queueContext(queue)
  const persona =
    'You are File Guru, an expert on file formats, compression, quality trade-offs, and accessibility. Be concise, proactive, and practical.'
  return `${persona} Context: ${ctx}. Total files: ${stats.count}, total size MB: ${(stats.total / (1024 * 1024)).toFixed(2)}.`
}

async function safeGenerate(model, text) {
  try {
    const resp = await model.generateContent(text)
    const c = resp?.response?.text()
    return c || ''
  } catch {
    return ''
  }
}

export default forwardRef(function Chatbot({ queue, stats }, ref) {
  const [messages, setMessages] = useState([])
  const clientRef = useRef(null)
  const modelRef = useRef(null)
  const [input, setInput] = useState('')
  const prevCountRef = useRef(0)

  useEffect(() => {
    clientRef.current = makeClient()
    if (clientRef.current) {
      modelRef.current = clientRef.current.getGenerativeModel({ model: modelName })
    } else {
      modelRef.current = null
    }
  }, [])

  useEffect(() => {
    if (queue.length > prevCountRef.current) {
      const item = queue[queue.length - 1]
      const prompt = `${assistantSystemPrompt(queue, stats)} A new file was added: ${item.name} (${item.type}). Provide a one-paragraph unsolicited recommendation, considering MIME type and typical workflows.`
      if (modelRef.current) {
        safeGenerate(modelRef.current, prompt).then((text) => {
          const t = text || `Consider compressing or optimizing ${item.name} based on its type ${item.type}.`
          setMessages((m) => [...m, { role: 'assistant', text: t }])
        })
      } else {
        const t = `Consider compressing or optimizing ${item.name} based on its type ${item.type}.`
        setMessages((m) => [...m, { role: 'assistant', text: t }])
      }
    }
    prevCountRef.current = queue.length
  }, [queue, stats])

  const send = async () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', text: input.trim() }
    setMessages((m) => [...m, userMsg])
    const prompt = `${assistantSystemPrompt(queue, stats)} User: ${input.trim()}. Answer with precise guidance. If asked about historical details like largest file before conversion, derive from context.`
    if (modelRef.current) {
      const text = await safeGenerate(modelRef.current, prompt)
      const assistantMsg = { role: 'assistant', text: text || 'Unable to reach AI. Provide more specific details.' }
      setMessages((m) => [...m, assistantMsg])
    } else {
      const assistantMsg = { role: 'assistant', text: 'AI offline. Based on queue context, prefer WEBP for images and keep tagged PDFs for accessibility.' }
      setMessages((m) => [...m, assistantMsg])
    }
    setInput('')
  }

  useImperativeHandle(ref, () => ({
    async getDefinition(term) {
      const quick = `One sentence definition of ${term} focused on practical usage.`
      if (modelRef.current) {
        const txt = await safeGenerate(modelRef.current, quick)
        return txt || `${term} is a standardized variant focused on archival compatibility.`
      }
      return `${term} is a standardized variant focused on archival compatibility.`
    },
    warnAccessibility(msg) {
      setMessages((m) => [...m, { role: 'assistant', text: `Warning: ${msg}` }])
    }
  }))

  const list = useMemo(() => messages.slice(-60), [messages])

  return (
    <div className="space-y-3">
      <div className="h-72 overflow-y-auto rounded-lg border border-indigo-500/20 bg-slate-900/40 p-3">
        {list.length === 0 && (
          <div className="text-xs text-slate-400">Ask about formats, quality, or workflow.</div>
        )}
        {list.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-slate-100 mb-2' : 'text-indigo-300 mb-2'}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the File Guru"
        />
        <button className="btn-primary" onClick={send}>Send</button>
      </div>
    </div>
  )
})
