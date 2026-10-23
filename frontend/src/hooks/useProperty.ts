import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import type { Property } from '../types';

export function useProperty(slug: string | undefined) {
  const [data, setData] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchData = useCallback(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    api
      .get(`/properties/${slug}`)
      .then((res) => setData(res.data.data))
      .catch((err) => {
        if (err?.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, notFound, refetch: fetchData };
}
