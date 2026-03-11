import React, { useState, useEffect } from 'react'
import { Page, ToastMsg } from '../App'
import { api } from '../lib/api'

interface Props {
  navigate: (p: Page, param?: string) => void
  tr: (key: string) => string
  addToast: (type: ToastMsg['type'], msg: string) => void
}

export default function DirectoryPage({ navigate, tr, addToast }: Props) {
  const [persons, setPersons] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [filterGender, setFilterGender] = useState('')
  const [filterLiving, setFilterLiving] = useState('')

  useEffect(() => {
    api.persons.list().then(p => { setPersons(p); setFiltered(p) }).catch(() => addToast('error', 'Failed to load')).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let res = persons
    if (query) res = res.filter(p => p.fullName?.toLowerCase().includes(query.toLowerCase()) || p.nickname?.toLowerCase().includes(query.toLowerCase()) || p.birthPlace?.toLowerCase().includes(query.toLowerCase()))
    if (filterGender) res = res.filter(p => p.gender === filterGender)
    if (filterLiving !== '') res = res.filter(p => String(p.isLiving) === filterLiving)
    setFiltered(res)
  }, [query, persons, filterGender, filterLiving])

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold text-bark">Family Directory</h1>
          <p className="text-bark-light font-display italic mt-1">Àwọn Ọmọ Ìdílé — All family members</p>
        </div>
        <button onClick={() => navigate('tree')} className="btn-gold">🌳 View Tree</button>
      </div>

      {/* Search & Filters */}
      <div className="bg-warm-white rounded-2xl p-4 card-shadow border border-sand/30 mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-48">
          <input className="input-warm" placeholder={`🔍 ${tr('general.search')} family members...`} value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <select className="input-warm w-32" value={filterGender} onChange={e => setFilterGender(e.target.value)}>
          <option value="">All genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <select className="input-warm w-36" value={filterLiving} onChange={e => setFilterLiving(e.target.value)}>
          <option value="">All</option>
          <option value="1">Living</option>
          <option value="0">Deceased</option>
        </select>
        <span className="text-sm text-bark-light">{filtered.length} members</span>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-display text-2xl text-bark mb-2">No members found</p>
          <p className="text-bark-light">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((person, i) => (
            <button key={person.personId} onClick={() => navigate('person', person.personId)}
              className="bg-warm-white rounded-2xl p-5 card-shadow border border-sand/30 text-left card-hover animate-fade-in"
              style={{animationDelay:`${(i%12)*0.04}s`}}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gold/10 border-2 border-gold/20 flex items-center justify-center text-xl overflow-hidden flex-shrink-0">
                  {person.profilePhotoUrl ? <img src={person.profilePhotoUrl} className="w-full h-full object-cover" /> : (person.gender === 'female' ? '👩' : '👨')}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-bark text-sm truncate">{person.fullName}</p>
                  {person.nickname && <p className="text-xs text-bark-light italic">"{person.nickname}"</p>}
                </div>
              </div>
              <div className="space-y-1">
                {person.birthPlace && <p className="text-xs text-bark-light flex items-center gap-1"><span>📍</span>{person.birthPlace}</p>}
                <p className="text-xs text-bark-light flex items-center gap-1">
                  <span>{person.isLiving ? '🟢' : '🕊️'}</span>
                  {person.isLiving ? tr('general.living') : tr('general.deceased')}
                  {person.birthDate ? ` · ${new Date(person.birthDate).getFullYear()}` : ''}
                  {!person.isLiving && person.deathDate ? ` – ${new Date(person.deathDate).getFullYear()}` : ''}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
