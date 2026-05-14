import { useState, useEffect } from 'react';
import { doc, onSnapshot, COLLECTIONS, db } from '@/lib/firestore';
import { Fund } from '@/types';

export function useFund(fundId: string | undefined) {
  const [fund, setFund] = useState<Fund | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!fundId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const unsubscribe = onSnapshot(
      doc(db, COLLECTIONS.FUNDS, fundId),
      (docSnap) => {
        if (docSnap.exists()) {
          setFund({ id: docSnap.id, ...docSnap.data() } as Fund);
        } else {
          setFund(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("useFund snapshot error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [fundId]);

  return { fund, loading, error };
}
