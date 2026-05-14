import {
  collection,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  writeBatch,
  COLLECTIONS,
  db
} from '@/lib/firestore';
import { Notification } from '@/types';

export const notificationService = {
  async createNotification(
    userId: string,
    title: string,
    body: string,
    type: Notification['type'],
    fundId?: string
  ): Promise<string> {
    const newRef = doc(collection(db, COLLECTIONS.NOTIFICATIONS));
    
    const notification: Omit<Notification, 'id'> = {
      userId,
      title,
      body,
      type,
      fundId,
      read: false,
      createdAt: serverTimestamp() as any,
    };

    await setDoc(newRef, notification);
    return newRef.id;
  },

  async markAsRead(notificationId: string): Promise<void> {
    const ref = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
    await updateDoc(ref, { read: true });
  },

  async markAllAsRead(userId: string): Promise<void> {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const snap = await getDocs(q);
    if (snap.empty) return;

    const batch = writeBatch(db);
    snap.docs.forEach((docSnap) => {
      batch.update(docSnap.ref, { read: true });
    });
    
    await batch.commit();
  }
};
