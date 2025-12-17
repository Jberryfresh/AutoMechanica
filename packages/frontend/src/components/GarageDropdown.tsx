import { useEffect, useRef, useState, type FC } from 'react';

import { describeVehicle, useGarage } from '@/lib/garage-context';
import { formatVehicleLabel } from '@/lib/vehicleData';

const GarageDropdown: FC = () => {
  const { activeVehicle, savedVehicles, setActiveVehicle, clearActiveVehicle } = useGarage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg border border-gunmetal-700 bg-gunmetal-800 px-3 py-2 text-sm font-medium text-slate-100 hover:border-electric-teal-500/60 hover:text-electric-teal-200"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="h-2 w-2 rounded-full bg-mint-green" />
        <span className="whitespace-nowrap">
          {activeVehicle ? describeVehicle(activeVehicle) : 'Select your vehicle'}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-gunmetal-700 bg-gunmetal-900/95 p-3 shadow-xl ring-1 ring-black/5">
          <div className="mb-2 text-xs uppercase tracking-[0.15em] text-soft-graphite">Garage</div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-100">
                {activeVehicle ? describeVehicle(activeVehicle) : 'No active vehicle'}
              </p>
              <p className="text-xs text-soft-graphite">Persistent across sessions</p>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.12em] text-soft-graphite">
                Saved vehicles
              </p>
              {savedVehicles.length === 0 && (
                <p className="text-sm text-soft-graphite">Nothing saved yet</p>
              )}
              <div className="space-y-1">
                {savedVehicles.map((vehicle) => (
                  <button
                    key={formatVehicleLabel(vehicle)}
                    type="button"
                    className="w-full rounded-md px-2 py-2 text-left text-sm text-slate-100 hover:bg-gunmetal-800 hover:text-electric-teal-200"
                    onClick={() => setActiveVehicle(vehicle)}
                  >
                    {formatVehicleLabel(vehicle)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <a
                href="#garage"
                className="text-sm text-electric-teal-400 hover:text-electric-teal-200"
                onClick={() => setOpen(false)}
              >
                Add vehicle
              </a>
              <button
                type="button"
                className="text-sm text-soft-graphite hover:text-amber-300"
                onClick={() => {
                  clearActiveVehicle();
                  setOpen(false);
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GarageDropdown;
