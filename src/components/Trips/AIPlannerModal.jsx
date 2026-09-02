import { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import './AIPlannerModal.css'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent'

const SYSTEM_CONTEXT = `You are a friendly Kenyan safari travel planning assistant for FOMO Travel.
Help users plan their trip by asking about dates, group size, budget, and interests
(wildlife, culture, beaches, mountains). Keep responses concise, warm, and focused on
Kenyan destinations like Masai Mara, Amboseli, Serengeti, Mount Kenya, Diani Beach, and Samburu.`

export default function AIPlannerModal({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your FOMO Travel AI planner. Tell me about your dream Kenyan safari — dates, group size, or what you'd love to see!" },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', text: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    const contents = [
      { role: 'user', parts: [{ text: SYSTEM_CONTEXT }] },
      ...newMessages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }],
      })),
    ]

    const maxRetries = 2
    let lastError = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': GEMINI_API_KEY,
          },
          body: JSON.stringify({ contents }),
        })

        const data = await res.json()

        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          setMessages((prev) => [...prev, { role: 'assistant', text: data.candidates[0].content.parts[0].text }])
          setLoading(false)
          return
        }

        lastError = data?.error?.message || 'Empty response'

        if (res.status === 503 && attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)))
          continue
        }

        break
      } catch (err) {
        lastError = err.message
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)))
          continue
        }
      }
    }

    console.error('Gemini failed after retries:', lastError)
    setMessages((prev) => [...prev, { role: 'assistant', text: "Our AI planner is a bit busy right now — please try sending that again in a moment." }])
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="aimodal__backdrop" onClick={onClose}>
      <div className="aimodal" onClick={(e) => e.stopPropagation()}>
        <div className="aimodal__header">
          <div className="aimodal__title">
            <Sparkles size={18} />
            <span>Plan With AI</span>
          </div>
          <button className="aimodal__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="aimodal__messages" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`aimodal__bubble aimodal__bubble--${m.role}`}>
              {m.role === 'assistant' ? (
                <ReactMarkdown>{m.text}</ReactMarkdown>
              ) : (
                m.text
              )}
            </div>
          ))}
          {loading && (
            <div className="aimodal__bubble aimodal__bubble--assistant aimodal__bubble--loading">
              Thinking...
            </div>
          )}
        </div>

        <div className="aimodal__input-row">
          <input
            type="text"
            placeholder="Ask about destinations, dates, budgets..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={sendMessage} disabled={loading} aria-label="Send">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}