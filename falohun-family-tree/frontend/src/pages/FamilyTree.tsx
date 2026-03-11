import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  Node, Edge, Controls, MiniMap, Background, BackgroundVariant,
  useNodesState, useEdgesState, addEdge, Connection, Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Search, Plus, RefreshCw, Users, ZoomIn, ZoomOut, X, AlertCircle } from 'lucide-react';
import { PersonNode } from '../components/tree/PersonNode';
import { api } from '../lib/api';
import { useStore } from '../lib/store';
import { t } from '../i18n/translations';
import { useNavigate } from 'react-router-dom';

const nodeTypes = { personNode: PersonNode };

interface PersonFormData {
  fullName: string; nickname: string; maidenName: string; gender: string;
  birthDate: string; deathDate: string; birthPlace: string; currentCity: string;
  isLiving: boolean; biography: string; culturalNotes: string; tags: string;
  relationshipType: string; relatedPersonId: string;
}

export function FamilyTree() {
  const { lang } = useStore();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [rootPersonId, setRootPersonId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<PersonFormData>({
    fullName: '', nickname: '', maidenName: '', gender: 'unknown',
    birthDate: '', deathDate: '', birthPlace: '', currentCity: '',
    isLiving: true, biography: '', culturalNotes: '', tags: '',
    relationshipType: '', relatedPersonId: '',
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const loadedIds = useRef(new Set<string>());

  const mergeTreeData = useCallback((newNodes: any[], newEdges: any[]) => {
    setNodes(prev => {
      const prevMap = new Map(prev.map(n => [n.id, n]));
      const merged = [...prev];
      for (const n of newNodes) {
        if (!prevMap.has(n.id)) merged.push({ ...n, type: 'personNode' });
      }
      return merged;
    });
    setEdges(prev => {
      const prevMap = new Map(prev.map(e => [e.id, e]));
      const merged = [...prev];
      for (const e of newEdges) {
        if (!prevMap.has(e.id)) merged.push(e);
      }
      return merged;
    });
  }, [setNodes, setEdges]);

  const loadTree = useCallback(async (personId: string) => {
    if (loadedIds.current.has(personId)) return;
    loadedIds.current.add(personId);
    setLoading(true);
    try {
      const [immData, ancData, descData] = await Promise.all([
        api.tree.get(personId),
        api.tree.ancestors(personId, 2),
        api.tree.descendants(personId, 2),
      ]) as any[];

      const allNodes = [...(immData.nodes || []), ...(ancData.nodes || []), ...(descData.nodes || [])];
      const allEdges = [...(immData.edges || []), ...(ancData.edges || []), ...(descData.edges || [])];

      // Decorate nodes with handlers
      const decorated = allNodes.map((n: any) => ({
        ...n,
        type: 'personNode',
        data: {
          ...n.data,
          isRoot: n.id === personId,
          onExpand: (id: string, type: 'ancestors' | 'descendants') => {
            if (type === 'ancestors') loadAncestors(id);
            else loadDescendants(id);
          },
          onAction: (id: string, action: string) => handleNodeAction(id, action),
        },
      }));

      mergeTreeData(decorated, allEdges);
      setRootPersonId(personId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [mergeTreeData]);

  const loadAncestors = async (personId: string) => {
    try {
      const data: any = await api.tree.ancestors(personId, 3);
      const decorated = (data.nodes || []).map((n: any) => ({
        ...n, type: 'personNode',
        data: {
          ...n.data,
          onExpand: (id: string, type: 'ancestors' | 'descendants') => {
            if (type === 'ancestors') loadAncestors(id); else loadDescendants(id);
          },
          onAction: handleNodeAction,
        },
      }));
      mergeTreeData(decorated, data.edges || []);
    } catch (e) { console.error(e); }
  };

  const loadDescendants = async (personId: string) => {
    try {
      const data: any = await api.tree.descendants(personId, 3);
      const decorated = (data.nodes || []).map((n: any) => ({
        ...n, type: 'personNode',
        data: {
          ...n.data,
          onExpand: (id: string, type: 'ancestors' | 'descendants') => {
            if (type === 'ancestors') loadAncestors(id); else loadDescendants(id);
          },
          onAction: handleNodeAction,
        },
      }));
      mergeTreeData(decorated, data.edges || []);
    } catch (e) { console.error(e); }
  };

  const handleNodeAction = useCallback((personId: string, action: string) => {
    if (action === 'view') {
      navigate(`/persons/${personId}`);
    } else if (['addParent', 'addChild', 'addSpouse', 'addSibling'].includes(action)) {
      const relMap: Record<string, string> = {
        addParent: 'PARENT', addChild: 'CHILD', addSpouse: 'SPOUSE', addSibling: 'SIBLING',
      };
      setFormData(f => ({ ...f, relatedPersonId: personId, relationshipType: relMap[action] }));
      setShowAddForm(true);
    }
  }, [navigate]);

  // Search
  useEffect(() => {
    if (!searchQ.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const data: any = await api.persons.list({ q: searchQ, limit: '8' });
        setSearchResults(data.persons || []);
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQ]);

  // Load first person if no root
  useEffect(() => {
    (async () => {
      try {
        const data: any = await api.persons.list({ limit: '1' });
        if (data.persons?.length > 0) {
          await loadTree(data.persons[0].personId);
        }
      } catch {}
    })();
  }, []);

  const handleSavePerson = async () => {
    if (!formData.fullName.trim()) { setFormError('Full name is required'); return; }
    setSaving(true);
    setFormError('');
    try {
      const { relatedPersonId, relationshipType, tags, ...personData } = formData;
      const res: any = await api.persons.create({
        ...personData,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });

      if (relatedPersonId && relationshipType) {
        await api.persons.addRelationship(relatedPersonId, {
          toPersonId: res.personId,
          relationshipType,
        });
      }

      loadedIds.current.clear();
      if (rootPersonId) await loadTree(rootPersonId);
      setShowAddForm(false);
      setFormData({ fullName: '', nickname: '', maidenName: '', gender: 'unknown', birthDate: '', deathDate: '', birthPlace: '', currentCity: '', isLiving: true, biography: '', culturalNotes: '', tags: '', relationshipType: '', relatedPersonId: '' });
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-parchment">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-cream border-b border-earth-200 shadow-sm z-10">
        <h1 className="font-display text-xl font-semibold text-earth-800 hidden sm:block">{t('tree.title', lang)}</h1>
        <div className="flex-1 relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" />
          <input
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder={t('tree.search', lang)}
            className="w-full pl-9 pr-4 py-2 bg-parchment border border-earth-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 text-earth-700"
          />
          {/* Search dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-earth-100 z-50 overflow-hidden">
              {searchResults.map((p: any) => (
                <button
                  key={p.personId}
                  onClick={() => { loadTree(p.personId); setSearchQ(''); setSearchResults([]); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-earth-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-earth-400 to-earth-600 flex items-center justify-center text-white text-sm font-bold">
                    {p.fullName[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-earth-800">{p.fullName}</div>
                    {p.birthDate && <div className="text-xs text-earth-400">{t('tree.born', lang)} {p.birthDate.substring(0,4)}</div>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-earth-600 to-terracotta-600 text-white rounded-full text-sm font-semibold shadow-warm hover:shadow-glow transition-all"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">{t('tree.addPerson', lang)}</span>
        </button>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-earth-500">
            <RefreshCw size={14} className="animate-spin" />
          </div>
        )}
      </div>

      {/* React Flow canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#c8852a22" />
          <Controls className="!bottom-4 !left-4" />
          <MiniMap
            nodeColor={n => n.data?.gender === 'female' ? '#d4522a' : '#a66a1f'}
            className="!bottom-4 !right-4 !w-32 !h-24"
          />
          {nodes.length === 0 && !loading && (
            <Panel position="top-center">
              <div className="mt-20 bg-white/90 backdrop-blur rounded-3xl p-10 text-center border border-earth-200 shadow-card">
                <Users size={48} className="mx-auto text-earth-300 mb-4" />
                <h3 className="font-display text-2xl font-semibold text-earth-700 mb-2">Start your family tree</h3>
                <p className="text-earth-400 font-body mb-6">Add the first family member to begin.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-earth-600 to-terracotta-600 text-white rounded-full font-semibold shadow-warm"
                >
                  <Plus size={16} className="inline mr-2" />{t('tree.addPerson', lang)}
                </button>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>

      {/* Add Person Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-earth-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-cream rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-earth-100">
              <h2 className="font-display text-2xl font-semibold text-earth-800">{t('tree.addPerson', lang)}</h2>
              <button onClick={() => setShowAddForm(false)} className="p-2 rounded-full hover:bg-earth-100 text-earth-500">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-terracotta-50 border border-terracotta-200 rounded-xl text-terracotta-700 text-sm">
                  <AlertCircle size={15} />
                  {formError}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { key: 'fullName', label: t('person.fullName', lang), required: true },
                  { key: 'nickname', label: t('person.nickname', lang) },
                  { key: 'maidenName', label: t('person.maidenName', lang) },
                  { key: 'birthPlace', label: t('person.birthPlace', lang) },
                  { key: 'currentCity', label: t('person.currentCity', lang) },
                  { key: 'tags', label: t('person.tags', lang) + ' (comma-separated)' },
                ].map(({ key, label, required }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-earth-600 mb-1">{label}{required && ' *'}</label>
                    <input
                      value={formData[key as keyof typeof formData] as string}
                      onChange={e => setFormData(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-earth-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 text-earth-800"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-semibold text-earth-600 mb-1">{t('person.gender', lang)}</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData(f => ({ ...f, gender: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-earth-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 text-earth-800"
                  >
                    <option value="unknown">{t('common.unknown', lang)}</option>
                    <option value="male">{t('common.male', lang)}</option>
                    <option value="female">{t('common.female', lang)}</option>
                    <option value="other">{t('common.other', lang)}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-earth-600 mb-1">{t('person.birthDate', lang)}</label>
                  <input type="date" value={formData.birthDate} onChange={e => setFormData(f => ({ ...f, birthDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-earth-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 text-earth-800" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-earth-600 mb-1">{t('person.deathDate', lang)}</label>
                  <input type="date" value={formData.deathDate} onChange={e => setFormData(f => ({ ...f, deathDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-earth-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 text-earth-800" />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-parchment rounded-xl">
                <input
                  type="checkbox"
                  id="isLiving"
                  checked={formData.isLiving}
                  onChange={e => setFormData(f => ({ ...f, isLiving: e.target.checked }))}
                  className="w-4 h-4 accent-earth-600"
                />
                <label htmlFor="isLiving" className="text-sm font-medium text-earth-700">{t('person.isLiving', lang)}</label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-600 mb-1">{t('person.biography', lang)}</label>
                <textarea value={formData.biography} onChange={e => setFormData(f => ({ ...f, biography: e.target.value }))} rows={3}
                  className="w-full px-3 py-2 bg-white border border-earth-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 text-earth-800 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-600 mb-1">{t('person.culturalNotes', lang)}</label>
                <textarea value={formData.culturalNotes} onChange={e => setFormData(f => ({ ...f, culturalNotes: e.target.value }))} rows={2}
                  className="w-full px-3 py-2 bg-white border border-earth-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 text-earth-800 resize-none" />
              </div>

              {formData.relatedPersonId && (
                <div className="p-3 bg-gold-50 border border-gold-200 rounded-xl text-sm text-gold-800">
                  Linking as <strong>{formData.relationshipType}</strong> to selected person
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-earth-100">
              <button onClick={() => setShowAddForm(false)} className="flex-1 py-3 border border-earth-200 rounded-xl text-earth-600 font-semibold hover:bg-earth-50 transition-colors">
                {t('common.cancel', lang)}
              </button>
              <button onClick={handleSavePerson} disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-earth-600 to-terracotta-600 text-white rounded-xl font-semibold shadow-warm hover:shadow-glow transition-all disabled:opacity-60">
                {saving ? t('common.loading', lang) : t('person.save', lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
