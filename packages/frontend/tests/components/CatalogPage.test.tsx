import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import CatalogPage from '@/pages/CatalogPage';
import type { Part } from '@/lib/parts-api';
import { GarageProvider } from '@/lib/garage-context';

vi.mock('@/lib/parts-api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/parts-api')>('@/lib/parts-api');
  const mockPart: Part = {
    id: 'brk-001',
    name: 'Premium Brake Pads - Front',
    category: 'brakes',
    brand: 'AutoMech',
    price: 129.99,
    description: 'Test description',
    attributes: { position: 'Front' },
    fitments: [
      {
        vehicle: { year: 2020, make: 'Toyota', model: 'Camry', trim: 'LE', engine: '2.5L I4' },
        confidence: 0.95,
        position: 'Front',
      },
    ],
  };
  return {
    ...actual,
    fetchParts: vi.fn().mockResolvedValue([mockPart]),
  };
});

const renderCatalog = (initialEntry = '/catalog/brakes'): void => {
  const queryClient = new QueryClient();
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <QueryClientProvider client={queryClient}>
        <GarageProvider>
          <Routes>
            <Route path="/catalog/:category" element={<CatalogPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
          </Routes>
        </GarageProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe('CatalogPage', () => {
  it('prompts to select a vehicle when none is active', async () => {
    renderCatalog();
    await waitFor(() => {
      expect(screen.getByText(/Select your vehicle/i)).toBeInTheDocument();
    });
  });

  it('shows parts filtered for active vehicle', async () => {
    window.localStorage.setItem(
      'automechanica-garage',
      JSON.stringify({
        activeVehicle: { year: 2020, make: 'Toyota', model: 'Camry', trim: 'LE', engine: '2.5L I4' },
        savedVehicles: [],
      })
    );

    renderCatalog();

    await waitFor(() => {
      expect(screen.getByText(/Premium Brake Pads/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Showing fitment for 2020 Toyota Camry/i)).toBeInTheDocument();

    // verify position filter works
    const select = screen.getByLabelText(/Position/i);
    await userEvent.selectOptions(select, ['Front']);
  });
});
