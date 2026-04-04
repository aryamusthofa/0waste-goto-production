import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'

export default function SupportChat({ navigate }) {
  const { t } = useTranslation()
  const { user, profile } = useAuth()
  const { show } = useToast()
  
  const [ticket, setTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  const isDev = Boolean(profile?.is_super_admin)

  useEffect(() => {
    if (!user) return
    loadTicket()

    // Realtime subscription
    const channel = supabase
      .channel('public:support_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, 
        payload => {
          setMessages(current => {
            if (current.some(m => m.id === payload.new.id)) return current
            return [...current, payload.new]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadTicket = async () => {
    setLoading(true)
    try {
      // Find or create ticket
      let { data: tkt, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'open')
        .single()

      if (error && error.code === 'PGRST116') {
        const { data: newTkt, error: createErr } = await supabase
          .from('support_tickets')
          .insert({ user_id: user.id, subject: 'Live Chat Support' })
          .select()
          .single()
        if (createErr) throw createErr
        tkt = newTkt
      } else if (error) throw error

      setTicket(tkt)
      
      // Load messages
      const { data: msgs, error: msgErr } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', tkt.id)
        .order('created_at', { ascending: true })
      
      if (msgErr) throw msgErr
      setMessages(msgs || [])
    } catch (e) {
      show('Gagal memuat bantuan: ' + e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !ticket || sending) return
    const msg = input.trim()
    setInput('')
    setSending(true)

    try {
      const { error } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: ticket.id,
          sender_id: user.id,
          message: msg
        })
      if (error) throw error
    } catch (e) {
      show('Gagal mengirim pesan.', 'error')
      setInput(msg)
    } finally {
      setSending(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F4F9]">
      {/* Header */}
      <div className="px-6 pt-14 pb-6 bg-[#1a1a2e] rounded-b-[40px] shadow-lg flex items-center gap-4">
        <button onClick={() => navigate('profile')} className="p-2 -ml-2 rounded-xl active:scale-95 transition-all text-white">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="w-12 h-12 rounded-2xl bg-[#3ec976] flex items-center justify-center text-2xl shadow-soft">🚀</div>
        <div className="flex-1">
          <h1 className="text-xl font-black text-white leading-tight">Live Support</h1>
          <p className="text-[10px] font-bold text-[#3ec976] uppercase tracking-widest mt-0.5">
             Direct to Developer (Mas CEO)
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
           <div className="w-10 h-10 border-4 border-[#3ec976]/20 border-t-[#3ec976] rounded-full animate-spin mb-4" />
           <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Connecting Support...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-4 pb-32">
           <div className="p-5 bg-white rounded-[24px] border border-gray-100 shadow-sm animate-fade-in">
              <p className="text-xs font-black text-[#1a1a2e] mb-1 uppercase tracking-tight">Halo {profile?.full_name}! 👋</p>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">
                 Silakan kirim pesan jika ada kendala sistem, bugs, atau ide fitur 0Waste. Saya akan membalas secepat mungkin.
              </p>
           </div>

           {messages.map((m, idx) => {
             const isMe = m.sender_id === user.id
             return (
               <div key={m.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                  <div 
                    className={`max-w-[80%] px-5 py-3.5 rounded-[22px] text-sm font-medium shadow-sm transition-all duration-300 ${
                      isMe ? 'bg-[#3ec976] text-white rounded-br-none' : 'bg-white text-[#1a1a2e] rounded-bl-none'
                    }`}
                  >
                    {m.message}
                  </div>
               </div>
             )
           })}
           <div ref={bottomRef} />
        </div>
      )}

      {/* Input Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-6 bg-white shadow-[0_-12px_40px_rgba(0,0,0,0.03)] border-t border-gray-50 flex items-center gap-3">
         <input 
           type="text" 
           value={input}
           onChange={e => setInput(e.target.value)}
           onKeyDown={e => e.key === 'Enter' && handleSend()}
           placeholder="Tulis pesan ke developer..."
           className="flex-1 h-14 px-6 bg-[#F4F4F9] rounded-[24px] font-bold text-sm outline-none border-[1.5px] border-transparent focus:border-[#3ec976] transition-all"
         />
         <button 
           onClick={handleSend}
           disabled={!input.trim() || sending}
           className="w-14 h-14 rounded-[24px] bg-[#1a1a2e] flex items-center justify-center text-white active:scale-95 transition-all shadow-lg disabled:opacity-50"
         >
           <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
           </svg>
         </button>
      </div>
    </div>
  )
}
