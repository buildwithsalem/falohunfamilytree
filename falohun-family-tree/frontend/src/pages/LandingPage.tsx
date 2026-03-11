// pages/LandingPage.tsx
import { Link } from 'react-router-dom';
import { TreePine, Users, Heart, BookOpen, Shield, Globe, ArrowRight, ChevronDown } from 'lucide-react';
import { useLanguage } from '../i18n/useLanguage';
import { useAuthStore } from '../lib/store';

export default function LandingPage() {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuthStore();

  const features = [
    {
      icon: TreePine,
      titleEn: 'Living Family Tree',
      titleYo: 'Igi Idile Alãye',
      descEn: 'An interactive, expandable tree that grows with every member added — explore generations at a glance.',
      descYo: 'Igi ti o le ṣii ati gbooro pẹlu gbogbo ọmọ ẹgbẹ ti a fi kun.',
      color: 'from-earth-500 to-earth-400',
    },
    {
      icon: Users,
      titleEn: 'Connect with Relatives',
      titleYo: 'Sopọ pẹlu Awọn Ibatan',
      descEn: 'Message living family members, discover cousins you never knew, and strengthen the bonds of kinship.',
      descYo: 'Fi ifiranṣẹ si awọn ibatan alãye, ṣawari awọn ibatan ti o ko mọ.',
      color: 'from-gold-500 to-earth-400',
    },
    {
      icon: BookOpen,
      titleEn: 'Preserve Our Culture',
      titleYo: 'Ṣọ Aṣa Wa',
      descEn: 'Document stories, cultural notes, traditions and memories that define the Falohun legacy.',
      descYo: 'Ṣe igbasilẹ awọn itan, awọn akọsilẹ aṣa, ati iranti ti o ṣe afihan ohun-ini Falohun.',
      color: 'from-forest-500 to-forest-400',
    },
    {
      icon: Heart,
      titleEn: 'Share Memories',
      titleYo: 'Pin Iranti',
      descEn: 'Upload photos and videos that bring faces to names and keep the memories of those we love alive.',
      descYo: 'Gbe awọn fọto ati fidio soke ti o mu oju si awọn orukọ.',
      color: 'from-umber-500 to-umber-400',
    },
  ];

  const en = language === 'en';

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal-800 via-umber-900 to-earth-900" />
        <div className="absolute inset-0 adire-texture opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 via-transparent to-transparent" />
        
        {/* Floating decorative elements */}
        <div className="absolute top-1/4 left-8 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-8 w-48 h-48 bg-earth-500/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '3s' }} />
        
        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Decorative kente stripe */}
          <div className="flex justify-center gap-1 mb-8">
            {['bg-gold-500','bg-earth-500','bg-forest-600','bg-earth-500','bg-gold-500'].map((c, i) => (
              <div key={i} className={`h-1 w-8 rounded-full ${c}`} />
            ))}
          </div>

          <p className="font-sans text-sm uppercase tracking-[0.3em] text-gold-400 mb-4 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            {en ? 'The Falohun Legacy' : 'Ohun-Ini Falohun'}
          </p>

          <h1 className="font-display text-5xl md:text-7xl font-black text-white mb-6 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            {en ? (
              <>Our Roots,<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-earth-400">Our Legacy</span></>
            ) : (
              <>Gbongbo Wa,<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-earth-400">Ohun-Ini Wa</span></>
            )}
          </h1>

          <p className="font-body text-lg md:text-xl text-ivory-300/90 max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            {en ? t('landingDesc') : translations_yo_desc}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
            {user ? (
              <Link to="/tree" className="btn-gold text-base py-3.5 px-8 inline-flex items-center gap-2 group">
                {t('landingCta')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn-gold text-base py-3.5 px-8 inline-flex items-center gap-2 group">
                  {t('landingJoin')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/tree" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/30 text-white font-sans font-medium hover:bg-white/10 transition-all">
                  {t('landingCta')}
                </Link>
              </>
            )}
          </div>

          {/* Language toggle hero */}
          <div className="mt-8 animate-fade-up" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
            <button
              onClick={() => setLanguage(en ? 'yo' : 'en')}
              className="inline-flex items-center gap-2 text-ivory-300/60 hover:text-ivory-300 transition-colors text-sm font-sans"
            >
              <Globe className="w-4 h-4" />
              {en ? 'Wo ní Yorùbá' : 'View in English'}
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* Heritage Stats Bar */}
      <section className="bg-gradient-to-r from-earth-600 to-earth-500 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 text-center text-white">
            {[
              { value: en ? 'Generations' : 'Ìran', sub: en ? 'documented' : 'ti a ṣe igbasilẹ' },
              { value: en ? 'Heritage' : 'Ohun-Ini', sub: en ? 'preserved' : 'ti a ṣọ' },
              { value: en ? 'Family' : 'Idile', sub: en ? 'connected' : 'ti o sopọ' },
            ].map((s, i) => (
              <div key={i}>
                <div className="font-display text-2xl md:text-3xl font-bold text-gold-300">{s.value}</div>
                <div className="font-sans text-sm text-white/70 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex justify-center gap-1 mb-6">
              {['bg-gold-500','bg-earth-400','bg-umber-400','bg-earth-400','bg-gold-500'].map((c, i) => (
                <div key={i} className={`h-0.5 w-6 ${c} rounded-full`} />
              ))}
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-charcoal-800 mb-4">
              {en ? 'Everything our family needs' : 'Ohun gbogbo ti idile wa nilo'}
            </h2>
            <p className="font-body text-umber-600 text-lg max-w-xl mx-auto">
              {en
                ? 'Built for every generation — simple enough for grandparents, rich enough for researchers'
                : 'Ti a kọ fun gbogbo iran — rọrun to fun awọn baba-nla, ọlọrọ to fun awọn oniwadi'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group card-warm p-8 hover:shadow-warm-lg hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display text-xl font-bold text-charcoal-800 mb-3">
                  {en ? f.titleEn : f.titleYo}
                </h3>
                <p className="font-body text-umber-600 leading-relaxed">
                  {en ? f.descEn : f.descYo}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cultural Heritage Banner */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-800 to-umber-900" />
        <div className="absolute inset-0 adire-texture opacity-30" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="font-sans text-xs uppercase tracking-[0.4em] text-gold-400 mb-4">
            {en ? 'Yoruba Heritage' : 'Ohun-Ini Yorùbá'}
          </div>
          <blockquote className="font-display text-2xl md:text-4xl italic text-white/90 mb-6 leading-relaxed">
            {en
              ? '"Igi to gun jù, ogún ẹsẹ ló nmú."'
              : '"Igi to gun jù, ogún ẹsẹ ló nmú."'
            }
          </blockquote>
          <p className="font-body text-umber-300">
            {en
              ? 'A tall tree has twenty roots — the deeper our roots, the higher we can grow.'
              : 'Igi gíga ní ogún gbòǹgbò — bí gbòǹgbò wa bá jìn, bẹ́ẹ̀ ni a lè gòkè.'
            }
          </p>
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({length: 7}).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-gold-500' : 'bg-earth-500'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Shield className="w-12 h-12 text-earth-400 mx-auto mb-6" />
          <h2 className="font-display text-4xl font-bold text-charcoal-800 mb-4">
            {en ? 'This is a private family space' : 'Eyi jẹ aaye idile ikọkọ'}
          </h2>
          <p className="font-body text-umber-600 text-lg mb-8">
            {en
              ? 'Membership requires an invite code from a family member or admin approval. Our heritage is for family.'
              : 'Ọmọ ẹgbẹ nilo koodu ìpè lati ọdọ ọmọ ẹbi tabi iyọọda alaṣẹ. Ohun-ini wa jẹ fun ẹbi.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn-primary text-base py-3.5 px-8 inline-flex items-center gap-2">
              {t('signUp')}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn-ghost text-base py-3.5 px-8">
              {t('signIn')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Yoruba long desc (separate constant to keep JSX clean)
const translations_yo_desc = 'Ibi-ipamọ alãye ti igbesi-aye wa, aṣa wa, ati iranti pinpin wa. Sopọ pẹlu awọn ibatan, ṣawari ohun-ini rẹ, ki o si ṣafikun itan rẹ si itan Falohun.';
