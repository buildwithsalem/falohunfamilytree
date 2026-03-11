import { Hono } from 'hono'
import { Env } from '../index'

const router = new Hono<{ Bindings: Env }>()

function requireAdmin(c: any) {
  const user = c.get('user') as any
  if (user.role !== 'admin') { c.json({ error: 'Admin only' }, 403); return false }
  return true
}

router.get('/users', async (c) => {
  if (!requireAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const users = await c.env.DB.prepare(`
    SELECT u.userId, u.email, u.role, u.isApproved, u.createdAt, p.displayName FROM Users u LEFT JOIN UserProfiles p ON u.userId = p.userId ORDER BY u.createdAt DESC
  `).all()
  return c.json(users.results)
})

router.patch('/users/:userId/approve', async (c) => {
  if (!requireAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  await c.env.DB.prepare('UPDATE Users SET isApproved=1 WHERE userId=?').bind(c.req.param('userId')).run()
  return c.json({ message: 'User approved' })
})

router.delete('/users/:userId', async (c) => {
  if (!requireAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  await c.env.DB.prepare('DELETE FROM Users WHERE userId=?').bind(c.req.param('userId')).run()
  return c.json({ message: 'User deleted' })
})

router.post('/invites', async (c) => {
  const user = c.get('user') as any
  if (user.role !== 'admin') return c.json({ error: 'Admin only' }, 403)
  const { expiresAt } = await c.req.json()
  const code = Array.from(crypto.getRandomValues(new Uint8Array(6))).map(b => b.toString(36)).join('').toUpperCase()
  const inviteId = crypto.randomUUID().replace(/-/g, '')
  await c.env.DB.prepare('INSERT INTO Invites (inviteId, code, createdByUserId, expiresAt) VALUES (?,?,?,?)').bind(inviteId, code, user.userId, expiresAt||null).run()
  return c.json({ code, inviteId }, 201)
})

router.get('/invites', async (c) => {
  if (!requireAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const invites = await c.env.DB.prepare('SELECT * FROM Invites ORDER BY createdAt DESC').all()
  return c.json(invites.results)
})

router.get('/stats', async (c) => {
  if (!requireAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const [users, persons, rels, media] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) as count FROM Users').first<any>(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM Persons').first<any>(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM Relationships').first<any>(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM Media').first<any>(),
  ])
  return c.json({ users: users?.count, persons: persons?.count, relationships: rels?.count, media: media?.count })
})

export { router as adminRouter }
