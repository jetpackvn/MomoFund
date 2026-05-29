import {
  collection,
  COLLECTIONS,
  db,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from '@/lib/firestore';
import { ACTIVITY_LOG_ACTIONS, activityLogService } from '@/services/activityLogService';
import { Fund, FundMember, User } from '@/types';

function generateFundCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const fundService = {
  async createFund(name: string, description: string, user: User): Promise<string> {
    const code = generateFundCode();
    const newFundRef = doc(collection(db, COLLECTIONS.FUNDS));
    const fundId = newFundRef.id;

    const newFund: Omit<Fund, 'id'> = {
      name,
      description,
      ownerId: user.uid,
      ownerName: user.displayName,
      balance: 0,
      code,
      memberCount: 1,
      status: 'active',
      createdAt: serverTimestamp() as any,
    };

    await setDoc(newFundRef, newFund);

    const memberId = `${fundId}_${user.uid}`;
    const newMemberRef = doc(db, COLLECTIONS.FUND_MEMBERS, memberId);

    const member: FundMember = {
      fundId,
      userId: user.uid,
      displayName: user.displayName,
      email: user.email,
      role: 'owner',
      joinedAt: serverTimestamp() as any,
    };

    await setDoc(newMemberRef, member);

    await activityLogService.createLog(
      user.uid,
      ACTIVITY_LOG_ACTIONS.FUND_CREATED,
      'fund',
      fundId,
      `created fund ${name}`
    );

    return fundId;
  },

  async getUserFunds(userId: string): Promise<Fund[]> {
    const membersQuery = query(
      collection(db, COLLECTIONS.FUND_MEMBERS),
      where('userId', '==', userId)
    );
    const membersSnap = await getDocs(membersQuery);

    if (membersSnap.empty) return [];

    const memberships = membersSnap.docs.map(d => d.data() as FundMember);
    const fundIds = memberships.map(m => m.fundId);

    const funds: Fund[] = [];
    const chunkSize = 30;

    for (let i = 0; i < fundIds.length; i += chunkSize) {
      const chunk = fundIds.slice(i, i + chunkSize);
      const fundsQuery = query(
        collection(db, COLLECTIONS.FUNDS),
        where('__name__', 'in', chunk)
      );
      const fundsSnap = await getDocs(fundsQuery);
      fundsSnap.docs.forEach(docSnap => {
        funds.push({ id: docSnap.id, ...docSnap.data() } as Fund);
      });
    }

    return funds;
  },

  async getFundById(fundId: string): Promise<Fund | null> {
    const snap = await getDoc(doc(db, COLLECTIONS.FUNDS, fundId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Fund;
  },

  async updateFund(fundId: string, data: Partial<Fund>): Promise<void> {
    const fundRef = doc(db, COLLECTIONS.FUNDS, fundId);
    const oldSnap = await getDoc(fundRef);
    const oldData = oldSnap.exists() ? oldSnap.data() : null;
    await updateDoc(fundRef, data as any);
    await activityLogService.createLog(
      'system',
      ACTIVITY_LOG_ACTIONS.FUND_UPDATED,
      'fund',
      fundId,
      `updated fund ${fundId}: ${JSON.stringify({ before: oldData, after: data })}`
    );
  },

  async disbandFund(
    fundId: string,
    allocations: { userId: string; displayName: string; amount: number }[],
    callerId?: string
  ): Promise<void> {
    const fundSnap = await getDoc(doc(db, COLLECTIONS.FUNDS, fundId));
    if (!fundSnap.exists()) throw new Error('Không tìm thấy quỹ');
    const fundData = fundSnap.data();
    if (callerId && fundData.ownerId !== callerId) {
      throw new Error('Chỉ chủ quỹ mới có quyền giải tán quỹ');
    }

    const batch = writeBatch(db);

    for (const alloc of allocations) {
      if (alloc.amount > 0) {
        const txRef = doc(collection(db, COLLECTIONS.TRANSACTIONS));
        batch.set(txRef, {
          fundId,
          userId: alloc.userId,
          userName: alloc.displayName,
          amount: alloc.amount,
          note: 'Hoàn tiền khi giải tán quỹ',
          type: 'withdrawal',
          status: 'completed',
          createdAt: serverTimestamp(),
        });
      }
    }

    const membersQuery = query(
      collection(db, COLLECTIONS.FUND_MEMBERS),
      where('fundId', '==', fundId)
    );
    const membersSnap = await getDocs(membersQuery);
    membersSnap.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    batch.delete(doc(db, COLLECTIONS.FUNDS, fundId));

    await batch.commit();
    await activityLogService.createLog(
      callerId || 'system',
      ACTIVITY_LOG_ACTIONS.FUND_CLOSED,
      'fund',
      fundId,
      `disbanded fund ${fundId}`
    );
  },

  async deleteFund(fundId: string): Promise<void> {
    const membersQuery = query(
      collection(db, COLLECTIONS.FUND_MEMBERS),
      where('fundId', '==', fundId)
    );
    const membersSnap = await getDocs(membersQuery);

    const batch = writeBatch(db);
    membersSnap.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    batch.delete(doc(db, COLLECTIONS.FUNDS, fundId));

    await batch.commit();
    await activityLogService.createLog('system', 'delete_fund', 'fund', fundId, `deleted fund ${fundId}`);
  }
};