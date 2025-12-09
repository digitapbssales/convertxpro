import React, { useRef, useState, useMemo } from 'react'
import ThemeToggle from './components/ThemeToggle.jsx'
import Converter from './components/Converter.jsx'
import Chatbot from './components/Chatbot.jsx'
import useHotkeys from './hooks/useHotkeys.js'

export default function App() {
  const [queue, setQueue] = useState([])
  const [showChat, setShowChat] = useState(true)
  const fileInputRef = useRef(null)
  const chatbotRef = useRef(null)

  const openFileDialog = () => {
    if (fileInputRef.current) fileInputRef.current.click()
  }

  const fetchDefinition = async (term) => {
    if (chatbotRef.current && chatbotRef.current.getDefinition) {
      return await chatbotRef.current.getDefinition(term)
    }
    return ''
  }

  const warnAccessibility = (msg) => {
    if (chatbotRef.current && chatbotRef.current.warnAccessibility) {
      chatbotRef.current.warnAccessibility(msg)
    }
  }

  useHotkeys({
    openFiles: openFileDialog,
    toggleChat: () => setShowChat((s) => !s)
  })

  const stats = useMemo(() => {
    const total = queue.reduce((a, f) => a + (f.size || 0), 0)
    return { count: queue.length, total }
  }, [queue])

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 pulse-ring" />
            <div>
              <h1 className="text-xl font-semibold gradient-text">ConvertX Pro 2.0</h1>
              <p className="text-xs text-slate-400">Cyber-future conversion lab</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 cyber-card rounded-xl p-4">
          <Converter
            queue={queue}
            setQueue={setQueue}
            fileInputRef={fileInputRef}
            fetchDefinition={fetchDefinition}
            warnAccessibility={warnAccessibility}
          />
        </section>

        <aside className="cyber-card rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">AI Assistant</h2>
            <button className="btn-ghost" onClick={() => setShowChat((s) => !s)}>
              {showChat ? 'Hide' : 'Show'}
            </button>
          </div>
          {showChat && (
            <Chatbot ref={chatbotRef} queue={queue} stats={stats} />
          )}
        </aside>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500">
        <div className="flex items-center justify-between">
          <span>Ctrl/Cmd+U to add files, Ctrl/Cmd+C to toggle chat</span>
          <span>All processing is client-side</span>
        </div>
      </footer>
    </div>
  )
}
