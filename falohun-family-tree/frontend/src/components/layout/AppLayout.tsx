// components/layout/AppLayout.tsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-ivory-100 adire-texture">
      <Navbar />
      <main className="pt-16 md:pt-20">
        <Outlet />
      </main>
      <footer className="bg-charcoal-800 text-ivory-300 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="font-display font-bold text-xl text-ivory-100 mb-1">
                Falohun Family Tree
              </div>
              <div className="font-body text-sm text-umber-400">
                Igi Idile Falohun — Preserving our roots, honouring our story
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs font-sans text-umber-500 tracking-widest uppercase mb-2">
                A living family archive
              </div>
              <div className="flex gap-1 justify-center">
                {['🟤','🟡','🟤','🟡','🟤'].map((c, i) => (
                  <span key={i} className="text-xs">{c}</span>
                ))}
              </div>
            </div>
            <div className="text-right text-xs font-sans text-umber-500">
              <div>Built with love for the Falohun family</div>
              <div className="mt-1">© {new Date().getFullYear()} All rights reserved</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
