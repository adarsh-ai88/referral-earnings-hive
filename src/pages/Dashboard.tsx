import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Users, 
  Clock, 
  TrendingUp, 
  Copy, 
  Share2,
  ChevronRight,
  Loader2,
  AlertTriangle,
  RefreshCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import StatsCard from '@/components/mlm/StatsCard';
import TransactionList from '@/components/mlm/TransactionList';
import ReferralCodeCard from '@/components/mlm/ReferralCodeCard';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useMLM } from '@/contexts/MLMContext';
import CommissionLevelsTable from '@/components/mlm/CommissionLevelsTable';
import { useToast } from '@/components/ui/use-toast';

const Dashboard = () => {
  const { isAuthenticated, user, isLoading, refreshUserProfile } = useAuth();
  const { userStats, copyReferralLink } = useMLM();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);
  const [localLoading, setLocalLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    console.log('Dashboard auth state:', { isAuthenticated, user, isLoading, userStats });
    
    if (!isAuthenticated && !isLoading) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Handle retry for profile refresh
  const handleRefreshProfile = async () => {
    setLocalLoading(true);
    try {
      await refreshUserProfile();
      setRetryCount(prev => prev + 1);
      toast({
        title: "Refresh Attempted",
        description: "Trying to reload your profile data",
      });
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  // Show loading state while waiting for user data
  if (isLoading || localLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 min-h-[80vh] flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-mlm-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading your dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  // If user is authenticated but data is still not available
  if (!user || !userStats) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 min-h-[80vh] flex flex-col items-center justify-center">
          <div className="text-center max-w-lg">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">There was an issue loading your dashboard</h2>
            <p className="text-muted-foreground mb-6">
              This could be due to network issues or problems with your account data.
            </p>
            
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error Details</AlertTitle>
              <AlertDescription>
                {retryCount > 0 
                  ? `Unable to load profile data after ${retryCount} attempts. Please try logging out and back in.`
                  : "Could not load user profile data. This may be due to database policies or network issues."}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <Button 
                onClick={handleRefreshProfile}
                className="w-full"
                disabled={localLoading}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Retry Loading Profile
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
                variant="outline"
              >
                Reload Page
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
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
            <h1 className="text-3xl font-bold animate-slideUp bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-400 animate-slideUp">
              Welcome back, {user.name}
            </p>
          </div>
          <Button 
            onClick={() => navigate('/referrals')}
            className="mt-4 md:mt-0 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition-opacity animate-slideUp"
          >
            View My Referral Network
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Earnings"
            value={`$${userStats.totalEarnings.toFixed(2)}`}
            icon={<DollarSign className="h-5 w-5 text-blue-500" />}
            trend={userStats.totalEarnings > 0 ? "up" : "neutral"}
            trendValue="From Commissions"
          />
          <StatsCard
            title="Direct Referrals"
            value={userStats.directReferrals}
            icon={<Users className="h-5 w-5 text-purple-500" />}
            description="First-level referrals"
          />
          <StatsCard
            title="Indirect Referrals"
            value={userStats.indirectReferrals}
            icon={<Share2 className="h-5 w-5 text-blue-500" />}
            description="From your network"
          />
          <StatsCard
            title="Pending Commissions"
            value={`$${userStats.pendingCommissions.toFixed(2)}`}
            icon={<Clock className="h-5 w-5 text-purple-500" />}
            description="Will be processed soon"
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 h-auto p-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-md">
            <TabsTrigger value="overview" className="py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="transactions" className="py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white">Transactions</TabsTrigger>
            <TabsTrigger value="referral" className="py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white">Referral Program</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-black/40 backdrop-blur-xl border border-white/10 animate-fadeIn">
                  <CardHeader>
                    <CardTitle className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Recent Transactions</CardTitle>
                    <CardDescription className="text-gray-400">
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
                          className="text-blue-500 hover:text-purple-500"
                        >
                          View all transactions
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-black/40 backdrop-blur-xl border border-white/10 animate-fadeIn">
                  <CardHeader>
                    <CardTitle className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Performance Overview</CardTitle>
                    <CardDescription className="text-gray-400">
                      Your referral network growth and earnings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <div className="text-center py-6 text-gray-400">
                      <TrendingUp className="mx-auto h-16 w-16 mb-4 text-blue-500 opacity-60" />
                      <p>Performance metrics and charts will appear here as your network grows.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <ReferralCodeCard />
                
                <Card className="bg-black/40 backdrop-blur-xl border border-white/10 animate-fadeIn">
                  <CardHeader>
                    <CardTitle className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      className="w-full justify-start bg-black/60 border border-white/10 hover:border-blue-500/50 transition-colors"
                      variant="outline"
                      onClick={() => navigate('/referrals')}
                    >
                      <Users className="mr-2 h-4 w-4 text-purple-500" />
                      View My Referral Network
                    </Button>
                    <Button 
                      className="w-full justify-start bg-black/60 border border-white/10 hover:border-blue-500/50 transition-colors"
                      variant="outline"
                      onClick={() => copyReferralLink(user.referralCode)}
                    >
                      <Copy className="mr-2 h-4 w-4 text-blue-500" />
                      Copy Referral Link
                    </Button>
                    <Button 
                      className="w-full justify-start bg-black/60 border border-white/10 hover:border-blue-500/50 transition-colors"
                      variant="outline"
                      onClick={() => handleTabClick("transactions")}
                    >
                      <DollarSign className="mr-2 h-4 w-4 text-purple-500" />
                      View All Transactions
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="bg-black/40 backdrop-blur-xl border border-white/10 animate-fadeIn">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Transaction History</CardTitle>
                <CardDescription className="text-gray-400">
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
                <Card className="bg-black/40 backdrop-blur-xl border border-white/10 animate-fadeIn">
                  <CardHeader>
                    <CardTitle className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Commission Structure</CardTitle>
                    <CardDescription className="text-gray-400">
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
