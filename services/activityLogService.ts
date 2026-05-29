import { addDoc, collection, COLLECTIONS, db, serverTimestamp } from '@/lib/firestore';

export const ACTIVITY_LOG_ACTIONS = {
  USER_REGISTERED: 'USER_REGISTERED',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  ADMIN_LOGIN: 'ADMIN_LOGIN',
  FUND_CREATED: 'FUND_CREATED',
  FUND_UPDATED: 'FUND_UPDATED',
  FUND_CLOSED: 'FUND_CLOSED',
  DEPOSIT_CREATED: 'DEPOSIT_CREATED',
  WITHDRAW_CREATED: 'WITHDRAW_CREATED',
  WITHDRAW_APPROVED: 'WITHDRAW_APPROVED',
  WITHDRAW_REJECTED: 'WITHDRAW_REJECTED',
  REPORT_CREATED: 'REPORT_CREATED',
  REPORT_RESOLVED: 'REPORT_RESOLVED',
  USER_LOCKED: 'USER_LOCKED',
  USER_UNLOCKED: 'USER_UNLOCKED',
} as const;

export type ActivityLogAction = typeof ACTIVITY_LOG_ACTIONS[keyof typeof ACTIVITY_LOG_ACTIONS];

export const activityLogService = {
  async createLog(
    actorId: string,
    action: ActivityLogAction | string,
    targetType?: string,
    targetId?: string,
    detail?: string,
    ipAddress?: string
  ) {
    try {
      await addDoc(collection(db, COLLECTIONS.ACTIVITY_LOGS), {
        actorId,
        action,
        targetType: targetType || null,
        targetId: targetId || null,
        detail: detail || null,
        ipAddress: ipAddress || null,
        createdAt: serverTimestamp() as any,
      });
    } catch (e) {
      console.error('Failed to write activity log', e);
    }
  }
};
