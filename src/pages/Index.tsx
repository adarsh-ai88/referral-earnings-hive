
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, DollarSign, ShieldCheck, Repeat, Sparkles } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import CommissionLevelsTable from '@/components/mlm/CommissionLevelsTable';
import { PRODUCT_PRICE, MLM_COMMISSION_TOTAL } from '@/lib/mlm-config';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="py-20 px-4 md:py-32">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block px-3 py-1 rounded-full bg-mlm-primary/10 text-mlm-primary text-sm font-medium mb-8 animate-pulse">
              Revolutionary Trading Algorithm + MLM System
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slideUp">
              Earn While You <span className="text-mlm-primary">Trade</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 animate-slideUp">
              Our state-of-the-art trading algorithm helps you maximize profits. Refer others and earn commissions through our 10-level MLM system.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slideUp">
              <Button 
                className="bg-mlm-primary hover:bg-mlm-accent text-white text-lg px-8 py-6 h-auto"
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started'} 
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                className="border-mlm-primary/30 hover:bg-mlm-primary/10 text-foreground"
                onClick={() => navigate('/how-it-works')}
              >
                Learn how it works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-mlm-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Our System Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join our community of successful traders and earn through our 10-level MLM structure
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-mlm-primary/10 text-mlm-primary mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Trading Algorithm</h3>
              <p className="text-muted-foreground">
                Purchase our state-of-the-art trading algorithm for ${PRODUCT_PRICE} and gain access to profitable automated trading strategies.
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-mlm-primary/10 text-mlm-primary mb-4">
                <Repeat className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Refer Others</h3>
              <p className="text-muted-foreground">
                Share your unique referral code with others. When they purchase the trading algorithm using your code, you earn commissions.
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-mlm-primary/10 text-mlm-primary mb-4">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Earn Commissions</h3>
              <p className="text-muted-foreground">
                Earn up to ${MLM_COMMISSION_TOTAL} in commissions for each purchase in your network, spread across 10 levels of referrals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MLM Structure Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 rounded-full bg-mlm-primary/10 text-mlm-primary text-sm font-medium mb-4">
              Transparent Commission Structure
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our MLM Commission Levels</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              For each ${PRODUCT_PRICE} purchase, ${MLM_COMMISSION_TOTAL} is distributed among 10 levels of referrers
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <CommissionLevelsTable />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-mlm-primary/10 to-background">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-mlm-primary/20 text-mlm-primary mb-6">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Earning?</h2>
            <p className="text-xl text-muted-foreground mb-10">
              Join our community today and start earning with our MLM trading algorithm system.
            </p>
            <Button 
              className="bg-mlm-primary hover:bg-mlm-accent text-white text-lg px-8 py-6 h-auto"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Register Now'}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

export default Index;
