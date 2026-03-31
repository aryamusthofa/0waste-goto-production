import { supabase } from './supabase'

/**
 * 0Waste AI Service — Supabase Edge Function Integration
 * Production-ready with graceful fallback.
 * DO NOT use client-side API keys.
 */

const PROVIDER = import.meta.env.VITE_AI_PROVIDER || 'gemini'

export function getActiveProvider() {
  return PROVIDER
}

export function isAiReady() {
  return true // Assume ready since we rely on the Edge Function which uses its own backend secrets.
}

export async function sendAiMessage(messages) {
  try {
    // Calling the Edge function via Supabase Client
    const { data, error } = await supabase.functions.invoke('eco-chat', {
      body: { messages },
      methods: 'POST',
    })

    if (error) {
      console.error('Edge Function Error:', error.message)
      throw new Error('Koneksi AI bermasalah. Coba beberapa saat lagi.')
    }

    if (data?.error) {
      console.error('Zera Backend Error:', data.error)
      throw new Error(data.error)
    }

    const reply = data?.reply
    if (!reply || typeof reply !== 'string') {
      throw new Error('Respons AI kosong atau tidak valid')
    }

    return reply.trim()
  } catch (err) {
    if (err.name === 'AbortError' || err.name === 'TimeoutError' || err.message.includes('fetch')) {
      throw new Error('Koneksi ke sistem AI terputus. Pastikan kamu terhubung internet.')
    }
    throw err
  }
}

// Provider display info
export const PROVIDER_INFO = {
  gemini: { name: 'Gemini 2.0 Flash (Edge Shield)', icon: '🛡️✨' },
  demo:   { name: 'Demo Mode', icon: '🌿' },
}
