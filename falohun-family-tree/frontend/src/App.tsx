import React, { useState, useEffect } from 'react'
import { useAuth } from './lib/auth'
import { t } from './lib/i18n'
import LandingPage from './pages/Landing'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import DashboardPage from './pages/Dashboard'
import TreePage from './pages/Tree'
import DirectoryPage from './pages/Directory'
import MessagesPage from './pages/Messages'
import ProfilePage from './pages/Profile'
import AdminPage from './pages/Admin'
import PersonPage from './pages/Person'
import Navigation from './components/ui/Navigation'
import Toast from './components/ui/Toast'

export type Page = 'landing' | 'login' | 'register' | 'dashboard' | 'tree' | 'directory' | 'messages' | 'profile' | 'admin' | 'person'

export interface ToastMsg { id: string; type: 'success' | 'error' | 'info'; message: string }

export default function App() {
  const { user, language } = useAuth()
  const [page, setPage] = useState<Page>('landing')
  const [pageParam, setPageParam] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastMsg[]>([])

  const tr = (key: string) => t(key, language)

  function navigate(p: Page, param?: string) {
    setPage(p)
    setPageParam(param || null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function addToast(type: ToastMsg['type'], message: string) {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }

  useEffect(() => {
    if (!user && !['landing', 'login', 'register'].includes(page)) {
      setPage('landing')
    }
  }, [user])

  const navProps = { navigate, currentPage: page, tr }

  return (
    <div className="min-h-screen bg-cream">
      {user && <Navigation {...navProps} />}
      
      <main className={user ? 'pt-16' : ''}>
        {page === 'landing' && <LandingPage navigate={navigate} tr={tr} />}
        {page === 'login' && <LoginPage navigate={navigate} tr={tr} addToast={addToast} />}
        {page === 'register' && <RegisterPage navigate={navigate} tr={tr} addToast={addToast} />}
        {page === 'dashboard' && user && <DashboardPage navigate={navigate} tr={tr} addToast={addToast} />}
        {page === 'tree' && user && <TreePage navigate={navigate} tr={tr} addToast={addToast} rootPersonId={pageParam} />}
        {page === 'directory' && user && <DirectoryPage navigate={navigate} tr={tr} addToast={addToast} />}
        {page === 'messages' && user && <MessagesPage navigate={navigate} tr={tr} addToast={addToast} threadId={pageParam} />}
        {page === 'profile' && user && <ProfilePage navigate={navigate} tr={tr} addToast={addToast} userId={pageParam} />}
        {page === 'admin' && user?.role === 'admin' && <AdminPage navigate={navigate} tr={tr} addToast={addToast} />}
        {page === 'person' && user && <PersonPage navigate={navigate} tr={tr} addToast={addToast} personId={pageParam} />}
      </main>

      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} />
        ))}
      </div>
    </div>
  )
}
