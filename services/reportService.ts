import {
  collection,
  COLLECTIONS,
  db,
  doc,
  serverTimestamp,
  setDoc,
} from '@/lib/firestore';
import { ACTIVITY_LOG_ACTIONS, activityLogService } from '@/services/activityLogService';
import { Report } from '@/types';

export const reportService = {
  async createReport(
    reporterId: string,
    targetType: 'user' | 'fund',
    targetId: string,
    reason: string
  ): Promise<string> {
    const newReportRef = doc(collection(db, COLLECTIONS.REPORTS));
    const reportId = newReportRef.id;

    const newReport: Omit<Report, 'id'> = {
      reporterId,
      targetType,
      targetId,
      reason,
      reportStatus: 'pending',
      createdAt: serverTimestamp() as any,
    };

    await setDoc(newReportRef, newReport);

    await activityLogService.createLog(
      reporterId,
      ACTIVITY_LOG_ACTIONS.REPORT_CREATED,
      'report',
      reportId,
      `reported ${targetType} with ID ${targetId}`
    );

    return reportId;
  }
};
