import React, { useState, useEffect } from 'react'
import { Page, ToastMsg } from '../App'
import { useAuth } from '../lib/auth'
import { api } from '../lib/api'

interface Props {
  navigate: (p: Page, param?: string) => void
  tr: (key: string) => string
  addToast: (type: ToastMsg['type'], msg: string) => void
  userId?: string | null
}

export default function ProfilePage({ navigate, tr, addToast, userId }: Props) {
  const { user, setUser, language, setLanguage } = useAuth()
  const isOwn = !userId || userId === user?.userId
  const [profile, setProfile] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFn = isOwn ? api.profiles.me() : api.profiles.get(userId || '')
    fetchFn.then(p => { setProfile(p); setForm(p) }).catch(() => addToast('error', 'Profile not found')).finally(() => setLoading(false))
  }, [userId])

  async function save() {
    try {
      await api.profiles.update(form)
      setProfile(form)
      setUser({ displayName: form.displayName, profilePhotoUrl: form.profilePhotoUrl })
      setEditing(false)
      addToast('success', tr('general.success'))
    } catch (err: any) { addToast('error', err.message) }
  }

  if (loading) return <div className="flex items-center justify-center min-h-64"><div className="text-5xl animate-bounce">👤</div></div>
  if (!profile) return null

  const socials = [
    { key: 'linkedinUrl', icon: '💼', label: 'LinkedIn' },
    { key: 'instagramUrl', icon: '📸', label: 'Instagram' },
    { key: 'facebookUrl', icon: '📘', label: 'Facebook' },
    { key: 'twitterUrl', icon: '🐦', label: 'Twitter/X' },
    { key: 'tiktokUrl', icon: '🎵', label: 'TikTok' },
    { key: 'youtubeUrl', icon: '▶️', label: 'YouTube' },
    { key: 'websiteUrl', icon: '🌐', label: 'Website' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-4xl font-semibold text-bark">{isOwn ? 'My Profile' : profile.displayName}</h1>
          <p className="font-display italic text-bark-light mt-1">Ìwé Àkọsílẹ̀</p>
        </div>
        {isOwn && !editing && <button onClick={() => setEditing(true)} className="btn-outline">{tr('profile.edit')}</button>}
      </div>

      <div className="space-y-4">
        {/* Main card */}
        <div className="bg-warm-white rounded-3xl p-6 card-shadow border border-sand/30">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-full bg-gold/10 border-2 border-gold/20 flex items-center justify-center text-4xl overflow-hidden flex-shrink-0">
              {profile.profilePhotoUrl ? <img src={profile.profilePhotoUrl} className="w-full h-full object-cover" /> : '👤'}
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-bark mb-1">Display Name</label>
                    <input className="input-warm" value={form.displayName || ''} onChange={e => setForm((f: any) => ({...f, displayName: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-bark mb-1">{tr('profile.bio')}</label>
                    <textarea className="input-warm resize-none" rows={3} value={form.bio || ''} onChange={e => setForm((f: any) => ({...f, bio: e.target.value}))} placeholder="Tell your family about yourself..." />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-bark mb-1">{tr('profile.location')}</label>
                    <input className="input-warm" value={form.location || ''} onChange={e => setForm((f: any) => ({...f, location: e.target.value}))} placeholder="Lagos, Nigeria" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-bark mb-1">Profile Photo URL</label>
                    <input className="input-warm" value={form.profilePhotoUrl || ''} onChange={e => setForm((f: any) => ({...f, profilePhotoUrl: e.target.value}))} placeholder="https://..." />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-2xl font-semibold text-bark">{profile.displayName}</h2>
                  {profile.location && <p className="text-sm text-bark-light mt-1">📍 {profile.location}</p>}
                  {profile.bio && <p className="text-bark-light mt-3 leading-relaxed text-sm">{profile.bio}</p>}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Social links */}
        {(editing || socials.some(s => profile[s.key])) && (
          <div className="bg-warm-white rounded-2xl p-5 card-shadow border border-sand/30">
            <h3 className="font-display text-lg font-semibold text-bark mb-3">{tr('profile.social')}</h3>
            <div className="grid grid-cols-1 gap-2">
              {socials.map(s => editing ? (
                <div key={s.key} className="flex items-center gap-2">
                  <span className="w-6 text-center">{s.icon}</span>
                  <input className="input-warm flex-1 text-sm py-2" value={form[s.key] || ''} onChange={e => setForm((f: any) => ({...f, [s.key]: e.target.value}))} placeholder={`${s.label} URL`} />
                </div>
              ) : profile[s.key] ? (
                <a key={s.key} href={profile[s.key]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-bark-light hover:text-gold transition-colors">
                  <span>{s.icon}</span> {s.label}
                </a>
              ) : null)}
            </div>
          </div>
        )}

        {/* Language & Privacy */}
        {isOwn && (
          <div className="bg-warm-white rounded-2xl p-5 card-shadow border border-sand/30">
            <h3 className="font-display text-lg font-semibold text-bark mb-3">Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-bark mb-2">Language / Èdè</label>
                <div className="flex gap-2">
                  {(['en', 'yo'] as const).map(lang => (
                    <button key={lang} onClick={() => setLanguage(lang)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${language === lang ? 'bg-gold text-white shadow' : 'bg-cream text-bark-light border border-sand hover:bg-sand'}`}>
                      {lang === 'en' ? '🇬🇧 English' : '🇳🇬 Yorùbá'}
                    </button>
                  ))}
                </div>
              </div>
              {editing && (
                <>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={!!form.allowContact} onChange={e => setForm((f: any) => ({...f, allowContact: e.target.checked}))} className="w-4 h-4 accent-gold" />
                    <span className="text-sm text-bark">{tr('profile.allowContact')}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={!!form.showSocialLinks} onChange={e => setForm((f: any) => ({...f, showSocialLinks: e.target.checked}))} className="w-4 h-4 accent-gold" />
                    <span className="text-sm text-bark">{tr('profile.showSocial')}</span>
                  </label>
                </>
              )}
            </div>
          </div>
        )}

        {/* Save / Cancel */}
        {editing && (
          <div className="flex gap-3">
            <button onClick={() => setEditing(false)} className="btn-outline flex-1 justify-center">{tr('general.cancel')}</button>
            <button onClick={save} className="btn-gold flex-1 justify-center">{tr('profile.save')}</button>
          </div>
        )}
      </div>
    </div>
  )
}
