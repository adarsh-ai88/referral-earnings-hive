
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
import { useAuth } from '@/contexts/AuthContext';
import { useMLM } from '@/contexts/MLMContext';
import AppLayout from '@/components/layout/AppLayout';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  
  const { isAuthenticated } = useAuth();
  const { registerUser } = useMLM();
  const navigate = useNavigate();

  // Check for referral code in URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      // Error state would be handled here in a production app
      return;
    }
    
    setLoading(true);
    
    try {
      // Use the registerUser function from MLMContext to register the user
      const user = await registerUser(name, email, referralCode || undefined);
      
      if (user) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
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
              <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
              <CardDescription className="text-center">
                {referralCode 
                  ? "You've been referred! Register to join our network."
                  : "Enter your details to create your account"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    disabled={loading}
                  >
                    {loading ? 'Registering...' : 'Register'}
                  </Button>
                </div>
              </form>
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
