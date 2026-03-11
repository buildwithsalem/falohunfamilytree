import React, { useState, useEffect } from 'react'
import { Page, ToastMsg } from '../App'
import { useAuth } from '../lib/auth'
import { api } from '../lib/api'

interface Props {
  navigate: (p: Page, param?: string) => void
  tr: (key: string) => string
  addToast: (type: ToastMsg['type'], msg: string) => void
}

export default function DashboardPage({ navigate, tr, addToast }: Props) {
  const { user } = useAuth()
  const [stats, setStats] = useState({ persons: 0, relationships: 0, media: 0, messages: 0 })
  const [recentPersons, setRecentPersons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.persons.list().then(p => setRecentPersons(p.slice(0, 6))).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const quickActions = [
    { icon: '👤', label: tr('dashboard.addPerson'), action: () => {}, desc: 'Add a new family member' },
    { icon: '🌳', label: tr('dashboard.viewTree'), action: () => navigate('tree'), desc: 'Explore the family tree' },
    { icon: '💬', label: tr('dashboard.messages'), action: () => navigate('messages'), desc: 'Message relatives' },
    { icon: '🔍', label: tr('nav.directory'), action: () => navigate('directory'), desc: 'Search family members' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Welcome */}
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-5xl font-semibold text-bark">
          {tr('dashboard.welcome')}, <span className="text-gold">{user?.displayName}</span>
        </h1>
        <p className="text-bark-light mt-2 font-display italic text-lg">Ẹ káàbọ̀ sí igi ìdílé wa</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '👥', label: tr('dashboard.members'), value: recentPersons.length, color: 'text-gold' },
          { icon: '🔗', label: tr('dashboard.relationships'), value: stats.relationships, color: 'text-leaf' },
          { icon: '📸', label: tr('dashboard.photos'), value: stats.media, color: 'text-terracotta' },
          { icon: '💬', label: tr('dashboard.messages'), value: stats.messages, color: 'text-bark-light' },
        ].map((stat, i) => (
          <div key={i} className="bg-warm-white rounded-2xl p-5 card-shadow border border-sand/30 animate-fade-in card-hover" style={{animationDelay:`${i*0.08}s`}}>
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className={`font-display text-4xl font-semibold ${stat.color}`}>{loading ? '—' : stat.value}</div>
            <div className="text-sm text-bark-light mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <h2 className="font-display text-2xl font-semibold text-bark mb-4">{tr('dashboard.quickActions')}</h2>
          <div className="space-y-3">
            {quickActions.map((action, i) => (
              <button key={i} onClick={action.action} className="w-full bg-warm-white rounded-xl p-4 card-shadow border border-sand/30 flex items-center gap-4 text-left card-hover animate-fade-in" style={{animationDelay:`${i*0.06}s`}}>
                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{action.icon}</div>
                <div>
                  <div className="font-medium text-bark text-sm">{action.label}</div>
                  <div className="text-xs text-bark-light">{action.desc}</div>
                </div>
                <span className="ml-auto text-gold opacity-50">→</span>
              </button>
            ))}
          </div>

          {/* Heritage banner */}
          <div className="mt-4 rounded-2xl p-5 text-white relative overflow-hidden" style={{background: 'linear-gradient(135deg, #3D2B1F 0%, #6B4C3B 100%)'}}>
            <div className="absolute inset-0 adinkra-pattern opacity-20" />
            <div className="relative">
              <p className="font-display text-lg font-semibold mb-1">Yoruba Heritage</p>
              <p className="text-sand/80 text-sm italic">"Ẹni tí ò mọ ibi tó ti wá, kò lè mọ ibi tó ń lọ"</p>
              <p className="text-sand/60 text-xs mt-1">One who doesn't know where they came from can't know where they're going</p>
            </div>
          </div>
        </div>

        {/* Recent family members */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-semibold text-bark">{tr('dashboard.familyStats')}</h2>
            <button onClick={() => navigate('directory')} className="text-gold text-sm hover:underline">View all →</button>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
            </div>
          ) : recentPersons.length === 0 ? (
            <div className="bg-warm-white rounded-2xl p-12 text-center card-shadow border border-sand/30">
              <div className="text-5xl mb-4">🌱</div>
              <p className="font-display text-xl text-bark mb-2">Start Your Family Tree</p>
              <p className="text-bark-light text-sm mb-4">Add the first member of your family to begin</p>
              <button className="btn-gold text-sm">{tr('dashboard.addPerson')}</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {recentPersons.map((person, i) => (
                <button key={person.personId} onClick={() => navigate('person', person.personId)}
                  className="bg-warm-white rounded-xl p-4 card-shadow border border-sand/30 text-left card-hover animate-fade-in"
                  style={{animationDelay:`${i*0.05}s`}}>
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-3 text-xl border border-gold/20 overflow-hidden">
                    {person.profilePhotoUrl ? <img src={person.profilePhotoUrl} className="w-full h-full object-cover" /> : (person.gender === 'female' ? '👩' : '👨')}
                  </div>
                  <p className="font-medium text-bark text-sm text-center truncate">{person.fullName}</p>
                  <p className="text-xs text-bark-light text-center">
                    {person.birthDate ? new Date(person.birthDate).getFullYear() : '—'}
                    {!person.isLiving && ' †'}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
