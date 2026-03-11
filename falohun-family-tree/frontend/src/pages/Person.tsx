import React, { useState, useEffect } from 'react'
import { Page, ToastMsg } from '../App'
import { useAuth } from '../lib/auth'
import { api } from '../lib/api'

interface Props {
  navigate: (p: Page, param?: string) => void
  tr: (key: string) => string
  addToast: (type: ToastMsg['type'], msg: string) => void
  personId?: string | null
}

export default function PersonPage({ navigate, tr, addToast, personId }: Props) {
  const { user } = useAuth()
  const [person, setPerson] = useState<any>(null)
  const [relationships, setRelationships] = useState<any[]>([])
  const [media, setMedia] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>({})

  useEffect(() => {
    if (!personId) return
    Promise.all([
      api.persons.get(personId).then(p => { setPerson(p); setForm(p) }),
      api.relationships.forPerson(personId).then(setRelationships),
      api.media.forPerson(personId).then(setMedia),
    ]).catch(() => addToast('error', 'Failed to load person')).finally(() => setLoading(false))
  }, [personId])

  async function saveEdit() {
    if (!personId) return
    try {
      await api.persons.update(personId, form)
      const updated = await api.persons.get(personId)
      setPerson(updated)
      setEditing(false)
      addToast('success', 'Updated!')
    } catch (err: any) { addToast('error', err.message) }
  }

  if (loading) return <div className="flex items-center justify-center min-h-64"><div className="text-5xl animate-bounce">🌳</div></div>
  if (!person) return <div className="text-center py-20"><p className="font-display text-2xl text-bark">Person not found</p></div>

  const canEdit = user?.userId === person.createdByUserId || user?.role === 'admin'
  const tags = JSON.parse(person.tags || '[]') as string[]

  const parents = relationships.filter(r => (r.fromPersonId === personId && r.relationshipType === 'PARENT') || (r.toPersonId === personId && r.relationshipType === 'CHILD'))
  const children = relationships.filter(r => (r.fromPersonId === personId && r.relationshipType === 'CHILD') || (r.toPersonId === personId && r.relationshipType === 'PARENT'))
  const spouses = relationships.filter(r => r.relationshipType === 'SPOUSE' || r.relationshipType === 'PARTNER')
  const siblings = relationships.filter(r => r.relationshipType === 'SIBLING')

  function relName(rel: any) {
    return rel.fromPersonId === personId ? rel.toName : rel.fromName
  }
  function relId(rel: any) {
    return rel.fromPersonId === personId ? rel.toPersonId : rel.fromPersonId
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <button onClick={() => navigate('directory')} className="text-bark-light/60 text-sm hover:text-bark-light mb-6 flex items-center gap-2 transition-colors">
        ← {tr('general.back')}
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-warm-white rounded-3xl p-6 card-shadow border border-sand/30 text-center">
            <div className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-gold/20 bg-gold/10 flex items-center justify-center text-5xl overflow-hidden shadow-lg">
              {person.profilePhotoUrl ? <img src={person.profilePhotoUrl} className="w-full h-full object-cover" /> : (person.gender === 'female' ? '👩' : '👨')}
            </div>
            <h1 className="font-display text-3xl font-semibold text-bark">{person.fullName}</h1>
            {person.nickname && <p className="text-bark-light italic mt-1">"{person.nickname}"</p>}
            {person.maidenName && <p className="text-sm text-bark-light">née {person.maidenName}</p>}
            
            <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-sm ${person.isLiving ? 'bg-leaf/10 text-leaf' : 'bg-bark/10 text-bark-light'}`}>
              <span>{person.isLiving ? '🟢' : '🕊️'}</span>
              {person.isLiving ? tr('general.living') : tr('general.deceased')}
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                {tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-sand/50 space-y-2 text-sm text-bark-light text-left">
              {person.birthDate && <p>🎂 {new Date(person.birthDate).toLocaleDateString()}</p>}
              {person.deathDate && <p>🕊️ {new Date(person.deathDate).toLocaleDateString()}</p>}
              {person.birthPlace && <p>📍 {person.birthPlace}</p>}
              {person.currentCity && <p>🏙️ {person.currentCity}</p>}
            </div>

            <div className="mt-4 flex gap-2">
              {canEdit && <button onClick={() => setEditing(true)} className="btn-outline text-sm flex-1 justify-center">{tr('person.edit')}</button>}
              <button onClick={() => navigate('tree', personId || undefined)} className="btn-gold text-sm flex-1 justify-center">🌳 Tree</button>
            </div>
          </div>

          {/* Family connections */}
          {[
            { label: 'Parents', items: parents, icon: '⬆️' },
            { label: 'Spouses', items: spouses, icon: '💑' },
            { label: 'Children', items: children, icon: '⬇️' },
            { label: 'Siblings', items: siblings, icon: '👫' },
          ].map(({ label, items, icon }) => items.length > 0 && (
            <div key={label} className="bg-warm-white rounded-2xl p-4 card-shadow border border-sand/30">
              <h3 className="font-display text-sm font-semibold text-bark mb-3">{icon} {label}</h3>
              <div className="space-y-2">
                {items.map(rel => (
                  <button key={rel.relationshipId} onClick={() => navigate('person', relId(rel))} className="flex items-center gap-2 w-full hover:bg-cream rounded-lg p-1.5 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-sm">👤</div>
                    <span className="text-sm text-bark">{relName(rel)}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-4">
          {person.biography && (
            <div className="bg-warm-white rounded-2xl p-6 card-shadow border border-sand/30">
              <h2 className="font-display text-xl font-semibold text-bark mb-3">Biography</h2>
              <p className="text-bark-light leading-relaxed">{person.biography}</p>
            </div>
          )}
          {person.culturalNotes && (
            <div className="bg-warm-white rounded-2xl p-6 card-shadow border border-sand/30 relative overflow-hidden">
              <div className="absolute inset-0 adinkra-pattern opacity-30" />
              <div className="relative">
                <h2 className="font-display text-xl font-semibold text-bark mb-3">🥁 Cultural Notes</h2>
                <p className="text-bark-light leading-relaxed">{person.culturalNotes}</p>
              </div>
            </div>
          )}
          {/* Media */}
          {media.length > 0 && (
            <div className="bg-warm-white rounded-2xl p-6 card-shadow border border-sand/30">
              <h2 className="font-display text-xl font-semibold text-bark mb-3">📸 Photos & Media</h2>
              <div className="grid grid-cols-3 gap-2">
                {media.map(m => (
                  <div key={m.mediaId} className="aspect-square rounded-lg overflow-hidden bg-cream border border-sand/50">
                    {m.type === 'photo' ? <img src={m.url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">🎬</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setEditing(false)}>
          <div className="absolute inset-0 bg-bark/30 backdrop-blur-sm" />
          <div className="relative bg-warm-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto card-shadow animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-sand/50 sticky top-0 bg-warm-white z-10">
              <h2 className="font-display text-2xl font-semibold text-bark">Edit Profile</h2>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: 'fullName', label: tr('person.fullName'), type: 'text' },
                { key: 'nickname', label: tr('person.nickname'), type: 'text' },
                { key: 'maidenName', label: tr('person.maidenName'), type: 'text' },
                { key: 'birthDate', label: tr('person.birthDate'), type: 'date' },
                { key: 'deathDate', label: tr('person.deathDate'), type: 'date' },
                { key: 'birthPlace', label: tr('person.birthPlace'), type: 'text' },
                { key: 'currentCity', label: tr('person.currentCity'), type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-bark mb-1.5">{f.label}</label>
                  <input className="input-warm" type={f.type} value={form[f.key] || ''} onChange={e => setForm((prev: any) => ({...prev, [f.key]: e.target.value}))} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-bark mb-1.5">{tr('person.biography')}</label>
                <textarea className="input-warm resize-none" rows={4} value={form.biography || ''} onChange={e => setForm((prev: any) => ({...prev, biography: e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-bark mb-1.5">{tr('person.culturalNotes')}</label>
                <textarea className="input-warm resize-none" rows={3} value={form.culturalNotes || ''} onChange={e => setForm((prev: any) => ({...prev, culturalNotes: e.target.value}))} />
              </div>
            </div>
            <div className="p-6 border-t border-sand/50 flex gap-3 sticky bottom-0 bg-warm-white">
              <button onClick={() => setEditing(false)} className="btn-outline flex-1 justify-center">{tr('general.cancel')}</button>
              <button onClick={saveEdit} className="btn-gold flex-1 justify-center">{tr('general.save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
