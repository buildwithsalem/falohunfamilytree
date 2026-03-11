import React, { useState } from 'react'
import { api } from '../../lib/api'
import { ToastMsg } from '../../App'

interface Props {
  mode: string
  relativeTo?: any
  persons: any[]
  onClose: () => void
  onSaved: (person: any) => void
  addToast: (type: ToastMsg['type'], msg: string) => void
  tr: (key: string) => string
}

const relTypeMap: Record<string, string> = {
  parent: 'PARENT', child: 'CHILD', spouse: 'SPOUSE', sibling: 'SIBLING', partner: 'PARTNER'
}

export default function AddPersonModal({ mode, relativeTo, persons, onClose, onSaved, addToast, tr }: Props) {
  const [tab, setTab] = useState<'new' | 'existing'>('new')
  const [form, setForm] = useState({ fullName: '', nickname: '', gender: '', birthDate: '', birthPlace: '', isLiving: true, biography: '', culturalNotes: '' })
  const [existingId, setExistingId] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    try {
      let personId: string
      let person: any
      if (tab === 'new') {
        if (!form.fullName) { addToast('error', 'Name is required'); setLoading(false); return }
        person = await api.persons.create(form)
        personId = person.personId
      } else {
        personId = existingId
        person = persons.find(p => p.personId === personId)
      }

      if (relativeTo && mode && relTypeMap[mode]) {
        const relType = relTypeMap[mode]
        if (mode === 'parent' || mode === 'spouse' || mode === 'sibling') {
          await api.relationships.create({ fromPersonId: personId, toPersonId: relativeTo.personId, relationshipType: relType })
        } else {
          await api.relationships.create({ fromPersonId: relativeTo.personId, toPersonId: personId, relationshipType: relType })
        }
      }

      onSaved(person)
    } catch (err: any) {
      addToast('error', err.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const modeLabel = mode ? `Add ${mode.charAt(0).toUpperCase() + mode.slice(1)}` : 'Add Person'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-bark/30 backdrop-blur-sm" />
      <div className="relative bg-warm-white rounded-3xl w-full max-w-lg card-shadow border border-sand/50 animate-fade-in overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-sand/50">
          <h2 className="font-display text-2xl font-semibold text-bark">{modeLabel}</h2>
          {relativeTo && <p className="text-sm text-bark-light mt-1">Relative of: {relativeTo.fullName}</p>}
        </div>

        {relativeTo && (
          <div className="flex gap-1 px-6 pt-4">
            {(['new', 'existing'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-gold text-white' : 'bg-cream text-bark-light hover:bg-sand'}`}>
                {t === 'new' ? '+ New Person' : 'Existing Person'}
              </button>
            ))}
          </div>
        )}

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {tab === 'existing' && relativeTo ? (
            <div>
              <label className="block text-sm font-medium text-bark mb-1.5">Select person</label>
              <select className="input-warm" value={existingId} onChange={e => setExistingId(e.target.value)}>
                <option value="">Choose...</option>
                {persons.filter(p => p.personId !== relativeTo?.personId).map(p => (
                  <option key={p.personId} value={p.personId}>{p.fullName}</option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-bark mb-1.5">{tr('person.fullName')} *</label>
                  <input className="input-warm" value={form.fullName} onChange={e => setForm(f=>({...f,fullName:e.target.value}))} placeholder="Adeyemi Falohun" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bark mb-1.5">{tr('person.nickname')}</label>
                  <input className="input-warm" value={form.nickname} onChange={e => setForm(f=>({...f,nickname:e.target.value}))} placeholder="Yemi" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bark mb-1.5">{tr('person.gender')}</label>
                  <select className="input-warm" value={form.gender} onChange={e => setForm(f=>({...f,gender:e.target.value}))}>
                    <option value="">Unknown</option>
                    <option value="male">{tr('person.gender.male')}</option>
                    <option value="female">{tr('person.gender.female')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-bark mb-1.5">{tr('person.birthDate')}</label>
                  <input className="input-warm" type="date" value={form.birthDate} onChange={e => setForm(f=>({...f,birthDate:e.target.value}))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bark mb-1.5">{tr('person.birthPlace')}</label>
                  <input className="input-warm" value={form.birthPlace} onChange={e => setForm(f=>({...f,birthPlace:e.target.value}))} placeholder="Lagos, Nigeria" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-bark mb-1.5">{tr('person.biography')}</label>
                <textarea className="input-warm resize-none" rows={2} value={form.biography} onChange={e => setForm(f=>({...f,biography:e.target.value}))} placeholder="A brief story..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-bark mb-1.5">{tr('person.culturalNotes')}</label>
                <textarea className="input-warm resize-none" rows={2} value={form.culturalNotes} onChange={e => setForm(f=>({...f,culturalNotes:e.target.value}))} placeholder="Cultural traditions, titles, clan..." />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isLiving} onChange={e => setForm(f=>({...f,isLiving:e.target.checked}))} className="w-4 h-4 accent-gold" />
                <span className="text-sm text-bark">{tr('person.isLiving')}</span>
              </label>
            </>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1 justify-center">{tr('general.cancel')}</button>
          <button onClick={handleSave} disabled={loading} className="btn-gold flex-1 justify-center">
            {loading ? tr('general.loading') : tr('general.save')}
          </button>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-cream flex items-center justify-center text-bark-light hover:text-bark">✕</button>
      </div>
    </div>
  )
}
