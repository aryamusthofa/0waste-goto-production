import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useTranslation } from 'react-i18next'

// UI Atoms
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'

const REASON_OPTIONS = [
  { id: 'fraud', label: 'Penipuan' },
  { id: 'legal_request', label: 'Permintaan Hukum' },
  { id: 'spam', label: 'Spam/Gangguan' },
  { id: 'other', label: 'Lainnya' }
]

export default function AdminConsole({ navigate }) {
  const { user, profile, isDeveloper, refreshProfile } = useAuth()
  const { show } = useToast()
  const { t } = useTranslation()
  
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [logs, setLogs] = useState([])
  const [reports, setReports] = useState([])
  const [tickets, setTickets] = useState([])
  const [activeTab, setActiveTab] = useState('moderation') // moderation | reports | applications | support
  
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [ticketMessages, setTicketMessages] = useState([])
  const [reply, setReply] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  
  const [reasonCode, setReasonCode] = useState('fraud')
  const [reasonNote, setReasonNote] = useState('')
  const [hardDelete, setHardDelete] = useState(true)
  const [selectedPartner, setSelectedPartner] = useState(null)

  const isSuperAdmin = Boolean(profile?.is_super_admin || isDeveloper)

  const loadAll = async () => {
    setLoading(true)
    try {
      const [{ data: u }, { data: p }, { data: l }, { data: r }, { data: tk }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('admin_actions_log').select('*').order('created_at', { ascending: false }).limit(30),
        supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('support_tickets').select('*, profiles(full_name)').order('updated_at', { ascending: false }),
      ])
      setUsers(u || [])
      setProducts(p || [])
      setLogs(l || [])
      setReports(r || [])
      setTickets(tk || [])
    } catch (e) {
      show('Gagal memuat data admin.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user || !isSuperAdmin) return
    loadAll()
  }, [user, isSuperAdmin])

  const callRpc = async (label, fn) => {
    setActionLoading(label)
    try {
      await fn()
      show('Tindakan admin berhasil.', 'success')
      await refreshProfile()
      await loadAll()
    } catch (e) {
      show('Gagal: ' + e.message, 'error')
    } finally {
      setActionLoading('')
    }
  }

  if (!user || !isSuperAdmin) return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-white text-center">
       <div className="text-6xl mb-8">🔐</div>
       <h2 className="text-2xl font-black text-[#1a1a2e] mb-2">Akses Terbatas</h2>
       <p className="text-gray-400 font-medium mb-10 max-w-[240px]">Hanya administrator ROOT yang dapat mengakses konsol ini.</p>
       <Button onClick={() => navigate('home')}>Kembali</Button>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-[#F9FAFB]">
      {/* Header */}
      <div className="px-6 pt-14 pb-8 bg-white rounded-b-[40px] shadow-sm">
        <div className="flex items-center justify-between mb-8">
           <div className="flex flex-col">
              <h1 className="text-[26px] font-black text-[#1a1a2e]">Admin Console</h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mission Control Center</p>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-3xl">🛡️</div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {[
            { id: 'moderation', label: 'Moderasi', color: '#1a1a2e' },
            { id: 'reports', label: 'Laporan', color: '#ef4444', count: reports.filter(r => r.status === 'pending').length },
            { id: 'applications', label: 'Mitra', color: '#3ec976', count: users.filter(u => u.partner_status === 'pending').length },
            { id: 'support', label: 'Bantuan', color: '#3b82f6', count: tickets.filter(tk => tk.status === 'open').length },
          ].map(t_ => (
            <button
              key={t_.id}
              onClick={() => setActiveTab(t_.id)}
              className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap"
              style={{
                background: activeTab === t_.id ? t_.color : '#F4F4F9',
                color: activeTab === t_.id ? 'white' : '#6b7280',
                boxShadow: activeTab === t_.id ? `0 8px 20px ${t_.color}33` : 'none'
              }}
            >
              {t_.label}
              {t_.count > 0 && <span className="px-1.5 py-0.5 bg-white text-black rounded-full text-[8px]">{t_.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pt-8 flex flex-col gap-8">
        {activeTab === 'moderation' && (
          <div className="flex flex-col gap-6 animate-fade-in">
             <Card padding="p-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Konteks Investigasi</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {REASON_OPTIONS.map(opt => (
                    <button key={opt.id} onClick={() => setReasonCode(opt.id)} className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${reasonCode === opt.id ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]' : 'bg-gray-50 text-gray-400 border-transparent'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
                <textarea value={reasonNote} onChange={e => setReasonNote(e.target.value)} placeholder="Catatan audit..." className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-[#1a1a2e] resize-none" rows={2} />
             </Card>

             <div className="flex flex-col gap-4">
                <h3 className="font-black text-lg text-[#1a1a2e]">Daftar Pengguna</h3>
                {users.slice(0, 10).map(u => (
                  <Card key={u.id} padding="p-4" className="flex flex-col gap-3">
                     <div className="flex justify-between items-start">
                        <div>
                           <p className="text-sm font-black text-[#1a1a2e] uppercase">{u.full_name || 'Anonymous'}</p>
                           <p className="text-[9px] font-bold text-gray-400 uppercase">{u.role} • {u.is_suspended ? 'SUSPENDED' : 'ACTIVE'}</p>
                        </div>
                        {u.is_super_admin && <Badge variant="danger">ROOT</Badge>}
                     </div>
                     <div className="flex gap-2">
                        <Button variant="warning" className="!h-8 !text-[9px]" onClick={() => callRpc(`susp-${u.id}`, () => supabase.rpc('admin_suspend_user', { p_target_user: u.id, p_reason_code: reasonCode, p_reason_note: reasonNote }))} disabled={u.is_super_admin}>Suspend</Button>
                        <Button variant="danger" className="!h-8 !text-[9px]" onClick={() => callRpc(`del-${u.id}`, () => supabase.rpc('admin_delete_account', { p_target_user: u.id, p_hard_delete: hardDelete, p_reason_code: reasonCode, p_reason_note: reasonNote }))} disabled={u.is_super_admin}>Delete</Button>
                     </div>
                  </Card>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="flex flex-col gap-4 animate-fade-in">
             <h3 className="font-black text-lg text-[#1a1a2e]">{t('support_inbox')}</h3>
             {tickets.length === 0 ? (
               <div className="py-20 text-center opacity-30 text-6xl">📬</div>
             ) : tickets.map(tk => (
               <Card key={tk.id} padding="p-5" className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                     <div>
                        <p className="text-sm font-black text-[#1a1a2e] uppercase">{tk.profiles?.full_name || 'User'}</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5">{tk.subject}</p>
                     </div>
                     <Badge variant={tk.status === 'open' ? 'warning' : 'success'}>{tk.status.toUpperCase()}</Badge>
                  </div>
                  <Button variant="secondary" className="!h-10 !text-[10px]" onClick={async () => {
                     setSelectedTicket(tk)
                     const { data } = await supabase.from('support_messages').select('*').eq('ticket_id', tk.id).order('created_at', { ascending: true })
                     setTicketMessages(data || [])
                  }}>Baca & Balas</Button>
               </Card>
             ))}
          </div>
        )}

        {activeTab === 'applications' && (
           <div className="flex flex-col gap-4 animate-fade-in">
              <h3 className="font-black text-lg text-[#1a1a2e]">Antrian Mitra</h3>
              {users.filter(u => u.partner_status === 'pending').map(app => (
                <Card key={app.id} padding="p-5" className="flex flex-col gap-4">
                   <p className="text-sm font-black text-[#1a1a2e] uppercase">{app.store_name}</p>
                   <Button onClick={() => setSelectedPartner(app)}>Review Detail</Button>
                </Card>
              ))}
           </div>
        )}

        {activeTab === 'reports' && (
           <div className="flex flex-col gap-4 animate-fade-in">
              <h3 className="font-black text-lg text-[#1a1a2e]">Laporan Masuk</h3>
              {reports.map(r => (
                <Card key={r.id} padding="p-5">
                   <p className="text-xs font-bold">{r.reason}</p>
                   <Badge className="mt-2" variant="danger">{r.status}</Badge>
                </Card>
              ))}
           </div>
        )}
      </div>

      {/* Modal Chat Support */}
      <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title="Bantuan Live">
        {selectedTicket && (
          <div className="flex flex-col gap-4 max-h-[60vh]">
             <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-[200px] no-scrollbar">
                {ticketMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-xs font-bold ${m.sender_id === user.id ? 'bg-[#1a1a2e] text-white' : 'bg-gray-100 text-black'}`}>
                      {m.message}
                    </div>
                  </div>
                ))}
             </div>
             <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Balasan..." className="w-full p-4 bg-gray-50 rounded-xl text-xs font-bold outline-none" rows={2} />
             <div className="flex gap-2">
                <Button className="flex-1" onClick={async () => {
                   if (!reply.trim()) return
                   const msg = reply.trim()
                   setReply('')
                   const { error } = await supabase.from('support_messages').insert({ ticket_id: selectedTicket.id, sender_id: user.id, message: msg })
                   if (!error) setTicketMessages([...ticketMessages, { sender_id: user.id, message: msg }])
                }}>Kirim</Button>
                <Button variant="success" onClick={async () => {
                   await supabase.from('support_tickets').update({ status: 'closed' }).eq('id', selectedTicket.id)
                   setSelectedTicket(null); loadAll()
                }}>Selesai</Button>
             </div>
          </div>
        )}
      </Modal>

      {/* Modal Partner Review */}
      <Modal isOpen={!!selectedPartner} onClose={() => setSelectedPartner(null)} title="Review Mitra">
         {selectedPartner && (
           <div className="flex flex-col gap-4">
              <p className="font-bold">{selectedPartner.store_name}</p>
              <div className="p-4 bg-gray-50 rounded-xl text-xs">
                 <p>WA: {selectedPartner.store_whatsapp || '-'}</p>
                 <p>Telegram: {selectedPartner.store_telegram || '-'}</p>
              </div>
              <Button variant="success" onClick={() => {
                callRpc(`appr-${selectedPartner.id}`, () => supabase.rpc('admin_approve_partner', { p_target_user: selectedPartner.id, p_reason_note: 'Approved by Root.' }))
                setSelectedPartner(null)
              }}>Setujui</Button>
           </div>
         )}
      </Modal>
    </div>
  )
}
