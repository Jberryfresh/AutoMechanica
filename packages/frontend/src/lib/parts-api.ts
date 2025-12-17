import { VEHICLE_DATA, type VehicleSpec } from './vehicleData';

export interface PartFitment {
  vehicle: VehicleSpec;
  confidence: number; // 0-1
  position?: string;
}

export interface Part {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  description: string;
  attributes: Record<string, string | number>;
  fitments: PartFitment[];
}

export interface PartsQuery {
  category?: string;
  position?: string;
  vehicle?: VehicleSpec | null;
}

const SAMPLE_PARTS: Part[] = [
  {
    id: 'brk-001',
    name: 'Premium Brake Pads - Front',
    category: 'brakes',
    brand: 'AutoMech',
    price: 129.99,
    description:
      'Ceramic brake pads engineered for low dust and consistent stopping power across temperatures.',
    attributes: {
      material: 'Ceramic',
      warranty: '24 months',
      position: 'Front',
    },
    fitments: [
      { vehicle: VEHICLE_DATA[0], confidence: 0.95, position: 'Front' },
      { vehicle: VEHICLE_DATA[1], confidence: 0.92, position: 'Front' },
      { vehicle: VEHICLE_DATA[5], confidence: 0.7, position: 'Front' },
    ],
  },
  {
    id: 'flt-101',
    name: 'Performance Air Filter',
    category: 'intake',
    brand: 'ClearFlow',
    price: 59.5,
    description: 'Reusable high-flow air filter designed to increase airflow and filtration.',
    attributes: {
      material: 'Cotton Gauze',
      warranty: '12 months',
      position: 'Engine Bay',
    },
    fitments: [
      { vehicle: VEHICLE_DATA[2], confidence: 0.91 },
      { vehicle: VEHICLE_DATA[3], confidence: 0.85 },
      { vehicle: VEHICLE_DATA[4], confidence: 0.88 },
    ],
  },
  {
    id: 'susp-204',
    name: 'Sport Suspension Kit',
    category: 'suspension',
    brand: 'RidePro',
    price: 899.0,
    description:
      'Adjustable coilover kit tuned for spirited driving with balanced comfort and control.',
    attributes: {
      damping: '10-way adjustable',
      dropRange: '0.5-2.0 in',
      position: 'Front/Rear',
    },
    fitments: [
      { vehicle: VEHICLE_DATA[3], confidence: 0.93 },
      { vehicle: VEHICLE_DATA[6], confidence: 0.76 },
    ],
  },
];

const matchesVehicle = (fitment: PartFitment, vehicle: VehicleSpec): boolean =>
  fitment.vehicle.year === vehicle.year &&
  fitment.vehicle.make.toLowerCase() === vehicle.make.toLowerCase() &&
  fitment.vehicle.model.toLowerCase() === vehicle.model.toLowerCase();

export const fetchParts = (query: PartsQuery): Promise<Part[]> => {
  const dataset = SAMPLE_PARTS.filter((part) =>
    query.category ? part.category.toLowerCase() === query.category.toLowerCase() : true
  ).filter((part) =>
    query.position ? part.attributes.position?.toString().toLowerCase() === query.position.toLowerCase() : true
  );

  if (!query.vehicle) return Promise.resolve(dataset);
  return Promise.resolve(
    dataset.filter((part) =>
      part.fitments.some((fitment) => matchesVehicle(fitment, query.vehicle as VehicleSpec))
    )
  );
};

export const fetchPartById = (id: string): Promise<Part | null> =>
  Promise.resolve(SAMPLE_PARTS.find((p) => p.id === id) ?? null);
