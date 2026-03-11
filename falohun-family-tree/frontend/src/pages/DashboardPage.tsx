// pages/DashboardPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TreePine, Users, MessageCircle, Camera, ArrowRight, Clock } from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { useLanguage } from '../i18n/useLanguage';
import { api } from '../lib/api';
import { Avatar, Card, Skeleton } from '../components/ui';
import { formatDate } from '../lib/utils';
import type { Person, Thread } from '../types';

interface DashboardStats {
  personCount: number;
  memberCount: number;
  threadCount: number;
  recentPersons: Person[];
  recentThreads: Thread[];
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { t, language } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const en = language === 'en';

  useEffect(() => {
    api.get<DashboardStats>('/dashboard')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const displayName = user?.profile?.displayName ?? user?.email?.split('@')[0] ?? 'Family Member';

  const quickActions = [
    { to: '/tree', icon: TreePine, labelEn: 'View Family Tree', labelYo: 'Wo Igi Idile', color: 'from-earth-500 to-earth-400', bg: 'bg-earth-50' },
    { to: '/directory', icon: Users, labelEn: 'Browse Directory', labelYo: 'Wo Atokọ', color: 'from-gold-500 to-earth-400', bg: 'bg-gold-50' },
    { to: '/messages', icon: MessageCircle, labelEn: 'Messages', labelYo: 'Ifiranṣẹ', color: 'from-forest-500 to-forest-400', bg: 'bg-forest-50' },
    { to: '/people/new', icon: Camera, labelEn: 'Add Person', labelYo: 'Ṣafikun Eniyan', color: 'from-umber-500 to-umber-400', bg: 'bg-umber-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-charcoal-800 to-umber-900 p-8 md:p-12 mb-10">
        <div className="absolute inset-0 adire-texture opacity-20" />
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-earth-700/30 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Avatar
              src={user?.profile?.profilePhotoUrl}
              name={displayName}
              size="lg"
            />
            <div>
              <p className="font-sans text-sm text-gold-400 uppercase tracking-widest">
                {en ? 'Welcome back' : 'Kaabọ padà'}
              </p>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
                {displayName}
              </h1>
            </div>
          </div>
          <p className="font-body text-ivory-300/80 max-w-md">
            {en
              ? "You are part of the Falohun family legacy. Explore the tree, connect with relatives, and add your chapter."
              : "Iwọ jẹ apakan ti ohun-ini idile Falohun. Ṣawari igi naa, sopọ pẹlu awọn ibatan, ki o si ṣafikun itan rẹ."
            }
          </p>
          <Link to="/tree" className="inline-flex items-center gap-2 mt-6 btn-gold text-sm py-2.5 px-5 group">
            {en ? 'Open Family Tree' : 'Ṣii Igi Idile'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Stats row */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { value: stats?.personCount ?? 0, labelEn: 'Family Members', labelYo: 'Awọn Ọmọ Ẹbi', icon: Users, color: 'text-earth-600' },
            { value: stats?.memberCount ?? 0, labelEn: 'Registered Users', labelYo: 'Awọn Olumulo', icon: Users, color: 'text-gold-600' },
            { value: stats?.threadCount ?? 0, labelEn: 'Conversations', labelYo: 'Awọn Ibaraẹnisọrọ', icon: MessageCircle, color: 'text-forest-600' },
          ].map((s, i) => (
            <Card key={i} className="text-center py-6">
              <div className={`font-display text-4xl font-bold ${s.color} mb-1`}>{s.value}</div>
              <div className="font-sans text-xs text-umber-500 uppercase tracking-widest">
                {en ? s.labelEn : s.labelYo}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <h2 className="font-display text-xl font-bold text-charcoal-800 mb-4 gold-bar">
        {en ? 'Quick Actions' : 'Awọn Iṣe Kiakia'}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {quickActions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className={`${a.bg} rounded-2xl p-5 border border-earth-100 hover:shadow-warm hover:-translate-y-0.5 transition-all duration-200 group`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <a.icon className="w-5 h-5 text-white" />
            </div>
            <div className="font-sans text-sm font-medium text-charcoal-800">
              {en ? a.labelEn : a.labelYo}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent family members */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-charcoal-800">
              {en ? 'Recently Added' : 'Ti Ṣafikun Laipẹ'}
            </h2>
            <Link to="/directory" className="font-sans text-sm text-earth-600 hover:text-earth-700 flex items-center gap-1">
              {en ? 'View all' : 'Wo gbogbo'} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              [1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)
            ) : stats?.recentPersons?.length ? (
              stats.recentPersons.slice(0, 5).map((p) => (
                <Link
                  key={p.personId}
                  to={`/people/${p.personId}`}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-earth-100 hover:border-earth-200 hover:shadow-warm transition-all"
                >
                  <Avatar src={p.profilePhotoUrl} name={p.fullName} size="sm" />
                  <div>
                    <div className="font-sans text-sm font-medium text-charcoal-800">{p.fullName}</div>
                    <div className="font-sans text-xs text-umber-500">
                      {p.birthPlace ?? p.currentCity ?? '—'}
                    </div>
                  </div>
                  {!p.isLiving && (
                    <span className="ml-auto text-xs font-sans text-umber-400 italic">
                      {en ? 'In memory' : 'Ni iranti'}
                    </span>
                  )}
                </Link>
              ))
            ) : (
              <p className="font-body text-sm text-umber-500 py-4 text-center">
                {en ? 'No family members yet. Add the first one!' : 'Ko si ọmọ ẹbi sibẹ. Ṣafikun akọkọ!'}
              </p>
            )}
          </div>
        </div>

        {/* Recent messages */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-charcoal-800">
              {en ? 'Recent Messages' : 'Awọn Ifiranṣẹ Aipẹ'}
            </h2>
            <Link to="/messages" className="font-sans text-sm text-earth-600 hover:text-earth-700 flex items-center gap-1">
              {en ? 'View all' : 'Wo gbogbo'} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              [1,2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)
            ) : stats?.recentThreads?.length ? (
              stats.recentThreads.slice(0, 4).map((thread) => (
                <Link
                  key={thread.threadId}
                  to={`/messages/${thread.threadId}`}
                  className="flex items-start gap-3 p-3 bg-white rounded-xl border border-earth-100 hover:border-earth-200 hover:shadow-warm transition-all"
                >
                  <Avatar
                    src={thread.otherUser?.profilePhotoUrl}
                    name={thread.otherUser?.displayName ?? 'Family Member'}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-sans text-sm font-medium text-charcoal-800">
                      {thread.otherUser?.displayName ?? 'Family Member'}
                    </div>
                    {thread.lastMessage && (
                      <p className="font-sans text-xs text-umber-500 truncate mt-0.5">
                        {thread.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {thread.lastMessage && (
                    <div className="flex items-center gap-1 text-xs font-sans text-umber-400 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatDate(thread.lastMessage.createdAt)}
                    </div>
                  )}
                </Link>
              ))
            ) : (
              <p className="font-body text-sm text-umber-500 py-4 text-center">
                {en ? 'No messages yet. Start a conversation!' : 'Ko si ifiranṣẹ sibẹ. Bẹrẹ ibaraẹnisọrọ!'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
