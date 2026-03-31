import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const REASON_OPTIONS = ['fraud', 'legal_request', 'spam', 'other']

export default function AdminConsole({ navigate }) {
  const { user, profile, refreshProfile } = useAuth()
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
    const [{ data: u }, { data: p }, { data: l }, { data: r }] = await Promise.all([
      supabase.from('profiles').select('id, full_name, role, partner_status, is_suspended, is_super_admin, store_name, store_slug, created_at').order('created_at', { ascending: false }),
      supabase.from('products').select('id, name, seller_id, status, discount_price, created_at').order('created_at', { ascending: false }).limit(40),
      supabase.from('admin_actions_log').select('*').order('created_at', { ascending: false }).limit(25),
      supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(30),
    ])
    setUsers(u || [])
    setProducts(p || [])
    setLogs(l || [])
    setReports(r || [])
    setLoading(false)
  }

  useEffect(() => {
    if (!user || !isSuperAdmin) return
    loadAll()
  }, [user, isSuperAdmin])

  const callRpc = async (label, fn) => {
    setActionLoading(label)
    await fn()
    await refreshProfile()
    await loadAll()
    setActionLoading('')
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-6">
        <p className="font-bold mb-2" style={{ color: '#1a1a2e' }}>Login untuk akses Admin Console</p>
        <button onClick={() => navigate('login')} className="px-6 py-3 rounded-xl text-white font-bold" style={{ background: '#3ec976' }}>
          Login
        </button>
      </div>
    )
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-6">
        <p className="font-bold mb-2" style={{ color: '#1a1a2e' }}>Akses Super Admin dibutuhkan</p>
        <button onClick={() => navigate('home')} className="px-6 py-3 rounded-xl text-white font-bold" style={{ background: '#3ec976' }}>
          Kembali
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen pb-28" style={{ background: '#F4F4F9' }}>
      <div className="px-4 pt-14 pb-4 bg-white">
        <h1 className="font-black text-xl" style={{ color: '#1a1a2e' }}>Admin Console</h1>
        <p className="text-xs text-gray-500">Moderasi akun, partner, dan produk dengan audit trail.</p>
        
        <div className="flex gap-2 mt-4">
          <button 
            onClick={() => setActiveTab('moderation')}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: activeTab === 'moderation' ? '#3ec976' : '#F4F4F9', color: activeTab === 'moderation' ? '#fff' : '#6b7280' }}
          >
            Moderasi
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            style={{ background: activeTab === 'reports' ? '#ef4444' : '#F4F4F9', color: activeTab === 'reports' ? '#fff' : '#6b7280' }}
          >
            Laporan {reports.filter(r => r.status === 'pending').length > 0 && <span className="w-4 h-4 bg-white text-red-500 rounded-full flex items-center justify-center text-[9px]">{reports.filter(r => r.status === 'pending').length}</span>}
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {activeTab === 'moderation' ? (
          <>
        <div className="bg-white rounded-2xl p-4">
          <p className="font-bold text-sm mb-2">Alasan Tindakan</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {REASON_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setReasonCode(opt)}
                className="py-2 rounded-xl text-xs font-bold"
                style={{ background: reasonCode === opt ? '#3ec976' : '#F4F4F9', color: reasonCode === opt ? '#fff' : '#6b7280' }}
              >
                {opt}
              </button>
            ))}
          </div>
          <textarea
            value={reasonNote}
            onChange={e => setReasonNote(e.target.value)}
            rows={2}
            placeholder="Catatan investigasi..."
            className="w-full p-3 rounded-xl text-sm outline-none"
            style={{ background: '#F4F4F9' }}
          />
        </div>

        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-sm">Users & Partners</p>
            {loading && <span className="text-xs text-gray-400">Loading...</span>}
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {users.map(u => (
              <div key={u.id} className="p-3 rounded-xl" style={{ background: '#F4F4F9' }}>
                <p className="text-xs font-bold">{u.full_name || 'No Name'} {u.is_super_admin ? '• SUPER ADMIN' : ''}</p>
                <p className="text-[11px] text-gray-500">{u.role} • {u.partner_status || 'none'} • {u.is_suspended ? 'suspended' : 'active'}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => callRpc(`suspend-${u.id}`, () => supabase.rpc('admin_suspend_user', { p_target_user: u.id, p_reason_code: reasonCode, p_reason_note: reasonNote || null }))}
                    disabled={actionLoading === `suspend-${u.id}` || u.is_super_admin}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                    style={{ background: '#f59e0b' }}
                  >
                    Suspend
                  </button>
                  <button
                    onClick={() => callRpc(`del-${u.id}`, () => supabase.rpc('admin_delete_account', { p_target_user: u.id, p_hard_delete: hardDelete, p_reason_code: reasonCode, p_reason_note: reasonNote || null }))}
                    disabled={actionLoading === `del-${u.id}` || u.is_super_admin}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                    style={{ background: '#ef4444' }}
                  >
                    {hardDelete ? 'Hard Delete' : 'Soft Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 mt-3 text-xs text-gray-600">
            <input type="checkbox" checked={hardDelete} onChange={e => setHardDelete(e.target.checked)} />
            Prioritaskan hard delete akun
          </label>
        </div>

        <div className="bg-white rounded-2xl p-4">
          <p className="font-bold text-sm mb-3">Products</p>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {products.map(p => (
              <div key={p.id} className="p-3 rounded-xl" style={{ background: '#F4F4F9' }}>
                <p className="text-xs font-bold">{p.name}</p>
                <p className="text-[11px] text-gray-500">{p.status} • seller: {p.seller_id?.slice(0, 8)}...</p>
                <button
                  onClick={() => callRpc(`prod-del-${p.id}`, () => supabase.rpc('admin_hard_delete_product', { p_product_id: p.id, p_reason_code: reasonCode, p_reason_note: reasonNote || null }))}
                  disabled={actionLoading === `prod-del-${p.id}`}
                  className="mt-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                  style={{ background: '#ef4444' }}
                >
                  Hard Delete Product
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4">
          <p className="font-bold text-sm mb-2">Audit Logs</p>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {logs.map(log => (
              <div key={log.id} className="p-2 rounded-lg text-[11px]" style={{ background: '#F4F4F9' }}>
                <p className="font-bold">{log.action_type} • {log.reason_code}</p>
                <p className="text-gray-500">{new Date(log.created_at).toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>
        </div>
        </>
        ) : (
          /* Reports Tab */
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4">
              <p className="font-bold text-sm mb-3">Laporan Antrian ({reports.filter(r => r.status === 'pending').length})</p>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {reports.length === 0 ? (
                  <p className="text-center py-10 text-xs text-gray-400">Tidak ada laporan masuk.</p>
                ) : reports.map(r => (
                  <div key={r.id} className="p-4 rounded-2xl border-2 border-gray-50" style={{ background: r.status === 'pending' ? '#fff' : '#F4F4F9', opacity: r.status === 'pending' ? 1 : 0.6 }}>
                    <div className="flex justify-between items-start mb-2">
                       <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase text-white" style={{ background: r.target_type === 'product' ? '#3b82f6' : '#f59e0b' }}>
                         {r.target_type}
                       </span>
                       <span className="text-[10px] text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-bold" style={{ color: '#1a1a2e' }}>Alasan: {r.reason}</p>
                    {r.details && <p className="text-xs text-gray-500 mt-1 italic">"{r.details}"</p>}
                    <p className="text-[10px] text-gray-400 mt-2">ID Target: {r.target_id}</p>
                    
                    {r.status === 'pending' && (
                      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                        <button 
                          onClick={() => callRpc(`resolve-${r.id}`, () => supabase.from('reports').update({ status: 'resolved' }).eq('id', r.id))}
                          className="flex-1 py-2 rounded-lg bg-green-50 text-green-600 text-xs font-bold"
                        >
                          Tandai Selesai
                        </button>
                        <button 
                          onClick={() => callRpc(`dismiss-${r.id}`, () => supabase.from('reports').update({ status: 'dismissed' }).eq('id', r.id))}
                          className="flex-1 py-2 rounded-lg bg-gray-50 text-gray-500 text-xs font-bold"
                        >
                          Abaikan
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
