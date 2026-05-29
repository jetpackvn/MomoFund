/**
 * lib/firestore.ts — Firestore helper chung
 * 
 * Cung cấp các hàm tiện ích để làm việc với Firestore.
 * Các service (fundService, transactionService, ...) nên import từ đây.
 * 
 * Collection names được định nghĩa tập trung để tránh typo.
 */

import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentData,
  DocumentReference,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryConstraint,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

// ─── Collection names (dùng hằng để tránh typo) ──────────────────────────────

export const COLLECTIONS = {
  USERS: 'users',
  FUNDS: 'funds',
  FUND_MEMBERS: 'fundMembers',   // {fundId, userId, role, joinedAt}
  TRANSACTIONS: 'transactions',
  WITHDRAW_REQUESTS: 'withdrawRequests',
  ACTIVITY_LOGS: 'activityLogs',
  JOIN_REQUESTS: 'joinRequests',
  NOTIFICATIONS: 'notifications',
} as const;

// ─── Re-export Firestore helpers hay dùng ─────────────────────────────────────
// Các service chỉ cần import từ '@/lib/firestore' thay vì 'firebase/firestore'

export {
  addDoc, collection, db, deleteDoc, doc,
  getDoc,
  getDocs, increment, limit,
  onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where, writeBatch
};

    export type {
    CollectionReference, DocumentData, DocumentReference, QueryConstraint
  };

// ─── Utility helpers ──────────────────────────────────────────────────────────

/**
 * Lấy một document và tự động gắn id vào data
 * Trả về null nếu không tìm thấy
 */
export async function getDocById<T>(
  collectionName: string,
  id: string
): Promise<(T & { id: string }) | null> {
  const snap = await getDoc(doc(db, collectionName, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T & { id: string };
}

/**
 * Query một collection với các điều kiện, trả về mảng có id
 */
export async function queryCollection<T>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<(T & { id: string })[]> {
  const q = query(collection(db, collectionName), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as T & { id: string }));
}
