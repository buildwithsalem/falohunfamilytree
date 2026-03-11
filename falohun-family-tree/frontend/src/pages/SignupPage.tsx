// pages/SignupPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TreePine, Eye, EyeOff, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuthStore } from '../lib/store';
import { useLanguage } from '../i18n/useLanguage';
import { Input, Button } from '../components/ui';
import type { User } from '../types';

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  inviteCode: z.string().min(1, 'Invite code is required'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post<{ user: User }>('/auth/register', data);
      setUser(res.user);
      toast.success('Welcome to the family tree!');
      navigate('/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-earth-700 via-umber-800 to-charcoal-800" />
        <div className="absolute inset-0 adire-texture opacity-30" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        <div className="relative z-10 flex flex-col justify-between w-full p-12">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-earth-400 flex items-center justify-center">
              <TreePine className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white">Falohun</span>
          </Link>

          <div className="text-center">
            <div className="grid grid-cols-3 gap-4 mb-12">
              {[
                { label: 'Heritage', sub: 'Ohun-Ini', color: 'bg-gold-500/20 border-gold-500/30' },
                { label: 'Family', sub: 'Idile', color: 'bg-earth-500/20 border-earth-500/30' },
                { label: 'Memory', sub: 'Iranti', color: 'bg-forest-500/20 border-forest-500/30' },
              ].map((item) => (
                <div key={item.label} className={`${item.color} border rounded-2xl p-4 text-center`}>
                  <div className="font-display font-bold text-white text-sm">{item.label}</div>
                  <div className="font-sans text-xs text-white/60 mt-1">{item.sub}</div>
                </div>
              ))}
            </div>
            <h2 className="font-display text-3xl font-bold text-white mb-3">
              Join your family's story
            </h2>
            <p className="font-body text-ivory-300/70">
              Every member added strengthens the branches of our family tree.
            </p>
          </div>

          <div className="text-center text-xs font-sans text-umber-500">
            A private, secure space for the Falohun family
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-ivory-100 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-earth-500 to-gold-500 flex items-center justify-center">
              <TreePine className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-charcoal-800">Falohun Family Tree</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-charcoal-800 mb-2">
              {t('registerTitle')}
            </h1>
            <p className="font-body text-umber-600">{t('registerSubtitle')}</p>
          </div>

          {/* Invite code notice */}
          <div className="flex gap-3 p-4 bg-gold-50 border border-gold-200 rounded-xl mb-6">
            <Info className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
            <p className="font-sans text-sm text-gold-700">
              You need an invite code from a family member to register. Contact your family admin if you don't have one.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label={t('fullName')}
              placeholder="Adebayo Falohun"
              autoComplete="name"
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            <Input
              label={t('email')}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <div className="relative">
              <Input
                label={t('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                error={errors.password?.message}
                hint="Use a strong password with letters and numbers"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-9 text-umber-400 hover:text-umber-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Input
              label={t('confirmPassword')}
              type="password"
              placeholder="Repeat your password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <Input
              label={t('inviteCode')}
              placeholder="FALOHUN-XXXX"
              error={errors.inviteCode?.message}
              hint="Your invite code from a family member"
              {...register('inviteCode')}
            />

            <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">
              {t('signUp')}
            </Button>
          </form>

          <p className="text-center font-sans text-sm text-umber-600 mt-6">
            {t('haveAccount')}{' '}
            <Link to="/login" className="font-medium text-earth-600 hover:text-earth-700">
              {t('signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
