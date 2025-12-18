import { useState, type FC, type FormEvent } from 'react';

import { useGarage } from '@/lib/garage-context';

interface SupportChatEntryProps {
  partId?: string;
}

interface ChatMessage {
  from: 'user' | 'assistant';
  text: string;
}

const SupportChatEntry: FC<SupportChatEntryProps> = ({ partId }) => {
  const { activeVehicle } = useGarage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!input.trim()) return;
    const userMessage: ChatMessage = { from: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);
    setError(null);

    try {
      const res = await fetch('/api/support/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.text,
          vehicle: activeVehicle ?? undefined,
          partId: partId ?? undefined,
        }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = (await res.json()) as { reply?: string };
      const reply: ChatMessage = { from: 'assistant', text: data.reply ?? 'Thanks, we are on it.' };
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="button-secondary"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        Ask AutoMechanica Support
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-3 w-96 rounded-xl border border-gunmetal-700 bg-gunmetal-900/90 p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-electric-teal-50">Support</p>
            <button
              type="button"
              className="text-xs text-soft-graphite hover:text-electric-teal-200"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
          <p className="mt-1 text-xs text-soft-graphite">
            Context: {partId ? `Part ${partId}` : 'No part selected'}
            {activeVehicle
              ? ` · Vehicle ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
              : ' · No vehicle set'}
          </p>

          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto rounded-lg border border-gunmetal-800 bg-gunmetal-900 p-2 text-sm">
            {messages.length === 0 && (
              <p className="text-soft-graphite">Ask a question and we will help.</p>
            )}
            {messages.map((msg, idx) => (
              <div
                key={`${msg.from}-${idx}`}
                className={`rounded-md px-3 py-2 ${
                  msg.from === 'user'
                    ? 'bg-electric-teal-500/10 text-electric-teal-50'
                    : 'bg-gunmetal-800 text-slate-100'
                }`}
              >
                <span className="mr-2 text-xs uppercase tracking-[0.1em] text-soft-graphite">
                  {msg.from === 'user' ? 'You' : 'Support'}
                </span>
                {msg.text}
              </div>
            ))}
          </div>

          <form
            className="mt-3 space-y-2"
            onSubmit={(e) => {
              void sendMessage(e);
            }}
          >
            <textarea
              className="w-full rounded-lg border border-gunmetal-700 bg-gunmetal-800 p-2 text-sm text-slate-100"
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="How can we help?"
              disabled={sending}
            />
            {error && <p className="text-xs text-amber-300">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="button-primary disabled:opacity-50"
                disabled={sending || !input.trim()}
              >
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SupportChatEntry;
