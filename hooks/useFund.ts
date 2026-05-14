import { useRealtime } from '@/hooks/useRealtime';
import { COLLECTIONS } from '@/lib/firestore';
import { Fund } from '@/types';

export function useFund(fundId: string | undefined) {
  const { document, loading, error } = useRealtime<Fund>(COLLECTIONS.FUNDS, fundId);
  return { fund: document, loading, error };
}
