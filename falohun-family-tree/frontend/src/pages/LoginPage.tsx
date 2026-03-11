// pages/LoginPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TreePine, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuthStore } from '../lib/store';
import { useLanguage } from '../i18n/useLanguage';
import { Input, Button } from '../components/ui';
import type { User } from '../types';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post<{ user: User }>('/auth/login', data);
      setUser(res.user);
      toast.success('Welcome back to the family!');
      navigate('/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal-800 via-umber-900 to-earth-800" />
        <div className="absolute inset-0 adire-texture opacity-30" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-earth-500 to-gold-400 flex items-center justify-center shadow-warm-lg mb-6 animate-float">
            <TreePine className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Falohun Family Tree
          </h2>
          <p className="font-body text-ivory-300/80 text-lg max-w-xs">
            Your family story, preserved for generations to come
          </p>
          <div className="flex gap-2 mt-8">
            {['bg-gold-500','bg-earth-400','bg-umber-400','bg-earth-400','bg-gold-500'].map((c, i) => (
              <div key={i} className={`h-1 w-8 ${c} rounded-full`} />
            ))}
          </div>
          <blockquote className="mt-12 font-display italic text-lg text-white/70">
            "Igi to gun jù, ogún ẹsẹ ló nmú."
          </blockquote>
          <p className="font-sans text-xs text-umber-400 mt-2">
            A tall tree has twenty roots
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-ivory-100">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-earth-500 to-gold-500 flex items-center justify-center">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-charcoal-800">Falohun Family Tree</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-charcoal-800 mb-2">
              {t('loginTitle')}
            </h1>
            <p className="font-body text-umber-600">{t('loginSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label={t('email')}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <div className="relative">
                <Input
                  label={t('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-9 text-umber-400 hover:text-umber-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <Link to="/forgot-password" className="text-xs font-sans text-earth-600 hover:text-earth-700 transition-colors">
                  {t('forgotPassword')}
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              className="w-full"
            >
              {t('signIn')}
            </Button>
          </form>

          <p className="text-center font-sans text-sm text-umber-600 mt-6">
            {t('noAccount')}{' '}
            <Link to="/signup" className="font-medium text-earth-600 hover:text-earth-700 transition-colors">
              {t('signUp')}
            </Link>
          </p>

          {/* Decorative divider */}
          <div className="flex items-center gap-3 mt-8">
            <div className="flex-1 h-px bg-earth-200" />
            <div className="flex gap-1">
              {['bg-gold-400','bg-earth-400','bg-gold-400'].map((c, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${c}`} />
              ))}
            </div>
            <div className="flex-1 h-px bg-earth-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
