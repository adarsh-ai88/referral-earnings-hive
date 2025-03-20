
import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
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
import { useMLM } from '@/contexts/MLMContext';
import AppLayout from '@/components/layout/AppLayout';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { supabase } from '@/integrations/supabase/client';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  
  const { isAuthenticated, isLoading, hasInitialized } = useAuth();
  const { registerUser } = useMLM();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for referral code in URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (hasInitialized && isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, isLoading, hasInitialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setFormLoading(true);
    
    try {
      // First register the user with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            referredBy: referralCode ? true : false
          }
        }
      });
      
      if (authError) {
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error("Failed to create user account");
      }
      
      // Then use MLM context to register the user in the MLM system
      const user = await registerUser(name, email, referralCode || undefined);
      
      if (user) {
        toast({
          title: "Registration Successful",
          description: "Your account has been created. You can now log in.",
        });
        navigate('/login');
      } else {
        throw new Error("Failed to register in MLM system");
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error?.message || "An error occurred during registration",
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
              <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
              <CardDescription className="text-center">
                {referralCode 
                  ? "You've been referred! Register to join our network."
                  : "Enter your details to create your account"
                }
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
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
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
                    {referralCode && (
                      <div className="space-y-2">
                        <Label htmlFor="referralCode">Referral Code</Label>
                        <Input
                          id="referralCode"
                          type="text"
                          value={referralCode}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full bg-mlm-primary hover:bg-mlm-accent"
                      disabled={formLoading}
                    >
                      {formLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : 'Register'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-mlm-primary hover:text-mlm-accent underline underline-offset-4"
                >
                  Sign in
                </Link>
              </div>

              <div className="text-xs text-center text-muted-foreground">
                By clicking Register, you agree to our{' '}
                <Link 
                  to="/terms" 
                  className="text-mlm-primary hover:text-mlm-accent underline underline-offset-4"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link 
                  to="/privacy" 
                  className="text-mlm-primary hover:text-mlm-accent underline underline-offset-4"
                >
                  Privacy Policy
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Register;
