// pages/AdminPage.tsx
import { useEffect, useState } from 'react';
import { Shield, Users, Key, Image, Trash2, Plus, RefreshCw, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useLanguage } from '../i18n/useLanguage';
import { Avatar, Badge, Button, Card, SectionHeader } from '../components/ui';
import type { User, InviteCode, Media } from '../types';

export default function AdminPage() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [tab, setTab] = useState<'users' | 'invites' | 'media'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, invitesRes, mediaRes] = await Promise.all([
        api.get<{ users: User[] }>('/admin/users'),
        api.get<{ invites: InviteCode[] }>('/admin/invites'),
        api.get<{ media: Media[] }>('/admin/media'),
      ]);
      setUsers(usersRes.users);
      setInvites(invitesRes.invites);
      setMedia(mediaRes.media);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const generateInvite = async () => {
    try {
      const res = await api.post<{ invite: InviteCode }>('/admin/invites', {});
      setInvites(prev => [res.invite, ...prev]);
      toast.success(en ? 'Invite code generated!' : 'Koodu ìpè ti ṣẹda!');
    } catch {
      toast.error('Failed to generate code');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm(en ? 'Delete this user?' : 'Pa olumulo yii?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u.userId !== userId));
      toast.success(en ? 'User deleted' : 'Olumulo ti pa');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const deleteMedia = async (mediaId: string) => {
    if (!confirm(en ? 'Delete this media?' : 'Pa media yii?')) return;
    try {
      await api.delete(`/admin/media/${mediaId}`);
      setMedia(prev => prev.filter(m => m.mediaId !== mediaId));
      toast.success(en ? 'Media removed' : 'Media ti yọ');
    } catch {
      toast.error('Failed to delete media');
    }
  };

  const tabs = [
    { id: 'users' as const, label: en ? `Users (${users.length})` : `Awọn Olumulo (${users.length})`, icon: Users },
    { id: 'invites' as const, label: en ? `Invite Codes (${invites.length})` : `Koodu Ìpè (${invites.length})`, icon: Key },
    { id: 'media' as const, label: en ? `Media (${media.length})` : `Media (${media.length})`, icon: Image },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-earth-600 to-earth-500 flex items-center justify-center shadow-warm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <SectionHeader
            title={en ? 'Admin Panel' : 'Pánẹ́ẹ̀lì Alàṣẹ'}
            subtitle={en ? 'Manage family members and content' : 'Ṣakoso awọn ọmọ ẹbi ati akoonu'}
          />
        </div>
        <Button variant="ghost" onClick={loadData} leftIcon={<RefreshCw className="w-4 h-4" />} size="sm">
          {en ? 'Refresh' : 'Ṣe ìmúdójúìwọ̀n'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-ivory-200 p-1 rounded-xl mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-sans font-medium transition-all ${
              tab === id ? 'bg-white text-earth-700 shadow-warm' : 'text-umber-500 hover:text-umber-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Users tab */}
      {tab === 'users' && (
        <div className="space-y-3">
          {users.map(user => (
            <Card key={user.userId} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={user.profile?.profilePhotoUrl}
                  name={user.profile?.displayName ?? user.email}
                  size="sm"
                />
                <div>
                  <div className="font-sans font-medium text-charcoal-800">
                    {user.profile?.displayName ?? en ? 'No display name' : 'Ko si orukọ afihan'}
                  </div>
                  <div className="font-sans text-xs text-umber-500">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={user.role === 'admin' ? 'gold' : 'earth'}>
                  {user.role}
                </Badge>
                <div className="font-sans text-xs text-umber-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
                {user.role !== 'admin' && (
                  <button
                    onClick={() => deleteUser(user.userId)}
                    className="p-1.5 text-umber-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Invites tab */}
      {tab === 'invites' && (
        <div>
          <div className="flex justify-end mb-4">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={generateInvite}>
              {en ? 'Generate Code' : 'Ṣẹda Koodu'}
            </Button>
          </div>
          <div className="space-y-3">
            {invites.map(invite => (
              <Card key={invite.codeId} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="font-mono text-lg font-bold text-earth-600 bg-earth-50 px-3 py-1.5 rounded-lg border border-earth-200">
                    {invite.code}
                  </div>
                  <div>
                    <Badge variant={invite.isUsed ? 'gray' : 'forest'}>
                      {invite.isUsed ? (en ? 'Used' : 'Ti lo') : (en ? 'Available' : 'Wa')}
                    </Badge>
                    <div className="font-sans text-xs text-umber-400 mt-1">
                      {en ? 'Created' : 'Ti ṣẹda'} {new Date(invite.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {!invite.isUsed && (
                  <button
                    onClick={() => copyCode(invite.code)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-earth-200 text-sm font-sans text-umber-600 hover:bg-earth-50 transition-colors"
                  >
                    {copiedCode === invite.code ? (
                      <><Check className="w-4 h-4 text-forest-500" /> {en ? 'Copied!' : 'Ti daakọ!'}</>
                    ) : (
                      <><Copy className="w-4 h-4" /> {en ? 'Copy' : 'Daakọ'}</>
                    )}
                  </button>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Media tab */}
      {tab === 'media' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {media.map(m => (
            <div key={m.mediaId} className="relative group rounded-xl overflow-hidden bg-umber-100 aspect-square">
              {m.type === 'photo' ? (
                <img src={m.url} alt={m.caption ?? ''} className="w-full h-full object-cover" />
              ) : (
                <video src={m.url} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => deleteMedia(m.mediaId)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-xs font-sans text-white truncate">{m.caption ?? m.type}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
