import { Hono } from 'hono'
import { Env } from '../index'

const router = new Hono<{ Bindings: Env }>()

interface PersonNode {
  id: string
  data: {
    personId: string
    fullName: string
    nickname?: string
    birthDate?: string
    deathDate?: string
    birthPlace?: string
    isLiving: boolean
    profilePhotoUrl?: string
    linkedUserId?: string
    gender?: string
  }
  position: { x: number; y: number }
  type: string
}

interface TreeEdge {
  id: string
  source: string
  target: string
  type: string
  label: string
  data: { relationshipType: string }
}

async function getPersonWithRelatives(db: D1Database, personId: string) {
  const person = await db.prepare(
    'SELECT * FROM Persons WHERE personId = ?'
  ).bind(personId).first<any>()
  if (!person) return null

  const relationships = await db.prepare(`
    SELECT r.*, 
      p1.personId as fp, p1.fullName as fName, p1.birthDate as fBirth, p1.isLiving as fLiving, p1.profilePhotoUrl as fPhoto, p1.gender as fGender,
      p2.personId as tp, p2.fullName as tName, p2.birthDate as tBirth, p2.isLiving as tLiving, p2.profilePhotoUrl as tPhoto, p2.gender as tGender
    FROM Relationships r
    JOIN Persons p1 ON r.fromPersonId = p1.personId
    JOIN Persons p2 ON r.toPersonId = p2.personId
    WHERE r.fromPersonId = ? OR r.toPersonId = ?
  `).bind(personId, personId).all<any>()

  return { person, relationships: relationships.results }
}

function layoutNodes(nodes: PersonNode[]): PersonNode[] {
  // Simple hierarchical layout
  const spouses = nodes.filter(n => n.type === 'spouse')
  const parents = nodes.filter(n => n.type === 'parent')
  const children = nodes.filter(n => n.type === 'child')
  const root = nodes.filter(n => n.type === 'root')
  const siblings = nodes.filter(n => n.type === 'sibling')

  root.forEach((n, i) => { n.position = { x: 400, y: 400 } })
  spouses.forEach((n, i) => { n.position = { x: 700 + i * 200, y: 400 } })
  parents.forEach((n, i) => { n.position = { x: 200 + i * 300, y: 100 } })
  children.forEach((n, i) => { n.position = { x: 100 + i * 220, y: 700 } })
  siblings.forEach((n, i) => { n.position = { x: -200 - i * 200, y: 400 } })

  return nodes
}

router.get('/:personId', async (c) => {
  const { personId } = c.req.param()
  const data = await getPersonWithRelatives(c.env.DB, personId)
  if (!data) return c.json({ error: 'Person not found' }, 404)

  const { person, relationships } = data
  const nodes: PersonNode[] = []
  const edges: TreeEdge[] = []
  const seen = new Set<string>()

  function addNode(p: any, nodeType: string) {
    if (seen.has(p.personId)) return
    seen.add(p.personId)
    nodes.push({
      id: p.personId,
      type: nodeType === 'root' ? 'personNode' : 'personNode',
      data: {
        personId: p.personId,
        fullName: p.fullName,
        nickname: p.nickname,
        birthDate: p.birthDate,
        deathDate: p.deathDate,
        birthPlace: p.birthPlace,
        isLiving: !!p.isLiving,
        profilePhotoUrl: p.profilePhotoUrl,
        linkedUserId: p.linkedUserId,
        gender: p.gender,
        nodeRole: nodeType,
      },
      position: { x: 0, y: 0 }
    } as any)
  }

  addNode(person, 'root')

  for (const rel of relationships) {
    const isFrom = rel.fromPersonId === personId
    const otherPerson = isFrom
      ? { personId: rel.tp, fullName: rel.tName, birthDate: rel.tBirth, isLiving: rel.tLiving, profilePhotoUrl: rel.tPhoto, gender: rel.tGender }
      : { personId: rel.fp, fullName: rel.fName, birthDate: rel.fBirth, isLiving: rel.fLiving, profilePhotoUrl: rel.fPhoto, gender: rel.fGender }

    let nodeType = 'relative'
    if (rel.relationshipType === 'PARENT' && isFrom) nodeType = 'child'
    else if (rel.relationshipType === 'PARENT' && !isFrom) nodeType = 'parent'
    else if (rel.relationshipType === 'CHILD' && isFrom) nodeType = 'parent'
    else if (rel.relationshipType === 'CHILD' && !isFrom) nodeType = 'child'
    else if (rel.relationshipType === 'SPOUSE' || rel.relationshipType === 'PARTNER') nodeType = 'spouse'
    else if (rel.relationshipType === 'SIBLING') nodeType = 'sibling'

    addNode(otherPerson, nodeType)

    edges.push({
      id: rel.relationshipId,
      source: rel.fromPersonId,
      target: rel.toPersonId,
      type: 'smoothstep',
      label: rel.relationshipType,
      data: { relationshipType: rel.relationshipType }
    })
  }

  layoutNodes(nodes)
  return c.json({ nodes, edges, rootPerson: person })
})

router.get('/:personId/ancestors', async (c) => {
  const { personId } = c.req.param()
  const depth = parseInt(c.req.query('depth') || '3')
  
  const nodes: any[] = []
  const edges: any[] = []
  const seen = new Set<string>()

  async function loadAncestors(pid: string, level: number) {
    if (level > depth || seen.has(pid)) return
    seen.add(pid)

    const person = await c.env.DB.prepare('SELECT * FROM Persons WHERE personId = ?').bind(pid).first<any>()
    if (!person) return

    nodes.push({
      id: person.personId,
      data: { ...person, nodeRole: level === 0 ? 'root' : 'ancestor', level },
      position: { x: level * -300 + Math.random() * 50, y: nodes.length * 150 },
      type: 'personNode'
    })

    const parents = await c.env.DB.prepare(`
      SELECT r.toPersonId as parentId FROM Relationships r
      WHERE r.fromPersonId = ? AND r.relationshipType = 'PARENT'
      UNION
      SELECT r.fromPersonId as parentId FROM Relationships r
      WHERE r.toPersonId = ? AND r.relationshipType = 'CHILD'
    `).bind(pid, pid).all<any>()

    for (const p of parents.results) {
      edges.push({ id: `${pid}-${p.parentId}`, source: p.parentId, target: pid, type: 'smoothstep', label: 'PARENT' })
      await loadAncestors(p.parentId, level + 1)
    }
  }

  await loadAncestors(personId, 0)
  return c.json({ nodes, edges })
})

router.get('/:personId/descendants', async (c) => {
  const { personId } = c.req.param()
  const depth = parseInt(c.req.query('depth') || '3')
  
  const nodes: any[] = []
  const edges: any[] = []
  const seen = new Set<string>()

  async function loadDescendants(pid: string, level: number) {
    if (level > depth || seen.has(pid)) return
    seen.add(pid)

    const person = await c.env.DB.prepare('SELECT * FROM Persons WHERE personId = ?').bind(pid).first<any>()
    if (!person) return

    nodes.push({
      id: person.personId,
      data: { ...person, nodeRole: level === 0 ? 'root' : 'descendant', level },
      position: { x: level * 300, y: nodes.length * 150 },
      type: 'personNode'
    })

    const children = await c.env.DB.prepare(`
      SELECT r.toPersonId as childId FROM Relationships r
      WHERE r.fromPersonId = ? AND r.relationshipType = 'CHILD'
      UNION
      SELECT r.fromPersonId as childId FROM Relationships r
      WHERE r.toPersonId = ? AND r.relationshipType = 'PARENT'
    `).bind(pid, pid).all<any>()

    for (const ch of children.results) {
      edges.push({ id: `${pid}-${ch.childId}`, source: pid, target: ch.childId, type: 'smoothstep', label: 'CHILD' })
      await loadDescendants(ch.childId, level + 1)
    }
  }

  await loadDescendants(personId, 0)
  return c.json({ nodes, edges })
})

export { router as treeRouter }
