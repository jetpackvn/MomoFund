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
  },
};