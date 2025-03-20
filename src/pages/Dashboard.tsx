
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Users, 
  Clock, 
  TrendingUp, 
  Copy, 
  Share2,
  ChevronRight
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user || !userStats) {
    return null;
  }

  // Helper function to safely handle tab clicks
  const handleTabClick = (tabValue: string) => {
    const tabElement = document.querySelector(`[data-value="${tabValue}"]`) as HTMLElement | null;
    if (tabElement) {
      tabElement.click();
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold animate-slideUp">Dashboard</h1>
            <p className="text-muted-foreground animate-slideUp">
              Welcome back, {user.name}
            </p>
          </div>
          <Button 
            onClick={() => navigate('/referrals')}
            className="mt-4 md:mt-0 bg-mlm-primary hover:bg-mlm-accent animate-slideUp"
          >
            View My Referral Network
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
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
                          onClick={() => handleTabClick("transactions")}
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
                  <CardHeader>
                    <CardTitle>Performance Overview</CardTitle>
                    <CardDescription>
                      Your referral network growth and earnings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <div className="text-center py-6 text-muted-foreground">
                      <TrendingUp className="mx-auto h-16 w-16 mb-4 text-mlm-primary opacity-60" />
                      <p>Performance metrics and charts will appear here as your network grows.</p>
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
                      onClick={() => handleTabClick("transactions")}
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      View All Transactions
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
