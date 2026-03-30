import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { sendAiMessage, isAiReady, getActiveProvider, PROVIDER_INFO } from '../lib/aiService'

const QUICK_PROMPTS_KEYS = ['quick_prompt_1', 'quick_prompt_2', 'quick_prompt_3', 'quick_prompt_4']

// Fallback responses jika tidak ada API key
const FALLBACK = {
  default: [
    'Selamat datang di 0 Waste Shop Food! Saya Zera. Tambahkan API key di .env untuk AI penuh. Ada yang bisa saya bantu?',
    'Setiap produk di 0waste melalui verifikasi Anti-Basi untuk memastikan keamanan konsumen.',
    'Tips: Selalu cek label "⏳ Anti-Basi" sebelum membeli. Badge ini menjamin produk masih optimal.',
  ],
  tips: 'Tips simpan makanan: 1) Pisahkan basah/kering. 2) Buah & sayur di laci terpisah. 3) Wadah kedap udara untuk makanan matang. 4) Label tanggal simpan di setiap wadah.',
  'anti-basi': 'Anti-Basi adalah protokol keamanan pangan 0waste. Setiap produk diverifikasi mitra untuk memastikan masih dalam batas waktu aman konsumsi. Badge 🛡️ menjamin produk segar.',
  surplus: 'Cara daftar surplus: Login sebagai Partner → Partner Dashboard → "+ Tambah Listing" → isi detail + expiry time → Publikasikan!',
  keamanan: 'Standar keamanan 0waste: ✅ Verifikasi identitas mitra ✅ Higienitas berkala ✅ Countdown Anti-Basi real-time ✅ Rating kepercayaan tiap transaksi',
}

function fallbackReply(msg) {
  const low = msg.toLowerCase()
  if (low.includes('tips') || low.includes('simpan')) return FALLBACK.tips
  if (low.includes('anti-basi') || low.includes('basi')) return FALLBACK['anti-basi']
  if (low.includes('daftar') || low.includes('jual') || low.includes('surplus')) return FALLBACK.surplus
  if (low.includes('aman') || low.includes('keamanan')) return FALLBACK.keamanan
  return FALLBACK.default[Math.floor(Math.random() * FALLBACK.default.length)]
}

export default function EcoChat({ navigate }) {
  const { t } = useTranslation()
  const aiReady = isAiReady()
  const provider = getActiveProvider()
  const providerInfo = PROVIDER_INFO[provider] || PROVIDER_INFO[null]

  const [messages, setMessages] = useState([
    { role: 'bot', text: t('ai_greeting'), ts: new Date() }
  ])
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const send = async (text) => {
    if (!text.trim() || typing) return
    const trimmed = text.trim()
    setMessages(m => [...m, { role: 'user', text: trimmed, ts: new Date() }])
    setInput('')
    setTyping(true)
    setError(null)

    const newHistory = [...history, { role: 'user', content: trimmed }]

    try {
      let reply
      if (aiReady) {
        reply = await sendAiMessage(newHistory)
      } else {
        await new Promise(r => setTimeout(r, 800 + Math.random() * 500))
        reply = fallbackReply(trimmed)
      }
      setMessages(m => [...m, { role: 'bot', text: reply, ts: new Date() }])
      setHistory([...newHistory, { role: 'assistant', content: reply }])
    } catch (err) {
      const errText = err.message === 'NO_KEY'
        ? 'Tambahkan API key di .env untuk AI penuh.'
        : `Gagal menghubungi AI: ${err.message}`
      setError(errText)
      const fallback = fallbackReply(trimmed)
      setMessages(m => [...m, { role: 'bot', text: fallback, ts: new Date() }])
      setHistory([...newHistory, { role: 'assistant', content: fallback }])
    } finally {
      setTyping(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4F4F9' }}>
      {/* Header */}
      <div className="px-4 pt-14 pb-4 flex items-center gap-3"
        style={{ background: '#1a1a2e', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
        <button onClick={() => navigate('home')} className="p-1">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: '#3ec976' }}>🌿</div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-white text-sm">{t('eco_assistant')}</p>
          <p className="text-xs flex items-center gap-1 truncate" style={{ color: '#3ec976' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0 animate-pulse-green"
              style={{ background: '#3ec976' }} />
            {aiReady ? `${providerInfo.icon} ${providerInfo.name}` : `${t('online_ai')} • Demo`}
          </p>
        </div>
        {aiReady && (
          <div className="px-2 py-1 rounded-xl text-xs font-bold flex-shrink-0"
            style={{ background: 'rgba(62,201,118,0.15)', color: '#3ec976' }}>
            AI Live
          </div>
        )}
      </div>

      {/* Error / No-key notice */}
      {error && (
        <div className="mx-4 mt-3 px-4 py-2 rounded-xl text-xs"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          ⚠️ {error}
        </div>
      )}
      {!aiReady && !error && (
        <div className="mx-4 mt-3 px-4 py-3 rounded-xl text-xs"
          style={{ background: 'rgba(245,158,11,0.1)', color: '#b45309', border: '1px solid rgba(245,158,11,0.2)' }}>
          <span className="font-bold">Demo Mode</span> — Tambahkan{' '}
          <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 4px', borderRadius: 4 }}>VITE_GROQ_API_KEY</code>
          {' '}di <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 4px', borderRadius: 4 }}>.env</code> untuk AI sungguhan.
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-36 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {msg.role === 'bot' && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 self-end mb-1"
                style={{ background: '#3ec976' }}>🌿</div>
            )}
            <div
              className={`max-w-[78%] px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bubble-user' : 'bubble-bot'}`}
              style={{
                background: msg.role === 'user' ? '#3ec976' : '#ffffff',
                color: msg.role === 'user' ? '#fff' : '#1a1a2e',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex items-end gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: '#3ec976' }}>🌿</div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center"
              style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full"
                  style={{ background: '#3ec976', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts + Input bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px]"
        style={{ background: '#fff', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pt-3 pb-2">
          {QUICK_PROMPTS_KEYS.map(key => (
            <button key={key} onClick={() => send(t(key))} disabled={typing}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-opacity"
              style={{ background: 'rgba(62,201,118,0.1)', color: '#3ec976', border: '1px solid rgba(62,201,118,0.2)', opacity: typing ? 0.5 : 1 }}>
              {t(key)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 20px)' }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send(input))}
            placeholder={t('chat_placeholder')}
            disabled={typing}
            className="flex-1 px-4 text-sm outline-none"
            style={{ height: 44, background: '#F4F4F9', borderRadius: 22, color: '#1a1a2e', opacity: typing ? 0.7 : 1 }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || typing}
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity"
            style={{ background: '#3ec976', opacity: (!input.trim() || typing) ? 0.5 : 1 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
