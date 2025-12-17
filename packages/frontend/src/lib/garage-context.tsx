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

import { frontendConfig } from './config';
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

const normalizeGarage = (state: GarageState | null | undefined): GarageState => ({
  activeVehicle: state?.activeVehicle ?? null,
  savedVehicles: state?.savedVehicles ?? [],
});

const fetchGarageFromApi = async (): Promise<GarageState | null> => {
  if (import.meta.env.MODE === 'test') return null;
  try {
    const res = await fetch(`${frontendConfig.apiBaseUrl}/api/garage`);
    if (!res.ok) return null;
    const payload = (await res.json()) as GarageState;
    return normalizeGarage(payload);
  } catch {
    return null;
  }
};

const saveGarageToApi = async (state: GarageState): Promise<void> => {
  if (import.meta.env.MODE === 'test') return;
  try {
    await fetch(`${frontendConfig.apiBaseUrl}/api/garage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
  } catch {
    // swallow sync errors for graceful degradation
  }
};

export const GarageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [garage, setGarage] = useState<GarageState>(() => loadGarage());

  useEffect(() => {
    persistGarage(garage);
    void saveGarageToApi(garage);
  }, [garage]);

  useEffect(() => {
    void (async () => {
      const remoteGarage = await fetchGarageFromApi();
      if (remoteGarage) {
        setGarage(remoteGarage);
        persistGarage(remoteGarage);
      }
    })();
  }, []);

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
