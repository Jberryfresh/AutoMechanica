import type { FC } from 'react';

import FitmentBadge from './FitmentBadge';
import type { PartFitment } from '@/lib/parts-api';
import type { VehicleSpec } from '@/lib/vehicleData';

const isActive = (fitment: PartFitment, vehicle: VehicleSpec | null | undefined): boolean => {
  if (!vehicle) return false;
  return (
    fitment.vehicle.year === vehicle.year &&
    fitment.vehicle.make.toLowerCase() === vehicle.make.toLowerCase() &&
    fitment.vehicle.model.toLowerCase() === vehicle.model.toLowerCase()
  );
};

interface Props {
  fitments: PartFitment[];
  activeVehicle?: VehicleSpec | null;
}

const ReverseFitmentTable: FC<Props> = ({ fitments, activeVehicle }) => {
  if (!fitments.length) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-gunmetal-700 bg-gunmetal-900/60">
      <table className="min-w-full divide-y divide-gunmetal-800 text-sm">
        <thead className="bg-gunmetal-900">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-electric-teal-50">Vehicle</th>
            <th className="px-4 py-3 text-left font-semibold text-electric-teal-50">Position</th>
            <th className="px-4 py-3 text-left font-semibold text-electric-teal-50">Confidence</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gunmetal-800">
          {fitments.map((fitment) => {
            const active = isActive(fitment, activeVehicle);
            return (
              <tr
                key={`${fitment.vehicle.year}-${fitment.vehicle.make}-${fitment.vehicle.model}-${fitment.vehicle.trim}-${fitment.position ?? 'pos'}`}
                className={active ? 'bg-electric-teal-500/5' : ''}
              >
                <td className="px-4 py-3 text-slate-100">
                  {fitment.vehicle.year} {fitment.vehicle.make} {fitment.vehicle.model}{' '}
                  {fitment.vehicle.trim}
                </td>
                <td className="px-4 py-3 text-soft-graphite">{fitment.position ?? '—'}</td>
                <td className="px-4 py-3">
                  <FitmentBadge confidence={fitment.confidence} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ReverseFitmentTable;
