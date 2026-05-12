export interface User {
    uid: string;
    displayName: string;
    email: string;
    createdAt: Date;
}

export interface Fund {
    id: string;
    name: string;
    description: string;
    ownerId: string;
    balance: number;
    code: string;         // mã 6 ký tự để join
    status: 'active' | 'closed';
    createdAt: Date;
}

export interface FundMember {
    fundId: string;
    userId: string;
    role: 'owner' | 'member';
    joinedAt: Date;
}

export interface Transaction {
    id: string;
    fundId: string;
    userId: string;
    amount: number;
    type: 'contribution' | 'withdrawal';
    note: string;
    status: 'completed' | 'pending';
    createdAt: Date;
}

export interface WithdrawRequest {
    id: string;
    fundId: string;
    requesterId: string;
    amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    body: string;
    type: 'contribution' | 'withdrawal' | 'join' | 'approval';
    read: boolean;
    createdAt: Date;
}