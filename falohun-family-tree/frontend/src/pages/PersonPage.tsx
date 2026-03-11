// pages/PersonPage.tsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Edit, MapPin, Calendar, TreePine, Camera, 
  Linkedin, Instagram, Facebook, Twitter, Globe,
  MessageCircle, Share2, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuthStore } from '../lib/store';
import { useLanguage } from '../i18n/useLanguage';
import { Avatar, Badge, Button, Card, Skeleton } from '../components/ui';
import { formatDate, getAge } from '../lib/utils';
import type { Person, Media } from '../types';

export default function PersonPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const en = language === 'en';
  const [person, setPerson] = useState<Person | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'photos' | 'tree'>('about');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get<{ person: Person }>(`/persons/${id}`),
      api.get<{ media: Media[] }>(`/persons/${id}/media`),
    ]).then(([personRes, mediaRes]) => {
      setPerson(personRes.person);
      setMedia(mediaRes.media);
    }).catch(() => toast.error('Failed to load person'))
      .finally(() => setLoading(false));
  }, [id]);

  const age = person ? getAge(person.birthDate, person.deathDate) : null;
  const canEdit = user && (user.role === 'admin' || user.userId === person?.createdByUserId);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Skeleton className="h-64 rounded-3xl mb-6" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );

  if (!person) return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-center">
      <p className="font-body text-umber-600">Person not found</p>
      <Link to="/directory" className="btn-ghost mt-4 inline-block">← Back to Directory</Link>
    </div>
  );

  const socialLinks = [
    { url: person.linkedUserId, icon: Linkedin, label: 'LinkedIn', color: '#0077b5' },
    { url: null, icon: Instagram, label: 'Instagram', color: '#e4405f' },
    { url: null, icon: Facebook, label: 'Facebook', color: '#1877f2' },
    { url: null, icon: Twitter, label: 'Twitter / X', color: '#1da1f2' },
    { url: null, icon: Globe, label: 'Website', color: '#d4891f' },
  ].filter(s => s.url);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-charcoal-800 to-umber-900 mb-6">
        <div className="absolute inset-0 adire-texture opacity-20" />
        {/* Memorial banner */}
        {!person.isLiving && (
          <div className="relative z-10 bg-umber-700/60 text-center py-2 text-xs font-sans font-medium text-ivory-200 tracking-widest uppercase border-b border-umber-600">
            {en ? '✦ In Loving Memory ✦' : '✦ Ni Iranti Ifẹ ✦'}
          </div>
        )}
        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start gap-8">
          <div className="flex-shrink-0">
            <Avatar
              src={person.profilePhotoUrl}
              name={person.fullName}
              size="xl"
              className={`border-4 border-gold-500/40 shadow-warm-lg ${!person.isLiving ? 'grayscale opacity-90' : ''}`}
            />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant={person.isLiving ? 'forest' : 'gray'}>
                {person.isLiving ? (en ? '● Living' : '● Alãye') : (en ? '† In Memory' : '† Ni Iranti')}
              </Badge>
              {person.gender && (
                <Badge variant="earth">
                  {person.gender === 'male' ? (en ? 'Male' : 'Ọkùnrin') : person.gender === 'female' ? (en ? 'Female' : 'Obìnrin') : '—'}
                </Badge>
              )}
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-1">
              {person.fullName}
            </h1>
            {person.nickname && (
              <p className="font-display italic text-lg text-gold-300 mb-2">"{person.nickname}"</p>
            )}
            {person.maidenName && (
              <p className="font-sans text-sm text-ivory-300/70 mb-3">née {person.maidenName}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm font-sans text-ivory-300/80">
              {person.birthDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gold-400" />
                  {en ? 'Born' : 'Bí'} {formatDate(person.birthDate)}
                  {age && ` · ${age} ${t('years')}`}
                </div>
              )}
              {person.deathDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-umber-400" />
                  {en ? 'Passed' : 'Lọ'} {formatDate(person.deathDate)}
                </div>
              )}
              {(person.birthPlace || person.currentCity) && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-earth-400" />
                  {person.currentCity ?? person.birthPlace}
                </div>
              )}
            </div>
          </div>
          {/* Actions */}
          <div className="flex flex-row md:flex-col gap-2">
            {canEdit && (
              <Link to={`/people/${id}/edit`} className="btn-gold text-xs py-2 px-3 inline-flex items-center gap-1.5">
                <Edit className="w-3.5 h-3.5" />
                {t('edit')}
              </Link>
            )}
            {person.linkedUserId && person.linkedUserId !== user?.userId && (
              <Link to={`/messages/new?to=${person.linkedUserId}`} className="btn-ghost text-xs py-2 px-3 inline-flex items-center gap-1.5 border-white/30 text-white hover:bg-white/10">
                <MessageCircle className="w-3.5 h-3.5" />
                {en ? 'Message' : 'Firanṣẹ'}
              </Link>
            )}
            <Link to={`/tree?root=${id}`} className="btn-ghost text-xs py-2 px-3 inline-flex items-center gap-1.5 border-white/30 text-white hover:bg-white/10">
              <TreePine className="w-3.5 h-3.5" />
              {en ? 'View Tree' : 'Wo Igi'}
            </Link>
          </div>
        </div>
      </div>

      {/* Tags */}
      {person.tags && (
        <div className="flex flex-wrap gap-2 mb-6">
          {person.tags.split(',').map(tag => (
            <span key={tag} className="text-sm font-sans px-3 py-1 bg-earth-50 text-umber-700 rounded-full border border-earth-100">
              {tag.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-ivory-200 p-1 rounded-xl mb-6">
        {(['about', 'photos', 'tree'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-sans font-medium transition-all ${
              activeTab === tab
                ? 'bg-white text-earth-700 shadow-warm'
                : 'text-umber-500 hover:text-umber-700'
            }`}
          >
            {tab === 'about' ? (en ? 'About' : 'Nípa') : tab === 'photos' ? (en ? 'Photos & Media' : 'Awọn Fọto') : (en ? 'Family Tree' : 'Igi Idile')}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {person.biography && (
            <Card className="md:col-span-2">
              <h3 className="font-display text-lg font-semibold text-charcoal-800 mb-3">
                {en ? 'Biography' : 'Itan Aye'}
              </h3>
              <p className="font-body text-umber-700 leading-relaxed whitespace-pre-wrap">
                {person.biography}
              </p>
            </Card>
          )}
          {person.culturalNotes && (
            <Card className="md:col-span-2 bg-gradient-to-br from-earth-50 to-gold-50 border-gold-200">
              <h3 className="font-display text-lg font-semibold text-earth-800 mb-3">
                {en ? '🪘 Cultural Notes' : '🪘 Awọn Akọsilẹ Aṣa'}
              </h3>
              <p className="font-body text-earth-700 leading-relaxed">
                {person.culturalNotes}
              </p>
            </Card>
          )}
          <Card>
            <h3 className="font-display text-lg font-semibold text-charcoal-800 mb-4">
              {en ? 'Details' : 'Alaye'}
            </h3>
            <dl className="space-y-3">
              {[
                { label: en ? 'Full Name' : 'Orukọ Kikun', value: person.fullName },
                { label: en ? 'Birthplace' : 'Ibiti a bi', value: person.birthPlace },
                { label: en ? 'Current City' : 'Ilu Lọwọlọwọ', value: person.currentCity },
                { label: en ? 'Birth Date' : 'Ọjọ Ibi', value: person.birthDate ? formatDate(person.birthDate) : null },
                { label: en ? 'Date of Passing' : 'Ọjọ Ipadanu', value: person.deathDate ? formatDate(person.deathDate) : null },
              ].filter(d => d.value).map(d => (
                <div key={d.label} className="flex items-start gap-2">
                  <dt className="font-sans text-xs text-umber-500 w-28 flex-shrink-0 mt-0.5">{d.label}</dt>
                  <dd className="font-sans text-sm text-charcoal-800 font-medium">{d.value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      )}

      {activeTab === 'photos' && (
        <div>
          {canEdit && (
            <div className="mb-6">
              <label className="btn-ghost inline-flex items-center gap-2 cursor-pointer">
                <Camera className="w-4 h-4" />
                {t('uploadPhoto')}
                <input type="file" accept="image/*,video/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const form = new FormData();
                  form.append('file', file);
                  form.append('personId', id!);
                  form.append('type', file.type.startsWith('video') ? 'video' : 'photo');
                  try {
                    const res = await api.upload<{ media: Media }>('/media/upload', form);
                    setMedia(prev => [res.media, ...prev]);
                    toast.success('Media uploaded!');
                  } catch {
                    toast.error('Upload failed');
                  }
                }} />
              </label>
            </div>
          )}
          {media.length === 0 ? (
            <div className="text-center py-16 text-umber-400 font-body">
              {en ? 'No photos or videos yet' : 'Ko si awọn fọto tabi fidio sibẹ'}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {media.map(m => (
                <div key={m.mediaId} className="group relative rounded-xl overflow-hidden bg-umber-100 aspect-square">
                  {m.type === 'photo' ? (
                    <img src={m.url} alt={m.caption ?? ''} className="w-full h-full object-cover" />
                  ) : (
                    <video src={m.url} className="w-full h-full object-cover" />
                  )}
                  {m.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs font-sans text-white">{m.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'tree' && (
        <div className="text-center py-12">
          <TreePine className="w-12 h-12 text-earth-300 mx-auto mb-4" />
          <p className="font-body text-umber-600 mb-6">
            {en ? 'View this person in the interactive family tree' : 'Wo eniyan yii ni igi idile idawọle'}
          </p>
          <Link to={`/tree?root=${id}`} className="btn-primary inline-flex items-center gap-2">
            <TreePine className="w-4 h-4" />
            {en ? 'Open in Tree View' : 'Ṣii ni Wiwo Igi'}
          </Link>
        </div>
      )}
    </div>
  );
}
