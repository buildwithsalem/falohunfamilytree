import { Hono } from 'hono'
import { Env } from '../index'

const router = new Hono<{ Bindings: Env }>()

router.get('/', async (c) => {
  const q = c.req.query('q') || ''
  const location = c.req.query('location')
  const tags = c.req.query('tags')

  if (!q && !location && !tags) return c.json([])

  let sql = `SELECT p.*, u.displayName as linkedUserName FROM Persons p LEFT JOIN UserProfiles u ON p.linkedUserId = u.userId WHERE 1=1`
  const params: any[] = []

  if (q) {
    sql += ` AND (p.fullName LIKE ? OR p.nickname LIKE ? OR p.maidenName LIKE ?)`
    params.push(`%${q}%`, `%${q}%`, `%${q}%`)
  }
  if (location) {
    sql += ` AND (p.birthPlace LIKE ? OR p.currentCity LIKE ?)`
    params.push(`%${location}%`, `%${location}%`)
  }
  if (tags) {
    sql += ` AND p.tags LIKE ?`
    params.push(`%${tags}%`)
  }

  sql += ` LIMIT 50`
  const results = await c.env.DB.prepare(sql).bind(...params).all()
  return c.json(results.results)
})

export { router as searchRouter }
