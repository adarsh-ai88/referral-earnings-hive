
import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
import { useMLM } from '@/contexts/MLMContext';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerUser } = useMLM();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract referral code from URL if present
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const ref = query.get('ref');
    if (ref) {
      setReferralCode(ref);
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Register the user
      const newUser = await registerUser(name, email, referralCode);
      
      if (newUser) {
        // Auto-login the user
        await login(email, password);
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4">
        <div className="w-full max-w-md">
          <div className="absolute inset-0 -z-10 animate-pulse -top-40 opacity-10">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-mlm-primary rounded-full mix-blend-lighten filter blur-xl opacity-70"></div>
            <div className="absolute -bottom-8 right-20 w-72 h-72 bg-mlm-accent rounded-full mix-blend-lighten filter blur-xl opacity-70"></div>
          </div>

          <Card className="w-full backdrop-blur-md bg-background/95 animate-slideUp">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
              <CardDescription className="text-center">
                Register to start trading and earning commissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="referralCode">Referral Code</Label>
                      {referralCode && (
                        <Badge variant="outline" className="ml-2 bg-mlm-primary/10 border-mlm-primary/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Code Applied
                        </Badge>
                      )}
                    </div>
                    <Input
                      id="referralCode"
                      placeholder="Optional"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter a referral code if you were invited by someone
                    </p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-mlm-primary hover:bg-mlm-accent"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account & Purchase Bot'}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-xs text-center text-muted-foreground">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="underline underline-offset-4 hover:text-mlm-primary">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="underline underline-offset-4 hover:text-mlm-primary">
                  Privacy Policy
                </Link>
              </div>
              <div className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-mlm-primary hover:text-mlm-accent underline underline-offset-4">
                  Login
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
