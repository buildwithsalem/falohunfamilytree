import React, { useState, useCallback, useEffect } from 'react'
import ReactFlow, {
  Node, Edge, Controls, MiniMap, Background,
  useNodesState, useEdgesState, addEdge,
  Handle, Position, NodeProps,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Page, ToastMsg } from '../App'
import { api } from '../lib/api'
import PersonModal from '../components/tree/PersonModal'
import AddPersonModal from '../components/tree/AddPersonModal'

interface Props {
  navigate: (p: Page, param?: string) => void
  tr: (key: string) => string
  addToast: (type: ToastMsg['type'], msg: string) => void
  rootPersonId?: string | null
}

// Custom person node
function PersonNode({ data }: NodeProps) {
  const genderColor = data.gender === 'female' ? 'bg-rose-50 border-rose-200' : data.gender === 'male' ? 'bg-sky-50 border-sky-200' : 'bg-sand/30 border-sand'
  const isRoot = data.nodeRole === 'root'

  return (
    <div className={`relative group cursor-pointer select-none transition-all duration-200 hover:scale-105`}>
      <Handle type="target" position={Position.Top} className="!bg-gold !border-gold-dark !w-2 !h-2" />
      <div className={`
        w-36 rounded-2xl border-2 p-3 text-center card-shadow
        ${isRoot ? 'bg-gold/10 border-gold shadow-gold/20 shadow-lg' : `${genderColor}`}
        ${data.nodeRole === 'ancestor' ? 'opacity-90' : ''}
      `}
        style={isRoot ? { background: 'linear-gradient(135deg, rgba(201,151,58,0.15) 0%, rgba(232,201,122,0.1) 100%)', borderColor: '#C9973A' } : {}}>
        <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-xl overflow-hidden border-2 ${isRoot ? 'border-gold' : 'border-white'} bg-white shadow-sm`}>
          {data.profilePhotoUrl
            ? <img src={data.profilePhotoUrl} className="w-full h-full object-cover" alt={data.fullName} />
            : <span>{data.gender === 'female' ? '👩' : '👨'}</span>
          }
        </div>
        <p className="text-xs font-semibold text-bark leading-tight truncate">{data.fullName}</p>
        {data.nickname && <p className="text-xs text-bark-light italic">"{data.nickname}"</p>}
        <p className="text-xs text-bark-light mt-0.5">
          {data.birthDate ? new Date(data.birthDate).getFullYear() : '?'}
          {!data.isLiving && data.deathDate ? ` – ${new Date(data.deathDate).getFullYear()}` : !data.isLiving ? ' †' : ''}
        </p>
        {isRoot && <div className="absolute -top-2 -right-2 bg-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow">★</div>}
      </div>
      {/* Action menu on hover */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-bark text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
        Click to manage
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gold !border-gold-dark !w-2 !h-2" />
    </div>
  )
}

const nodeTypes = { personNode: PersonNode }

export default function TreePage({ navigate, tr, addToast, rootPersonId }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [loading, setLoading] = useState(false)
  const [persons, setPersons] = useState<any[]>([])
  const [rootPerson, setRootPerson] = useState<any>(null)
  const [selectedPerson, setSelectedPerson] = useState<any>(null)
  const [showPersonModal, setShowPersonModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addMode, setAddMode] = useState<string>('')

  useEffect(() => {
    api.persons.list().then(setPersons).catch(() => {})
  }, [])

  useEffect(() => {
    if (rootPersonId) loadTree(rootPersonId)
    else if (persons.length > 0) loadTree(persons[0].personId)
  }, [rootPersonId, persons])

  async function loadTree(personId: string) {
    setLoading(true)
    try {
      const data = await api.tree.get(personId)
      const layouted = autoLayout(data.nodes, data.edges)
      setNodes(layouted.nodes)
      setEdges(layouted.edges.map(e => ({
        ...e,
        style: { stroke: '#C9973A', strokeWidth: 2 },
        labelStyle: { fill: '#6B4C3B', fontSize: 10 },
        animated: e.data?.relationshipType === 'SPOUSE',
      })))
      setRootPerson(data.rootPerson)
    } catch (err) {
      addToast('error', 'Failed to load tree')
    } finally {
      setLoading(false)
    }
  }

  function autoLayout(rawNodes: any[], rawEdges: any[]): { nodes: Node[], edges: Edge[] } {
    const SPACING_X = 180, SPACING_Y = 160
    const rolePositions: Record<string, {x: number, y: number}> = {}
    let xCounts: Record<string, number> = {}

    rawNodes.forEach(n => {
      const role = n.data?.nodeRole || 'relative'
      xCounts[role] = (xCounts[role] || 0) + 1
    })

    const roleY: Record<string, number> = {
      parent: 0, grandparent: -SPACING_Y,
      root: SPACING_Y * 2, spouse: SPACING_Y * 2,
      child: SPACING_Y * 4, grandchild: SPACING_Y * 5,
      sibling: SPACING_Y * 2, relative: SPACING_Y * 3,
      ancestor: 0, descendant: SPACING_Y * 4,
    }

    const roleX: Record<string, number[]> = {}
    rawNodes.forEach(n => {
      const role = n.data?.nodeRole || 'relative'
      if (!roleX[role]) roleX[role] = []
      const idx = roleX[role].length
      const total = xCounts[role]
      const x = (idx - (total - 1) / 2) * SPACING_X
      roleX[role].push(x)
      rolePositions[n.id] = { x, y: roleY[role] ?? SPACING_Y * 2 }
    })

    return {
      nodes: rawNodes.map((n, i) => ({
        ...n,
        position: rolePositions[n.id] || { x: i * SPACING_X, y: SPACING_Y * 2 },
        type: 'personNode',
      })),
      edges: rawEdges
    }
  }

  function onNodeClick(_: any, node: Node) {
    setSelectedPerson(node.data)
    setShowPersonModal(true)
  }

  async function expandAncestors() {
    if (!rootPerson) return
    setLoading(true)
    try {
      const data = await api.tree.ancestors(rootPerson.personId, 3)
      const layouted = autoLayout(data.nodes, data.edges)
      setNodes(layouted.nodes)
      setEdges(layouted.edges.map(e => ({ ...e, style: { stroke: '#C9973A', strokeWidth: 2 } })))
    } catch { addToast('error', 'Failed to load ancestors') }
    finally { setLoading(false) }
  }

  async function expandDescendants() {
    if (!rootPerson) return
    setLoading(true)
    try {
      const data = await api.tree.descendants(rootPerson.personId, 3)
      const layouted = autoLayout(data.nodes, data.edges)
      setNodes(layouted.nodes)
      setEdges(layouted.edges.map(e => ({ ...e, style: { stroke: '#C9973A', strokeWidth: 2 } })))
    } catch { addToast('error', 'Failed to load descendants') }
    finally { setLoading(false) }
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Toolbar */}
      <div className="bg-warm-white border-b border-sand/50 px-6 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1">
          <span className="font-display text-xl font-semibold text-bark">{tr('tree.title')}</span>
          {rootPerson && (
            <span className="tag">{rootPerson.fullName}</span>
          )}
        </div>
        {/* Root person selector */}
        <select className="input-warm w-48 text-sm py-2" onChange={e => { if (e.target.value) loadTree(e.target.value) }}>
          <option value="">{tr('tree.selectRoot')}</option>
          {persons.map(p => <option key={p.personId} value={p.personId}>{p.fullName}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <button onClick={expandAncestors} className="btn-outline text-sm py-1.5 px-3">{tr('tree.expandAncestors')}</button>
          <button onClick={expandDescendants} className="btn-outline text-sm py-1.5 px-3">{tr('tree.expandDescendants')}</button>
          <button onClick={() => { setShowAddModal(true); setAddMode('new') }} className="btn-gold text-sm py-1.5 px-3">+ {tr('person.add')}</button>
        </div>
      </div>

      {/* Tree canvas */}
      <div className="flex-1 relative" style={{background: 'radial-gradient(circle at 50% 50%, rgba(201,151,58,0.04) 0%, transparent 70%), #FAF6EE'}}>
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-cream/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-5xl mb-4 animate-bounce">🌳</div>
              <p className="font-display text-xl text-bark">{tr('tree.loading')}</p>
            </div>
          </div>
        )}
        {!loading && nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🌱</div>
              <p className="font-display text-2xl text-bark mb-2">{tr('tree.noData')}</p>
              <button onClick={() => setShowAddModal(true)} className="btn-gold mt-4">{tr('person.add')}</button>
            </div>
          </div>
        )}
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView fitViewOptions={{ padding: 0.3 }}
          minZoom={0.2} maxZoom={2}
        >
          <Controls className="!bottom-4 !left-4" />
          <MiniMap nodeColor={n => n.data?.nodeRole === 'root' ? '#C9973A' : '#E8D5B7'} maskColor="rgba(250,246,238,0.8)" />
          <Background color="#C9973A" gap={40} size={1} style={{ opacity: 0.06 }} />
        </ReactFlow>
      </div>

      {/* Person action modal */}
      {showPersonModal && selectedPerson && (
        <PersonModal
          person={selectedPerson}
          onClose={() => setShowPersonModal(false)}
          onViewProfile={() => { setShowPersonModal(false); navigate('person', selectedPerson.personId) }}
          onAddRelative={(mode: string) => { setShowPersonModal(false); setAddMode(mode); setShowAddModal(true) }}
          onExpand={(mode: string) => {
            setShowPersonModal(false)
            if (mode === 'ancestors') { setRootPerson(selectedPerson); expandAncestors() }
            else if (mode === 'descendants') { setRootPerson(selectedPerson); expandDescendants() }
            else loadTree(selectedPerson.personId)
          }}
          tr={tr}
        />
      )}

      {/* Add person modal */}
      {showAddModal && (
        <AddPersonModal
          mode={addMode}
          relativeTo={selectedPerson}
          persons={persons}
          onClose={() => setShowAddModal(false)}
          onSaved={(newPerson) => {
            addToast('success', `${newPerson.fullName} added successfully`)
            setShowAddModal(false)
            setPersons(prev => [...prev, newPerson])
            loadTree(rootPerson?.personId || newPerson.personId)
          }}
          addToast={addToast}
          tr={tr}
        />
      )}
    </div>
  )
}
