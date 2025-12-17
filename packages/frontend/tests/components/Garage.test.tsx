import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import App from '@/App';
import { GarageProvider } from '@/lib/garage-context';

const renderWithProviders = (): void => {
  const queryClient = new QueryClient();
  render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <GarageProvider>
          <App />
        </GarageProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe('Garage and vehicle selection', () => {
  it('allows selecting a vehicle and updates the header label', async () => {
    renderWithProviders();
    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText(/Year/i), ['2020']);
    await user.selectOptions(screen.getByLabelText(/Make/i), ['Toyota']);
    await user.selectOptions(screen.getByLabelText(/Model/i), ['Camry']);
    await user.selectOptions(screen.getByLabelText(/Trim/i), ['LE']);
    await user.selectOptions(screen.getByLabelText(/Engine/i), ['2.5L I4']);

    await user.click(screen.getByRole('button', { name: /Save vehicle/i }));

    const headerButton = screen.getByRole('button', { name: /2020 Toyota Camry LE 2.5L I4/i });
    expect(headerButton).toBeInTheDocument();

    const stored = window.localStorage.getItem('automechanica-garage');
    expect(stored).toContain('Camry');
  });

  it('loads the active vehicle from localStorage on render', async () => {
    window.localStorage.setItem(
      'automechanica-garage',
      JSON.stringify({
        activeVehicle: {
          year: 2023,
          make: 'Ford',
          model: 'F-150',
          trim: 'XLT',
          engine: '3.5L EcoBoost V6',
        },
        savedVehicles: [
          {
            year: 2023,
            make: 'Ford',
            model: 'F-150',
            trim: 'XLT',
            engine: '3.5L EcoBoost V6',
          },
        ],
      })
    );

    renderWithProviders();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /2023 Ford F-150 XLT 3\.5L EcoBoost V6/i })
      ).toBeInTheDocument();
    });
  });
});
