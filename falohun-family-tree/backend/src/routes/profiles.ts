import { Hono } from 'hono'
import { Env } from '../index'

const router = new Hono<{ Bindings: Env }>()

router.get('/me', async (c) => {
  const user = c.get('user') as any
  const profile = await c.env.DB.prepare(`
    SELECT u.userId, u.email, u.role, p.* FROM Users u 
    LEFT JOIN UserProfiles p ON u.userId = p.userId 
    WHERE u.userId = ?
  `).bind(user.userId).first()
  if (!profile) return c.json({ error: 'Profile not found' }, 404)
  return c.json(profile)
})

router.put('/me', async (c) => {
  const user = c.get('user') as any
  const body = await c.req.json()
  const { displayName, bio, location, linkedinUrl, instagramUrl, facebookUrl, twitterUrl, tiktokUrl, youtubeUrl, websiteUrl, allowContact, showSocialLinks, preferredLanguage } = body

  await c.env.DB.prepare(`
    UPDATE UserProfiles SET displayName=COALESCE(?,displayName), bio=?, location=?, linkedinUrl=?, instagramUrl=?, facebookUrl=?, twitterUrl=?, tiktokUrl=?, youtubeUrl=?, websiteUrl=?, allowContact=COALESCE(?,allowContact), showSocialLinks=COALESCE(?,showSocialLinks), preferredLanguage=COALESCE(?,preferredLanguage), updatedAt=datetime('now')
    WHERE userId=?
  `).bind(displayName||null, bio||null, location||null, linkedinUrl||null, instagramUrl||null, facebookUrl||null, twitterUrl||null, tiktokUrl||null, youtubeUrl||null, websiteUrl||null, allowContact!==undefined?allowContact?1:0:null, showSocialLinks!==undefined?showSocialLinks?1:0:null, preferredLanguage||null, user.userId).run()

  return c.json({ message: 'Profile updated' })
})

router.get('/:userId', async (c) => {
  const profile = await c.env.DB.prepare(`
    SELECT p.*, u.email FROM UserProfiles p JOIN Users u ON p.userId = u.userId WHERE p.userId = ?
  `).bind(c.req.param('userId')).first()
  if (!profile) return c.json({ error: 'Profile not found' }, 404)
  return c.json(profile)
})

export { router as profileRouter }
