import React, { useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { User, Plus, Eye, UserPlus, Heart, Users, ChevronDown } from 'lucide-react';
import { useStore } from '../../lib/store';
import { t } from '../../i18n/translations';

interface PersonData {
  personId: string;
  fullName: string;
  nickname: string | null;
  birthYear: string | null;
  deathYear: string | null;
  gender: string | null;
  isLiving: boolean;
  profilePhotoUrl: string | null;
  linkedUserId: string | null;
  onExpand?: (id: string, type: 'ancestors' | 'descendants') => void;
  onAction?: (id: string, action: string) => void;
  isRoot?: boolean;
}

export function PersonNode({ data, selected }: NodeProps<PersonData>) {
  const { lang } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const genderColor = data.gender === 'female'
    ? 'from-terracotta-400 to-terracotta-600'
    : data.gender === 'male'
    ? 'from-earth-500 to-earth-700'
    : 'from-earth-400 to-earth-500';

  const handleAction = useCallback((action: string) => {
    setMenuOpen(false);
    data.onAction?.(data.personId, action);
  }, [data]);

  return (
    <div className={`relative group ${data.isRoot ? 'z-10' : ''}`}>
      <Handle type="target" position={Position.Top} className="!bg-gold-400 !border-gold-600 !w-3 !h-3" />

      <div
        className={`bg-white rounded-2xl border-2 transition-all cursor-pointer w-44 overflow-visible shadow-card hover:shadow-warm ${
          selected ? 'border-gold-400 shadow-glow' : data.isRoot ? 'border-earth-400' : 'border-earth-100 hover:border-earth-300'
        }`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {/* Root indicator */}
        {data.isRoot && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gold-400 rounded-full text-xs font-bold text-white whitespace-nowrap z-10 shadow-sm">
            Root
          </div>
        )}

        {/* Avatar */}
        <div className={`h-16 bg-gradient-to-br ${genderColor} flex items-center justify-center rounded-t-xl relative`}>
          {data.profilePhotoUrl ? (
            <img src={data.profilePhotoUrl} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white/40" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{data.fullName[0]}</span>
            </div>
          )}
          {/* Living indicator */}
          {data.isLiving && (
            <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-forest-400 border border-white" title="Living" />
          )}
          {data.linkedUserId && (
            <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-gold-400 flex items-center justify-center" title="Has account">
              <User size={10} className="text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 pb-3">
          <div className="font-semibold text-earth-800 text-sm leading-tight truncate" title={data.fullName}>
            {data.fullName}
          </div>
          {data.nickname && (
            <div className="text-xs text-earth-400 italic truncate">"{data.nickname}"</div>
          )}
          <div className="flex items-center gap-1 mt-1 text-xs text-earth-400 font-body">
            {data.birthYear && <span>{data.birthYear}</span>}
            {data.birthYear && (data.deathYear || !data.isLiving) && <span>–</span>}
            {data.deathYear && <span>{data.deathYear}</span>}
            {!data.deathYear && !data.isLiving && <span>†</span>}
          </div>
        </div>

        {/* Action button */}
        <div className="px-3 pb-3">
          <button
            className="w-full flex items-center justify-center gap-1 py-1.5 bg-earth-50 hover:bg-earth-100 rounded-lg text-xs text-earth-600 font-semibold transition-colors"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          >
            <Plus size={12} />
            Actions
            <ChevronDown size={12} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Context menu */}
      {menuOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-2xl shadow-2xl border border-earth-100 z-50 w-52 overflow-hidden animate-fade-in">
          <div className="p-2 space-y-0.5">
            <button onClick={() => handleAction('view')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-earth-700 hover:bg-earth-50 rounded-xl transition-colors">
              <Eye size={15} className="text-earth-400" />
              {t('tree.viewProfile', lang)}
            </button>
            <button onClick={() => handleAction('addParent')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-earth-700 hover:bg-earth-50 rounded-xl transition-colors">
              <UserPlus size={15} className="text-forest-500" />
              {t('tree.addParent', lang)}
            </button>
            <button onClick={() => handleAction('addChild')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-earth-700 hover:bg-earth-50 rounded-xl transition-colors">
              <UserPlus size={15} className="text-earth-500" />
              {t('tree.addChild', lang)}
            </button>
            <button onClick={() => handleAction('addSpouse')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-earth-700 hover:bg-earth-50 rounded-xl transition-colors">
              <Heart size={15} className="text-terracotta-500" />
              {t('tree.addSpouse', lang)}
            </button>
            <button onClick={() => handleAction('addSibling')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-earth-700 hover:bg-earth-50 rounded-xl transition-colors">
              <Users size={15} className="text-gold-600" />
              {t('tree.addSibling', lang)}
            </button>
            <div className="h-px bg-earth-100 my-1" />
            <button onClick={() => { data.onExpand?.(data.personId, 'ancestors'); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-earth-700 hover:bg-gold-50 rounded-xl transition-colors">
              <ChevronDown size={15} className="text-gold-600 rotate-180" />
              {t('tree.expandAncestors', lang)}
            </button>
            <button onClick={() => { data.onExpand?.(data.personId, 'descendants'); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-earth-700 hover:bg-gold-50 rounded-xl transition-colors">
              <ChevronDown size={15} className="text-gold-600" />
              {t('tree.expandDescendants', lang)}
            </button>
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-gold-400 !border-gold-600 !w-3 !h-3" />
    </div>
  );
}
