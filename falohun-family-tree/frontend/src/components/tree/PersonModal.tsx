import React from 'react'

interface Props {
  person: any
  onClose: () => void
  onViewProfile: () => void
  onAddRelative: (mode: string) => void
  onExpand: (mode: string) => void
  tr: (key: string) => string
}

export default function PersonModal({ person, onClose, onViewProfile, onAddRelative, onExpand, tr }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-bark/30 backdrop-blur-sm" />
      <div className="relative bg-warm-white rounded-3xl p-6 w-80 card-shadow border border-sand/50 animate-fade-in" onClick={e => e.stopPropagation()}>
        {/* Person info */}
        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-sand/50">
          <div className="w-14 h-14 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center text-2xl overflow-hidden">
            {person.profilePhotoUrl ? <img src={person.profilePhotoUrl} className="w-full h-full object-cover" /> : (person.gender === 'female' ? '👩' : '👨')}
          </div>
          <div>
            <p className="font-semibold text-bark">{person.fullName}</p>
            {person.nickname && <p className="text-sm text-bark-light italic">"{person.nickname}"</p>}
            <p className="text-xs text-bark-light">
              {person.birthDate ? new Date(person.birthDate).getFullYear() : '?'}
              {!person.isLiving ? (person.deathDate ? ` – ${new Date(person.deathDate).getFullYear()}` : ' †') : ' · Living'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <button onClick={onViewProfile} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gold/8 transition-colors flex items-center gap-3 text-sm">
            <span>👤</span> <span className="text-bark">{tr('person.viewProfile')}</span>
          </button>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: '⬆️', label: tr('person.addParent'), mode: 'parent' },
              { icon: '⬇️', label: tr('person.addChild'), mode: 'child' },
              { icon: '💑', label: tr('person.addSpouse'), mode: 'spouse' },
              { icon: '👫', label: tr('person.addSibling'), mode: 'sibling' },
            ].map(({ icon, label, mode }) => (
              <button key={mode} onClick={() => onAddRelative(mode)}
                className="px-3 py-2.5 rounded-xl bg-cream hover:bg-gold/10 transition-colors flex items-center gap-2 text-xs text-bark border border-sand/50">
                <span>{icon}</span> <span>{label}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button onClick={() => onExpand('ancestors')} className="btn-outline text-xs py-2 justify-center">{tr('tree.expandAncestors')}</button>
            <button onClick={() => onExpand('descendants')} className="btn-outline text-xs py-2 justify-center">{tr('tree.expandDescendants')}</button>
          </div>
          <button onClick={() => onExpand('focus')} className="w-full btn-gold text-sm py-2 justify-center">🎯 Focus on this person</button>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-cream flex items-center justify-center text-bark-light hover:text-bark hover:bg-sand transition-colors text-sm">✕</button>
      </div>
    </div>
  )
}
