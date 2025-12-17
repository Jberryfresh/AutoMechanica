export interface VehicleSpec {
  year: number;
  make: string;
  model: string;
  trim: string;
  engine: string;
}

export const VEHICLE_DATA: VehicleSpec[] = [
  { year: 2020, make: 'Toyota', model: 'Camry', trim: 'LE', engine: '2.5L I4' },
  { year: 2020, make: 'Toyota', model: 'Camry', trim: 'XSE', engine: '3.5L V6' },
  { year: 2021, make: 'Toyota', model: 'RAV4', trim: 'XLE', engine: '2.5L I4' },
  { year: 2022, make: 'Honda', model: 'Civic', trim: 'Sport', engine: '2.0L I4' },
  { year: 2022, make: 'Honda', model: 'Accord', trim: 'EX-L', engine: '1.5L Turbo I4' },
  { year: 2023, make: 'Ford', model: 'F-150', trim: 'XLT', engine: '3.5L EcoBoost V6' },
  { year: 2023, make: 'Ford', model: 'Bronco', trim: 'Badlands', engine: '2.7L EcoBoost V6' },
];

export const formatVehicleLabel = (vehicle: VehicleSpec): string =>
  `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim} ${vehicle.engine}`;

export interface VehicleOptions {
  years: number[];
  makes: string[];
  models: string[];
  trims: string[];
  engines: string[];
}

export interface VehicleFilters {
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
}

const unique = <T>(values: T[]): T[] => Array.from(new Set(values));

export const buildOptionsFromLocal = (
  dataset: VehicleSpec[],
  filters: VehicleFilters
): VehicleOptions => {
  const years = unique(dataset.map((v) => v.year)).sort((a, b) => a - b);
  const makes = unique(
    dataset.filter((v) => !filters.year || v.year === filters.year).map((v) => v.make)
  ).sort();
  const models = unique(
    dataset
      .filter(
        (v) =>
          (!filters.year || v.year === filters.year) && (!filters.make || v.make === filters.make)
      )
      .map((v) => v.model)
  ).sort();
  const trims = unique(
    dataset
      .filter(
        (v) =>
          (!filters.year || v.year === filters.year) &&
          (!filters.make || v.make === filters.make) &&
          (!filters.model || v.model === filters.model)
      )
      .map((v) => v.trim)
  ).sort();
  const engines = unique(
    dataset
      .filter(
        (v) =>
          (!filters.year || v.year === filters.year) &&
          (!filters.make || v.make === filters.make) &&
          (!filters.model || v.model === filters.model) &&
          (!filters.trim || v.trim === filters.trim)
      )
      .map((v) => v.engine)
  );

  return { years, makes, models, trims, engines };
};

export const fetchVehicleOptions = async (
  apiBaseUrl: string,
  filters: VehicleFilters
): Promise<VehicleOptions> => {
  if (import.meta.env.MODE === 'test') {
    return buildOptionsFromLocal(VEHICLE_DATA, filters);
  }
  const params = new URLSearchParams();
  if (filters.year) params.set('year', filters.year.toString());
  if (filters.make) params.set('make', filters.make);
  if (filters.model) params.set('model', filters.model);
  if (filters.trim) params.set('trim', filters.trim);

  const res = await fetch(`${apiBaseUrl}/api/vehicles/options?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to load vehicle options (${res.status})`);
  }
  const data = (await res.json()) as { options?: VehicleOptions };
  return data.options ?? buildOptionsFromLocal(VEHICLE_DATA, filters);
};
