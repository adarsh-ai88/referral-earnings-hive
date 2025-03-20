
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Admin credentials
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "password123";

const AdminLogin = () => {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminCreating, setAdminCreating] = useState(false);
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin');
    } else if (isAuthenticated && !isAdmin) {
      // If authenticated but not admin, redirect to dashboard
      navigate('/dashboard');
      toast({
        title: "Access Denied",
        description: "You do not have admin privileges",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, isAdmin, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Try to login with the provided credentials
      const success = await login(email, password);
      if (success) {
        // We'll check admin status in the useEffect
        toast({
          title: "Login Successful",
          description: "Welcome, Admin!",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "Please check your admin credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminCreate = async () => {
    setAdminCreating(true);
    try {
      // Call the Supabase Edge Function directly
      const { data, error } = await supabase.functions.invoke('create_admin', {
        method: 'POST'
      });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        toast({
          title: "Admin Credentials Ready",
          description: `${data.message}. Use email: ${data.adminEmail} and password: ${data.adminPassword}`,
        });
        
        // Fill in the password field
        setPassword(data.adminPassword);
      }
    } catch (error) {
      console.error('Admin creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create admin user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAdminCreating(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <div className="w-full max-w-md">
          <div className="absolute inset-0 -z-10 animate-pulse -top-40 opacity-10">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-mlm-primary rounded-full mix-blend-lighten filter blur-xl opacity-70"></div>
            <div className="absolute -bottom-8 right-20 w-72 h-72 bg-mlm-accent rounded-full mix-blend-lighten filter blur-xl opacity-70"></div>
          </div>

          <Card className="w-full backdrop-blur-md bg-background/95 animate-slideUp border-mlm-primary">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
              <CardDescription className="text-center">
                Enter your admin credentials to access the admin panel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Admin Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-mlm-primary hover:bg-mlm-accent"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Admin Login'}
                  </Button>
                </div>
              </form>
              
              <div className="mt-4 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleAdminCreate}
                  disabled={adminCreating}
                  className="w-full text-xs"
                  size="sm"
                >
                  {adminCreating ? 'Creating Admin User...' : 'Create/Update Admin User'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  This will create or update the admin user with the default credentials
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                variant="link" 
                onClick={() => navigate('/login')}
                className="text-mlm-primary hover:text-mlm-accent"
              >
                Regular User Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminLogin;
