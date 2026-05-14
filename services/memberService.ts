import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  COLLECTIONS,
  db
} from '@/lib/firestore';
import { Fund, User, FundMember } from '@/types';

export const memberService = {
  async joinFundByCode(user: User, code: string): Promise<string> {
    // 1. Find fund by code
    const fundQuery = query(
      collection(db, COLLECTIONS.FUNDS),
      where('code', '==', code.toUpperCase())
    );
    const fundSnap = await getDocs(fundQuery);

    if (fundSnap.empty) {
      throw new Error('Không tìm thấy quỹ với mã này');
    }

    const fundDoc = fundSnap.docs[0];
    const fundId = fundDoc.id;
    const fundData = fundDoc.data() as Fund;

    if (fundData.status !== 'active') {
      throw new Error('Quỹ này đã đóng');
    }

    // 2. Check if user is already a member
    const memberId = `${fundId}_${user.uid}`;
    const memberRef = doc(db, COLLECTIONS.FUND_MEMBERS, memberId);
    
    // We can also query to check, but doc ID is deterministic
    const membershipsQuery = query(
      collection(db, COLLECTIONS.FUND_MEMBERS),
      where('fundId', '==', fundId),
      where('userId', '==', user.uid)
    );
    const existingMembership = await getDocs(membershipsQuery);

    if (!existingMembership.empty) {
      throw new Error('Bạn đã là thành viên của quỹ này');
    }

    // 3. Add to FUND_MEMBERS
    const newMember: FundMember = {
      fundId,
      userId: user.uid,
      displayName: user.displayName,
      email: user.email,
      role: 'member',
      joinedAt: serverTimestamp() as any,
    };

    await setDoc(memberRef, newMember);

    // 4. Increment memberCount in FUNDS
    await updateDoc(doc(db, COLLECTIONS.FUNDS, fundId), {
      memberCount: fundData.memberCount + 1
    });

    return fundId;
  },

  async getFundMembers(fundId: string): Promise<FundMember[]> {
    const q = query(
      collection(db, COLLECTIONS.FUND_MEMBERS),
      where('fundId', '==', fundId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as FundMember);
  },

  async leaveFund(userId: string, fundId: string): Promise<void> {
    const memberId = `${fundId}_${userId}`;
    const memberRef = doc(db, COLLECTIONS.FUND_MEMBERS, memberId);
    
    // Check if user is member
    const memberSnap = await getDoc(memberRef);
    if (!memberSnap.exists()) {
      throw new Error('Bạn không phải là thành viên của quỹ này');
    }

    if (memberSnap.data()?.role === 'owner') {
      throw new Error('Chủ quỹ không thể rời quỹ. Vui lòng chuyển quyền hoặc xóa quỹ.');
    }

    // Delete membership
    await deleteDoc(memberRef);

    // Decrement memberCount in FUNDS
    const fundRef = doc(db, COLLECTIONS.FUNDS, fundId);
    const fundSnap = await getDoc(fundRef);
    if (fundSnap.exists()) {
      const currentCount = fundSnap.data().memberCount || 1;
      await updateDoc(fundRef, {
        memberCount: Math.max(0, currentCount - 1)
      });
    }
  }
};
