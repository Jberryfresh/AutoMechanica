import type { FC } from 'react';
import { Link } from 'react-router-dom';

import { frontendConfig } from '@/lib/config';

const Header: FC = () => (
  <header className="flex items-center justify-between border-b border-gunmetal-700 bg-gunmetal-900/60 px-6 py-4 backdrop-blur">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-electric-teal-500 text-charcoal-black font-display text-lg shadow-brand">
        AM
      </div>
      <div>
        <p className="text-xl font-display text-electric-teal-200">{frontendConfig.appName}</p>
        <p className="text-sm text-soft-graphite">Precision-engineered intelligence for every vehicle</p>
      </div>
    </div>
    <nav className="flex items-center gap-4 text-sm font-medium text-slate-100">
      <Link className="hover:text-electric-teal-300" to="/">Home</Link>
      <Link className="hover:text-electric-teal-300" to="/catalog">Catalog</Link>
      <Link className="hover:text-electric-teal-300" to="/support">Support</Link>
    </nav>
  </header>
);

export default Header;
