import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Calendar, TreePine, MessageCircle, Edit, Trash2, ArrowLeft, Users, BookOpen, Music } from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../lib/store';
import { t } from '../i18n/translations';

export function PersonProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, lang } = useStore();
  const [person, setPerson] = useState<any>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.persons.get(id),
      api.persons.getRelationships(id),
    ]).then(([pd, rd]: any[]) => {
      setPerson(pd.person);
      setMedia(pd.media || []);
      setRelationships(rd.relationships || []);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl loading-shimmer" />)}
    </div>
  );

  if (!person) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <h2 className="font-display text-3xl text-earth-600">Person not found</h2>
      <Link to="/directory" className="mt-4 inline-block text-earth-500 hover:text-earth-700">← Back to directory</Link>
    </div>
  );

  const parents = relationships.filter(r => r.toPersonId === id && r.relationshipType === 'PARENT');
  const children = relationships.filter(r => r.fromPersonId === id && r.relationshipType === 'CHILD');
  const spouses = relationships.filter(r => (r.fromPersonId === id || r.toPersonId === id) && (r.relationshipType === 'SPOUSE' || r.relationshipType === 'PARTNER'));

  const genderGradient = person.gender === 'female'
    ? 'from-terracotta-600 to-terracotta-800'
    : 'from-earth-600 to-earth-800';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-earth-500 hover:text-earth-700 mb-6 transition-colors font-body text-sm">
        <ArrowLeft size={16} />
        {t('common.back', lang)}
      </button>

      {/* Hero */}
      <div className={`relative bg-gradient-to-br ${genderGradient} rounded-3xl p-8 mb-6 text-cream overflow-hidden`}>
        <div className="absolute inset-0 bg-adire opacity-20" />
        <div className="relative flex flex-col sm:flex-row items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center text-5xl font-bold text-white shadow-lg font-display flex-shrink-0">
            {person.fullName[0]}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-1">{person.fullName}</h1>
            {person.nickname && <p className="text-earth-200 italic text-lg mb-2">"{person.nickname}"</p>}
            {person.maidenName && <p className="text-earth-300 text-sm">née {person.maidenName}</p>}
            <div className="flex flex-wrap gap-3 mt-3 text-sm text-earth-200 font-body">
              {person.birthDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  {t('tree.born', lang)} {person.birthDate}
                  {person.deathDate && ` — ${t('tree.died', lang)} ${person.deathDate}`}
                </span>
              )}
              {(person.currentCity || person.birthPlace) && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} />
                  {person.currentCity || person.birthPlace}
                </span>
              )}
              {!person.isLiving && (
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs">Remembered</span>
              )}
              {person.isLiving && (
                <span className="px-3 py-1 bg-forest-500/40 rounded-full text-xs flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-forest-300" />
                  {t('tree.living', lang)}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {person.linkedUserId && (
              <button
                onClick={async () => {
                  try {
                    const d: any = await api.messages.createThread(person.linkedUserId);
                    navigate(`/messages`);
                  } catch {}
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-semibold transition-colors"
              >
                <MessageCircle size={15} />
                Message
              </button>
            )}
            <Link
              to={`/tree?person=${person.personId}`}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-semibold transition-colors"
            >
              <TreePine size={15} />
              View in Tree
            </Link>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Biography */}
          {person.biography && (
            <div className="bg-white rounded-3xl p-6 border border-earth-100 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={18} className="text-earth-500" />
                <h2 className="font-display text-xl font-semibold text-earth-800">{t('person.biography', lang)}</h2>
              </div>
              <p className="text-earth-600 font-body leading-relaxed whitespace-pre-wrap">{person.biography}</p>
            </div>
          )}

          {/* Cultural notes */}
          {person.culturalNotes && (
            <div className="bg-gradient-to-br from-gold-50 to-earth-50 rounded-3xl p-6 border border-gold-200 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Music size={18} className="text-gold-600" />
                <h2 className="font-display text-xl font-semibold text-earth-800">{t('person.culturalNotes', lang)}</h2>
              </div>
              <p className="text-earth-700 font-yoruba leading-relaxed whitespace-pre-wrap">{person.culturalNotes}</p>
            </div>
          )}

          {/* Media */}
          {media.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-earth-100 shadow-card">
              <h2 className="font-display text-xl font-semibold text-earth-800 mb-4">{t('person.media', lang)}</h2>
              <div className="grid grid-cols-3 gap-3">
                {media.map((m: any) => (
                  <div key={m.mediaId} className="aspect-square rounded-2xl overflow-hidden bg-earth-100">
                    {m.type === 'photo'
                      ? <img src={m.url} alt={m.caption || ''} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      : <video src={m.url} className="w-full h-full object-cover" />
                    }
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Relationships sidebar */}
        <div className="space-y-4">
          {[
            { label: 'Parents', rels: parents, getOther: (r: any) => r.fromPersonId === id ? r.toPersonId : r.fromPersonId },
            { label: 'Children', rels: children, getOther: (r: any) => r.toPersonId },
            { label: 'Spouse / Partner', rels: spouses, getOther: (r: any) => r.fromPersonId === id ? r.toPersonId : r.fromPersonId },
          ].filter(({ rels }) => rels.length > 0).map(({ label, rels, getOther }) => (
            <div key={label} className="bg-white rounded-3xl p-5 border border-earth-100 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-earth-400" />
                <h3 className="font-display text-base font-semibold text-earth-700">{label}</h3>
              </div>
              <div className="space-y-2">
                {rels.map((r: any) => {
                  const otherId = getOther(r);
                  return (
                    <Link
                      key={r.relationshipId}
                      to={`/persons/${otherId}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-earth-50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-earth-400 to-earth-600 flex items-center justify-center text-white text-sm font-bold">
                        {(r.fromPersonId === id ? r.toName : r.fromName)?.[0] || '?'}
                      </div>
                      <span className="text-sm text-earth-700 font-body group-hover:text-earth-900">
                        {r.fromPersonId === id ? r.toName : r.fromName}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Tags */}
          {person.tags && (
            <div className="bg-white rounded-3xl p-5 border border-earth-100 shadow-card">
              <h3 className="font-display text-base font-semibold text-earth-700 mb-3">{t('person.tags', lang)}</h3>
              <div className="flex flex-wrap gap-2">
                {(JSON.parse(person.tags) as string[]).map(tag => (
                  <span key={tag} className="px-3 py-1 bg-earth-100 text-earth-600 rounded-full text-xs font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
