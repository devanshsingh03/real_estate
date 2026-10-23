import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Location } from '../types';

export function useLocations() {
  const [data, setData] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/locations')
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
