import React, { useState } from 'react'
import { Page } from '../../App'
import { useAuth } from '../../lib/auth'

interface Props {
  navigate: (p: Page) => void
  currentPage: Page
  tr: (key: string) => string
}

export default function Navigation({ navigate, currentPage, tr }: Props) {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('landing')
  }

  const navItems: { page: Page; key: string; icon: string }[] = [
    { page: 'dashboard', key: 'nav.home', icon: '🏡' },
    { page: 'tree', key: 'nav.tree', icon: '🌳' },
    { page: 'directory', key: 'nav.directory', icon: '👥' },
    { page: 'messages', key: 'nav.messages', icon: '💬' },
  ]

  if (user?.role === 'admin') navItems.push({ page: 'admin', key: 'nav.admin', icon: '⚙️' })

  return (
    <nav className="fixed top-0 inset-x-0 z-40 bg-warm-white/95 backdrop-blur-md border-b border-sand/50 h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => navigate('dashboard')} className="flex items-center gap-2.5">
          <div className="w-8 h-8 gold-gradient rounded-full flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-sm">🌳</span>
          </div>
          <span className="font-display text-xl font-semibold text-bark hidden sm:block">Falohun</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <button key={item.page} onClick={() => navigate(item.page)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${currentPage === item.page ? 'bg-gold/12 text-gold-dark' : 'text-bark-light hover:text-bark hover:bg-cream'}`}>
              <span className="text-base">{item.icon}</span>
              {tr(item.key)}
            </button>
          ))}
        </div>

        {/* Profile */}
        <div className="relative">
          <button onClick={() => setProfileOpen(o => !o)} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-cream transition-colors">
            <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-sm overflow-hidden">
              {user?.profilePhotoUrl ? <img src={user.profilePhotoUrl} className="w-full h-full object-cover" /> : '👤'}
            </div>
            <span className="text-sm font-medium text-bark hidden sm:block truncate max-w-24">{user?.displayName}</span>
            <span className="text-bark-light text-xs">▾</span>
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-warm-white rounded-2xl card-shadow border border-sand/50 overflow-hidden z-20 animate-fade-in">
                <button onClick={() => { navigate('profile'); setProfileOpen(false) }} className="w-full px-4 py-3 text-left text-sm text-bark hover:bg-cream transition-colors flex items-center gap-2">
                  👤 {tr('nav.profile')}
                </button>
                <div className="border-t border-sand/50" />
                <button onClick={handleLogout} className="w-full px-4 py-3 text-left text-sm text-terracotta hover:bg-terracotta/5 transition-colors flex items-center gap-2">
                  🚪 {tr('nav.logout')}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <button onClick={() => setMobileOpen(o => !o)} className="md:hidden w-8 h-8 flex items-center justify-center text-bark-light">
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-warm-white border-b border-sand/50 px-4 pb-4">
          {navItems.map(item => (
            <button key={item.page} onClick={() => { navigate(item.page); setMobileOpen(false) }}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-bark-light hover:text-bark hover:bg-cream transition-colors">
              <span>{item.icon}</span> {tr(item.key)}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}
