import { Hono } from 'hono'
import { Env } from '../index'

const router = new Hono<{ Bindings: Env }>()

router.post('/', async (c) => {
  const user = c.get('user') as any
  const { fromPersonId, toPersonId, relationshipType } = await c.req.json()

  if (!fromPersonId || !toPersonId || !relationshipType) return c.json({ error: 'All fields required' }, 400)
  if (fromPersonId === toPersonId) return c.json({ error: 'Cannot create self-relationship' }, 400)

  const validTypes = ['PARENT', 'CHILD', 'SPOUSE', 'PARTNER', 'SIBLING']
  if (!validTypes.includes(relationshipType)) return c.json({ error: 'Invalid relationship type' }, 400)

  const dup = await c.env.DB.prepare('SELECT relationshipId FROM Relationships WHERE fromPersonId=? AND toPersonId=? AND relationshipType=?').bind(fromPersonId, toPersonId, relationshipType).first()
  if (dup) return c.json({ error: 'Relationship already exists' }, 409)

  const id = crypto.randomUUID().replace(/-/g, '')
  await c.env.DB.prepare('INSERT INTO Relationships (relationshipId, fromPersonId, toPersonId, relationshipType, createdByUserId) VALUES (?,?,?,?,?)').bind(id, fromPersonId, toPersonId, relationshipType, user.userId).run()

  return c.json({ relationshipId: id, fromPersonId, toPersonId, relationshipType }, 201)
})

router.get('/person/:personId', async (c) => {
  const rels = await c.env.DB.prepare(`
    SELECT r.*, p1.fullName as fromName, p2.fullName as toName FROM Relationships r
    JOIN Persons p1 ON r.fromPersonId = p1.personId
    JOIN Persons p2 ON r.toPersonId = p2.personId
    WHERE r.fromPersonId = ? OR r.toPersonId = ?
  `).bind(c.req.param('personId'), c.req.param('personId')).all()
  return c.json(rels.results)
})

router.delete('/:relationshipId', async (c) => {
  const user = c.get('user') as any
  const rel = await c.env.DB.prepare('SELECT * FROM Relationships WHERE relationshipId=?').bind(c.req.param('relationshipId')).first<any>()
  if (!rel) return c.json({ error: 'Not found' }, 404)
  if (rel.createdByUserId !== user.userId && user.role !== 'admin') return c.json({ error: 'Forbidden' }, 403)
  await c.env.DB.prepare('DELETE FROM Relationships WHERE relationshipId=?').bind(c.req.param('relationshipId')).run()
  return c.json({ message: 'Deleted' })
})

export { router as relationshipRouter }
