import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import App from '@/App';

const renderApp = (): void => {
  const queryClient = new QueryClient();

  render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </MemoryRouter>
  );
};

afterEach(() => {
  cleanup();
});

describe('App', () => {
  it('renders hero content', () => {
    renderApp();

    expect(
      screen.getByText('AI-powered automotive parts with confident fitment intelligence.')
    ).toBeInTheDocument();
    expect(screen.getByText(/Explore documentation/i)).toBeInTheDocument();
  });

  it('shows navigation links', () => {
    renderApp();

    expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Catalog/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Support/i })).toBeInTheDocument();
  });
});
