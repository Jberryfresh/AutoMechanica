import { Router, type Request } from 'express';

import type { VehicleInput } from '../models/Vehicle.js';

interface GaragePayload {
  activeVehicle: VehicleInput | null;
  savedVehicles: VehicleInput[];
}

const garageStore = new Map<string, GaragePayload>();

const validateVehicle = (vehicle: VehicleInput): void => {
  if (!vehicle.year || !vehicle.make || !vehicle.model || !vehicle.engine) {
    throw new Error('Vehicle must include year, make, model, and engine');
  }
};

const getClientKey = (req: Request): string =>
  (req.headers['x-user-id'] as string) || req.ip || 'anonymous';

const router = Router();

router.get('/garage', (req, res) => {
  const key = getClientKey(req);
  const garage = garageStore.get(key) ?? { activeVehicle: null, savedVehicles: [] };
  res.json(garage);
});

router.put('/garage', (req, res, next) => {
  try {
    const key = getClientKey(req);
    const payload = req.body as GaragePayload;

    if (payload.activeVehicle) validateVehicle(payload.activeVehicle);
    for (const vehicle of payload.savedVehicles ?? []) {
      validateVehicle(vehicle);
    }

    const garage: GaragePayload = {
      activeVehicle: payload.activeVehicle ?? null,
      savedVehicles: Array.isArray(payload.savedVehicles) ? payload.savedVehicles : [],
    };
    garageStore.set(key, garage);
    res.json(garage);
  } catch (error) {
    next(error);
  }
});

export default router;
