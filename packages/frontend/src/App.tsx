import type { FC } from 'react';
import { Route, Routes } from 'react-router-dom';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import CatalogPage from '@/pages/CatalogPage';
import PartDetailPage from '@/pages/PartDetailPage';
import { frontendConfig } from '@/lib/config';
import VehiclePicker from './components/VehiclePicker';

const HomePage: FC = () => (
  <>
    <section className="card grid gap-8 md:grid-cols-2 md:items-center">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-electric-teal-300">
          {frontendConfig.appName}
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-electric-teal-50">
          AI-powered automotive parts with confident fitment intelligence.
        </h1>
        <p className="text-lg text-soft-graphite">
          Build faster with pre-wired tooling, brand-safe UI components, and strict typing across
          the stack. AutoMechanica pairs clean architecture with AI agents to keep your catalog
          reliable.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a className="button-primary" href="/docs">
            Explore documentation
          </a>
          <a className="button-secondary" href="/api/health">
            View API health
          </a>
        </div>
      </div>
      <div className="grid gap-4 rounded-xl border border-gunmetal-700 bg-gunmetal-800/60 p-6 shadow-brand">
        <div className="flex items-center justify-between rounded-lg border border-gunmetal-700 bg-gunmetal-900/60 px-4 py-3">
          <div>
            <p className="text-sm text-soft-graphite">Environment</p>
            <p className="text-lg font-semibold text-electric-teal-200">{import.meta.env.MODE}</p>
          </div>
          <span className="rounded-full bg-mint-green px-3 py-1 text-xs font-semibold text-charcoal-black shadow-brand">
            Ready
          </span>
        </div>
        <div className="rounded-lg border border-gunmetal-700 bg-deep-navy-800/40 p-4">
          <p className="mb-2 text-sm text-soft-graphite">API Base URL</p>
          <p className="truncate text-electric-teal-200">{frontendConfig.apiBaseUrl}</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg border border-gunmetal-700 bg-gunmetal-900/50 p-3">
            <p className="text-2xl font-semibold text-electric-teal-300">24/7</p>
            <p className="text-xs uppercase text-soft-graphite">Monitoring</p>
          </div>
          <div className="rounded-lg border border-gunmetal-700 bg-gunmetal-900/50 p-3">
            <p className="text-2xl font-semibold text-electric-teal-300">Strict</p>
            <p className="text-xs uppercase text-soft-graphite">Type Safety</p>
          </div>
          <div className="rounded-lg border border-gunmetal-700 bg-gunmetal-900/50 p-3">
            <p className="text-2xl font-semibold text-electric-teal-300">HMR</p>
            <p className="text-xs uppercase text-soft-graphite">Developer UX</p>
          </div>
        </div>
      </div>
    </section>
    <section id="garage" className="card">
      <VehiclePicker />
    </section>
  </>
);

const App: FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-deep-navy-900 via-gunmetal-900 to-gunmetal-800 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-8">
        <Header />
        <main className="flex flex-1 flex-col gap-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/catalog/:category" element={<CatalogPage />} />
            <Route path="/vehicles/:year/:make/:model/:category" element={<CatalogPage />} />
            <Route path="/parts/:partId" element={<PartDetailPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;
