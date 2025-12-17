import { useMemo, useState, type FC, type ChangeEvent } from 'react';

import { describeVehicle, useGarage } from '@/lib/garage-context';
import { VEHICLE_DATA, type VehicleSpec } from '@/lib/vehicleData';

type VehicleForm = {
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  engine?: string;
};

const getUnique = <T,>(values: T[]): T[] => Array.from(new Set(values));

const VehiclePicker: FC = () => {
  const { activeVehicle, setActiveVehicle } = useGarage();
  const [selection, setSelection] = useState<VehicleForm>({});

  const years = useMemo(() => getUnique(VEHICLE_DATA.map((v) => v.year)).sort(), []);

  const makes = useMemo(() => {
    if (!selection.year) return [];
    return getUnique(
      VEHICLE_DATA.filter((v) => v.year === selection.year).map((v) => v.make)
    ).sort();
  }, [selection.year]);

  const models = useMemo(() => {
    if (!selection.year || !selection.make) return [];
    return getUnique(
      VEHICLE_DATA.filter((v) => v.year === selection.year && v.make === selection.make).map(
        (v) => v.model
      )
    ).sort();
  }, [selection.make, selection.year]);

  const trims = useMemo(() => {
    if (!selection.year || !selection.make || !selection.model) return [];
    return getUnique(
      VEHICLE_DATA.filter(
        (v) =>
          v.year === selection.year &&
          v.make === selection.make &&
          v.model === selection.model
      ).map((v) => v.trim)
    ).sort();
  }, [selection.make, selection.model, selection.year]);

  const engines = useMemo(() => {
    if (!selection.year || !selection.make || !selection.model || !selection.trim) return [];
    return getUnique(
      VEHICLE_DATA.filter(
        (v) =>
          v.year === selection.year &&
          v.make === selection.make &&
          v.model === selection.model &&
          v.trim === selection.trim
      ).map((v) => v.engine)
    );
  }, [selection.make, selection.model, selection.trim, selection.year]);

  const onSelect = (field: keyof VehicleForm) => (event: ChangeEvent<HTMLSelectElement>): void => {
    const value = event.target.value;
    setSelection((prev) => {
      const updated: VehicleForm = { ...prev, [field]: value ? value : undefined };
      if (field === 'year') {
        updated.make = undefined;
        updated.model = undefined;
        updated.trim = undefined;
        updated.engine = undefined;
      }
      if (field === 'make') {
        updated.model = undefined;
        updated.trim = undefined;
        updated.engine = undefined;
      }
      if (field === 'model') {
        updated.trim = undefined;
        updated.engine = undefined;
      }
      if (field === 'trim') {
        updated.engine = undefined;
      }
      return updated;
    });
  };

  const readyToSave =
    selection.year && selection.make && selection.model && selection.trim && selection.engine;

  const handleSave = (): void => {
    if (!readyToSave) return;
    const vehicle: VehicleSpec = {
      year: selection.year!,
      make: selection.make!,
      model: selection.model!,
      trim: selection.trim!,
      engine: selection.engine!,
    };
    setActiveVehicle(vehicle);
  };

  return (
    <div className="rounded-xl border border-gunmetal-700 bg-gunmetal-900/60 p-6 shadow-brand">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-electric-teal-300">Garage</p>
          <h2 className="text-2xl font-semibold text-electric-teal-50">Select your vehicle</h2>
        </div>
        <div className="rounded-lg border border-electric-teal-500/30 bg-electric-teal-500/10 px-3 py-2 text-xs text-electric-teal-200">
          Active: {describeVehicle(activeVehicle)}
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-soft-graphite">
          Year
          <select
            aria-label="Year"
            className="rounded-lg border border-gunmetal-700 bg-gunmetal-800 px-3 py-2 text-slate-100"
            value={selection.year ?? ''}
            onChange={(e) => {
              const yearValue = e.target.value ? Number(e.target.value) : undefined;
              setSelection((prev) => ({
                ...prev,
                year: yearValue,
                make: undefined,
                model: undefined,
                trim: undefined,
                engine: undefined,
              }));
            }}
          >
            <option value="">Select year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-soft-graphite">
          Make
          <select
            aria-label="Make"
            className="rounded-lg border border-gunmetal-700 bg-gunmetal-800 px-3 py-2 text-slate-100"
            value={selection.make ?? ''}
            onChange={onSelect('make')}
            disabled={!makes.length}
          >
            <option value="">Select make</option>
            {makes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-soft-graphite">
          Model
          <select
            aria-label="Model"
            className="rounded-lg border border-gunmetal-700 bg-gunmetal-800 px-3 py-2 text-slate-100"
            value={selection.model ?? ''}
            onChange={onSelect('model')}
            disabled={!models.length}
          >
            <option value="">Select model</option>
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-soft-graphite">
          Trim
          <select
            aria-label="Trim"
            className="rounded-lg border border-gunmetal-700 bg-gunmetal-800 px-3 py-2 text-slate-100"
            value={selection.trim ?? ''}
            onChange={onSelect('trim')}
            disabled={!trims.length}
          >
            <option value="">Select trim</option>
            {trims.map((trim) => (
              <option key={trim} value={trim}>
                {trim}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-soft-graphite md:col-span-2">
          Engine
          <select
            aria-label="Engine"
            className="rounded-lg border border-gunmetal-700 bg-gunmetal-800 px-3 py-2 text-slate-100"
            value={selection.engine ?? ''}
            onChange={onSelect('engine')}
            disabled={!engines.length}
          >
            <option value="">Select engine</option>
            {engines.map((engine) => (
              <option key={engine} value={engine}>
                {engine}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="button-primary disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleSave}
          disabled={!readyToSave}
        >
          Save vehicle
        </button>
        {activeVehicle && (
          <div className="text-sm text-electric-teal-200">
            Active vehicle: {describeVehicle(activeVehicle)}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehiclePicker;
