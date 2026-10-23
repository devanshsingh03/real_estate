import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { ApiMeta, Property } from '../types';

export function useProperties(params: Record<string, string | undefined>) {
  const [data, setData] = useState<Property[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const key = JSON.stringify(params);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    const query = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));
    api
      .get('/properties', { params: query })
      .then((res) => {
        if (!active) return;
        setData(res.data.data);
        setMeta(res.data.meta);
      })
      .catch(() => {
        if (active) setError('Unable to load plots right now. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, meta, loading, error };
}
