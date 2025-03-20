
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
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const { login, isAuthenticated, isAdmin, isLoading, hasInitialized } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (hasInitialized && isAuthenticated && !isLoading) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, navigate, isLoading, hasInitialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    
    setFormLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        // The useEffect will handle redirects based on user role
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Show a clear loading state when initializing
  if (!hasInitialized) {
    return <LoadingSpinner fullScreen text="Initializing application..." />;
  }

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
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-mlm-primary mb-4" />
                  <p className="text-sm text-muted-foreground">Checking authentication status...</p>
                </div>
              ) : (
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
                      disabled={formLoading}
                    >
                      {formLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : 'Login'}
                    </Button>
                  </div>
                </form>
              )}
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
              <div className="w-full text-center">
                <Button 
                  variant="link" 
                  onClick={() => navigate('/admin-login')}
                  className="text-mlm-primary hover:text-mlm-accent"
                >
                  Admin Login
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Login;
