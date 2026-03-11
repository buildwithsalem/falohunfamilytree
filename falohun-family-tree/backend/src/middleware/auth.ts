import { Context, Next } from 'hono'
import { Env } from '../index'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  exp: number
}

async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const [headerB64, payloadB64, sigB64] = token.split('.')
    if (!headerB64 || !payloadB64 || !sigB64) return null

    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    )
    const data = encoder.encode(`${headerB64}.${payloadB64}`)
    const sig = Uint8Array.from(atob(sigB64.replace(/-/g,'+').replace(/_/g,'/')), c => c.charCodeAt(0))
    const valid = await crypto.subtle.verify('HMAC', key, sig, data)
    if (!valid) return null

    const payload = JSON.parse(atob(payloadB64.replace(/-/g,'+').replace(/_/g,'/')))
    if (payload.exp < Date.now() / 1000) return null
    return payload
  } catch { return null }
}

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.replace('Bearer ', '') || getCookie(c, 'auth_token')
  
  if (!token) return c.json({ error: 'Unauthorized' }, 401)
  
  const payload = await verifyJWT(token, c.env.JWT_SECRET)
  if (!payload) return c.json({ error: 'Invalid or expired token' }, 401)
  
  c.set('user', payload)
  await next()
}

function getCookie(c: Context, name: string): string | undefined {
  const cookie = c.req.header('Cookie')
  if (!cookie) return undefined
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

export async function createJWT(payload: Omit<JWTPayload, 'exp'>, secret: string): Promise<string> {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
  const pay = btoa(JSON.stringify({ ...payload, exp })).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(`${header}.${pay}`))
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
  return `${header}.${pay}.${sigB64}`
}
