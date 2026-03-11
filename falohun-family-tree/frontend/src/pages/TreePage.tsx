// pages/TreePage.tsx
import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge,
  Node, Edge, Connection, BackgroundVariant, Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Search, RefreshCw, Plus, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useLanguage } from '../i18n/useLanguage';
import PersonNode from '../components/tree/PersonNode';
import NodeContextMenu from '../components/tree/NodeContextMenu';
import AddPersonModal from '../components/tree/AddPersonModal';
import type { Person, TreeNode as TNode, TreeEdge as TEdge } from '../types';

const nodeTypes = { personNode: PersonNode };

export default function TreePage() {
  const { t, language } = useLanguage();
  const en = language === 'en';

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [rootPerson, setRootPerson] = useState<Person | null>(null);
  const [persons, setPersons] = useState<Person[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ personId: string; x: number; y: number } | null>(null);
  const [addModal, setAddModal] = useState<{ type: 'parent' | 'child' | 'spouse' | 'standalone'; relatedPersonId?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Load tree from root person
  const loadTree = useCallback(async (personId: string) => {
    setLoading(true);
    try {
      const data = await api.get<{ nodes: TNode[]; edges: TEdge[] }>(`/tree/${personId}`);
      
      // Layout nodes in a hierarchical grid
      const flowNodes: Node[] = data.nodes.map((n, i) => ({
        id: n.id,
        type: 'personNode',
        position: n.position ?? { x: (i % 4) * 280, y: Math.floor(i / 4) * 200 },
        data: { ...n.data, onContextMenu: (e: React.MouseEvent) => {
          e.preventDefault();
          setContextMenu({ personId: n.id, x: e.clientX, y: e.clientY });
        }},
      }));

      const flowEdges: Edge[] = data.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'smoothstep',
        className: e.data?.relationshipType === 'SPOUSE' ? 'spouse' : '',
        label: e.label,
        style: {
          stroke: e.data?.relationshipType === 'SPOUSE' ? '#f5b800' : '#d4891f',
          strokeWidth: 2,
          strokeDasharray: e.data?.relationshipType === 'SPOUSE' ? '6 4' : undefined,
        },
        labelStyle: { fontFamily: 'DM Sans', fontSize: 11, fill: '#aa7856' },
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (err) {
      toast.error('Failed to load family tree');
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges]);

  // Expand relatives of a node
  const expandNode = useCallback(async (personId: string, direction: 'ancestors' | 'descendants') => {
    try {
      const data = await api.get<{ nodes: TNode[]; edges: TEdge[] }>(`/tree/${personId}/${direction}`);
      
      setNodes(prev => {
        const existing = new Set(prev.map(n => n.id));
        const offset = prev.length * 10;
        const newNodes = data.nodes
          .filter(n => !existing.has(n.id))
          .map((n, i) => ({
            id: n.id,
            type: 'personNode',
            position: { x: (i % 4) * 280 + offset, y: Math.floor(i / 4) * 200 + offset },
            data: { ...n.data, onContextMenu: (e: React.MouseEvent) => {
              e.preventDefault();
              setContextMenu({ personId: n.id, x: e.clientX, y: e.clientY });
            }},
          }));
        return [...prev, ...newNodes];
      });

      setEdges(prev => {
        const existing = new Set(prev.map(e => e.id));
        const newEdges = data.edges.filter(e => !existing.has(e.id)).map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: 'smoothstep',
          style: { stroke: '#d4891f', strokeWidth: 2 },
        }));
        return [...prev, ...newEdges];
      });

      toast.success(`Loaded ${data.nodes.length} relatives`);
    } catch {
      toast.error('Failed to expand tree');
    }
  }, [setNodes, setEdges]);

  // Load initial persons list
  useEffect(() => {
    api.get<{ persons: Person[] }>('/persons').then(d => setPersons(d.persons));
  }, []);

  // Search persons
  useEffect(() => {
    if (!searchQuery) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    setSearchResults(persons.filter(p =>
      p.fullName.toLowerCase().includes(q) ||
      p.nickname?.toLowerCase().includes(q) ||
      p.birthPlace?.toLowerCase().includes(q)
    ).slice(0, 8));
  }, [searchQuery, persons]);

  const selectRoot = (person: Person) => {
    setRootPerson(person);
    setShowSearch(false);
    setSearchQuery('');
    loadTree(person.personId);
  };

  const onConnect = useCallback((params: Connection) => setEdges(e => addEdge(params, e)), [setEdges]);

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      {/* Tree toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white/90 backdrop-blur border-b border-earth-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-earth-500 to-gold-500 flex items-center justify-center">
            <span className="text-white text-xs">🌳</span>
          </div>
          <span className="font-display font-semibold text-charcoal-800 hidden sm:block">
            {t('treeTitle')}
          </span>
        </div>

        {/* Root selector */}
        <div className="relative flex-1 max-w-xs">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="w-full flex items-center gap-2 px-3 py-2 bg-ivory-100 border border-earth-200 rounded-lg text-sm font-sans text-umber-600 hover:border-earth-300 transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="flex-1 text-left truncate">
              {rootPerson ? rootPerson.fullName : (en ? 'Select starting person...' : 'Yan eniyan ibẹrẹ...')}
            </span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showSearch ? 'rotate-90' : ''}`} />
          </button>

          {showSearch && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-warm-lg border border-earth-100 z-20 overflow-hidden">
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={en ? 'Search by name...' : 'Ṣawari nipasẹ orukọ...'}
                className="w-full px-4 py-3 text-sm font-sans border-b border-earth-100 focus:outline-none"
              />
              <div className="max-h-64 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map(p => (
                    <button
                      key={p.personId}
                      onClick={() => selectRoot(p)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-earth-50 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-earth-400 to-gold-400 flex items-center justify-center text-white text-xs font-bold">
                        {p.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-sans font-medium text-charcoal-800">{p.fullName}</div>
                        <div className="text-xs font-sans text-umber-500">{p.birthPlace ?? p.currentCity ?? ''}</div>
                      </div>
                    </button>
                  ))
                ) : searchQuery ? (
                  <p className="px-4 py-3 text-sm font-sans text-umber-400 text-center">No results</p>
                ) : (
                  persons.slice(0, 6).map(p => (
                    <button
                      key={p.personId}
                      onClick={() => selectRoot(p)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-earth-50 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-earth-400 to-gold-400 flex items-center justify-center text-white text-xs font-bold">
                        {p.fullName.charAt(0)}
                      </div>
                      <span className="text-sm font-sans text-charcoal-800">{p.fullName}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {rootPerson && (
            <button
              onClick={() => loadTree(rootPerson.personId)}
              className="p-2 rounded-lg text-umber-500 hover:bg-earth-50 hover:text-earth-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button
            onClick={() => setAddModal({ type: 'standalone' })}
            className="flex items-center gap-1.5 px-3 py-2 bg-earth-500 text-white rounded-lg text-sm font-sans font-medium hover:bg-earth-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:block">{t('addPerson')}</span>
          </button>
        </div>
      </div>

      {/* React Flow canvas */}
      <div className="flex-1 relative">
        {!rootPerson && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🌳</div>
              <h3 className="font-display text-2xl font-bold text-charcoal-800 mb-2">
                {en ? 'Select a family member to begin' : 'Yan ọmọ ẹbi lati bẹrẹ'}
              </h3>
              <p className="font-body text-umber-500 max-w-sm">
                {en
                  ? 'Choose a starting point from the search bar above to explore the family tree'
                  : 'Yan ibẹrẹ lati ọpa wiwa loke lati ṣawari igi idile'
                }
              </p>
              <button
                onClick={() => setShowSearch(true)}
                className="mt-6 btn-primary inline-flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {en ? 'Search Family Members' : 'Ṣawari Awọn Ọmọ Ẹbi'}
              </button>
            </div>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.1}
          maxZoom={2}
          onClick={() => setContextMenu(null)}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1.5}
            color="#e5d5c4"
          />
          <Controls className="!bottom-6 !left-6" />
          <MiniMap
            className="!bottom-6 !right-6"
            nodeColor="#d4891f"
            maskColor="rgba(250,243,228,0.7)"
          />
          
          {/* Legend panel */}
          <Panel position="top-right" className="bg-white/90 backdrop-blur rounded-xl border border-earth-100 p-3 shadow-warm text-xs font-sans">
            <div className="font-semibold text-umber-700 mb-2">{en ? 'Legend' : 'Alaye'}</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-earth-500 rounded" />
                <span className="text-umber-600">{t('parent')}/{t('child')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-gold-500 rounded" style={{ borderTop: '2px dashed #f5b800', background: 'none' }} />
                <span className="text-umber-600">{t('spouse')}</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>

        {/* Context menu */}
        {contextMenu && (
          <NodeContextMenu
            personId={contextMenu.personId}
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            onExpandAncestors={() => { expandNode(contextMenu.personId, 'ancestors'); setContextMenu(null); }}
            onExpandDescendants={() => { expandNode(contextMenu.personId, 'descendants'); setContextMenu(null); }}
            onAddParent={() => { setAddModal({ type: 'parent', relatedPersonId: contextMenu.personId }); setContextMenu(null); }}
            onAddChild={() => { setAddModal({ type: 'child', relatedPersonId: contextMenu.personId }); setContextMenu(null); }}
            onAddSpouse={() => { setAddModal({ type: 'spouse', relatedPersonId: contextMenu.personId }); setContextMenu(null); }}
          />
        )}
      </div>

      {/* Add Person Modal */}
      {addModal && (
        <AddPersonModal
          type={addModal.type}
          relatedPersonId={addModal.relatedPersonId}
          onClose={() => setAddModal(null)}
          onSuccess={() => {
            setAddModal(null);
            if (rootPerson) loadTree(rootPerson.personId);
          }}
        />
      )}
    </div>
  );
}
