import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X, Send, Loader2, MapPin } from 'lucide-react';
import { api, resolveMediaUrl } from '../../lib/api';
import { useCompare } from '../../context/CompareContext';
import { formatINR, formatArea } from '../../lib/format';
import type { Property } from '../../types';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  properties?: Property[];
  suggestedReplies?: string[];
}

const GREETING: ChatMessage = {
  id: 0,
  role: 'assistant',
  text: "Hi! I'm your plot-finding assistant. Tell me a budget, location, or type of plot and I'll search for you.",
  suggestedReplies: ['Residential plots under 50L', 'Show me plots in Katni', 'How does EMI work?', 'Talk to a human'],
};

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<Record<string, unknown>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const { ids: compareIds } = useCompare();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { id: Date.now(), role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/assistant/chat', { message: trimmed, context });
      const { reply, properties, suggestedReplies, context: newContext } = res.data.data;
      setContext(newContext || {});
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', text: reply, properties, suggestedReplies },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', text: "Sorry, I couldn't reach the server. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSuggested(text: string) {
    if (text === 'Talk to a human') {
      window.location.href = '/contact';
      return;
    }
    sendMessage(text);
  }

  const bottomOffset = compareIds.length > 0 ? '6rem' : '1.5rem';
  const panelBottomOffset = compareIds.length > 0 ? '11.5rem' : '6rem';

  return (
    <>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close assistant' : 'Open plot-finding assistant'}
        className="fixed left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-forest text-ivory shadow-lg transition-all duration-250 hover:scale-105 focus-ring"
        style={{ bottom: bottomOffset }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
      >
        {open ? <X size={24} /> : <Sparkles size={24} />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed left-6 z-40 flex h-[32rem] w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-forest/10 bg-ivory shadow-2xl"
            style={{ bottom: panelBottomOffset }}
          >
            <div className="flex items-center gap-2 border-b border-forest/10 bg-forest px-4 py-3.5 text-ivory">
              <Sparkles size={16} className="text-champagne" />
              <p className="text-sm font-semibold">Plot Assistant</p>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.map((m) => (
                <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div className={`max-w-[88%] space-y-2`}>
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        m.role === 'user' ? 'bg-forest text-ivory' : 'border border-forest/10 bg-white text-charcoal'
                      }`}
                    >
                      {m.text}
                    </div>

                    {m.properties && m.properties.length > 0 && (
                      <div className="space-y-2">
                        {m.properties.map((p) => (
                          <Link
                            key={p.id}
                            to={`/plots/${p.slug}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl border border-forest/10 bg-white p-2 hover:border-forest/30"
                          >
                            <div className="h-12 w-14 shrink-0 overflow-hidden rounded-lg bg-sage/20">
                              {p.images[0] && (
                                <img src={resolveMediaUrl(p.images[0])} alt="" className="h-full w-full object-cover" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-forest">{p.title}</p>
                              <p className="flex items-center gap-1 truncate text-[11px] text-charcoal/50">
                                <MapPin size={10} /> {p.location ? `${p.location.locality}, ${p.location.city}` : '—'}
                              </p>
                              <p className="text-xs font-medium text-charcoal">{formatINR(p.price)} · {formatArea(p.area_sqft)}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {m.role === 'assistant' && m.suggestedReplies && m.suggestedReplies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {m.suggestedReplies.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleSuggested(s)}
                            className="rounded-full border border-forest/20 bg-white px-3 py-1.5 text-xs text-charcoal/70 hover:border-forest/40"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl border border-forest/10 bg-white px-3.5 py-2.5">
                    <Loader2 size={14} className="animate-spin text-forest" />
                    <span className="text-xs text-charcoal/50">Thinking…</span>
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-2 border-t border-forest/10 bg-white p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about plots, EMI, visits…"
                className="flex-1 rounded-full border border-forest/15 px-3.5 py-2 text-sm outline-none focus:border-forest"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest text-ivory disabled:opacity-40"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
