import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from 'react';

import { formatVehicleLabel, type VehicleSpec } from './vehicleData';

export interface GarageState {
  activeVehicle: VehicleSpec | null;
  savedVehicles: VehicleSpec[];
}

interface GarageContextValue extends GarageState {
  setActiveVehicle: (vehicle: VehicleSpec) => void;
  clearActiveVehicle: () => void;
  removeVehicle: (vehicle: VehicleSpec) => void;
}

const GARAGE_STORAGE_KEY = 'automechanica-garage';

const defaultGarageState: GarageState = {
  activeVehicle: null,
  savedVehicles: [],
};

const GarageContext = createContext<GarageContextValue | undefined>(undefined);

const loadGarage = (): GarageState => {
  if (typeof window === 'undefined') return defaultGarageState;
  try {
    const raw = window.localStorage.getItem(GARAGE_STORAGE_KEY);
    if (!raw) return defaultGarageState;
    const parsed = JSON.parse(raw) as GarageState;
    return {
      activeVehicle: parsed.activeVehicle ?? null,
      savedVehicles: parsed.savedVehicles ?? [],
    };
  } catch {
    return defaultGarageState;
  }
};

const persistGarage = (state: GarageState): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GARAGE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore write errors
  }
};

const isSameVehicle = (a: VehicleSpec, b: VehicleSpec): boolean =>
  a.year === b.year &&
  a.make === b.make &&
  a.model === b.model &&
  a.trim === b.trim &&
  a.engine === b.engine;

export const GarageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [garage, setGarage] = useState<GarageState>(() => loadGarage());

  useEffect(() => {
    persistGarage(garage);
  }, [garage]);

  const setActiveVehicle = useCallback((vehicle: VehicleSpec) => {
    setGarage((current) => {
      const exists = current.savedVehicles.some((v) => isSameVehicle(v, vehicle));
      const savedVehicles = exists ? current.savedVehicles : [...current.savedVehicles, vehicle];
      return { activeVehicle: vehicle, savedVehicles };
    });
  }, []);

  const clearActiveVehicle = useCallback(() => {
    setGarage((current) => ({ ...current, activeVehicle: null }));
  }, []);

  const removeVehicle = useCallback((vehicle: VehicleSpec) => {
    setGarage((current) => {
      const savedVehicles = current.savedVehicles.filter((v) => !isSameVehicle(v, vehicle));
      const isActive =
        current.activeVehicle && vehicle && isSameVehicle(current.activeVehicle, vehicle);
      return { activeVehicle: isActive ? null : current.activeVehicle, savedVehicles };
    });
  }, []);

  const value = useMemo<GarageContextValue>(
    () => ({
      ...garage,
      setActiveVehicle,
      clearActiveVehicle,
      removeVehicle,
    }),
    [garage, clearActiveVehicle, removeVehicle, setActiveVehicle]
  );

  return <GarageContext.Provider value={value}>{children}</GarageContext.Provider>;
};

export const useGarage = (): GarageContextValue => {
  const ctx = useContext(GarageContext);
  if (!ctx) {
    throw new Error('useGarage must be used within a GarageProvider');
  }
  return ctx;
};

export const describeVehicle = (vehicle: VehicleSpec | null): string =>
  vehicle ? formatVehicleLabel(vehicle) : 'Select your vehicle';
