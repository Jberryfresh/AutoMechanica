import { useMemo, useState, type FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';

import ProductCard from '@/components/ProductCard';
import { useGarage } from '@/lib/garage-context';
import { fetchParts } from '@/lib/parts-api';

const CatalogPage: FC = () => {
  const { category, year, make, model } = useParams<{
    category?: string;
    year?: string;
    make?: string;
    model?: string;
  }>();
  const { activeVehicle } = useGarage();
  const [positionFilter, setPositionFilter] = useState<string>('');

  const vehicleFromRoute =
    year && make && model
      ? { year: Number(year), make, model, trim: '', engine: '' }
      : null;

  const vehicle = activeVehicle ?? vehicleFromRoute ?? null;

  const { data: parts, isLoading } = useQuery({
    queryKey: ['parts', category, positionFilter, vehicle?.year, vehicle?.make, vehicle?.model],
    queryFn: () =>
      fetchParts({
        category: category ?? undefined,
        position: positionFilter || undefined,
        vehicle,
      }),
    staleTime: 1000 * 60 * 5,
  });

  const positions = useMemo(() => {
    if (!parts) return [];
    return Array.from(
      new Set(
        parts
          .map((p) => p.attributes.position?.toString())
          .filter((p): p is string => Boolean(p))
      )
    );
  }, [parts]);

  const showVehiclePrompt = !vehicle;

  return (
    <section className="card space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-electric-teal-300">Catalog</p>
          <h2 className="text-3xl font-semibold text-electric-teal-50">
            {category ? `${category} parts` : 'Browse parts'}
          </h2>
          {showVehiclePrompt ? (
            <p className="text-sm text-amber-200">
              Select your vehicle to see only compatible parts.
              {'  '}
              <Link className="underline" to="/#garage">
                Choose vehicle
              </Link>
            </p>
          ) : (
            <p className="text-sm text-soft-graphite">
              Showing fitment for {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-soft-graphite">
            Position
            <select
              className="ml-2 rounded-md border border-gunmetal-700 bg-gunmetal-800 px-2 py-1 text-slate-100"
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
            >
              <option value="">All</option>
              {positions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {isLoading && <p className="text-sm text-soft-graphite">Loading parts...</p>}

      {!isLoading && parts && parts.length === 0 && (
        <p className="text-sm text-soft-graphite">No parts found for this selection.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {parts?.map((part) => (
          <ProductCard key={part.id} part={part} activeVehicle={vehicle ?? undefined} />
        ))}
      </div>
    </section>
  );
};

export default CatalogPage;
