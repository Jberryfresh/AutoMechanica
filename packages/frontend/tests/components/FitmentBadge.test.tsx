import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import FitmentBadge, { getFitmentBadgeLabel } from '@/components/FitmentBadge';

describe('FitmentBadge', () => {
  it('maps confidence to labels', () => {
    expect(getFitmentBadgeLabel(0.95)).toBe('Guaranteed fit');
    expect(getFitmentBadgeLabel(0.8)).toBe('Likely fit');
    expect(getFitmentBadgeLabel(0.5)).toBe('Verify fitment');
    expect(getFitmentBadgeLabel(undefined)).toBe('Verify fitment');
  });

  it('renders badge text', () => {
    render(<FitmentBadge confidence={0.92} />);
    expect(screen.getByText(/Guaranteed fit/i)).toBeInTheDocument();
  });
});
