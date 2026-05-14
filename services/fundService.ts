import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  serverTimestamp,
  writeBatch,
  COLLECTIONS,
  db
} from '@/lib/firestore';
import { Fund, User, FundMember } from '@/types';

function generateFundCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const fundService = {
  async createFund(name: string, description: string, user: User): Promise<string> {
    const code = generateFundCode();
    // Using doc() with auto-generated id
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

    // Add user as owner in FUND_MEMBERS
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

    return fundId;
  },

  async getUserFunds(userId: string): Promise<Fund[]> {
    // 1. Get all memberships for this user
    const membersQuery = query(
      collection(db, COLLECTIONS.FUND_MEMBERS),
      where('userId', '==', userId)
    );
    const membersSnap = await getDocs(membersQuery);
    
    if (membersSnap.empty) return [];

    const memberships = membersSnap.docs.map(d => d.data() as FundMember);
    const fundIds = memberships.map(m => m.fundId);

    // 2. Fetch the corresponding funds
    // Note: Firestore 'in' query supports up to 30 elements.
    // If a user is in >30 funds, this needs chunking. For MVP, this is fine.
    
    // To handle potential limits or large arrays, we can chunk them:
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
    await updateDoc(fundRef, data as any);
  },

  async deleteFund(fundId: string): Promise<void> {
    // 1. Delete all members
    const membersQuery = query(
      collection(db, COLLECTIONS.FUND_MEMBERS),
      where('fundId', '==', fundId)
    );
    const membersSnap = await getDocs(membersQuery);
    
    const batch = writeBatch(db);
    membersSnap.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    
    // 2. Delete the fund itself
    batch.delete(doc(db, COLLECTIONS.FUNDS, fundId));
    
    await batch.commit();
  }
};