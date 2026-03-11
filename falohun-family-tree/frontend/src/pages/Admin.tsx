import React, { useState, useEffect } from 'react'
import { Page, ToastMsg } from '../App'
import { api } from '../lib/api'

interface Props {
  navigate: (p: Page) => void
  tr: (key: string) => string
  addToast: (type: ToastMsg['type'], msg: string) => void
}

export default function AdminPage({ navigate, tr, addToast }: Props) {
  const [tab, setTab] = useState<'overview' | 'users' | 'invites'>('overview')
  const [users, setUsers] = useState<any[]>([])
  const [invites, setInvites] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.admin.stats().then(setStats).catch(() => {})
    api.admin.users().then(setUsers).catch(() => {})
    api.admin.invites().then(setInvites).catch(() => {})
  }, [])

  async function approveUser(userId: string) {
    try {
      await api.admin.approveUser(userId)
      setUsers(prev => prev.map(u => u.userId === userId ? {...u, isApproved: 1} : u))
      addToast('success', 'User approved')
    } catch { addToast('error', 'Failed') }
  }

  async function createInvite() {
    try {
      const inv = await api.admin.createInvite() as any
      setInvites(prev => [inv, ...prev])
      addToast('success', `Invite code: ${inv.code}`)
    } catch { addToast('error', 'Failed') }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center text-white">⚙️</div>
        <div>
          <h1 className="font-display text-4xl font-semibold text-bark">Admin Panel</h1>
          <p className="text-bark-light font-display italic text-sm">Alákòóso Ìdílé</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['overview', 'users', 'invites'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? 'bg-gold text-white shadow' : 'bg-warm-white text-bark-light border border-sand hover:bg-sand'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          {[
            { icon: '👥', label: 'Total Users', value: stats.users || 0, color: 'text-gold' },
            { icon: '🌱', label: 'Family Members', value: stats.persons || 0, color: 'text-leaf' },
            { icon: '🔗', label: 'Relationships', value: stats.relationships || 0, color: 'text-terracotta' },
            { icon: '📸', label: 'Media Files', value: stats.media || 0, color: 'text-bark-light' },
          ].map((s, i) => (
            <div key={i} className="bg-warm-white rounded-2xl p-5 card-shadow border border-sand/30">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className={`font-display text-4xl font-semibold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-bark-light mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="bg-warm-white rounded-2xl card-shadow border border-sand/30 overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-sand/50 flex items-center justify-between">
            <h2 className="font-semibold text-bark">{users.length} Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream text-bark-light text-xs uppercase">
                <tr>
                  {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.userId} className="border-t border-sand/30 hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-bark">{u.displayName}</td>
                    <td className="px-4 py-3 text-bark-light">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`tag ${u.role === 'admin' ? 'bg-gold/20 text-gold-dark' : ''}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`tag ${u.isApproved ? 'bg-leaf/10 text-leaf' : 'bg-terracotta/10 text-terracotta'}`}>
                        {u.isApproved ? '✓ Active' : '⏳ Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-bark-light text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {!u.isApproved && (
                        <button onClick={() => approveUser(u.userId)} className="text-xs bg-leaf/10 text-leaf px-3 py-1 rounded-lg hover:bg-leaf/20 transition-colors">Approve</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'invites' && (
        <div className="animate-fade-in">
          <div className="flex justify-end mb-4">
            <button onClick={createInvite} className="btn-gold">+ Create Invite Code</button>
          </div>
          <div className="bg-warm-white rounded-2xl card-shadow border border-sand/30 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream text-bark-light text-xs uppercase">
                <tr>
                  {['Code', 'Status', 'Expires', 'Created'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invites.map(inv => (
                  <tr key={inv.inviteId} className="border-t border-sand/30">
                    <td className="px-4 py-3"><code className="bg-cream px-2 py-1 rounded text-gold-dark font-mono">{inv.code}</code></td>
                    <td className="px-4 py-3"><span className={`tag ${inv.isUsed ? 'opacity-50' : 'bg-leaf/10 text-leaf'}`}>{inv.isUsed ? 'Used' : 'Active'}</span></td>
                    <td className="px-4 py-3 text-bark-light text-xs">{inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString() : 'Never'}</td>
                    <td className="px-4 py-3 text-bark-light text-xs">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
