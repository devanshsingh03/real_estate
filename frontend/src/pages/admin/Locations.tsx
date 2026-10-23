import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { api } from '../../lib/api';
import type { Location } from '../../types';
import Skeleton from '../../components/ui/Skeleton';

const emptyForm = { city: '', locality: '', imageUrl: '', description: '' };

export default function AdminLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  function fetchData() {
    setLoading(true);
    api.get('/admin/locations').then((res) => setLocations(res.data.data)).finally(() => setLoading(false));
  }

  useEffect(() => { fetchData(); }, []);

  function startEdit(loc?: Location) {
    if (loc) {
      setForm({ city: loc.city, locality: loc.locality, imageUrl: loc.image_url || '', description: loc.description || '' });
      setEditingId(loc.id);
    } else {
      setForm(emptyForm);
      setEditingId('new');
    }
    setError('');
  }

  async function handleSave() {
    try {
      if (editingId === 'new') {
        await api.post('/admin/locations', form);
      } else {
        await api.put(`/admin/locations/${editingId}`, form);
      }
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save location.');
    }
  }

  async function handleDelete(loc: Location) {
    if (!confirm(`Delete ${loc.locality}, ${loc.city}?`)) return;
    try {
      await api.delete(`/admin/locations/${loc.id}`);
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to delete location.');
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-forest">Locations</h1>
          <p className="mt-1 text-sm text-charcoal/60">Manage the cities and localities shown across the site.</p>
        </div>
        <button onClick={() => startEdit()} className="flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-ivory">
          <Plus size={16} /> Add Location
        </button>
      </div>

      {editingId !== null && (
        <div className="mt-5 rounded-2xl border border-forest/10 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-forest">{editingId === 'new' ? 'New Location' : 'Edit Location'}</h2>
            <button onClick={() => setEditingId(null)}><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">City</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Locality</label>
              <input value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Image URL</label>
              <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="/seed/locations/example.svg or https://..." className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none" />
            </div>
          </div>
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
          <button onClick={handleSave} className="mt-4 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-ivory">Save</button>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)
        ) : locations.length === 0 ? (
          <p className="text-sm text-charcoal/50">No locations yet.</p>
        ) : (
          locations.map((loc) => (
            <div key={loc.id} className="flex items-center justify-between rounded-2xl border border-forest/10 bg-white p-4">
              <div>
                <p className="font-medium text-forest">{loc.locality}, {loc.city}</p>
                <p className="text-sm text-charcoal/50">{loc.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(loc)} className="rounded-lg p-2 text-forest hover:bg-sage/10"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(loc)} className="rounded-lg p-2 text-red-700 hover:bg-red-50"><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
