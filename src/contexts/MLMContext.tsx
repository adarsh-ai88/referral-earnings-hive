
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { 
  User, 
  Transaction, 
  Commission, 
  UserStats, 
  ReferralTreeNode 
} from '@/lib/types';
import { generateReferralCode } from '@/lib/mlm-config';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [referralTree, setReferralTree] = useState<ReferralTreeNode[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Load all users for admin view and referral tree
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        console.error('Error fetching users:', error);
        return;
      }
      
      if (data) {
        const formattedUsers: User[] = data.map(profile => ({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          referralCode: profile.referral_code,
          referredBy: profile.referred_by,
          level: profile.level,
          registeredAt: new Date(profile.registered_at),
          isAdmin: profile.is_admin
        }));
        
        setUsers(formattedUsers);
        
        // Build referral tree
        const tree = buildReferralTree(formattedUsers);
        setReferralTree(tree);
      }
    };
    
    fetchUsers();
  }, [isAuthenticated]);

  // Load transactions and commissions
  useEffect(() => {
    const fetchTransactionsAndCommissions = async () => {
      if (!isAuthenticated || !user) return;

      // Fetch transactions
      const { data: transData, error: transError } = await supabase
        .from('transactions')
        .select('*');
      
      if (transError) {
        console.error('Error fetching transactions:', transError);
      } else if (transData) {
        const formattedTransactions: Transaction[] = transData.map(trans => ({
          id: trans.id,
          userId: trans.user_id,
          amount: Number(trans.amount),
          type: trans.type as 'purchase' | 'commission',
          description: trans.description,
          createdAt: new Date(trans.created_at),
          referenceId: trans.reference_id
        }));
        
        setTransactions(formattedTransactions);
      }

      // Fetch commissions
      const { data: commData, error: commError } = await supabase
        .from('commissions')
        .select('*');
      
      if (commError) {
        console.error('Error fetching commissions:', commError);
      } else if (commData) {
        const formattedCommissions: Commission[] = commData.map(comm => ({
          id: comm.id,
          userId: comm.user_id,
          referralUserId: comm.referral_user_id,
          purchaseId: comm.purchase_id,
          amount: Number(comm.amount),
          level: comm.level,
          createdAt: new Date(comm.created_at),
          status: comm.status as 'pending' | 'paid'
        }));
        
        setCommissions(formattedCommissions);
      }
    };
    
    fetchTransactionsAndCommissions();
  }, [isAuthenticated, user]);

  // Update user stats when user changes
  useEffect(() => {
    if (user && transactions.length > 0) {
      const stats = calculateUserStats(user.id, transactions, users);
      setUserStats(stats);
    } else {
      setUserStats(null);
    }
  }, [user, transactions, users]);

  // Build referral tree helper function
  const buildReferralTree = (users: User[]): ReferralTreeNode[] => {
    const userMap = new Map<string, User>();
    const tree: ReferralTreeNode[] = [];
    const nodeMap = new Map<string, ReferralTreeNode>();

    // First, create a map of all users
    users.forEach(user => {
      userMap.set(user.id, user);
      nodeMap.set(user.id, { user, children: [] });
    });

    // Then build the tree structure
    users.forEach(user => {
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
  };

  // Calculate user stats
  const calculateUserStats = (userId: string, transactions: Transaction[], users: User[]): UserStats => {
    const userTransactions = transactions.filter(t => t.userId === userId);
    const totalEarnings = userTransactions
      .filter(t => t.type === "commission")
      .reduce((sum, t) => sum + t.amount, 0);

    const directReferrals = users.filter(u => u.referredBy === userId).length;
    
    const indirectReferrals = users.filter(u => {
      if (!u.referredBy) return false;
      const directReferer = users.find(du => du.id === u.referredBy);
      return directReferer && directReferer.referredBy === userId;
    }).length;

    const pendingCommissions = commissions
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
  };

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

    // Get the referrer's ID from the referral code
    let referrerId: string | null = null;
    if (referralCode) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', referralCode)
        .single();
      
      if (error) {
        console.error('Error finding referrer:', error);
      } else if (data) {
        referrerId = data.id;
      }
    }

    try {
      // Register the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: email, // Using email as password for demo simplicity - in production use proper password
        options: {
          data: {
            name,
            referredBy: referrerId
          }
        }
      });
      
      if (authError) {
        toast({
          title: "Registration Error",
          description: authError.message,
          variant: "destructive",
        });
        return null;
      }
      
      if (!authData.user) {
        toast({
          title: "Registration Error",
          description: "Failed to create user",
          variant: "destructive",
        });
        return null;
      }
      
      // Wait for the profile to be created by the database trigger
      // In a real app, you might want to implement a more robust solution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fetch the newly created profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (profileError || !profileData) {
        toast({
          title: "Registration Error",
          description: "Failed to retrieve user profile",
          variant: "destructive",
        });
        return null;
      }
      
      // Process the initial purchase
      await processPurchase(authData.user.id, 150);
      
      const newUser: User = {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        referralCode: profileData.referral_code,
        referredBy: profileData.referred_by,
        level: profileData.level,
        registeredAt: new Date(profileData.registered_at),
        isAdmin: profileData.is_admin
      };
      
      // Update the users list
      setUsers(prev => [...prev, newUser]);
      
      // Rebuild referral tree
      setReferralTree(buildReferralTree([...users, newUser]));
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created",
      });
      
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred during registration",
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
      // Create purchase transaction in Supabase
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          amount,
          type: 'purchase',
          description: 'Trading Bot Purchase'
        })
        .select()
        .single();
      
      if (transactionError) {
        console.error('Error creating purchase transaction:', transactionError);
        toast({
          title: "Purchase Error",
          description: "An error occurred during purchase",
          variant: "destructive",
        });
        return false;
      }

      // Call the database function to process MLM commissions
      const { error: rpcError } = await supabase.rpc(
        'process_mlm_commissions',
        {
          purchaser_id: userId,
          purchase_id: transactionData.id,
          purchase_amount: amount
        }
      );
      
      if (rpcError) {
        console.error('Error processing commissions:', rpcError);
        toast({
          title: "Commission Processing Error",
          description: "An error occurred while processing commissions",
          variant: "destructive",
        });
        return false;
      }
      
      // Refresh transactions and commissions
      const { data: newTransactions, error: newTransError } = await supabase
        .from('transactions')
        .select('*');
        
      if (!newTransError && newTransactions) {
        const formattedTransactions: Transaction[] = newTransactions.map(trans => ({
          id: trans.id,
          userId: trans.user_id,
          amount: Number(trans.amount),
          type: trans.type as 'purchase' | 'commission',
          description: trans.description,
          createdAt: new Date(trans.created_at),
          referenceId: trans.reference_id
        }));
        
        setTransactions(formattedTransactions);
      }
      
      const { data: newCommissions, error: newCommError } = await supabase
        .from('commissions')
        .select('*');
        
      if (!newCommError && newCommissions) {
        const formattedCommissions: Commission[] = newCommissions.map(comm => ({
          id: comm.id,
          userId: comm.user_id,
          referralUserId: comm.referral_user_id,
          purchaseId: comm.purchase_id,
          amount: Number(comm.amount),
          level: comm.level,
          createdAt: new Date(comm.created_at),
          status: comm.status as 'pending' | 'paid'
        }));
        
        setCommissions(formattedCommissions);
      }
      
      toast({
        title: "Purchase Successful",
        description: `You have successfully purchased the Trading Bot for $${amount}`,
      });
      
      return true;
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Error",
        description: "An unexpected error occurred during purchase",
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
