import { Router, type NextFunction, type Request, type Response } from 'express';

import {
  listVehicles,
  type Vehicle,
  type VehicleInput,
  type VehicleValidationError,
} from '../models/Vehicle.js';

const router = Router();

const SAMPLE_VEHICLES: VehicleInput[] = [
  { year: 2020, make: 'Toyota', model: 'Camry', trim: 'LE', engine: '2.5L I4' },
  { year: 2020, make: 'Toyota', model: 'Camry', trim: 'XSE', engine: '3.5L V6' },
  { year: 2021, make: 'Toyota', model: 'Rav4', trim: 'XLE', engine: '2.5L I4' },
  { year: 2022, make: 'Honda', model: 'Civic', trim: 'Sport', engine: '2.0L I4' },
  { year: 2022, make: 'Honda', model: 'Accord', trim: 'EX-L', engine: '1.5L Turbo I4' },
  { year: 2023, make: 'Ford', model: 'F-150', trim: 'XLT', engine: '3.5L EcoBoost V6' },
  { year: 2023, make: 'Ford', model: 'Bronco', trim: 'Badlands', engine: '2.7L EcoBoost V6' },
];

const unique = <T>(values: T[]): T[] => Array.from(new Set(values));

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;
const asyncHandler =
  (handler: AsyncHandler): ((req: Request, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction): void => {
    void handler(req, res, next).catch(next);
  };

const normalizeVehicles = (vehicles: Vehicle[] | VehicleInput[]): Vehicle[] =>
  vehicles.map((v) => ({
    ...(v as Vehicle),
    id: (v as Vehicle).id ?? `${v.year}-${v.make}-${v.model}-${v.trim ?? 'base'}-${v.engine}`,
    createdAt: (v as Vehicle).createdAt ?? new Date(),
  }));

const filterVehicles = (
  vehicles: Vehicle[],
  filters: { year?: number; make?: string; model?: string; trim?: string }
): Vehicle[] =>
  vehicles.filter((v) => {
    if (filters.year && v.year !== filters.year) return false;
    if (filters.make && v.make.toLowerCase() !== filters.make.toLowerCase()) return false;
    if (filters.model && v.model.toLowerCase() !== filters.model.toLowerCase()) return false;
    if (filters.trim && (v.trim ?? '').toLowerCase() !== filters.trim.toLowerCase()) return false;
    return true;
  });

const buildOptions = (
  vehicles: Vehicle[],
  filters: { year?: number; make?: string; model?: string; trim?: string }
): { years: number[]; makes: string[]; models: string[]; trims: string[]; engines: string[] } => {
  const filtered = filterVehicles(vehicles, filters);

  const years = unique(vehicles.map((v) => v.year)).sort((a, b) => a - b);
  const makes = unique(
    vehicles.filter((v) => !filters.year || v.year === filters.year).map((v) => v.make)
  ).sort();
  const models = unique(
    vehicles
      .filter(
        (v) =>
          (!filters.year || v.year === filters.year) && (!filters.make || v.make === filters.make)
      )
      .map((v) => v.model)
  ).sort();
  const trims = unique(
    vehicles
      .filter(
        (v) =>
          (!filters.year || v.year === filters.year) &&
          (!filters.make || v.make === filters.make) &&
          (!filters.model || v.model === filters.model) &&
          v.trim
      )
      .map((v) => v.trim as string)
  ).sort();
  const engines = unique(filtered.filter((v) => !!v.engine).map((v) => v.engine));

  return { years, makes, models, trims, engines };
};

router.get(
  '/vehicles',
  asyncHandler(async (req, res): Promise<void> => {
    const { year, make, model } = req.query;
    const filters = {
      year: year ? Number(year) : undefined,
      make: (make as string | undefined)?.toString(),
      model: (model as string | undefined)?.toString(),
    };

    const vehicles = await listVehicles(filters);
    const data = vehicles.length ? vehicles : normalizeVehicles(SAMPLE_VEHICLES);
    res.json({ vehicles: data });
  })
);

router.get(
  '/vehicles/options',
  asyncHandler(async (req, res): Promise<void> => {
    const { year, make, model, trim } = req.query;
    const filters = {
      year: year ? Number(year) : undefined,
      make: (make as string | undefined)?.toString(),
      model: (model as string | undefined)?.toString(),
      trim: (trim as string | undefined)?.toString(),
    };

    try {
      const vehicles = await listVehicles(filters);
      const dataset = vehicles.length ? vehicles : normalizeVehicles(SAMPLE_VEHICLES);
      const options = buildOptions(dataset, filters);
      res.json({ options });
    } catch (error) {
      if ((error as VehicleValidationError).name === 'VehicleValidationError') {
        const options = buildOptions(normalizeVehicles(SAMPLE_VEHICLES), {});
        res.json({ options });
        return;
      }
      throw error;
    }
  })
);

export default router;
