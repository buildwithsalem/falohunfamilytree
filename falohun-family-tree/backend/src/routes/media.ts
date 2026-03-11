import { Hono } from 'hono'
import { Env } from '../index'

const router = new Hono<{ Bindings: Env }>()

router.post('/upload', async (c) => {
  const user = c.get('user') as any
  const formData = await c.req.formData()
  const file = formData.get('file') as File
  const personId = formData.get('personId') as string
  const caption = formData.get('caption') as string
  const type = formData.get('type') as string || 'photo'

  if (!file) return c.json({ error: 'File required' }, 400)

  const MAX_SIZE = 10 * 1024 * 1024 // 10MB
  if (file.size > MAX_SIZE) return c.json({ error: 'File too large (max 10MB)' }, 400)

  const ext = file.name.split('.').pop()?.toLowerCase()
  const key = `media/${user.userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`
  
  await c.env.MEDIA_BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type }
  })

  const url = `${c.env.R2_PUBLIC_URL}/${key}`
  const mediaId = crypto.randomUUID().replace(/-/g, '')
  
  await c.env.DB.prepare('INSERT INTO Media (mediaId, personId, uploaderUserId, type, url, caption) VALUES (?,?,?,?,?,?)').bind(mediaId, personId||null, user.userId, type, url, caption||null).run()

  if (personId && formData.get('setProfile') === 'true') {
    await c.env.DB.prepare('UPDATE Persons SET profilePhotoUrl=? WHERE personId=?').bind(url, personId).run()
  }

  return c.json({ mediaId, url }, 201)
})

router.get('/person/:personId', async (c) => {
  const media = await c.env.DB.prepare(`
    SELECT m.*, p.displayName as uploaderName FROM Media m
    JOIN UserProfiles p ON m.uploaderUserId = p.userId
    WHERE m.personId = ? AND m.isApproved = 1
    ORDER BY m.createdAt DESC
  `).bind(c.req.param('personId')).all()
  return c.json(media.results)
})

export { router as mediaRouter }
