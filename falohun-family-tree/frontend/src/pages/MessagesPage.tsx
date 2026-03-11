// pages/MessagesPage.tsx
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Send, Search, MessageCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuthStore } from '../lib/store';
import { useLanguage } from '../i18n/useLanguage';
import { Avatar, EmptyState } from '../components/ui';
import { formatDate } from '../lib/utils';
import type { Thread, Message } from '../types';

export default function MessagesPage() {
  const { threadId } = useParams<{ threadId?: string }>();
  const { user } = useAuthStore();
  const { t, language } = useLanguage();
  const en = language === 'en';
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get<{ threads: Thread[] }>('/messages/threads')
      .then(d => setThreads(d.threads))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!threadId) return;
    const thread = threads.find(t => t.threadId === threadId);
    setActiveThread(thread ?? null);
    api.get<{ messages: Message[] }>(`/messages/threads/${threadId}`)
      .then(d => setMessages(d.messages));
  }, [threadId, threads]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !threadId || !activeThread) return;
    setSending(true);
    try {
      const res = await api.post<{ message: Message }>(`/messages/threads/${threadId}`, {
        content: newMessage,
        recipientUserId: activeThread.otherUser?.userId,
      });
      setMessages(prev => [...prev, res.message]);
      setNewMessage('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const filteredThreads = threads.filter(t =>
    !search || t.otherUser?.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white rounded-3xl border border-earth-100 shadow-warm overflow-hidden" style={{ height: 'calc(100vh - 10rem)' }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className={`w-full md:w-80 flex-shrink-0 border-r border-earth-100 flex flex-col ${threadId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-earth-100">
              <h2 className="font-display text-xl font-bold text-charcoal-800 mb-3">
                {t('conversations')}
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-umber-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={en ? 'Search conversations...' : 'Ṣawari awọn ibaraẹnisọrọ...'}
                  className="w-full pl-9 pr-3 py-2 bg-ivory-100 border border-earth-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl skeleton" />)}
                </div>
              ) : filteredThreads.length === 0 ? (
                <EmptyState
                  icon={<MessageCircle className="w-8 h-8" />}
                  title={en ? 'No conversations' : 'Ko si ibaraẹnisọrọ'}
                  subtitle={en ? 'Message a family member to start' : 'Fi ifiranṣẹ si ọmọ ẹbi lati bẹrẹ'}
                />
              ) : (
                filteredThreads.map(thread => (
                  <button
                    key={thread.threadId}
                    onClick={() => navigate(`/messages/${thread.threadId}`)}
                    className={`w-full flex items-start gap-3 p-4 border-b border-earth-50 hover:bg-earth-50 transition-colors text-left ${
                      threadId === thread.threadId ? 'bg-earth-50' : ''
                    }`}
                  >
                    <div className="relative">
                      <Avatar
                        src={thread.otherUser?.profilePhotoUrl}
                        name={thread.otherUser?.displayName ?? 'Family'}
                        size="sm"
                      />
                      {thread.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-earth-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {thread.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-sans text-sm font-semibold text-charcoal-800 truncate">
                          {thread.otherUser?.displayName ?? 'Family Member'}
                        </span>
                        {thread.lastMessage && (
                          <span className="text-xs font-sans text-umber-400 flex-shrink-0 ml-2">
                            {new Date(thread.lastMessage.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {thread.lastMessage && (
                        <p className="text-xs font-sans text-umber-500 truncate mt-0.5">
                          {thread.lastMessage.senderUserId === user?.userId ? (en ? 'You: ' : 'Iwọ: ') : ''}
                          {thread.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message area */}
          <div className={`flex-1 flex flex-col ${!threadId ? 'hidden md:flex' : 'flex'}`}>
            {threadId && activeThread ? (
              <>
                {/* Thread header */}
                <div className="flex items-center gap-3 p-4 border-b border-earth-100">
                  <button
                    onClick={() => navigate('/messages')}
                    className="md:hidden p-2 rounded-lg hover:bg-earth-50 text-umber-600"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <Avatar
                    src={activeThread.otherUser?.profilePhotoUrl}
                    name={activeThread.otherUser?.displayName ?? 'Family'}
                    size="sm"
                  />
                  <div>
                    <div className="font-sans font-semibold text-charcoal-800">
                      {activeThread.otherUser?.displayName ?? 'Family Member'}
                    </div>
                    <div className="text-xs font-sans text-umber-500">
                      {en ? 'Family member' : 'Ọmọ ẹbi'}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-ivory-50">
                  {messages.map(msg => {
                    const isMe = msg.senderUserId === user?.userId;
                    return (
                      <div key={msg.messageId} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md rounded-2xl px-4 py-3 ${
                          isMe
                            ? 'bg-gradient-to-br from-earth-500 to-earth-600 text-white rounded-br-sm'
                            : 'bg-white border border-earth-100 text-charcoal-800 rounded-bl-sm shadow-sm'
                        }`}>
                          <p className="font-sans text-sm leading-relaxed">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMe ? 'text-earth-200' : 'text-umber-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-earth-100 bg-white">
                  <div className="flex items-end gap-3">
                    <textarea
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                      placeholder={t('messagePlaceholder')}
                      rows={2}
                      className="flex-1 input-warm resize-none py-2.5 text-sm"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="p-3 bg-earth-500 text-white rounded-xl hover:bg-earth-600 disabled:opacity-50 transition-colors flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  icon={<MessageCircle className="w-16 h-16" />}
                  title={en ? 'Your messages' : 'Awọn ifiranṣẹ rẹ'}
                  subtitle={en
                    ? 'Select a conversation or start a new one by visiting a family member\'s profile'
                    : 'Yan ibaraẹnisọrọ tabi bẹrẹ ọkan titun nipa ṣibẹwo profaili ọmọ ẹbi'
                  }
                  action={
                    <Link to="/directory" className="btn-primary inline-flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      {en ? 'Find Family Members' : 'Wa Awọn Ọmọ Ẹbi'}
                    </Link>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
