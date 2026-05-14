import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, COLLECTIONS, db } from '@/lib/firestore';
import { Notification } from '@/types';
import { useAuth } from './useAuth';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
      setLoading(false);
    }, (err) => {
      console.error("useNotifications error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { notifications, unreadCount, loading };
}
