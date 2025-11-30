import type { FC } from 'react';

const Footer: FC = () => (
  <footer className="border-t border-gunmetal-700 bg-gunmetal-900/60 px-6 py-4 text-sm text-soft-graphite">
    <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
      <p>
        © {new Date().getFullYear()} AutoMechanica. Engineered for trusted fitment and AI-powered
        support.
      </p>
      <div className="flex items-center gap-3 text-electric-teal-300">
        <span className="h-2 w-2 rounded-full bg-mint-green shadow-brand" aria-hidden />
        <span className="text-xs uppercase tracking-wide">Live system monitoring enabled</span>
      </div>
    </div>
  </footer>
);

export default Footer;
