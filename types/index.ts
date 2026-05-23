import { Timestamp } from 'firebase/firestore';

// Re-export Timestamp để các file khác dùng chung
export type { Timestamp };

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: Timestamp | Date;
}

// ─── Fund ────────────────────────────────────────────────────────────────────

export interface Fund {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;       // Tên chủ quỹ — dùng trong FundCard (index.tsx)
  balance: number;
  code: string;            // Mã 6 ký tự để join
  memberCount: number;     // Tổng số thành viên
  status: 'active' | 'closed';
  createdAt: Timestamp | Date;

  // Virtual field — KHÔNG lưu Firestore, gắn runtime tại client
  role?: 'owner' | 'member';
}

// ─── FundMember ───────────────────────────────────────────────────────────────

export interface FundMember {
  fundId: string;
  userId: string;
  displayName: string;     // Tên thành viên — dùng trong MemberList
  email: string;
  role: 'owner' | 'member';
  joinedAt: Timestamp | Date;
}

// ─── Transaction ──────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  fundId: string;
  userId: string;
  userName: string;        // Tên người thực hiện — dùng trong TransactionItem
  amount: number;
  type: 'contribution' | 'withdrawal';
  note: string;
  status: 'completed' | 'pending';
  createdAt: Timestamp | Date;
}

// ─── WithdrawRequest ──────────────────────────────────────────────────────────

export interface WithdrawRequest {
  id: string;
  fundId: string;
  requesterId: string;
  requesterName: string;   // Tên người yêu cầu — dùng trong withdrawal approval
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;     // uid của chủ quỹ duyệt
  approvedAt?: Timestamp | Date;
  createdAt: Timestamp | Date;
}

// ─── JoinRequest ────────────────────────────────────────────────────────────────
export interface JoinRequest {
  id: string;
  fundId: string;
  userId: string;
  userName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp | Date;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'contribution' | 'withdrawal' | 'join' | 'approval';
  fundId?: string;         // Link đến quỹ liên quan (optional)
  read: boolean;
  createdAt: Timestamp | Date;
}