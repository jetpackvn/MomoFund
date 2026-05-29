import {
    addDoc,
    collection,
    COLLECTIONS,
    db,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch,
} from '@/lib/firestore';
import { ACTIVITY_LOG_ACTIONS, activityLogService } from '@/services/activityLogService';
import { notificationService } from '@/services/notificationService';
import { Fund, Transaction, User, WithdrawRequest } from '@/types';

export const transactionService = {
  async contribute(fundId: string, user: User, amount: number, note = '') {
    if (amount <= 0) {
      throw new Error('Số tiền đóng góp phải lớn hơn 0');
    }

    const fundRef = doc(db, COLLECTIONS.FUNDS, fundId);
    const fundSnap = await getDoc(fundRef);

    if (!fundSnap.exists()) {
      throw new Error('Không tìm thấy quỹ');
    }

    const fund = fundSnap.data() as Fund;
    const newBalance = (fund.balance ?? 0) + amount;

    const batch = writeBatch(db);
    const txRef = doc(collection(db, COLLECTIONS.TRANSACTIONS));
    batch.set(txRef, {
      fundId,
      userId: user.uid,
      userName: user.displayName,
      amount,
      note,
      type: 'contribution',
      status: 'completed',
      createdAt: serverTimestamp(),
    });
    batch.update(fundRef, { balance: newBalance });

    await batch.commit();
    await activityLogService.createLog(
      user.uid,
      ACTIVITY_LOG_ACTIONS.DEPOSIT_CREATED,
      'fund',
      fundId,
      `deposited ${amount} into fund ${fundId}`
    );
  },

  async requestWithdrawal(fundId: string, user: User, amount: number, reason: string) {
    if (amount <= 0) {
      throw new Error('Số tiền yêu cầu phải lớn hơn 0');
    }

    if (!reason.trim()) {
      throw new Error('Vui lòng nhập lý do rút tiền');
    }

    const fundRef = doc(db, COLLECTIONS.FUNDS, fundId);
    const fundSnap = await getDoc(fundRef);

    if (!fundSnap.exists()) {
      throw new Error('Không tìm thấy quỹ');
    }

    const fund = fundSnap.data() as Fund;
    if (user.uid === fund.ownerId) {
      if ((fund.balance ?? 0) < amount) {
        throw new Error('Quỹ không đủ số dư để rút tiền');
      }

      const batch = writeBatch(db);
      batch.update(fundRef, { balance: (fund.balance ?? 0) - amount });

      const txRef = doc(collection(db, COLLECTIONS.TRANSACTIONS));
      batch.set(txRef, {
        fundId,
        userId: user.uid,
        userName: user.displayName,
        amount,
        note: reason,
        type: 'withdrawal',
        status: 'completed',
        createdAt: serverTimestamp(),
      });

      await batch.commit();
      // Log activity: direct withdrawal created
      await activityLogService.createLog(user.uid, ACTIVITY_LOG_ACTIONS.WITHDRAW_CREATED, 'fund', fundId, `owner ${user.displayName} withdrew ${amount}`);
      return { direct: true };
    }

    await addDoc(collection(db, COLLECTIONS.WITHDRAW_REQUESTS), {
      fundId,
      requesterId: user.uid,
      requesterName: user.displayName,
      amount,
      reason,
      status: 'pending',
      createdAt: serverTimestamp(),
    } as WithdrawRequest);

    await notificationService.createNotification(
      fund.ownerId,
      'Yêu cầu rút tiền mới',
      `${user.displayName} yêu cầu rút ${amount.toLocaleString('vi-VN')} ₫`,
      'withdrawal',
      fundId
    );

    // Log activity: withdrawal request created
    await activityLogService.createLog(user.uid, ACTIVITY_LOG_ACTIONS.WITHDRAW_CREATED, 'fund', fundId, `requested ${amount} - ${reason}`);
    return { direct: false };
  },

  async getTransactions(fundId: string): Promise<Transaction[]> {
    const rootQuery = query(
      collection(db, COLLECTIONS.TRANSACTIONS),
      where('fundId', '==', fundId),
      orderBy('createdAt', 'desc')
    );
    const rootSnap = await getDocs(rootQuery);
    const rootTransactions = rootSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Transaction));
    if (rootTransactions.length > 0) {
      return rootTransactions;
    }

    // Fallback for alternate schema where transactions are stored as subcollection under fund
    try {
      const subQuery = query(
        collection(db, COLLECTIONS.FUNDS, fundId, COLLECTIONS.TRANSACTIONS),
        orderBy('createdAt', 'desc')
      );
      const subSnap = await getDocs(subQuery);
      return subSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Transaction));
    } catch (fallbackError) {
      console.warn('Fallback transaction subcollection query failed:', fallbackError);
      return rootTransactions;
    }
  },

  async getPendingWithdrawRequests(fundId: string): Promise<WithdrawRequest[]> {
    const requestQuery = query(
      collection(db, COLLECTIONS.WITHDRAW_REQUESTS),
      where('fundId', '==', fundId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const requestSnap = await getDocs(requestQuery);
    return requestSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as WithdrawRequest));
  },

  async approveWithdrawRequest(requestId: string, approverId: string) {
    const requestRef = doc(db, COLLECTIONS.WITHDRAW_REQUESTS, requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      throw new Error('Yêu cầu rút tiền không tồn tại');
    }

    const requestData = requestSnap.data() as WithdrawRequest;
    if (requestData.status !== 'pending') {
      throw new Error('Yêu cầu đã được xử lý');
    }

    const fundRef = doc(db, COLLECTIONS.FUNDS, requestData.fundId);
    const fundSnap = await getDoc(fundRef);

    if (!fundSnap.exists()) {
      throw new Error('Không tìm thấy quỹ');
    }

    const fund = fundSnap.data() as Fund;
    if ((fund.balance ?? 0) < requestData.amount) {
      throw new Error('Quỹ không đủ số dư để duyệt yêu cầu này');
    }

    const batch = writeBatch(db);
    batch.update(requestRef, {
      status: 'approved',
      approvedBy: approverId,
      approvedAt: serverTimestamp(),
    });
    batch.update(fundRef, { balance: (fund.balance ?? 0) - requestData.amount });

    const txRef = doc(collection(db, COLLECTIONS.TRANSACTIONS));
    batch.set(txRef, {
      fundId: requestData.fundId,
      userId: requestData.requesterId,
      userName: requestData.requesterName,
      amount: requestData.amount,
      note: requestData.reason,
      type: 'withdrawal',
      status: 'completed',
      createdAt: serverTimestamp(),
    });

    await batch.commit();

    await notificationService.createNotification(
      requestData.requesterId,
      'Yêu cầu rút tiền được duyệt',
      `Yêu cầu rút ${requestData.amount.toLocaleString('vi-VN')} ₫ của bạn đã được duyệt`,
      'approval',
      requestData.fundId
    );
    // Log activity: withdrawal approved
    await activityLogService.createLog(
      approverId,
      ACTIVITY_LOG_ACTIONS.WITHDRAW_APPROVED,
      'withdrawRequest',
      requestId,
      `approved ${requestData.amount} for ${requestData.requesterName}`
    );
  },

  async rejectWithdrawRequest(requestId: string, approverId: string) {
    const requestRef = doc(db, COLLECTIONS.WITHDRAW_REQUESTS, requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      throw new Error('Yêu cầu rút tiền không tồn tại');
    }

    const requestData = requestSnap.data() as WithdrawRequest;
    if (requestData.status !== 'pending') {
      throw new Error('Yêu cầu đã được xử lý');
    }

    await updateDoc(requestRef, {
      status: 'rejected',
      approvedBy: approverId,
      approvedAt: serverTimestamp(),
    });

    await notificationService.createNotification(
      requestData.requesterId,
      'Yêu cầu rút tiền bị từ chối',
      `Yêu cầu rút ${requestData.amount.toLocaleString('vi-VN')} ₫ của bạn đã bị từ chối`,
      'approval',
      requestData.fundId
    );
    // Log activity: withdrawal rejected
    await activityLogService.createLog(
      approverId,
      ACTIVITY_LOG_ACTIONS.WITHDRAW_REJECTED,
      'withdrawRequest',
      requestId,
      `rejected ${requestData.amount} for ${requestData.requesterName}`
    );
  },
};