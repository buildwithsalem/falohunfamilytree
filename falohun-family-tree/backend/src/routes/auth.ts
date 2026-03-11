import { Hono } from 'hono'
import { Env } from '../index'
import { createJWT } from '../middleware/auth'

const router = new Hono<{ Bindings: Env }>()

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const combined = new Uint8Array([...salt, ...new Uint8Array(hash)])
  return btoa(String.fromCharCode(...combined))
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const storedBytes = Uint8Array.from(atob(stored), c => c.charCodeAt(0))
    const salt = storedBytes.slice(0, 16)
    const storedHash = storedBytes.slice(16)
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hash = await crypto.subtle.digest('SHA-256', data)
    const hashBytes = new Uint8Array(hash)
    if (storedHash.length !== hashBytes.length) return false
    for (let i = 0; i < hashBytes.length; i++) {
      if (hashBytes[i] !== storedHash[i]) return false
    }
    return true
  } catch { return false }
}

function genId(): string {
  return crypto.randomUUID().replace(/-/g, '')
}

router.post('/register', async (c) => {
  const body = await c.req.json()
  const { email, password, displayName, inviteCode } = body

  if (!email || !password || !displayName) {
    return c.json({ error: 'Email, password, and display name required' }, 400)
  }
  if (password.length < 8) return c.json({ error: 'Password must be at least 8 characters' }, 400)

  const existing = await c.env.DB.prepare('SELECT userId FROM Users WHERE email = ?').bind(email).first()
  if (existing) return c.json({ error: 'Email already registered' }, 409)

  let isApproved = 0
  if (inviteCode) {
    const invite = await c.env.DB.prepare(
      'SELECT inviteId FROM Invites WHERE code = ? AND isUsed = 0 AND (expiresAt IS NULL OR expiresAt > datetime("now"))'
    ).bind(inviteCode).first()
    if (!invite) return c.json({ error: 'Invalid or expired invite code' }, 400)
    isApproved = 1
    await c.env.DB.prepare('UPDATE Invites SET isUsed = 1 WHERE code = ?').bind(inviteCode).run()
  }

  const userId = genId()
  const profileId = genId()
  const passwordHash = await hashPassword(password)

  await c.env.DB.prepare(
    'INSERT INTO Users (userId, email, passwordHash, isApproved, inviteCode) VALUES (?, ?, ?, ?, ?)'
  ).bind(userId, email, passwordHash, isApproved, inviteCode || null).run()

  await c.env.DB.prepare(
    'INSERT INTO UserProfiles (profileId, userId, displayName) VALUES (?, ?, ?)'
  ).bind(profileId, userId, displayName).run()

  if (!isApproved) {
    return c.json({ message: 'Registration submitted. Awaiting admin approval.' }, 201)
  }

  const token = await createJWT({ userId, email, role: 'member' }, c.env.JWT_SECRET)
  return c.json({ token, userId, displayName }, 201)
})

router.post('/login', async (c) => {
  const { email, password } = await c.req.json()
  if (!email || !password) return c.json({ error: 'Email and password required' }, 400)

  const user = await c.env.DB.prepare(
    'SELECT u.userId, u.email, u.passwordHash, u.role, u.isApproved, p.displayName FROM Users u LEFT JOIN UserProfiles p ON u.userId = p.userId WHERE u.email = ?'
  ).bind(email).first<any>()

  if (!user) return c.json({ error: 'Invalid credentials' }, 401)
  if (!user.isApproved) return c.json({ error: 'Account pending approval' }, 403)

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) return c.json({ error: 'Invalid credentials' }, 401)

  const token = await createJWT({ userId: user.userId, email: user.email, role: user.role }, c.env.JWT_SECRET)
  return c.json({ token, userId: user.userId, displayName: user.displayName, role: user.role })
})

router.post('/logout', (c) => c.json({ message: 'Logged out' }))

router.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return c.json({ error: 'Not authenticated' }, 401)
  return c.json({ message: 'Use /api/profiles/me for profile data' })
})

export { router as authRouter }
