
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refreshUserProfile: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const isAuthenticated = !!session;
  const isAdmin = !!user?.isAdmin;

  // Function to fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no data is found
      
      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
      
      if (data) {
        const userProfile: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          referralCode: data.referral_code,
          referredBy: data.referred_by,
          level: data.level,
          registeredAt: new Date(data.registered_at),
          isAdmin: data.is_admin
        };
        console.log('User profile loaded:', userProfile);
        setUser(userProfile);
        return userProfile;
      } else {
        console.log('No user profile found');
        setUser(null);
        return null;
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      throw err;
    }
  };

  // Function to refresh user profile data
  const refreshUserProfile = async () => {
    if (!session?.user?.id) {
      console.log('Cannot refresh profile: No authenticated user');
      return;
    }
    
    try {
      setIsLoading(true);
      await fetchUserProfile(session.user.id);
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
      toast({
        title: "Profile Update Failed",
        description: "Could not refresh your profile data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up auth state listener and check for existing session
  useEffect(() => {
    let mounted = true;
    console.log('Setting up auth state listener');
    setIsLoading(true);
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        
        if (!mounted) return;
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Fetch user profile data
          try {
            await fetchUserProfile(currentSession.user.id);
          } catch (err) {
            console.error('Profile fetch error during auth change:', err);
            toast({
              title: "Profile Loading Error",
              description: "There was an issue loading your profile. Please try logging in again.",
              variant: "destructive",
            });
          } finally {
            if (mounted) setIsLoading(false);
          }
        } else {
          setUser(null);
          if (mounted) setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Checking existing session:', initialSession?.user?.id);
        
        if (!mounted) return;
        
        setSession(initialSession);
        
        if (initialSession?.user) {
          // Fetch user profile data
          try {
            await fetchUserProfile(initialSession.user.id);
          } catch (err) {
            console.error('Profile fetch error on init:', err);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    getInitialSession();

    return () => {
      console.log('Cleaning up auth listener');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', email);
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error.message);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }
      
      if (data.user) {
        console.log('Login successful for:', data.user.email);
        toast({
          title: "Login Successful",
          description: `Welcome back!`,
        });
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login exception:', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out');
      setIsLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin, refreshUserProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
