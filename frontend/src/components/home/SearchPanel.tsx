import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const budgetOptions = [
  { label: 'Any Budget', min: '', max: '' },
  { label: 'Under ₹25 L', min: '', max: '2500000' },
  { label: '₹25 L – ₹50 L', min: '2500000', max: '5000000' },
  { label: '₹50 L – ₹1 Cr', min: '5000000', max: '10000000' },
  { label: 'Above ₹1 Cr', min: '10000000', max: '' },
];

export default function SearchPanel() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [budget, setBudget] = useState(0);
  const [propertyType, setPropertyType] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const b = budgetOptions[budget];
    if (b.min) params.set('minPrice', b.min);
    if (b.max) params.set('maxPrice', b.max);
    if (propertyType) params.set('propertyType', propertyType);
    navigate(`/plots?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-ivory/15 bg-ivory/95 p-3 shadow-2xl backdrop-blur-md sm:flex-row sm:items-center"
    >
      <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5 sm:border-r sm:border-forest/10">
        <Search size={18} className="text-forest/50" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="City, locality, or project"
          className="w-full bg-transparent text-sm text-charcoal outline-none placeholder:text-charcoal/40"
        />
      </div>

      <select
        value={budget}
        onChange={(e) => setBudget(Number(e.target.value))}
        className="rounded-xl bg-transparent px-3 py-2.5 text-sm text-charcoal outline-none sm:border-r sm:border-forest/10"
      >
        {budgetOptions.map((b, i) => (
          <option key={b.label} value={i}>
            {b.label}
          </option>
        ))}
      </select>

      <select
        value={propertyType}
        onChange={(e) => setPropertyType(e.target.value)}
        className="rounded-xl bg-transparent px-3 py-2.5 text-sm text-charcoal outline-none"
      >
        <option value="">Any Type</option>
        <option value="residential">Residential</option>
        <option value="commercial">Commercial</option>
        <option value="agricultural">Agricultural</option>
      </select>

      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-xl bg-forest px-6 py-3 text-sm font-semibold text-ivory transition-colors duration-250 hover:bg-charcoal focus-ring"
      >
        <Search size={16} /> Search
      </button>
    </form>
  );
}
