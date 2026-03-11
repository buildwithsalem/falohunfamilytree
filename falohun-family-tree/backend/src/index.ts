// Falohun Family Tree - Cloudflare Worker API
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authRouter } from './routes/auth'
import { profileRouter } from './routes/profiles'
import { personRouter } from './routes/persons'
import { relationshipRouter } from './routes/relationships'
import { treeRouter } from './routes/tree'
import { mediaRouter } from './routes/media'
import { messagingRouter } from './routes/messaging'
import { adminRouter } from './routes/admin'
import { searchRouter } from './routes/search'
import { authMiddleware } from './middleware/auth'

export interface Env {
  DB: D1Database
  MEDIA_BUCKET: R2Bucket
  JWT_SECRET: string
  FRONTEND_URL: string
  R2_PUBLIC_URL: string
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', logger())
app.use('*', cors({
  origin: (origin, c) => {
    const allowed = [c.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5173']
    return allowed.includes(origin) ? origin : allowed[0]
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.get('/api/health', (c) => c.json({ status: 'ok', service: 'Falohun Family API' }))
app.route('/api/auth', authRouter)
app.use('/api/*', authMiddleware)
app.route('/api/profiles', profileRouter)
app.route('/api/persons', personRouter)
app.route('/api/relationships', relationshipRouter)
app.route('/api/tree', treeRouter)
app.route('/api/media', mediaRouter)
app.route('/api/messages', messagingRouter)
app.route('/api/admin', adminRouter)
app.route('/api/search', searchRouter)

app.notFound((c) => c.json({ error: 'Route not found' }, 404))
app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

export default app
