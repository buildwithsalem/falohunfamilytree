import { Hono } from 'hono'
import { Env } from '../index'

const router = new Hono<{ Bindings: Env }>()

router.get('/', async (c) => {
  const persons = await c.env.DB.prepare('SELECT * FROM Persons ORDER BY fullName').all<any>()
  return c.json(persons.results)
})

router.get('/:personId', async (c) => {
  const person = await c.env.DB.prepare('SELECT * FROM Persons WHERE personId = ?').bind(c.req.param('personId')).first()
  if (!person) return c.json({ error: 'Person not found' }, 404)
  return c.json(person)
})

router.post('/', async (c) => {
  const user = c.get('user') as any
  const body = await c.req.json()
  const { fullName, nickname, maidenName, gender, birthDate, deathDate, birthPlace, currentCity, isLiving, biography, culturalNotes, tags } = body

  if (!fullName) return c.json({ error: 'Full name required' }, 400)

  const personId = crypto.randomUUID().replace(/-/g, '')
  await c.env.DB.prepare(`
    INSERT INTO Persons (personId, fullName, nickname, maidenName, gender, birthDate, deathDate, birthPlace, currentCity, isLiving, biography, culturalNotes, tags, createdByUserId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(personId, fullName, nickname||null, maidenName||null, gender||null, birthDate||null, deathDate||null, birthPlace||null, currentCity||null, isLiving!==false?1:0, biography||null, culturalNotes||null, JSON.stringify(tags||[]), user.userId).run()

  const person = await c.env.DB.prepare('SELECT * FROM Persons WHERE personId = ?').bind(personId).first()
  return c.json(person, 201)
})

router.put('/:personId', async (c) => {
  const user = c.get('user') as any
  const { personId } = c.req.param()
  const body = await c.req.json()
  
  const existing = await c.env.DB.prepare('SELECT * FROM Persons WHERE personId = ?').bind(personId).first<any>()
  if (!existing) return c.json({ error: 'Person not found' }, 404)
  if (existing.createdByUserId !== user.userId && user.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const { fullName, nickname, maidenName, gender, birthDate, deathDate, birthPlace, currentCity, isLiving, biography, culturalNotes, tags } = body

  await c.env.DB.prepare(`
    UPDATE Persons SET fullName=?, nickname=?, maidenName=?, gender=?, birthDate=?, deathDate=?, birthPlace=?, currentCity=?, isLiving=?, biography=?, culturalNotes=?, tags=?, updatedAt=datetime('now') WHERE personId=?
  `).bind(fullName||existing.fullName, nickname||null, maidenName||null, gender||null, birthDate||null, deathDate||null, birthPlace||null, currentCity||null, isLiving!==undefined?isLiving?1:0:existing.isLiving, biography||null, culturalNotes||null, JSON.stringify(tags||[]), personId).run()

  return c.json(await c.env.DB.prepare('SELECT * FROM Persons WHERE personId = ?').bind(personId).first())
})

router.delete('/:personId', async (c) => {
  const user = c.get('user') as any
  const { personId } = c.req.param()
  const existing = await c.env.DB.prepare('SELECT * FROM Persons WHERE personId = ?').bind(personId).first<any>()
  if (!existing) return c.json({ error: 'Person not found' }, 404)
  if (existing.createdByUserId !== user.userId && user.role !== 'admin') return c.json({ error: 'Forbidden' }, 403)
  await c.env.DB.prepare('DELETE FROM Persons WHERE personId = ?').bind(personId).run()
  return c.json({ message: 'Person deleted' })
})

export { router as personRouter }
