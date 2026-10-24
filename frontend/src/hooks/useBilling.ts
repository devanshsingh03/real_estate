import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { BillingStatus } from '../types';

export function useBilling() {
  const { user } = useAuth();
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    if (!user) {
      setBilling(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get('/billing/me')
      .then((res) => setBilling(res.data.data))
      .catch(() => setBilling(null))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { billing, loading, refetch };
}
