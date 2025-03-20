
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

// Fixed admin credentials - for developer reference only
// Email: admin@example.com
// Password: password123
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "password123";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check if the credentials match the admin credentials
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const success = await login(email, password);
        if (success) {
          toast({
            title: "Admin Login Successful",
            description: "Welcome back, Admin!",
          });
          navigate('/admin'); // Redirect directly to admin page
          return;
        }
      }
      
      // Regular login flow
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminCreate = async () => {
    try {
      const response = await fetch('/api/create_admin');
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Admin Credentials Ready",
          description: `${data.message}. Use email: ${data.adminEmail} and password: ${data.adminPassword}`,
        });
        
        // Fill in the fields
        setEmail(data.adminEmail);
        setPassword(data.adminPassword);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create admin user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Admin creation error:', error);
      toast({
        title: "Error",
        description: "Failed to connect to the admin creation service",
        variant: "destructive",
      });
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

          <Card className="w-full backdrop-blur-md bg-background/95 animate-slideUp">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Login</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link 
                        to="/forgot-password"
                        className="text-xs text-mlm-primary hover:text-mlm-accent"
                      >
                        Forgot password?
                      </Link>
                    </div>
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
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-muted-foreground">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-mlm-primary hover:text-mlm-accent underline underline-offset-4"
                >
                  Create one
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Login;
