// pages/DirectoryPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Users, TreePine } from 'lucide-react';
import { api } from '../lib/api';
import { useLanguage } from '../i18n/useLanguage';
import { Avatar, Badge, Skeleton, EmptyState, SectionHeader } from '../components/ui';
import { getAge } from '../lib/utils';
import type { Person } from '../types';

export default function DirectoryPage() {
  const { t, language } = useLanguage();
  const en = language === 'en';
  const [persons, setPersons] = useState<Person[]>([]);
  const [filtered, setFiltered] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'living' | 'memorial'>('all');

  useEffect(() => {
    api.get<{ persons: Person[] }>('/persons')
      .then(d => { setPersons(d.persons); setFiltered(d.persons); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = persons;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.fullName.toLowerCase().includes(q) ||
        p.nickname?.toLowerCase().includes(q) ||
        p.maidenName?.toLowerCase().includes(q) ||
        p.birthPlace?.toLowerCase().includes(q) ||
        p.currentCity?.toLowerCase().includes(q) ||
        p.tags?.toLowerCase().includes(q)
      );
    }
    if (locationFilter) {
      const l = locationFilter.toLowerCase();
      result = result.filter(p =>
        p.currentCity?.toLowerCase().includes(l) ||
        p.birthPlace?.toLowerCase().includes(l)
      );
    }
    if (statusFilter === 'living') result = result.filter(p => p.isLiving);
    if (statusFilter === 'memorial') result = result.filter(p => !p.isLiving);
    setFiltered(result);
  }, [persons, search, locationFilter, statusFilter]);

  const locations = [...new Set(persons.map(p => p.currentCity ?? p.birthPlace).filter(Boolean))];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <SectionHeader
          title={en ? 'Family Directory' : 'Atokọ Idile'}
          subtitle={en
            ? `${persons.length} family members documented`
            : `Awọn ọmọ ẹbi ${persons.length} ti a ṣe igbasilẹ`
          }
        />
        <Link to="/people/new" className="btn-primary inline-flex items-center gap-2 self-start md:self-auto">
          <Users className="w-4 h-4" />
          {t('addPerson')}
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-earth-100 p-4 mb-8 shadow-warm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-umber-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('searchDirectory')}
              className="w-full pl-10 pr-4 py-2.5 bg-ivory-100 border border-earth-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-umber-400" />
              <select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-ivory-100 border border-earth-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-gold-400 appearance-none cursor-pointer"
              >
                <option value="">{t('filterByLocation')}</option>
                {locations.map(l => <option key={l} value={l!}>{l}</option>)}
              </select>
            </div>
            <div className="flex rounded-xl overflow-hidden border border-earth-200">
              {(['all', 'living', 'memorial'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 text-xs font-sans font-medium transition-colors ${
                    statusFilter === s ? 'bg-earth-500 text-white' : 'bg-ivory-100 text-umber-600 hover:bg-earth-50'
                  }`}
                >
                  {s === 'all' ? (en ? 'All' : 'Gbogbo') : s === 'living' ? (en ? 'Living' : 'Alãye') : (en ? 'In Memory' : 'Ni Iranti')}
                </button>
              ))}
            </div>
          </div>
        </div>
        {(search || locationFilter || statusFilter !== 'all') && (
          <div className="flex items-center gap-2 mt-3 text-sm font-sans text-umber-600">
            <Filter className="w-3.5 h-3.5" />
            {en ? `Showing ${filtered.length} of ${persons.length}` : `Ṣafihan ${filtered.length} ti ${persons.length}`}
            <button
              onClick={() => { setSearch(''); setLocationFilter(''); setStatusFilter('all'); }}
              className="text-earth-600 hover:text-earth-700 underline ml-1"
            >
              {en ? 'Clear filters' : 'Pa awọn àlẹmọ rẹ'}
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="w-12 h-12" />}
          title={en ? 'No family members found' : 'Ko si awọn ọmọ ẹbi ti a ri'}
          subtitle={en ? 'Try adjusting your search or filters' : 'Gbiyanju lati ṣatunṣe wiwa rẹ'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((person) => {
            const age = getAge(person.birthDate, person.deathDate);
            return (
              <Link
                key={person.personId}
                to={`/people/${person.personId}`}
                className="group bg-white rounded-2xl border border-earth-100 p-5 hover:shadow-warm-lg hover:-translate-y-0.5 hover:border-earth-200 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <Avatar
                    src={person.profilePhotoUrl}
                    name={person.fullName}
                    size="lg"
                    className={!person.isLiving ? 'opacity-80 grayscale' : ''}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-charcoal-800 group-hover:text-earth-700 transition-colors">
                      {person.fullName}
                    </h3>
                    {person.nickname && (
                      <p className="font-body text-xs italic text-umber-400">"{person.nickname}"</p>
                    )}
                    {person.maidenName && (
                      <p className="font-sans text-xs text-umber-500 mt-0.5">née {person.maidenName}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant={person.isLiving ? 'forest' : 'gray'}>
                        {person.isLiving ? (en ? 'Living' : 'Alãye') : (en ? 'In Memory' : 'Ni Iranti')}
                      </Badge>
                      {person.gender && (
                        <Badge variant="earth">
                          {person.gender === 'male' ? (en ? 'Male' : 'Ọkùnrin') : person.gender === 'female' ? (en ? 'Female' : 'Obìnrin') : '—'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-earth-50 space-y-1">
                  {(person.birthPlace || person.currentCity) && (
                    <div className="flex items-center gap-2 text-xs font-sans text-umber-500">
                      <MapPin className="w-3.5 h-3.5 text-earth-400" />
                      {person.currentCity ?? person.birthPlace}
                    </div>
                  )}
                  {age && (
                    <div className="flex items-center gap-2 text-xs font-sans text-umber-500">
                      <span>🎂</span>
                      {person.birthDate && new Date(person.birthDate).getFullYear()}
                      {age && ` · ${age} ${t('years')}`}
                    </div>
                  )}
                </div>
                {person.tags && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {person.tags.split(',').slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs font-sans px-2 py-0.5 bg-earth-50 text-umber-600 rounded-full border border-earth-100">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
