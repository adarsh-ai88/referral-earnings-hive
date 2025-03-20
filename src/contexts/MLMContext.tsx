
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { 
  User, 
  Transaction, 
  Commission, 
  UserStats, 
  ReferralTreeNode 
} from '@/lib/types';
import { 
  mockUsers, 
  mockTransactions, 
  mockCommissions, 
  buildReferralTree,
  getUserStats,
  registerUser as mockRegisterUser
} from '@/lib/mock-data';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { generateReferralCode } from '@/lib/mlm-config';

interface MLMContextType {
  users: User[];
  transactions: Transaction[];
  commissions: Commission[];
  referralTree: ReferralTreeNode[];
  userStats: UserStats | null;
  registerUser: (name: string, email: string, referralCode?: string) => Promise<User | null>;
  copyReferralLink: (code: string) => void;
  processPurchase: (userId: string, amount: number) => Promise<boolean>;
}

const MLMContext = createContext<MLMContextType | undefined>(undefined);

export function MLMProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [commissions, setCommissions] = useState<Commission[]>(mockCommissions);
  const [referralTree, setReferralTree] = useState<ReferralTreeNode[]>(buildReferralTree());
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Update user stats when user changes
  useEffect(() => {
    if (user) {
      const stats = getUserStats(user.id);
      setUserStats(stats);
    } else {
      setUserStats(null);
    }
  }, [user, transactions]);

  // Register a new user
  const registerUser = async (name: string, email: string, referralCode?: string) => {
    if (!name || !email) {
      toast({
        title: "Registration Error",
        description: "Name and email are required",
        variant: "destructive",
      });
      return null;
    }

    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      toast({
        title: "Registration Error",
        description: "This email is already registered",
        variant: "destructive",
      });
      return null;
    }

    // Register the user
    try {
      const newUser = mockRegisterUser(name, email, referralCode);
      
      // Update state
      setUsers(prev => [...prev, newUser]);
      
      // Rebuild referral tree
      setReferralTree(buildReferralTree());
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created",
      });
      
      return newUser;
    } catch (error) {
      toast({
        title: "Registration Error",
        description: "An error occurred during registration",
        variant: "destructive",
      });
      return null;
    }
  };

  // Copy referral link to clipboard
  const copyReferralLink = (code: string) => {
    const referralLink = `${window.location.origin}/register?ref=${code}`;
    navigator.clipboard.writeText(referralLink);
    
    toast({
      title: "Referral Link Copied",
      description: "Your referral link has been copied to clipboard",
    });
  };

  // Process a purchase
  const processPurchase = async (userId: string, amount: number) => {
    try {
      // Create purchase transaction
      const purchaseId = `trans${transactions.length + 1}`;
      const purchase: Transaction = {
        id: purchaseId,
        userId,
        amount,
        type: "purchase",
        description: "Trading Bot Purchase",
        createdAt: new Date()
      };
      
      setTransactions(prev => [...prev, purchase]);
      
      // Find the user who made the purchase
      const purchaser = users.find(u => u.id === userId);
      if (purchaser && purchaser.referredBy) {
        // Process MLM commissions
        let currentReferrerId = purchaser.referredBy;
        let currentLevel = 1;
        
        const visited = new Set<string>();
        
        while (currentReferrerId && currentLevel <= 10 && !visited.has(currentReferrerId)) {
          visited.add(currentReferrerId);
          
          const referrer = users.find(u => u.id === currentReferrerId);
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
              id: `comm${commissions.length + 1}`,
              userId: currentReferrerId,
              referralUserId: userId,
              purchaseId,
              amount: levelConfig.commission,
              level: currentLevel,
              createdAt: new Date(),
              status: "pending"
            };
            
            setCommissions(prev => [...prev, commission]);
            
            // Create a transaction for this commission
            const transaction: Transaction = {
              id: `trans${transactions.length + 1 + currentLevel}`,
              userId: currentReferrerId,
              amount: levelConfig.commission,
              type: "commission",
              description: `Level ${currentLevel} Commission from purchase`,
              createdAt: new Date(),
              referenceId: purchaseId
            };
            
            setTransactions(prev => [...prev, transaction]);
          }
          
          // Move up the referral chain
          currentReferrerId = referrer.referredBy || "";
          currentLevel++;
        }
      }
      
      toast({
        title: "Purchase Successful",
        description: `You have successfully purchased the Trading Bot for $${amount}`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Purchase Error",
        description: "An error occurred during purchase",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <MLMContext.Provider 
      value={{ 
        users, 
        transactions, 
        commissions, 
        referralTree, 
        userStats,
        registerUser,
        copyReferralLink,
        processPurchase
      }}
    >
      {children}
    </MLMContext.Provider>
  );
}

export function useMLM() {
  const context = useContext(MLMContext);
  if (context === undefined) {
    throw new Error('useMLM must be used within an MLMProvider');
  }
  return context;
}
