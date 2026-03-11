import { Hono } from 'hono'
import { Env } from '../index'

const router = new Hono<{ Bindings: Env }>()

router.get('/threads', async (c) => {
  const user = c.get('user') as any
  const threads = await c.env.DB.prepare(`
    SELECT t.*, 
      p1.displayName as p1Name, p1.profilePhotoUrl as p1Photo,
      p2.displayName as p2Name, p2.profilePhotoUrl as p2Photo,
      (SELECT content FROM Messages WHERE threadId=t.threadId ORDER BY createdAt DESC LIMIT 1) as lastMessage,
      (SELECT createdAt FROM Messages WHERE threadId=t.threadId ORDER BY createdAt DESC LIMIT 1) as lastMessageAt,
      (SELECT COUNT(*) FROM Messages WHERE threadId=t.threadId AND recipientUserId=? AND isRead=0) as unreadCount
    FROM Threads t
    JOIN UserProfiles p1 ON t.participant1UserId = p1.userId
    JOIN UserProfiles p2 ON t.participant2UserId = p2.userId
    WHERE t.participant1UserId = ? OR t.participant2UserId = ?
    ORDER BY lastMessageAt DESC
  `).bind(user.userId, user.userId, user.userId).all()
  return c.json(threads.results)
})

router.post('/threads', async (c) => {
  const user = c.get('user') as any
  const { recipientUserId } = await c.req.json()
  if (!recipientUserId) return c.json({ error: 'Recipient required' }, 400)
  if (recipientUserId === user.userId) return c.json({ error: 'Cannot message yourself' }, 400)

  const existing = await c.env.DB.prepare(`
    SELECT threadId FROM Threads WHERE (participant1UserId=? AND participant2UserId=?) OR (participant1UserId=? AND participant2UserId=?)
  `).bind(user.userId, recipientUserId, recipientUserId, user.userId).first<any>()

  if (existing) return c.json({ threadId: existing.threadId })

  const threadId = crypto.randomUUID().replace(/-/g, '')
  await c.env.DB.prepare('INSERT INTO Threads (threadId, participant1UserId, participant2UserId) VALUES (?,?,?)').bind(threadId, user.userId, recipientUserId).run()
  return c.json({ threadId }, 201)
})

router.get('/threads/:threadId', async (c) => {
  const user = c.get('user') as any
  const thread = await c.env.DB.prepare('SELECT * FROM Threads WHERE threadId=?').bind(c.req.param('threadId')).first<any>()
  if (!thread) return c.json({ error: 'Thread not found' }, 404)
  if (thread.participant1UserId !== user.userId && thread.participant2UserId !== user.userId) return c.json({ error: 'Forbidden' }, 403)

  const messages = await c.env.DB.prepare(`
    SELECT m.*, p.displayName as senderName, p.profilePhotoUrl as senderPhoto FROM Messages m
    JOIN UserProfiles p ON m.senderUserId = p.userId
    WHERE m.threadId = ? ORDER BY m.createdAt ASC
  `).bind(c.req.param('threadId')).all()

  await c.env.DB.prepare('UPDATE Messages SET isRead=1 WHERE threadId=? AND recipientUserId=?').bind(c.req.param('threadId'), user.userId).run()

  return c.json(messages.results)
})

router.post('/threads/:threadId/messages', async (c) => {
  const user = c.get('user') as any
  const thread = await c.env.DB.prepare('SELECT * FROM Threads WHERE threadId=?').bind(c.req.param('threadId')).first<any>()
  if (!thread) return c.json({ error: 'Thread not found' }, 404)
  if (thread.participant1UserId !== user.userId && thread.participant2UserId !== user.userId) return c.json({ error: 'Forbidden' }, 403)

  const { content } = await c.req.json()
  if (!content?.trim()) return c.json({ error: 'Content required' }, 400)

  const recipientUserId = thread.participant1UserId === user.userId ? thread.participant2UserId : thread.participant1UserId
  const msgId = crypto.randomUUID().replace(/-/g, '')
  
  await c.env.DB.prepare('INSERT INTO Messages (messageId, threadId, senderUserId, recipientUserId, content) VALUES (?,?,?,?,?)').bind(msgId, c.req.param('threadId'), user.userId, recipientUserId, content).run()
  
  return c.json({ messageId: msgId }, 201)
})

export { router as messagingRouter }
