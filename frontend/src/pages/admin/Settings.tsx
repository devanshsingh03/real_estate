import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import type { SiteSettings } from '../../types';

export default function AdminSettings() {
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/admin/settings').then((res) => setForm(res.data.data)).finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setSaved(false);
    const res = await api.put('/admin/settings', form);
    setForm(res.data.data);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading || !form) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-forest" /></div>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-forest">Settings</h1>
      <p className="mt-1 text-sm text-charcoal/60">Controls the brand name, contact details, and social links shown site-wide.</p>

      <form onSubmit={handleSave} className="mt-6 space-y-5 rounded-2xl border border-forest/10 bg-white p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">Brand Name</label>
          <input value={form.brandName} onChange={(e) => setForm({ ...form, brandName: e.target.value })} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">Contact Email</label>
          <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">WhatsApp Number</label>
          <input value={form.whatsappNumber} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} placeholder="Country code + number, e.g. 911234567890" className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">Logo URL</label>
          <input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Facebook URL</label>
            <input value={form.facebookUrl} onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Instagram URL</label>
            <input value={form.instagramUrl} onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Twitter / X URL</label>
            <input value={form.twitterUrl} onChange={(e) => setForm({ ...form, twitterUrl: e.target.value })} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none" />
          </div>
        </div>

        <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-ivory disabled:opacity-60">
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saved && <CheckCircle2 size={16} />}
          {saved ? 'Saved' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
