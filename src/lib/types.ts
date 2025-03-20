
export interface User {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  referredBy: string | null;
  level: number;
  registeredAt: Date;
  isAdmin?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: "purchase" | "commission";
  description: string;
  createdAt: Date;
  referenceId?: string;
}

export interface Commission {
  id: string;
  userId: string;
  referralUserId: string;
  purchaseId: string;
  amount: number;
  level: number;
  createdAt: Date;
  status: "pending" | "paid";
}

export interface MLMLevel {
  level: number;
  commission: number;
}

export interface ReferralTreeNode {
  user: User;
  children: ReferralTreeNode[];
}

export interface UserStats {
  totalEarnings: number;
  directReferrals: number;
  indirectReferrals: number;
  pendingCommissions: number;
  lastTransactions: Transaction[];
}
