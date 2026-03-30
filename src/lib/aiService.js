// =============================================
// 0waste AI Service — Multi-Provider Support
// Provider: Groq | Gemini | OpenAI
// Auto-detect dari key yang tersedia di .env
// =============================================

const GROQ_KEY    = import.meta.env.VITE_GROQ_API_KEY
const GEMINI_KEY  = import.meta.env.VITE_GEMINI_API_KEY
const OPENAI_KEY  = import.meta.env.VITE_OPENAI_API_KEY
const PREF        = import.meta.env.VITE_AI_PROVIDER || 'groq'

// Auto-detect provider aktif berdasarkan key tersedia + preferensi
function resolveProvider() {
  const order = [PREF, 'groq', 'gemini', 'openai']
  for (const p of order) {
    if (p === 'groq'   && GROQ_KEY)   return 'groq'
    if (p === 'gemini' && GEMINI_KEY) return 'gemini'
    if (p === 'openai' && OPENAI_KEY) return 'openai'
  }
  return null
}

export function getActiveProvider() {
  return resolveProvider()
}

export function isAiReady() {
  return resolveProvider() !== null
}

// System prompt 0waste — eco-focused
const SYSTEM_PROMPT = `Kamu adalah Zera, asisten AI eksklusif milik platform 0waste Shop Food — marketplace sirkular makanan surplus terverifikasi.

Fokus dan kepribadianmu:
- Ahli keamanan pangan, ekonomi sirkular, dan pengurangan pemborosan makanan
- Bantu pengguna: menemukan makanan surplus, memahami label Anti-Basi, mendaftar sebagai mitra penjual
- Berikan tips penyimpanan makanan, info sertifikasi halal, dan panduan checkout
- Nada: ramah, informatif, sedikit eco-enthusiast, tidak bertele-tele
- Jawab dalam bahasa yang sama dengan pertanyaan pengguna (Indonesia atau Inggris)
- Selalu singkat dan actionable — maksimal 3-4 kalimat per respons
- Jika pertanyaan di luar topik makanan/ekologi, redirect halus ke konteks 0waste

Konteks platform:
- Warna brand: hijau #3ec976 (Modern Green)  
- Fitur kunci: Anti-Basi badge (countdown kedaluwarsa), verified partner system, sertifikasi halal
- Target user: konsumen pencari makanan murah + mitra restoran/cafe ingin kurangi food waste`

// ---- GROQ ----
async function callGroq(messages) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',  // gratis, cepat
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 300,
      temperature: 0.7,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Groq error ${res.status}`)
  }
  const data = await res.json()
  return data.choices[0]?.message?.content || ''
}

// ---- GEMINI ----
async function callGemini(messages) {
  // Convert ke format Gemini
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  // Inject system prompt sebagai user turn pertama jika belum ada
  const withSystem = [
    { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
    { role: 'model', parts: [{ text: 'Siap! Saya Zera, asisten AI 0waste. Ada yang bisa saya bantu?' }] },
    ...contents,
  ]
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: withSystem }),
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Gemini error ${res.status}`)
  }
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// ---- OPENAI ----
async function callOpenAI(messages) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 300,
      temperature: 0.7,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `OpenAI error ${res.status}`)
  }
  const data = await res.json()
  return data.choices[0]?.message?.content || ''
}

// ---- Main export: sendMessage ----
// messages: [{role:'user'|'assistant', content: string}]
export async function sendAiMessage(messages) {
  const provider = resolveProvider()
  if (!provider) {
    throw new Error('NO_KEY') // Tidak ada API key yang dikonfigurasi
  }
  switch (provider) {
    case 'groq':   return callGroq(messages)
    case 'gemini': return callGemini(messages)
    case 'openai': return callOpenAI(messages)
    default:       throw new Error('Provider tidak dikenal')
  }
}

// Provider display info
export const PROVIDER_INFO = {
  groq:   { name: 'Groq (Llama 3.1)',    icon: '⚡' },
  gemini: { name: 'Gemini 2.0 Flash',    icon: '✨' },
  openai: { name: 'GPT-4o mini',         icon: '🤖' },
  null:   { name: 'Demo Mode',           icon: '🌿' },
}
