import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { useCompare } from '../../context/CompareContext';

export default function CompareBar() {
  const { ids, clearCompare } = useCompare();
  const navigate = useNavigate();
  const location = useLocation();
  const hidden = location.pathname === '/compare';

  return (
    <AnimatePresence>
      {ids.length > 0 && !hidden && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-forest/10 bg-ivory/97 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm"
        >
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-forest" />
              <span className="text-sm font-medium text-charcoal">
                {ids.length} plot{ids.length > 1 ? 's' : ''} selected to compare
              </span>
              <button onClick={clearCompare} className="text-xs text-charcoal/50 underline">
                Clear
              </button>
            </div>
            <button
              onClick={() => navigate(`/compare?ids=${ids.join(',')}`)}
              disabled={ids.length < 2}
              className="rounded-full bg-forest px-5 py-2 text-sm font-semibold text-ivory disabled:opacity-40"
            >
              Compare {ids.length >= 2 ? `(${ids.length})` : '— pick 1 more'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
