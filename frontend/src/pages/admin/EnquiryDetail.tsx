import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import type { Enquiry, EnquiryHistoryEntry } from '../../types';

export default function AdminEnquiryDetail() {
  const { id } = useParams();
  const [enquiry, setEnquiry] = useState<(Enquiry & { history: EnquiryHistoryEntry[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [status, setStatus] = useState('new');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get(`/admin/enquiries/${id}`).then((res) => {
      const e = res.data.data;
      setEnquiry(e);
      setNotes(e.internal_notes || '');
      setFollowUp(e.follow_up_date ? e.follow_up_date.slice(0, 10) : '');
      setStatus(e.status);
    }).finally(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const res = await api.patch(`/admin/enquiries/${id}`, {
      status,
      internalNotes: notes,
      followUpDate: followUp || null,
    });
    setEnquiry((prev) => (prev ? { ...prev, ...res.data.data } : prev));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-forest" /></div>;
  if (!enquiry) return <p className="text-charcoal/60">Enquiry not found.</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/admin/enquiries" className="mb-4 flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-forest">
        <ArrowLeft size={15} /> Back to enquiries
      </Link>
      <h1 className="font-display text-3xl font-semibold text-forest">{enquiry.name}</h1>
      <p className="mt-1 text-sm text-charcoal/60 capitalize">{enquiry.type.replace('_', ' ')} · {new Date(enquiry.created_at).toLocaleString('en-IN')}</p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-forest/10 bg-white p-5">
          <h2 className="mb-3 font-display text-lg font-semibold text-forest">Contact Details</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-charcoal/50">Phone</dt><dd className="font-medium">{enquiry.phone}</dd></div>
            {enquiry.email && <div className="flex justify-between"><dt className="text-charcoal/50">Email</dt><dd className="font-medium">{enquiry.email}</dd></div>}
            {enquiry.preferred_time && <div className="flex justify-between"><dt className="text-charcoal/50">Preferred Time</dt><dd className="font-medium capitalize">{enquiry.preferred_time}</dd></div>}
          </dl>
        </section>

        <section className="rounded-2xl border border-forest/10 bg-white p-5">
          <h2 className="mb-3 font-display text-lg font-semibold text-forest">Property</h2>
          {enquiry.property_title ? (
            <Link to={`/plots/${enquiry.property_slug}`} target="_blank" className="text-sm font-medium text-forest underline">
              {enquiry.property_title}
            </Link>
          ) : (
            <p className="text-sm text-charcoal/50">General enquiry (not tied to a specific plot)</p>
          )}
        </section>
      </div>

      {enquiry.message && (
        <section className="mt-6 rounded-2xl border border-forest/10 bg-white p-5">
          <h2 className="mb-2 font-display text-lg font-semibold text-forest">Message</h2>
          <p className="whitespace-pre-line text-sm text-charcoal/70">{enquiry.message}</p>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-forest/10 bg-white p-5">
        <h2 className="mb-4 font-display text-lg font-semibold text-forest">Manage Enquiry</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none">
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Follow-up Date</label>
            <input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Internal Notes</label>
            <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes visible only to the team..." className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none" />
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="mt-4 flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-ivory disabled:opacity-60">
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saved && <CheckCircle2 size={16} />}
          {saved ? 'Saved' : 'Save Changes'}
        </button>
      </section>

      {enquiry.history.length > 0 && (
        <section className="mt-6 rounded-2xl border border-forest/10 bg-white p-5">
          <h2 className="mb-3 font-display text-lg font-semibold text-forest">Status History</h2>
          <div className="space-y-2 text-sm">
            {enquiry.history.map((h) => (
              <div key={h.id} className="flex items-center justify-between border-b border-forest/5 pb-2 last:border-0">
                <span className="capitalize text-charcoal/70">{h.status.replace('_', ' ')} {h.changed_by_name ? `by ${h.changed_by_name}` : ''}</span>
                <span className="text-xs text-charcoal/40">{new Date(h.created_at).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
