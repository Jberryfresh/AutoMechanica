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
