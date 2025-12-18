import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import type { FC } from 'react';

import FitmentBadge from '@/components/FitmentBadge';
import ReverseFitmentTable from '@/components/ReverseFitmentTable';
import SpecsTable from '@/components/SpecsTable';
import SupportChatEntry from '@/components/SupportChatEntry';
import { useGarage } from '@/lib/garage-context';
import { fetchPartById } from '@/lib/parts-api';
import type { VehicleSpec } from '@/lib/vehicleData';

const matchesVehicle = (vehicle: VehicleSpec | null, target: VehicleSpec): boolean =>
  !!vehicle &&
  vehicle.year === target.year &&
  vehicle.make.toLowerCase() === target.make.toLowerCase() &&
  vehicle.model.toLowerCase() === target.model.toLowerCase();

const PartDetailPage: FC = () => {
  const { partId } = useParams<{ partId: string }>();
  const { activeVehicle } = useGarage();

  const { data: part, isLoading } = useQuery({
    queryKey: ['part', partId],
    queryFn: async () => (partId ? fetchPartById(partId) : null),
    enabled: Boolean(partId),
  });

  const activeFitment = part?.fitments.find((fitment) =>
    matchesVehicle(activeVehicle, fitment.vehicle)
  );

  if (isLoading) return <p className="text-soft-graphite">Loading part...</p>;
  if (!part) {
    return (
      <div className="card space-y-3">
        <p className="text-soft-graphite">Part not found.</p>
        <Link className="text-electric-teal-300 underline" to="/catalog">
          Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <section className="card space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-soft-graphite">{part.brand}</p>
          <h1 className="text-3xl font-semibold text-electric-teal-50">{part.name}</h1>
          <p className="text-sm text-soft-graphite capitalize">{part.category}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-electric-teal-200">${part.price.toFixed(2)}</p>
          <FitmentBadge confidence={activeFitment?.confidence} />
        </div>
      </div>

      <p className="text-soft-graphite">{part.description}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-electric-teal-50">Specifications</h3>
          <SpecsTable attributes={part.attributes} />
          <SupportChatEntry partId={part.id} />
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-electric-teal-50">Fits these vehicles</h3>
          <ReverseFitmentTable fitments={part.fitments} activeVehicle={activeVehicle} />
        </div>
      </div>
    </section>
  );
};

export default PartDetailPage;
