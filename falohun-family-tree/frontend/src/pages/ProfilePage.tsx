// pages/ProfilePage.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Camera, Linkedin, Instagram, Facebook, Twitter, Youtube, Globe } from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../lib/store';
import { useLanguage } from '../i18n/useLanguage';
import { Input, Textarea, Button, Card, Avatar, SectionHeader } from '../components/ui';
import type { UserProfile } from '../types';

const schema = z.object({
  displayName: z.string().min(1, 'Name required'),
  bio: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  tiktokUrl: z.string().url().optional().or(z.literal('')),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  allowContact: z.boolean(),
  showSocialLinks: z.boolean(),
});
type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { t, language } = useLanguage();
  const en = language === 'en';

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      allowContact: true,
      showSocialLinks: true,
    },
  });

  useEffect(() => {
    if (user?.profile) {
      reset({
        displayName: user.profile.displayName ?? '',
        bio: user.profile.bio ?? '',
        location: user.profile.location ?? '',
        linkedinUrl: user.profile.linkedinUrl ?? '',
        instagramUrl: user.profile.instagramUrl ?? '',
        facebookUrl: user.profile.facebookUrl ?? '',
        twitterUrl: user.profile.twitterUrl ?? '',
        tiktokUrl: user.profile.tiktokUrl ?? '',
        youtubeUrl: user.profile.youtubeUrl ?? '',
        websiteUrl: user.profile.websiteUrl ?? '',
        allowContact: user.profile.allowContact ?? true,
        showSocialLinks: user.profile.showSocialLinks ?? true,
      });
    }
  }, [user?.profile, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.put<{ profile: UserProfile }>('/profile', data);
      setUser({ ...user!, profile: res.profile });
      toast.success(en ? 'Profile updated!' : 'Profaili ti ni imudojuiwọn!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const socialFields = [
    { name: 'linkedinUrl' as const, icon: Linkedin, label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...' },
    { name: 'instagramUrl' as const, icon: Instagram, label: 'Instagram', placeholder: 'https://instagram.com/...' },
    { name: 'facebookUrl' as const, icon: Facebook, label: 'Facebook', placeholder: 'https://facebook.com/...' },
    { name: 'twitterUrl' as const, icon: Twitter, label: 'Twitter / X', placeholder: 'https://x.com/...' },
    { name: 'youtubeUrl' as const, icon: Youtube, label: 'YouTube', placeholder: 'https://youtube.com/...' },
    { name: 'websiteUrl' as const, icon: Globe, label: en ? 'Website' : 'Oju Opo', placeholder: 'https://...' },
  ];

  const displayName = user?.profile?.displayName ?? user?.email?.split('@')[0] ?? 'You';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SectionHeader
        title={t('editProfile')}
        subtitle={en ? 'Update your information visible to family members' : 'Ṣatunṣe alaye rẹ ti o han si awọn ọmọ ẹbi'}
        className="mb-8"
      />

      {/* Profile picture */}
      <Card className="mb-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar src={user?.profile?.profilePhotoUrl} name={displayName} size="xl" />
            <label className="absolute inset-0 flex items-center justify-center bg-charcoal-900/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Camera className="w-6 h-6 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const form = new FormData();
                  form.append('file', file);
                  form.append('type', 'profile');
                  try {
                    const res = await api.upload<{ url: string }>('/profile/photo', form);
                    setUser({ ...user!, profile: { ...user!.profile!, profilePhotoUrl: res.url } });
                    toast.success(en ? 'Photo updated!' : 'Fọto ti ni imudojuiwọn!');
                  } catch {
                    toast.error(en ? 'Upload failed' : 'Gbigba soke kuna');
                  }
                }}
              />
            </label>
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-charcoal-800">{displayName}</h3>
            <p className="font-sans text-sm text-umber-500">{user?.email}</p>
            <p className="font-sans text-xs text-earth-500 mt-1">
              {en ? 'Click avatar to change photo' : 'Tẹ fọto lati yi pada'}
            </p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <Card>
          <h3 className="font-display text-lg font-semibold text-charcoal-800 mb-4">
            {en ? 'Basic Information' : 'Alaye Ipilẹ'}
          </h3>
          <div className="space-y-4">
            <Input
              label={t('displayName')}
              placeholder="Adebayo Falohun"
              error={errors.displayName?.message}
              {...register('displayName')}
            />
            <Textarea
              label={t('bio')}
              placeholder={en ? "Tell your family about yourself..." : "Sọ fun idile rẹ nípa ara rẹ..."}
              rows={4}
              {...register('bio')}
            />
            <Input
              label={t('location')}
              placeholder="Lagos, Nigeria"
              {...register('location')}
            />
          </div>
        </Card>

        {/* Social links */}
        <Card>
          <h3 className="font-display text-lg font-semibold text-charcoal-800 mb-4">
            {t('socialLinks')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {socialFields.map(({ name, icon: Icon, label, placeholder }) => (
              <div key={name} className="relative">
                <label className="block font-sans text-sm font-medium text-umber-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </span>
                </label>
                <input
                  type="url"
                  placeholder={placeholder}
                  className="input-warm text-sm"
                  {...register(name)}
                />
                {errors[name] && (
                  <p className="mt-1 text-xs text-red-500">{errors[name]?.message as string}</p>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Privacy */}
        <Card>
          <h3 className="font-display text-lg font-semibold text-charcoal-800 mb-4">
            {t('privacySettings')}
          </h3>
          <div className="space-y-3">
            {[
              { field: 'allowContact' as const, label: t('allowContact') },
              { field: 'showSocialLinks' as const, label: t('showSocialLinks') },
            ].map(({ field, label }) => (
              <label key={field} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded accent-earth-600"
                  {...register(field)}
                />
                <span className="font-sans text-sm text-umber-700 group-hover:text-charcoal-800 transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={() => reset()} disabled={!isDirty} className="flex-1">
            {t('cancel')}
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting} disabled={!isDirty} className="flex-1">
            {t('saveChanges')}
          </Button>
        </div>
      </form>
    </div>
  );
}
