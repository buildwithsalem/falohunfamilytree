import React, { useState } from 'react'
import { Page, ToastMsg } from '../App'
import { useAuth } from '../lib/auth'
import { api } from '../lib/api'

interface Props {
  navigate: (p: Page) => void
  tr: (key: string) => string
  addToast: (type: ToastMsg['type'], msg: string) => void
}

export default function RegisterPage({ navigate, tr, addToast }: Props) {
  const { login, language, setLanguage } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', displayName: '', inviteCode: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 8) { addToast('error', 'Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const res = await api.auth.register({ ...form, inviteCode: form.inviteCode || undefined }) as any
      if (res.token) {
        login(res.token, { userId: res.userId, email: form.email, role: 'member', displayName: form.displayName })
        navigate('dashboard')
      } else {
        addToast('success', res.message || 'Registration submitted! Awaiting approval.')
        navigate('login')
      }
    } catch (err: any) {
      addToast('error', err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center relative overflow-hidden py-8">
      <div className="fixed inset-0 adinkra-pattern pointer-events-none" />
      <div className="fixed inset-0 bg-pattern pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 gold-gradient rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🌱</span>
          </div>
          <h1 className="font-display text-4xl font-semibold text-bark mb-2">{tr('auth.joinFamily')}</h1>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {(['en', 'yo'] as const).map(lang => (
            <button key={lang} onClick={() => setLanguage(lang)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${language === lang ? 'bg-gold text-white shadow' : 'bg-sand/50 text-bark-light hover:bg-sand'}`}>
              {lang === 'en' ? '🇬🇧 English' : '🇳🇬 Yorùbá'}
            </button>
          ))}
        </div>

        <div className="bg-warm-white rounded-3xl p-8 card-shadow border border-sand/50 animate-fade-in-delay-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-bark mb-1.5">{tr('auth.displayName')}</label>
              <input className="input-warm" type="text" value={form.displayName} onChange={e => setForm(f => ({...f, displayName: e.target.value}))} placeholder="Adeyemi Falohun" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-bark mb-1.5">{tr('auth.email')}</label>
              <input className="input-warm" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="your@email.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-bark mb-1.5">{tr('auth.password')}</label>
              <input className="input-warm" type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} placeholder="Min. 8 characters" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-bark mb-1.5">{tr('auth.inviteCode')}</label>
              <input className="input-warm" type="text" value={form.inviteCode} onChange={e => setForm(f => ({...f, inviteCode: e.target.value}))} placeholder="INVITE-CODE" />
              <p className="text-xs text-bark-light mt-1">Without a code, your account needs admin approval</p>
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full justify-center py-3 text-base mt-2">
              {loading ? tr('auth.loading') : tr('auth.register')}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-sand/50 text-center">
            <p className="text-bark-light text-sm">
              {tr('auth.hasAccount')}{' '}
              <button onClick={() => navigate('login')} className="text-gold font-medium hover:underline">{tr('auth.login')}</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
