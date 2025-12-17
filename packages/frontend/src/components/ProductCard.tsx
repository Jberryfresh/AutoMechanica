import type { FC } from 'react';

import FitmentBadge from './FitmentBadge';
import type { Part, PartFitment } from '@/lib/parts-api';
import type { VehicleSpec } from '@/lib/vehicleData';

const matchesVehicle = (fitment: PartFitment, vehicle: VehicleSpec): boolean =>
  fitment.vehicle.year === vehicle.year &&
  fitment.vehicle.make.toLowerCase() === vehicle.make.toLowerCase() &&
  fitment.vehicle.model.toLowerCase() === vehicle.model.toLowerCase();

interface Props {
  part: Part;
  activeVehicle?: VehicleSpec | null;
}

const ProductCard: FC<Props> = ({ part, activeVehicle }) => {
  const activeFitment =
    activeVehicle && part.fitments.find((fitment) => matchesVehicle(fitment, activeVehicle));

  return (
    <article className="grid gap-3 rounded-xl border border-gunmetal-700 bg-gunmetal-900/60 p-4 shadow-brand">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-soft-graphite">{part.brand}</p>
          <h3 className="text-lg font-semibold text-electric-teal-50">{part.name}</h3>
          <p className="text-sm text-soft-graphite capitalize">{part.category}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-electric-teal-200">${part.price.toFixed(2)}</p>
          {activeVehicle ? (
            <FitmentBadge confidence={activeFitment?.confidence} />
          ) : (
            <span className="rounded-full bg-gunmetal-800 px-3 py-1 text-xs text-soft-graphite">
              Select a vehicle
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-soft-graphite line-clamp-2">{part.description}</p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2 text-xs text-soft-graphite">
          {Object.entries(part.attributes).map(([key, value]) => (
            <span
              key={key}
              className="rounded-md border border-gunmetal-700 bg-gunmetal-800 px-2 py-1 capitalize"
            >
              {key}: {value}
            </span>
          ))}
        </div>
        <a
          className="button-secondary"
          href={`/parts/${part.id}`}
          aria-label={`View details for ${part.name}`}
        >
          View details
        </a>
      </div>
    </article>
  );
};

export default ProductCard;
