import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TreePine, MessageCircle, Users, Home, User, Shield, LogOut, Menu, X, Globe } from 'lucide-react';
import { useStore } from '../../lib/store';
import { api } from '../../lib/api';
import { t, type Lang } from '../../i18n/translations';

export function Navbar() {
  const { user, lang, setUser, setLang } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await api.auth.logout();
    setUser(null);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = user ? [
    { path: '/dashboard', icon: Home, label: t('nav.home', lang) },
    { path: '/tree', icon: TreePine, label: t('nav.tree', lang) },
    { path: '/directory', icon: Users, label: t('nav.directory', lang) },
    { path: '/messages', icon: MessageCircle, label: t('nav.messages', lang) },
    { path: '/profile', icon: User, label: t('nav.profile', lang) },
    ...(user.role === 'admin' ? [{ path: '/admin', icon: Shield, label: t('nav.admin', lang) }] : []),
  ] : [];

  return (
    <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-md border-b border-earth-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-500 to-earth-600 flex items-center justify-center shadow-warm group-hover:shadow-glow transition-shadow">
              <TreePine size={18} className="text-cream" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-semibold text-xl text-earth-800 leading-tight">Falohun</span>
              <span className="block text-xs text-earth-500 leading-none tracking-widest uppercase font-body">Family Tree</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(path)
                    ? 'bg-earth-100 text-earth-700 shadow-sm'
                    : 'text-earth-600 hover:bg-earth-50 hover:text-earth-700'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'yo' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-gold-300 text-gold-700 hover:bg-gold-50 transition-colors"
              title={lang === 'en' ? 'Switch to Yoruba' : 'Switch to English'}
            >
              <Globe size={13} />
              {lang === 'en' ? 'EN' : 'YO'}
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5">
                  {user.profilePhotoUrl ? (
                    <img src={user.profilePhotoUrl} alt="" className="w-7 h-7 rounded-full object-cover border border-earth-300" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-earth-400 to-terracotta-500 flex items-center justify-center text-xs font-bold text-white">
                      {user.displayName?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-earth-700 font-medium">{user.displayName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-earth-500 hover:text-earth-700 hover:bg-earth-50 transition-colors"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="px-4 py-1.5 text-sm font-medium text-earth-700 hover:text-earth-900 transition-colors">
                  {t('nav.login', lang)}
                </Link>
                <Link to="/signup" className="px-4 py-1.5 text-sm font-semibold bg-gradient-to-r from-earth-500 to-terracotta-500 text-white rounded-full shadow-warm hover:shadow-glow transition-all hover:scale-105">
                  {t('nav.signup', lang)}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-earth-600 hover:bg-earth-50"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-earth-100 bg-cream py-3 px-4 space-y-1 animate-fade-in">
          {navLinks.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive(path) ? 'bg-earth-100 text-earth-700' : 'text-earth-600'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={() => { handleLogout(); setMenuOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-earth-500"
            >
              <LogOut size={18} />
              {t('nav.logout', lang)}
            </button>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-center py-2.5 border border-earth-300 rounded-xl text-earth-700 font-medium text-sm">
                {t('nav.login', lang)}
              </Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="block text-center py-2.5 bg-gradient-to-r from-earth-500 to-terracotta-500 text-white rounded-xl font-semibold text-sm">
                {t('nav.signup', lang)}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
