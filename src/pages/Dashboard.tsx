
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Users, 
  Clock, 
  TrendingUp, 
  Copy, 
  Share2,
  ChevronRight,
  LineChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatsCard from '@/components/mlm/StatsCard';
import TransactionList from '@/components/mlm/TransactionList';
import ReferralCodeCard from '@/components/mlm/ReferralCodeCard';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useMLM } from '@/contexts/MLMContext';
import CommissionLevelsTable from '@/components/mlm/CommissionLevelsTable';

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const { userStats, copyReferralLink } = useMLM();
  const navigate = useNavigate();

  // External Trading Bot URL - replace with your actual Bolt.new app URL
  const tradingBotUrl = "https://your-bolt-app-url.com";

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user || !userStats) {
    return null;
  }

  // Helper function to open external link
  const openExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold animate-slideUp">MLM Dashboard</h1>
            <p className="text-muted-foreground animate-slideUp">
              Welcome back, {user.name}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <Button 
              onClick={() => navigate('/referrals')}
              className="bg-mlm-primary hover:bg-mlm-accent animate-slideUp"
            >
              View My Referral Network
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              onClick={() => openExternalLink(tradingBotUrl)}
              className="bg-mlm-accent hover:bg-mlm-primary animate-slideUp"
            >
              <LineChart className="mr-2 h-4 w-4" />
              Open Trading Bot
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Earnings"
            value={`$${userStats.totalEarnings.toFixed(2)}`}
            icon={<DollarSign className="h-5 w-5" />}
            trend={userStats.totalEarnings > 0 ? "up" : "neutral"}
            trendValue="From Commissions"
          />
          <StatsCard
            title="Direct Referrals"
            value={userStats.directReferrals}
            icon={<Users className="h-5 w-5" />}
            description="First-level referrals"
          />
          <StatsCard
            title="Indirect Referrals"
            value={userStats.indirectReferrals}
            icon={<Share2 className="h-5 w-5" />}
            description="From your network"
          />
          <StatsCard
            title="Pending Commissions"
            value={`$${userStats.pendingCommissions.toFixed(2)}`}
            icon={<Clock className="h-5 w-5" />}
            description="Will be processed soon"
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 h-auto p-1">
            <TabsTrigger value="overview" className="py-2">Overview</TabsTrigger>
            <TabsTrigger value="transactions" className="py-2">Transactions</TabsTrigger>
            <TabsTrigger value="referral" className="py-2">Referral Program</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="backdrop-blur-md animate-fadeIn">
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>
                      Your most recent earnings and purchases
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TransactionList transactions={userStats.lastTransactions} />
                    {userStats.lastTransactions.length > 0 && (
                      <div className="mt-4 text-right">
                        <Button 
                          variant="link" 
                          onClick={() => {
                            const tabElement = document.querySelector('[data-value="transactions"]');
                            if (tabElement) {
                              (tabElement as HTMLElement).click();
                            }
                          }}
                          className="text-mlm-primary hover:text-mlm-accent"
                        >
                          View all transactions
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-md animate-fadeIn">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Trading Bot Access</CardTitle>
                      <CardDescription>
                        Start trading with your premium trading bot
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center space-y-4 py-6">
                      <LineChart className="h-16 w-16 text-mlm-primary mb-2" />
                      <p className="text-center max-w-md">
                        Your Trading Bot is ready to use. Access all trading features, signals, and automated trading in your dedicated Trading Bot platform.
                      </p>
                      <Button 
                        onClick={() => openExternalLink(tradingBotUrl)}
                        size="lg"
                        className="mt-4 bg-mlm-accent hover:bg-mlm-primary"
                      >
                        <LineChart className="mr-2 h-5 w-5" />
                        Launch Trading Bot
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <ReferralCodeCard />
                
                <Card className="backdrop-blur-md animate-fadeIn">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigate('/referrals')}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      View My Referral Network
                    </Button>
                    <Button 
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => copyReferralLink(user.referralCode)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Referral Link
                    </Button>
                    <Button 
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => {
                        const tabElement = document.querySelector('[data-value="transactions"]');
                        if (tabElement) {
                          (tabElement as HTMLElement).click();
                        }
                      }}
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      View All Transactions
                    </Button>
                    <Button 
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => openExternalLink(tradingBotUrl)}
                    >
                      <LineChart className="mr-2 h-4 w-4" />
                      Open Trading Bot
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="backdrop-blur-md animate-fadeIn">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  All your earnings and purchases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionList transactions={userStats.lastTransactions} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referral">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="backdrop-blur-md animate-fadeIn">
                  <CardHeader>
                    <CardTitle>Commission Structure</CardTitle>
                    <CardDescription>
                      How earnings are distributed in our MLM program
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CommissionLevelsTable />
                  </CardContent>
                </Card>
              </div>
              <div>
                <ReferralCodeCard />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
