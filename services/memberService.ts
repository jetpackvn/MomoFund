import {
  addDoc,
  collection,
  COLLECTIONS,
  db,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from '@/lib/firestore';
import { activityLogService } from '@/services/activityLogService';
import { Fund, FundMember, JoinRequest, User } from '@/types';

export const memberService = {
  // Yêu cầu tham gia quỹ bằng mã (thay vì join trực tiếp)
  async requestJoinFundByCode(user: User, code: string): Promise<{ fundId: string; joinedDirectly: boolean }> {
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

    // Check if user is already a member
    const memberId = `${fundId}_${user.uid}`;
    const memberRef = doc(db, COLLECTIONS.FUND_MEMBERS, memberId);
    const memberSnap = await getDoc(memberRef);

    if (memberSnap.exists()) {
      throw new Error('Bạn đã là thành viên của quỹ này');
    }

    if (fundData.visibility === 'public') {
      const newMember: FundMember = {
        fundId,
        userId: user.uid,
        displayName: user.displayName,
        email: user.email,
        role: 'member',
        joinedAt: serverTimestamp() as any,
        totalContributed: 0,
      };

      await setDoc(memberRef, newMember);

      const fundRef = doc(db, COLLECTIONS.FUNDS, fundId);
      await updateDoc(fundRef, {
        memberCount: (fundData.memberCount || 0) + 1,
      });

      return { fundId, joinedDirectly: true };
    }

    // Check if there is already a pending request
    const requestQuery = query(
      collection(db, COLLECTIONS.JOIN_REQUESTS),
      where('fundId', '==', fundId),
      where('userId', '==', user.uid),
      where('status', '==', 'pending')
    );
    const requestSnap = await getDocs(requestQuery);
    if (!requestSnap.empty) {
      throw new Error('Bạn đã gửi yêu cầu tham gia và đang chờ duyệt');
    }

    // Create join request
    const joinReq: Omit<JoinRequest, 'id'> = {
      fundId,
      userId: user.uid,
      userName: user.displayName,
      status: 'pending',
      createdAt: serverTimestamp() as any,
    };

    await addDoc(collection(db, COLLECTIONS.JOIN_REQUESTS), joinReq);

    // Log activity: join request created
    await activityLogService.createLog(user.uid, 'request_join', 'fund', fundId, `requested to join fund ${fundId}`);

    return { fundId, joinedDirectly: false };
  },

  async getPendingJoinRequests(fundId: string): Promise<JoinRequest[]> {
    const q = query(
      collection(db, COLLECTIONS.JOIN_REQUESTS),
      where('fundId', '==', fundId),
      where('status', '==', 'pending')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as JoinRequest));
  },

  async approveJoinRequest(requestId: string, approverId: string) {
    const reqRef = doc(db, COLLECTIONS.JOIN_REQUESTS, requestId);
    const reqSnap = await getDoc(reqRef);
    if (!reqSnap.exists()) throw new Error('Yêu cầu không tồn tại');
    
    const reqData = reqSnap.data() as JoinRequest;
    if (reqData.status !== 'pending') throw new Error('Yêu cầu đã được xử lý');

    // Add to members
    const memberId = `${reqData.fundId}_${reqData.userId}`;
    const memberRef = doc(db, COLLECTIONS.FUND_MEMBERS, memberId);
    
    const newMember: FundMember = {
      fundId: reqData.fundId,
      userId: reqData.userId,
      displayName: reqData.userName,
      email: '', // Not strictly needed or we can fetch user profile
      role: 'member',
      joinedAt: serverTimestamp() as any,
      totalContributed: 0,
    };

    await setDoc(memberRef, newMember);

    // Update request status
    await updateDoc(reqRef, {
      status: 'approved',
      approvedBy: approverId,
      approvedAt: serverTimestamp()
    });

    // Log activity: join request approved
    await activityLogService.createLog(approverId, 'approve_join', 'joinRequest', requestId, `approved join for ${reqData.userId} into fund ${reqData.fundId}`);

    // Increment fund member count
    const fundRef = doc(db, COLLECTIONS.FUNDS, reqData.fundId);
    const fundSnap = await getDoc(fundRef);
    if (fundSnap.exists()) {
      await updateDoc(fundRef, {
        memberCount: (fundSnap.data().memberCount || 0) + 1
      });
    }
  },

  async rejectJoinRequest(requestId: string, approverId: string) {
    const reqRef = doc(db, COLLECTIONS.JOIN_REQUESTS, requestId);
    const reqSnap = await getDoc(reqRef);
    if (!reqSnap.exists()) throw new Error('Yêu cầu không tồn tại');
    
    const reqData = reqSnap.data() as JoinRequest;
    if (reqData.status !== 'pending') throw new Error('Yêu cầu đã được xử lý');

    await updateDoc(reqRef, {
      status: 'rejected',
      rejectedBy: approverId,
      rejectedAt: serverTimestamp()
    });

    // Log activity: join request rejected
    await activityLogService.createLog(approverId, 'reject_join', 'joinRequest', requestId, `rejected join for ${reqData.userId} into fund ${reqData.fundId}`);
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

    // Log activity: member left fund
    await activityLogService.createLog(userId, 'leave_fund', 'fund', fundId, `user ${userId} left fund ${fundId}`);

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
