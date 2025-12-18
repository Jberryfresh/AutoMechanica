import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import SupportChatEntry from '@/components/SupportChatEntry';
import { GarageProvider } from '@/lib/garage-context';

const renderChat = (): void => {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <GarageProvider>
        <SupportChatEntry partId="brk-001" />
      </GarageProvider>
    </QueryClientProvider>
  );
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('SupportChatEntry', () => {
  it('opens chat and sends a message', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ reply: 'Hello!' }), { status: 200 }) as unknown as Response
    );

    renderChat();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Ask AutoMechanica Support/i }));
    await user.type(screen.getByPlaceholderText(/How can we help/i), 'Need help');
    await user.click(screen.getByRole('button', { name: /Send/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
      expect(screen.getByText(/Hello!/i)).toBeInTheDocument();
    });
  });
});
