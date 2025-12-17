import type { FC } from 'react';

export interface FitmentBadgeProps {
  confidence?: number;
}

const getBadge = (confidence?: number): { label: string; color: string } => {
  if (confidence === undefined || confidence === null) {
    return { label: 'Verify fitment', color: 'bg-amber-500/20 text-amber-200' };
  }
  if (confidence >= 0.9) return { label: 'Guaranteed fit', color: 'bg-mint-green/20 text-mint-green' };
  if (confidence >= 0.75) return { label: 'Likely fit', color: 'bg-electric-teal-500/20 text-electric-teal-200' };
  return { label: 'Verify fitment', color: 'bg-amber-500/20 text-amber-200' };
};

const FitmentBadge: FC<FitmentBadgeProps> = ({ confidence }) => {
  const badge = getBadge(confidence);
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badge.color}`}>
      {badge.label}
      {confidence !== undefined && (
        <span className="ml-2 text-[11px] text-soft-graphite">({Math.round(confidence * 100)}%)</span>
      )}
    </span>
  );
};

export default FitmentBadge;

export const getFitmentBadgeLabel = (confidence?: number): string => getBadge(confidence).label;
