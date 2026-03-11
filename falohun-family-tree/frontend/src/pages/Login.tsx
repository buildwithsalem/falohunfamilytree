import React, { useState } from 'react'
import { Page, ToastMsg } from '../App'
import { useAuth } from '../lib/auth'
import { api } from '../lib/api'

interface Props {
  navigate: (p: Page) => void
  tr: (key: string) => string
  addToast: (type: ToastMsg['type'], msg: string) => void
}

export default function LoginPage({ navigate, tr, addToast }: Props) {
  const { login, language, setLanguage } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.auth.login(email, password) as any
      login(res.token, { userId: res.userId, email, role: res.role, displayName: res.displayName })
      navigate('dashboard')
    } catch (err: any) {
      addToast('error', err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center relative overflow-hidden">
      <div className="fixed inset-0 adinkra-pattern pointer-events-none" />
      <div className="fixed inset-0 bg-pattern pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="w-16 h-16 gold-gradient rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🌳</span>
          </div>
          <h1 className="font-display text-4xl font-semibold text-bark mb-2">{tr('auth.welcome')}</h1>
          <p className="text-bark-light">Falohun Family Tree</p>
        </div>

        {/* Lang toggle */}
        <div className="flex justify-center gap-2 mb-6">
          {(['en', 'yo'] as const).map(lang => (
            <button key={lang} onClick={() => setLanguage(lang)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${language === lang ? 'bg-gold text-white shadow' : 'bg-sand/50 text-bark-light hover:bg-sand'}`}>
              {lang === 'en' ? '🇬🇧 English' : '🇳🇬 Yorùbá'}
            </button>
          ))}
        </div>

        <div className="bg-warm-white rounded-3xl p-8 card-shadow border border-sand/50 animate-fade-in-delay-1">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-bark mb-1.5">{tr('auth.email')}</label>
              <input className="input-warm" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-bark mb-1.5">{tr('auth.password')}</label>
              <input className="input-warm" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full justify-center py-3 text-base">
              {loading ? tr('auth.loading') : tr('auth.login')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-sand/50 text-center">
            <p className="text-bark-light text-sm">
              {tr('auth.noAccount')}{' '}
              <button onClick={() => navigate('register')} className="text-gold font-medium hover:underline">
                {tr('nav.register')}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center mt-6">
          <button onClick={() => navigate('landing')} className="text-bark-light/60 text-sm hover:text-bark-light transition-colors">
            ← Back to home
          </button>
        </p>
      </div>
    </div>
  )
}
