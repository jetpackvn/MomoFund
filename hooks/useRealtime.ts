import { db, doc, onSnapshot } from '@/lib/firestore';
import { useEffect, useState } from 'react';

export function useRealtime<T>(collectionName: string, id?: string) {
  const [document, setDocument] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setDocument(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, collectionName, id),
      (snap) => {
        if (snap.exists()) {
          setDocument({ id: snap.id, ...snap.data() } as T);
        } else {
          setDocument(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('useRealtime snapshot error:', err);
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionName, id]);

  return { document, loading, error };
}
