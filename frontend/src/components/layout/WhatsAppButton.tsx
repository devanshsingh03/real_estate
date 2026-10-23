import { MessageCircle } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import { useCompare } from '../../context/CompareContext';

export default function WhatsAppButton() {
  const { whatsappNumber } = useConfig();
  const { ids } = useCompare();
  if (!whatsappNumber) return null;

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi, I would like to enquire about a plot.')}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#1f7a4d] text-white shadow-lg transition-all duration-250 hover:scale-105 focus-ring"
      style={{ bottom: ids.length > 0 ? '5.5rem' : '1.5rem' }}
    >
      <MessageCircle size={26} />
    </a>
  );
}
