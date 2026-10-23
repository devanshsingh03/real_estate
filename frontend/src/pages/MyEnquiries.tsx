import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Enquiry } from '../types';
import Skeleton from '../components/ui/Skeleton';

const statusStyles: Record<string, string> = {
  new: 'bg-sage/20 text-forest border-sage',
  contacted: 'bg-champagne/30 text-charcoal border-champagne',
  in_progress: 'bg-champagne/30 text-charcoal border-champagne',
  closed: 'bg-charcoal/10 text-charcoal/60 border-charcoal/20',
};

export default function MyEnquiries() {
  const [data, setData] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/enquiries/mine').then((res) => setData(res.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 pt-32 lg:px-10">
      <h1 className="mb-8 font-display text-4xl font-semibold text-forest">My Enquiries</h1>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-forest/20 py-20 text-center">
          <p className="font-display text-xl text-forest">No enquiries yet</p>
          <p className="text-sm text-charcoal/60">Enquiries you submit on plot pages will appear here.</p>
          <Link to="/plots" className="mt-2 rounded-full bg-forest px-5 py-2 text-sm text-ivory">Explore Plots</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((e) => (
            <div key={e.id} className="rounded-2xl border border-forest/10 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-display text-lg font-semibold text-forest">
                    {e.property_title ? (
                      <Link to={`/plots/${e.property_slug}`} className="hover:underline">{e.property_title}</Link>
                    ) : (
                      'General enquiry'
                    )}
                  </p>
                  <p className="text-xs text-charcoal/50">{new Date(e.created_at).toLocaleString('en-IN')}</p>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[e.status]}`}>
                  {e.status.replace('_', ' ')}
                </span>
              </div>
              {e.message && <p className="mt-3 whitespace-pre-line text-sm text-charcoal/70">{e.message}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
