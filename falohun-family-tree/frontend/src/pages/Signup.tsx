import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, TreePine, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../lib/store';
import { t } from '../i18n/translations';

export function Signup() {
  const { lang } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', displayName: '', inviteCode: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data: any = await api.auth.register(form.email, form.password, form.displayName, form.inviteCode || undefined);
      setSuccess(data.message);
      if (data.isApproved) setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-900 to-earth-800 flex items-center justify-center p-4 bg-adire">
      <div className="w-full max-w-md animate-slide-up">
        <div className="bg-cream rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-forest-700 to-earth-700 p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4">
              <TreePine size={32} className="text-gold-300" />
            </div>
            <h1 className="font-display text-3xl font-bold text-cream">{t('auth.signup.title', lang)}</h1>
            <p className="text-earth-200 text-sm mt-2 font-body">{t('auth.signup.subtitle', lang)}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-4">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-terracotta-50 border border-terracotta-200 rounded-2xl text-terracotta-700 text-sm">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-3 p-4 bg-forest-50 border border-forest-200 rounded-2xl text-forest-700 text-sm">
                <CheckCircle size={16} className="shrink-0" />
                {success}
              </div>
            )}

            {[
              { key: 'displayName', label: t('auth.displayName', lang), type: 'text', placeholder: 'Adebayo Falohun' },
              { key: 'email', label: t('auth.email', lang), type: 'email', placeholder: 'you@example.com' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-earth-700 mb-2">{label}</label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-parchment border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 text-earth-800 placeholder:text-earth-400 font-body"
                  placeholder={placeholder}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-semibold text-earth-700 mb-2">{t('auth.password', lang)}</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 pr-12 bg-parchment border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 text-earth-800 font-body"
                  placeholder="Min. 8 characters"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 p-1">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-earth-700 mb-2">{t('auth.inviteCode', lang)}</label>
              <input
                type="text"
                value={form.inviteCode}
                onChange={e => setForm(f => ({ ...f, inviteCode: e.target.value }))}
                className="w-full px-4 py-3 bg-parchment border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 text-earth-800 placeholder:text-earth-400 font-body"
                placeholder="FALOHUN2024"
              />
              <p className="flex items-start gap-2 mt-2 text-xs text-earth-400">
                <Info size={13} className="shrink-0 mt-0.5" />
                {t('auth.signup.inviteInfo', lang)}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full py-3.5 bg-gradient-to-r from-forest-600 to-earth-600 text-white font-semibold rounded-xl shadow-warm hover:shadow-glow transition-all hover:scale-[1.01] disabled:opacity-60"
            >
              {loading ? t('common.loading', lang) : t('auth.signup.submit', lang)}
            </button>

            <p className="text-center text-earth-500 text-sm font-body">
              {t('auth.signup.hasAccount', lang)}{' '}
              <Link to="/login" className="text-earth-700 font-semibold hover:text-earth-900 underline underline-offset-2">
                {t('nav.login', lang)}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
