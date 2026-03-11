const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787'

function getToken(): string | null {
  return localStorage.getItem('falohun_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as any).error || 'Request failed')
  }
  
  return res.json()
}

export const api = {
  auth: {
    login: (email: string, password: string) => request<{ token: string; userId: string; displayName: string; role: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (data: { email: string; password: string; displayName: string; inviteCode?: string }) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },
  profiles: {
    me: () => request<any>('/api/profiles/me'),
    update: (data: any) => request('/api/profiles/me', { method: 'PUT', body: JSON.stringify(data) }),
    get: (userId: string) => request<any>(`/api/profiles/${userId}`),
  },
  persons: {
    list: () => request<any[]>('/api/persons'),
    get: (id: string) => request<any>(`/api/persons/${id}`),
    create: (data: any) => request<any>('/api/persons', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/api/persons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/api/persons/${id}`, { method: 'DELETE' }),
  },
  relationships: {
    create: (data: any) => request<any>('/api/relationships', { method: 'POST', body: JSON.stringify(data) }),
    forPerson: (personId: string) => request<any[]>(`/api/relationships/person/${personId}`),
    delete: (id: string) => request(`/api/relationships/${id}`, { method: 'DELETE' }),
  },
  tree: {
    get: (personId: string) => request<any>(`/api/tree/${personId}`),
    ancestors: (personId: string, depth = 3) => request<any>(`/api/tree/${personId}/ancestors?depth=${depth}`),
    descendants: (personId: string, depth = 3) => request<any>(`/api/tree/${personId}/descendants?depth=${depth}`),
  },
  media: {
    upload: (formData: FormData) => {
      const token = getToken()
      return fetch(`${API_BASE}/api/media/upload`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      }).then(r => r.json())
    },
    forPerson: (personId: string) => request<any[]>(`/api/media/person/${personId}`),
  },
  messages: {
    threads: () => request<any[]>('/api/messages/threads'),
    createThread: (recipientUserId: string) => request<any>('/api/messages/threads', { method: 'POST', body: JSON.stringify({ recipientUserId }) }),
    getMessages: (threadId: string) => request<any[]>(`/api/messages/threads/${threadId}`),
    send: (threadId: string, content: string) => request<any>(`/api/messages/threads/${threadId}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
  },
  search: {
    query: (q: string, location?: string, tags?: string) => {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (location) params.set('location', location)
      if (tags) params.set('tags', tags)
      return request<any[]>(`/api/search?${params}`)
    },
  },
  admin: {
    users: () => request<any[]>('/api/admin/users'),
    approveUser: (userId: string) => request(`/api/admin/users/${userId}/approve`, { method: 'PATCH' }),
    deleteUser: (userId: string) => request(`/api/admin/users/${userId}`, { method: 'DELETE' }),
    createInvite: (expiresAt?: string) => request<any>('/api/admin/invites', { method: 'POST', body: JSON.stringify({ expiresAt }) }),
    invites: () => request<any[]>('/api/admin/invites'),
    stats: () => request<any>('/api/admin/stats'),
  },
}
