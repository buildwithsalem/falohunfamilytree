// components/tree/NodeContextMenu.tsx
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, UserPlus, Heart, Users, ChevronUp, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../i18n/useLanguage';

interface Props {
  personId: string;
  x: number;
  y: number;
  onClose: () => void;
  onExpandAncestors: () => void;
  onExpandDescendants: () => void;
  onAddParent: () => void;
  onAddChild: () => void;
  onAddSpouse: () => void;
}

export default function NodeContextMenu({
  personId, x, y, onClose,
  onExpandAncestors, onExpandDescendants,
  onAddParent, onAddChild, onAddSpouse,
}: Props) {
  const { t, language } = useLanguage();
  const en = language === 'en';
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Adjust position to stay in viewport
  const adjustedX = Math.min(x, window.innerWidth - 220);
  const adjustedY = Math.min(y, window.innerHeight - 350);

  const actions = [
    { label: en ? t('viewProfile') : t('viewProfile'), icon: User, action: null, to: `/people/${personId}`, color: 'text-charcoal-700' },
    { label: en ? t('addParent') : t('addParent'), icon: UserPlus, action: onAddParent, color: 'text-earth-600' },
    { label: en ? t('addChild') : t('addChild'), icon: UserPlus, action: onAddChild, color: 'text-earth-600' },
    { label: en ? t('addSpouse') : t('addSpouse'), icon: Heart, action: onAddSpouse, color: 'text-gold-600' },
    null,
    { label: en ? t('expandParents') : t('expandParents'), icon: ChevronUp, action: onExpandAncestors, color: 'text-forest-600' },
    { label: en ? t('expandChildren') : t('expandChildren'), icon: ChevronDown, action: onExpandDescendants, color: 'text-forest-600' },
  ];

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-white rounded-2xl shadow-warm-lg border border-earth-100 py-2 w-52 animate-fade-in"
      style={{ left: adjustedX, top: adjustedY }}
    >
      <div className="px-4 py-2 border-b border-earth-100 mb-1">
        <span className="font-sans text-xs font-semibold text-umber-500 uppercase tracking-widest">
          {en ? 'Family Actions' : 'Awọn Iṣe Idile'}
        </span>
      </div>
      {actions.map((action, i) =>
        action === null ? (
          <div key={i} className="border-t border-earth-100 my-1" />
        ) : action.to ? (
          <Link
            key={i}
            to={action.to}
            className={`flex items-center gap-3 px-4 py-2.5 hover:bg-earth-50 transition-colors ${action.color}`}
            onClick={onClose}
          >
            <action.icon className="w-4 h-4" />
            <span className="font-sans text-sm">{action.label}</span>
          </Link>
        ) : (
          <button
            key={i}
            onClick={action.action ?? undefined}
            className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-earth-50 transition-colors ${action.color}`}
          >
            <action.icon className="w-4 h-4" />
            <span className="font-sans text-sm">{action.label}</span>
          </button>
        )
      )}
    </div>
  );
}
