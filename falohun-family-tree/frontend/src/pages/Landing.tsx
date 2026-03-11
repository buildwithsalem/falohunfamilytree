import React, { useEffect, useRef } from 'react'
import { Page } from '../App'
import { useAuth } from '../lib/auth'

interface Props {
  navigate: (p: Page) => void
  tr: (key: string) => string
}

export default function LandingPage({ navigate, tr }: Props) {
  const { user } = useAuth()

  if (user) {
    navigate('dashboard')
    return null
  }

  return (
    <div className="min-h-screen bg-warm-white overflow-hidden">
      {/* Decorative bg */}
      <div className="fixed inset-0 adinkra-pattern pointer-events-none" />
      <div className="fixed inset-0 bg-pattern pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center shadow-lg">
            <span className="text-white text-lg">🌳</span>
          </div>
          <span className="font-display text-2xl font-semibold text-bark">Falohun</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('login')} className="btn-outline text-sm">{tr('nav.login')}</button>
          <button onClick={() => navigate('register')} className="btn-gold text-sm">{tr('nav.register')}</button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-2 text-sm text-gold-dark font-medium mb-6">
            <span>🌿</span> Preserving Yoruba Heritage
          </div>
          <h1 className="font-display text-6xl md:text-8xl font-semibold text-bark leading-none mb-6">
            {tr('landing.title')}
          </h1>
          <p className="font-display text-2xl md:text-3xl text-bark-light italic font-light mb-4">
            {tr('landing.subtitle')}
          </p>
          <p className="text-bark-light/70 text-lg mb-10 max-w-xl mx-auto">
            {tr('landing.tagline')}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button onClick={() => navigate('register')} className="btn-gold text-base px-8 py-3">
              {tr('landing.cta.join')} →
            </button>
            <button onClick={() => navigate('login')} className="btn-outline text-base px-8 py-3">
              {tr('landing.cta.explore')}
            </button>
          </div>
        </div>

        {/* Tree illustration */}
        <div className="animate-fade-in-delay-2 mt-20 relative">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cream pointer-events-none z-10" />
            <div className="bg-warm-white border border-sand rounded-3xl p-8 shadow-2xl max-w-2xl mx-auto card-shadow">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-gold/20">
                    <span className="text-2xl">👴</span>
                  </div>
                  <p className="text-xs font-medium text-bark">Baba Falohun</p>
                  <p className="text-xs text-bark-light">1920–1998</p>
                </div>
              </div>
              <div className="w-px h-8 bg-gold/30 mx-auto" />
              <div className="flex items-start justify-center gap-16">
                {[{emoji:'👨',name:'Adeyemi',year:'1950'},
                  {emoji:'👩',name:'Funke',year:'1952'},
                  {emoji:'👨',name:'Dele',year:'1955'}].map((p,i) => (
                  <div key={i} className="text-center">
                    <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-gold/20">
                      <span className="text-xl">{p.emoji}</span>
                    </div>
                    <p className="text-xs font-medium text-bark">{p.name}</p>
                    <p className="text-xs text-bark-light">{p.year}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <h2 className="font-display text-4xl font-semibold text-center text-bark mb-12">
          Built for the Falohun Family
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '🌳', key: 'tree', color: 'bg-leaf/10 border-leaf/20' },
            { icon: '🥁', key: 'heritage', color: 'bg-terracotta/10 border-terracotta/20' },
            { icon: '💬', key: 'connect', color: 'bg-gold/10 border-gold/20' },
            { icon: '📸', key: 'media', color: 'bg-gold-dark/10 border-gold-dark/20' },
          ].map(({ icon, key, color }, i) => (
            <div key={i} className={`animate-fade-in bg-warm-white rounded-2xl p-6 border card-shadow card-hover`} style={{animationDelay: `${i * 0.1}s`}}>
              <div className={`w-12 h-12 ${color} border rounded-xl flex items-center justify-center text-2xl mb-4`}>
                {icon}
              </div>
              <h3 className="font-display text-xl font-semibold text-bark mb-2">{tr(`landing.feature.${key}`)}</h3>
              <p className="text-sm text-bark-light leading-relaxed">{tr(`landing.feature.${key}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-sand/50 py-8 text-center">
        <p className="text-bark-light/60 text-sm font-display italic">
          Ẹ jọ̀ ẹ jọkọ́ — Come, let us sit together
        </p>
        <p className="text-bark-light/40 text-xs mt-2">© 2024 Falohun Family Tree</p>
      </footer>
    </div>
  )
}
