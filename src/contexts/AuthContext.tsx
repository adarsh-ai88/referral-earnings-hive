
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();
  const isAuthenticated = !!session;
  const isAdmin = !!user?.isAdmin;

  // Set up auth state listener and check for existing session
  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile data
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (error) {
              console.error('Error fetching user profile:', error);
              return;
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
            } else {
              console.log('No user profile found');
              setUser(null);
            }
          } catch (err) {
            console.error('Profile fetch error:', err);
          }
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Checking existing session:', session?.user?.id);
      setSession(session);
      
      if (session?.user) {
        // Fetch user profile data
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user profile on init:', error);
            return;
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
            console.log('User profile loaded on init:', userProfile);
            setUser(userProfile);
          } else {
            console.log('No user profile found on init');
          }
        } catch (err) {
          console.error('Profile fetch error on init:', err);
        }
      }
    });

    return () => {
      console.log('Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', email);
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
      
      return false;
    } catch (error) {
      console.error('Login exception:', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out');
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
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin }}>
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
