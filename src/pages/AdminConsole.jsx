import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

// UI Atoms
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const REASON_OPTIONS = [
  { id: 'fraud', label: 'Penipuan' },
  { id: 'legal_request', label: 'Permintaan Hukum' },
  { id: 'spam', label: 'Spam/Gangguan' },
  { id: 'other', label: 'Lainnya' }
]

export default function AdminConsole({ navigate }) {
  const { user, profile, refreshProfile } = useAuth()
  const { show } = useToast()
  
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [logs, setLogs] = useState([])
  const [reports, setReports] = useState([])
  const [activeTab, setActiveTab] = useState('moderation') // 'moderation' or 'reports'
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  
  const [reasonCode, setReasonCode] = useState('fraud')
  const [reasonNote, setReasonNote] = useState('')
  const [hardDelete, setHardDelete] = useState(true)

  const isSuperAdmin = Boolean(profile?.is_super_admin)

  const loadAll = async () => {
    setLoading(true)
    try {
      const [{ data: u }, { data: p }, { data: l }, { data: r }] = await Promise.all([
        supabase.from('profiles').select('id, full_name, role, partner_status, is_suspended, is_super_admin, store_name, store_slug, created_at').order('created_at', { ascending: false }),
        supabase.from('products').select('id, name, seller_id, status, discount_price, created_at').order('created_at', { ascending: false }).limit(50),
        supabase.from('admin_actions_log').select('*').order('created_at', { ascending: false }).limit(30),
        supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(50),
      ])
      setUsers(u || [])
      setProducts(p || [])
      setLogs(l || [])
      setReports(r || [])
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
      show('Tindakan admin berhasil dieksekusi.', 'success')
      await refreshProfile()
      await loadAll()
    } catch (e) {
      show('Gagal mengeksekusi tindakan: ' + e.message, 'error')
    } finally {
      setActionLoading('')
    }
  }

  // Gates
  if (!user) return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-white text-center">
       <div className="text-6xl mb-8">🔐</div>
       <h2 className="text-2xl font-black text-[#1a1a2e] mb-2">Akses Terbatas</h2>
       <p className="text-gray-400 font-medium mb-10 max-w-[240px]">Hanya administrator yang dapat mengakses konsol ini.</p>
       <Button onClick={() => navigate('login')}>Login Admin</Button>
    </div>
  )

  if (!isSuperAdmin) return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-white text-center">
       <div className="text-6xl mb-8">🛡️</div>
       <h2 className="text-2xl font-black text-[#1a1a2e] mb-2">Izin Ditolak</h2>
       <p className="text-gray-400 font-medium mb-10 max-w-[240px]">Kamu membutuhkan hak akses Super Admin untuk melihat halaman ini.</p>
       <Button variant="secondary" onClick={() => navigate('home')}>Kembali ke Beranda</Button>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-[#F9FAFB]">
      {/* Header */}
      <div className="px-6 pt-14 pb-8 bg-white rounded-b-[40px] shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-8">
           <div className="flex flex-col">
              <h1 className="text-[26px] font-black text-[#1a1a2e] leading-tight">Admin Console</h1>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">Governance & Audit Trail</p>
           </div>
           <Card className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-soft" padding="p-0" style={{ background: 'rgba(239,68,68,0.1)' }}>🛡️</Card>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveTab('moderation')}
            className="flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300"
            style={{ 
              background: activeTab === 'moderation' ? '#1a1a2e' : '#F4F4F9', 
              color: activeTab === 'moderation' ? 'white' : '#6b7280',
              boxShadow: activeTab === 'moderation' ? '0 8px 24px rgba(26,26,46,0.2)' : 'none'
            }}
          >
            Moderasi
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className="flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3"
            style={{ 
              background: activeTab === 'reports' ? '#ef4444' : '#F4F4F9', 
              color: activeTab === 'reports' ? 'white' : '#6b7280',
              boxShadow: activeTab === 'reports' ? '0 8px 24px rgba(239,68,68,0.2)' : 'none'
            }}
          >
            Laporan
            {reports.filter(r => r.status === 'pending').length > 0 && (
              <span className="w-5 h-5 bg-white text-red-500 rounded-full flex items-center justify-center text-[10px] font-black">
                {reports.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="px-6 flex flex-col gap-8 pt-8">
        {activeTab === 'moderation' ? (
          <>
            {/* Action Context Card */}
            <Card padding="p-6" className="flex flex-col gap-6">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Konteks Tindakan</p>
              
              <div className="grid grid-cols-2 gap-3">
                {REASON_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setReasonCode(opt.id)}
                    className="py-3 rounded-2xl text-xs font-bold transition-all border-2"
                    style={{ 
                      background: reasonCode === opt.id ? '#1a1a2e' : '#F4F4F9', 
                      color: reasonCode === opt.id ? 'white' : '#6b7280',
                      borderColor: reasonCode === opt.id ? '#1a1a2e' : 'transparent'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <textarea
                value={reasonNote}
                onChange={e => setReasonNote(e.target.value)}
                rows={2}
                placeholder="Catatan investigasi wajib untuk audit..."
                className="w-full p-4 bg-[#F4F4F9] rounded-[24px] font-bold text-sm outline-none border-[1.5px] border-transparent focus:border-[#1a1a2e] transition-all resize-none shadow-inner"
              />
            </Card>

            {/* Users & Partners Management */}
            <div className="flex flex-col gap-4">
               <div className="flex items-center justify-between px-1">
                  <h3 className="font-black text-lg text-[#1a1a2e]">Users & Partners</h3>
                  <Badge variant="info" className="!px-2 !py-0.5 !text-[9px]">{users.length} Total</Badge>
               </div>
               
               <div className="flex flex-col gap-4">
                  {users.map(u => (
                    <Card key={u.id} padding="p-4" className="flex flex-col gap-4">
                       <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                             <p className="text-sm font-black text-[#1a1a2e] truncate uppercase tracking-tight">
                               {u.full_name || 'Anonymous User'} 
                               {u.is_super_admin && <span className="ml-2 text-[9px] text-red-500">🛡️ ROOT</span>}
                             </p>
                             <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
                               Role: {u.role} • Status: {u.is_suspended ? 'SUSPENDED' : 'ACTIVE'}
                             </p>
                          </div>
                          {u.partner_status && (
                             <Badge variant={u.partner_status === 'approved' ? 'success' : 'warning'} className="!px-1.5 !py-0 !text-[8px]">
                               {u.partner_status.toUpperCase()}
                             </Badge>
                          )}
                       </div>
                       
                       <div className="flex gap-2">
                          <Button 
                            variant="warning" 
                            fullWidth={false}
                            className="!h-9 !px-4 !text-[10px] !rounded-xl !uppercase !tracking-widest"
                            onClick={() => callRpc(`suspend-${u.id}`, () => supabase.rpc('admin_suspend_user', { p_target_user: u.id, p_reason_code: reasonCode, p_reason_note: reasonNote || null }))}
                            disabled={actionLoading === `suspend-${u.id}` || u.is_super_admin}
                            loading={actionLoading === `suspend-${u.id}`}
                          >
                             Suspend
                          </Button>
                          <Button 
                            variant="danger" 
                            fullWidth={false}
                            className="!h-9 !px-4 !text-[10px] !rounded-xl !uppercase !tracking-widest"
                            onClick={() => callRpc(`del-${u.id}`, () => supabase.rpc('admin_delete_account', { p_target_user: u.id, p_hard_delete: hardDelete, p_reason_code: reasonCode, p_reason_note: reasonNote || null }))}
                            disabled={actionLoading === `del-${u.id}` || u.is_super_admin}
                            loading={actionLoading === `del-${u.id}`}
                          >
                             {hardDelete ? 'Hard Delete' : 'Soft Delete'}
                          </Button>
                       </div>
                    </Card>
                  ))}
               </div>
               
               <label className="flex items-center gap-3 px-2 py-1 mt-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={hardDelete} 
                    onChange={e => setHardDelete(e.target.checked)} 
                    className="w-4 h-4 accent-[#ef4444]"
                  />
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-red-500 transition-colors">Prioritaskan Hard Delete Akun</span>
               </label>
            </div>

            {/* Products Governance */}
            <div className="flex flex-col gap-4">
               <h3 className="font-black text-lg text-[#1a1a2e] px-1">Recent Products</h3>
               <div className="flex flex-col gap-4">
                  {products.map(p => (
                    <Card key={p.id} padding="p-4" className="flex items-center justify-between gap-4">
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-[#1a1a2e] truncate uppercase">{p.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">
                            Status: {p.status} • Seller: {p.seller_id?.slice(0, 12)}...
                          </p>
                       </div>
                       <Button 
                         variant="danger" 
                         fullWidth={false}
                         className="!h-9 !px-4 !text-[10px] !rounded-xl !uppercase !tracking-widest flex-shrink-0"
                         onClick={() => callRpc(`prod-del-${p.id}`, () => supabase.rpc('admin_hard_delete_product', { p_product_id: p.id, p_reason_code: reasonCode, p_reason_note: reasonNote || null }))}
                         disabled={actionLoading === `prod-del-${p.id}`}
                         loading={actionLoading === `prod-del-${p.id}`}
                       >
                          Hard Delete
                       </Button>
                    </Card>
                  ))}
               </div>
            </div>

            {/* Audit Trail */}
            <Card padding="p-6">
              <h3 className="text-lg font-black text-[#1a1a2e] mb-6 flex items-center gap-2">
                 📝 Audit Trail
              </h3>
              <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                {logs.map(log => (
                  <div key={log.id} className="p-4 bg-gray-50 rounded-[20px] flex flex-col gap-1.5 border border-gray-100">
                    <div className="flex items-center justify-between">
                       <Badge variant="dark" className="!px-1.5 !py-0 !text-[8px]">{log.action_type}</Badge>
                       <span className="text-[10px] font-black text-gray-300">{new Date(log.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs font-bold text-[#1a1a2e]">Reason: {log.reason_code}</p>
                    <p className="text-[10px] text-gray-400 font-medium italic">"{log.reason_note || 'No additional notes.'}"</p>
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : (
          /* Reports Management */
          <div className="flex flex-col gap-6 animate-fade-in">
             <div className="flex items-center justify-between px-1">
                <h3 className="font-black text-lg text-[#1a1a2e]">Antrian Laporan</h3>
                <Badge variant="danger" className="!px-2 !py-0.5 !text-[9px]">{reports.filter(r => r.status === 'pending').length} Baru</Badge>
             </div>

             <div className="flex flex-col gap-5">
                {reports.length === 0 ? (
                  <Card padding="p-20" className="text-center flex flex-col items-center">
                     <div className="text-6xl mb-6">🏜️</div>
                     <p className="font-black text-[#1a1a2e]">Antrian Kosong</p>
                     <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-wide">Semua laporan telah ditindaklanjuti.</p>
                  </Card>
                ) : reports.map(r => (
                  <Card key={r.id} padding="p-5" className={`flex flex-col gap-4 border-2 transition-opacity duration-300 ${r.status !== 'pending' ? 'opacity-50 grayscale' : 'border-gray-50'}`}>
                    <div className="flex justify-between items-start">
                       <Badge variant={r.target_type === 'product' ? 'info' : 'warning'} className="!px-2 !py-0.5 !text-[9px] uppercase">
                         {r.target_type}
                       </Badge>
                       <span className="text-[10px] font-black text-gray-300">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <div>
                       <p className="text-sm font-black text-[#1a1a2e]">Reason: {r.reason}</p>
                       {r.details && (
                         <div className="mt-2 p-3 bg-red-50/50 rounded-xl border border-red-100/50">
                            <p className="text-xs text-gray-500 font-medium italic leading-relaxed">"{r.details}"</p>
                         </div>
                       )}
                    </div>
                    
                    <p className="text-[9px] font-bold text-gray-300 font-mono uppercase tracking-widest">Target ID: {r.target_id}</p>
                    
                    {r.status === 'pending' && (
                      <div className="flex gap-3 pt-3 border-t border-gray-50 mt-1">
                        <Button 
                          variant="success" 
                          className="!h-10 !text-[11px] !rounded-xl !uppercase !tracking-widest"
                          onClick={() => callRpc(`resolve-${r.id}`, () => supabase.from('reports').update({ status: 'resolved' }).eq('id', r.id))}
                          loading={actionLoading === `resolve-${r.id}`}
                        >
                          Tindak Selesai
                        </Button>
                        <Button 
                          variant="secondary" 
                          className="!h-10 !text-[11px] !rounded-xl !uppercase !tracking-widest"
                          onClick={() => callRpc(`dismiss-${r.id}`, () => supabase.from('reports').update({ status: 'dismissed' }).eq('id', r.id))}
                          loading={actionLoading === `dismiss-${r.id}`}
                        >
                          Abaikan
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
