
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '@/lib/types';
import { mockUsers, loginUser as mockLoginUser } from '@/lib/mock-data';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();
  const isAuthenticated = !!user;
  const isAdmin = !!user?.isAdmin;

  // Check for saved login on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem('mlm_user_id');
    if (savedUserId) {
      const user = mockUsers.find(u => u.id === savedUserId);
      if (user) {
        setUser(user);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    // In a real app, you would validate credentials against a backend
    // For this prototype, we'll just find a user with the matching email
    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser) {
      // Mock login - in real app you'd verify password
      const loggedInUser = mockLoginUser(foundUser.id);
      if (loggedInUser) {
        setUser(loggedInUser);
        localStorage.setItem('mlm_user_id', loggedInUser.id);
        toast({
          title: "Login Successful",
          description: `Welcome back, ${loggedInUser.name}!`,
        });
        return true;
      }
    }
    
    toast({
      title: "Login Failed",
      description: "Invalid email or password",
      variant: "destructive",
    });
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mlm_user_id');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
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
