
import { Commission, ReferralTreeNode, Transaction, User, UserStats } from "./types";
import { generateReferralCode } from "./mlm-config";

// Mock users
export const mockUsers: User[] = [
  {
    id: "user1",
    name: "John Admin",
    email: "admin@example.com",
    referralCode: "ADMIN123",
    referredBy: null,
    level: 0,
    registeredAt: new Date(2023, 0, 1),
    isAdmin: true
  },
  {
    id: "user2",
    name: "Alice Smith",
    email: "alice@example.com",
    referralCode: "ALICE456",
    referredBy: null,
    level: 1,
    registeredAt: new Date(2023, 1, 15)
  },
  {
    id: "user3",
    name: "Bob Johnson",
    email: "bob@example.com",
    referralCode: "BOB789",
    referredBy: "user2",
    level: 2,
    registeredAt: new Date(2023, 2, 10)
  },
  {
    id: "user4",
    name: "Carol Davis",
    email: "carol@example.com",
    referralCode: "CAROL012",
    referredBy: "user3",
    level: 3,
    registeredAt: new Date(2023, 3, 5)
  },
  {
    id: "user5",
    name: "Dave Wilson",
    email: "dave@example.com",
    referralCode: "DAVE345",
    referredBy: "user2",
    level: 2,
    registeredAt: new Date(2023, 4, 20)
  },
  {
    id: "user6",
    name: "Eve Brown",
    email: "eve@example.com",
    referralCode: "EVE678",
    referredBy: "user5",
    level: 3,
    registeredAt: new Date(2023, 5, 12)
  },
  {
    id: "user7",
    name: "Frank Miller",
    email: "frank@example.com",
    referralCode: "FRANK901",
    referredBy: "user2",
    level: 2,
    registeredAt: new Date(2023, 6, 8)
  }
];

// Mock transactions
export const mockTransactions: Transaction[] = [
  {
    id: "trans1",
    userId: "user2",
    amount: 150,
    type: "purchase",
    description: "Trading Bot Purchase",
    createdAt: new Date(2023, 1, 15)
  },
  {
    id: "trans2",
    userId: "user3",
    amount: 150,
    type: "purchase",
    description: "Trading Bot Purchase",
    createdAt: new Date(2023, 2, 10)
  },
  {
    id: "trans3",
    userId: "user2",
    amount: 10,
    type: "commission",
    description: "Level 1 Commission from Bob Johnson",
    createdAt: new Date(2023, 2, 10),
    referenceId: "trans2"
  },
  {
    id: "trans4",
    userId: "user4",
    amount: 150,
    type: "purchase",
    description: "Trading Bot Purchase",
    createdAt: new Date(2023, 3, 5)
  },
  {
    id: "trans5",
    userId: "user3",
    amount: 10,
    type: "commission",
    description: "Level 1 Commission from Carol Davis",
    createdAt: new Date(2023, 3, 5),
    referenceId: "trans4"
  },
  {
    id: "trans6",
    userId: "user2",
    amount: 6,
    type: "commission",
    description: "Level 2 Commission from Carol Davis",
    createdAt: new Date(2023, 3, 5),
    referenceId: "trans4"
  },
  {
    id: "trans7",
    userId: "user5",
    amount: 150,
    type: "purchase",
    description: "Trading Bot Purchase",
    createdAt: new Date(2023, 4, 20)
  },
  {
    id: "trans8",
    userId: "user2",
    amount: 10,
    type: "commission",
    description: "Level 1 Commission from Dave Wilson",
    createdAt: new Date(2023, 4, 20),
    referenceId: "trans7"
  },
];

// Mock commissions
export const mockCommissions: Commission[] = [
  {
    id: "comm1",
    userId: "user2",
    referralUserId: "user3",
    purchaseId: "trans2",
    amount: 10,
    level: 1,
    createdAt: new Date(2023, 2, 10),
    status: "paid"
  },
  {
    id: "comm2",
    userId: "user3",
    referralUserId: "user4",
    purchaseId: "trans4",
    amount: 10,
    level: 1,
    createdAt: new Date(2023, 3, 5),
    status: "paid"
  },
  {
    id: "comm3",
    userId: "user2",
    referralUserId: "user4",
    purchaseId: "trans4",
    amount: 6,
    level: 2,
    createdAt: new Date(2023, 3, 5),
    status: "paid"
  },
  {
    id: "comm4",
    userId: "user2",
    referralUserId: "user5",
    purchaseId: "trans7",
    amount: 10,
    level: 1,
    createdAt: new Date(2023, 4, 20),
    status: "paid"
  },
  {
    id: "comm5",
    userId: "user2",
    referralUserId: "user6",
    purchaseId: "trans8",
    amount: 6,
    level: 2,
    createdAt: new Date(2023, 5, 12),
    status: "pending"
  }
];

// Helper function to build a referral tree
export function buildReferralTree(): ReferralTreeNode[] {
  const userMap = new Map<string, User>();
  const tree: ReferralTreeNode[] = [];
  const nodeMap = new Map<string, ReferralTreeNode>();

  // First, create a map of all users
  mockUsers.forEach(user => {
    userMap.set(user.id, user);
    nodeMap.set(user.id, { user, children: [] });
  });

  // Then build the tree structure
  mockUsers.forEach(user => {
    const node = nodeMap.get(user.id)!;
    if (user.referredBy) {
      const parentNode = nodeMap.get(user.referredBy);
      if (parentNode) {
        parentNode.children.push(node);
      }
    } else {
      tree.push(node);
    }
  });

  return tree;
}

// Get user stats
export function getUserStats(userId: string): UserStats {
  const userTransactions = mockTransactions.filter(t => t.userId === userId);
  const totalEarnings = userTransactions
    .filter(t => t.type === "commission")
    .reduce((sum, t) => sum + t.amount, 0);

  const directReferrals = mockUsers.filter(u => u.referredBy === userId).length;
  
  const indirectReferrals = mockUsers.filter(u => {
    if (!u.referredBy) return false;
    const directReferer = mockUsers.find(du => du.id === u.referredBy);
    return directReferer && directReferer.referredBy === userId;
  }).length;

  const pendingCommissions = mockCommissions
    .filter(c => c.userId === userId && c.status === "pending")
    .reduce((sum, c) => sum + c.amount, 0);

  const lastTransactions = userTransactions
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  return {
    totalEarnings,
    directReferrals,
    indirectReferrals,
    pendingCommissions,
    lastTransactions
  };
}

// Current user context
export let currentUser: User | null = null;

// Function to "log in" a user
export function loginUser(userId: string): User | null {
  const user = mockUsers.find(u => u.id === userId);
  if (user) {
    currentUser = user;
    return user;
  }
  return null;
}

// Function to register a new user
export function registerUser(name: string, email: string, referralCode?: string): User {
  let referredBy: string | null = null;
  let level = 1;
  
  if (referralCode) {
    const referrer = mockUsers.find(u => u.referralCode === referralCode);
    if (referrer) {
      referredBy = referrer.id;
      level = referrer.level + 1;
    }
  }
  
  const newUser: User = {
    id: `user${mockUsers.length + 1}`,
    name,
    email,
    referralCode: generateReferralCode(),
    referredBy,
    level,
    registeredAt: new Date()
  };
  
  mockUsers.push(newUser);
  
  // Simulate a purchase
  const purchaseId = `trans${mockTransactions.length + 1}`;
  const purchase: Transaction = {
    id: purchaseId,
    userId: newUser.id,
    amount: 150,
    type: "purchase",
    description: "Trading Bot Purchase",
    createdAt: new Date()
  };
  
  mockTransactions.push(purchase);
  
  // Process MLM commissions
  if (referredBy) {
    processCommissions(newUser.id, referredBy, purchaseId);
  }
  
  return newUser;
}

// Function to process MLM commissions
function processCommissions(newUserId: string, referrerId: string, purchaseId: string): void {
  let currentReferrerId = referrerId;
  let currentLevel = 1;
  
  const visited = new Set<string>();
  
  while (currentReferrerId && currentLevel <= 10 && !visited.has(currentReferrerId)) {
    visited.add(currentReferrerId);
    
    const referrer = mockUsers.find(u => u.id === currentReferrerId);
    if (!referrer) break;
    
    const levelConfig = { level: currentLevel, commission: 0 };
    
    switch(currentLevel) {
      case 1: levelConfig.commission = 10; break;
      case 2: levelConfig.commission = 6; break;
      case 3: levelConfig.commission = 4; break;
      case 4: levelConfig.commission = 3; break;
      case 5: levelConfig.commission = 2; break;
      case 6: levelConfig.commission = 2; break;
      case 7: levelConfig.commission = 3; break;
      case 8: levelConfig.commission = 4; break;
      case 9: levelConfig.commission = 6; break;
      case 10: levelConfig.commission = 10; break;
      default: levelConfig.commission = 0;
    }
    
    if (levelConfig.commission > 0) {
      // Create a commission record
      const commission: Commission = {
        id: `comm${mockCommissions.length + 1}`,
        userId: currentReferrerId,
        referralUserId: newUserId,
        purchaseId,
        amount: levelConfig.commission,
        level: currentLevel,
        createdAt: new Date(),
        status: "pending"
      };
      
      mockCommissions.push(commission);
      
      // Create a transaction for this commission
      const transaction: Transaction = {
        id: `trans${mockTransactions.length + 1}`,
        userId: currentReferrerId,
        amount: levelConfig.commission,
        type: "commission",
        description: `Level ${currentLevel} Commission from new user purchase`,
        createdAt: new Date(),
        referenceId: purchaseId
      };
      
      mockTransactions.push(transaction);
    }
    
    // Move up the referral chain
    currentReferrerId = referrer.referredBy || "";
    currentLevel++;
  }
}
