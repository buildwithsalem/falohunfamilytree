import { create } from 'zustand'

interface User {
  userId: string
  email: string
  role: string
  displayName: string
  profilePhotoUrl?: string
}

interface AuthStore {
  user: User | null
  token: string | null
  language: 'en' | 'yo'
  login: (token: string, user: User) => void
  logout: () => void
  setUser: (user: Partial<User>) => void
  setLanguage: (lang: 'en' | 'yo') => void
}

export const useAuth = create<AuthStore>((set) => ({
  user: (() => {
    try {
      const u = localStorage.getItem('falohun_user')
      return u ? JSON.parse(u) : null
    } catch { return null }
  })(),
  token: localStorage.getItem('falohun_token'),
  language: (localStorage.getItem('falohun_lang') as 'en' | 'yo') || 'en',
  login: (token, user) => {
    localStorage.setItem('falohun_token', token)
    localStorage.setItem('falohun_user', JSON.stringify(user))
    set({ token, user })
  },
  logout: () => {
    localStorage.removeItem('falohun_token')
    localStorage.removeItem('falohun_user')
    set({ token: null, user: null })
  },
  setUser: (updates) => set((state) => {
    const updated = { ...state.user!, ...updates }
    localStorage.setItem('falohun_user', JSON.stringify(updated))
    return { user: updated }
  }),
  setLanguage: (lang) => {
    localStorage.setItem('falohun_lang', lang)
    set({ language: lang })
  },
}))
