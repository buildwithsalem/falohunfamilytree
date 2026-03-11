import React, { useState, useEffect, useRef } from 'react'
import { Page, ToastMsg } from '../App'
import { useAuth } from '../lib/auth'
import { api } from '../lib/api'

interface Props {
  navigate: (p: Page, param?: string) => void
  tr: (key: string) => string
  addToast: (type: ToastMsg['type'], msg: string) => void
  threadId?: string | null
}

export default function MessagesPage({ navigate, tr, addToast, threadId: initThread }: Props) {
  const { user } = useAuth()
  const [threads, setThreads] = useState<any[]>([])
  const [activeThread, setActiveThread] = useState<string | null>(initThread || null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [profiles, setProfiles] = useState<any[]>([])
  const [showNewConvo, setShowNewConvo] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.messages.threads().then(setThreads).catch(() => {})
    api.persons.list().then(() => {}).catch(() => {})
  }, [])

  useEffect(() => {
    if (activeThread) {
      api.messages.getMessages(activeThread).then(setMessages).catch(() => {})
    }
  }, [activeThread])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!newMsg.trim() || !activeThread) return
    try {
      await api.messages.send(activeThread, newMsg.trim())
      setNewMsg('')
      const updated = await api.messages.getMessages(activeThread)
      setMessages(updated)
    } catch (err: any) { addToast('error', err.message) }
  }

  function getOtherParticipant(thread: any) {
    const isP1 = thread.participant1UserId === user?.userId
    return {
      name: isP1 ? thread.p2Name : thread.p1Name,
      photo: isP1 ? thread.p2Photo : thread.p1Photo,
    }
  }

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Thread list */}
      <div className="w-80 bg-warm-white border-r border-sand/50 flex flex-col">
        <div className="p-4 border-b border-sand/50 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-bark">{tr('messages.title')}</h2>
          <button onClick={() => setShowNewConvo(true)} className="btn-gold text-xs py-1.5 px-3">+ New</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="p-6 text-center text-bark-light text-sm">
              <p className="text-3xl mb-2">💬</p>
              <p>{tr('messages.noMessages')}</p>
            </div>
          ) : threads.map(thread => {
            const other = getOtherParticipant(thread)
            return (
              <button key={thread.threadId} onClick={() => setActiveThread(thread.threadId)}
                className={`w-full p-4 flex items-center gap-3 text-left hover:bg-cream transition-colors border-b border-sand/30 ${activeThread === thread.threadId ? 'bg-gold/8 border-l-2 border-l-gold' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-lg overflow-hidden flex-shrink-0">
                  {other.photo ? <img src={other.photo} className="w-full h-full object-cover" /> : '👤'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-bark truncate">{other.name}</p>
                    {thread.unreadCount > 0 && <span className="bg-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">{thread.unreadCount}</span>}
                  </div>
                  {thread.lastMessage && <p className="text-xs text-bark-light truncate mt-0.5">{thread.lastMessage}</p>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Message area */}
      <div className="flex-1 flex flex-col bg-cream">
        {activeThread ? (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map(msg => {
                const isMine = msg.senderUserId === user?.userId
                return (
                  <div key={msg.messageId} className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                      {msg.senderPhoto ? <img src={msg.senderPhoto} className="w-full h-full object-cover" /> : '👤'}
                    </div>
                    <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2.5 ${isMine ? 'bg-gold text-white rounded-br-sm' : 'bg-warm-white card-shadow text-bark rounded-bl-sm'}`}>
                      {!isMine && <p className="text-xs font-medium mb-1 opacity-70">{msg.senderName}</p>}
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isMine ? 'text-white/60' : 'text-bark-light'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-warm-white border-t border-sand/50">
              <div className="flex items-center gap-3">
                <input
                  className="input-warm flex-1"
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  placeholder={tr('messages.typeMessage')}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                />
                <button onClick={sendMessage} className="btn-gold py-2.5 px-4">{tr('messages.send')}</button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <div className="text-6xl mb-4">💬</div>
              <p className="font-display text-2xl text-bark mb-2">{tr('messages.noMessages')}</p>
              <p className="text-bark-light">{tr('messages.startConversation')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
