
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useMLM } from '@/contexts/MLMContext';
import ReferralTree from '@/components/mlm/ReferralTree';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ReferralCodeCard from '@/components/mlm/ReferralCodeCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MLM_LEVELS, 
  PRODUCT_PRICE, 
  MLM_COMMISSION_TOTAL 
} from '@/lib/mlm-config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Referrals = () => {
  const { isAuthenticated, user } = useAuth();
  const { referralTree, userStats } = useMLM();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user || !referralTree) {
    return null;
  }

  // Find the current user's node in the tree
  const findUserNode = (tree, userId) => {
    for (const node of tree) {
      if (node.user.id === userId) {
        return [node];
      }
      const found = findUserNode(node.children, userId);
      if (found.length > 0) {
        return found;
      }
    }
    return [];
  };

  const userNode = findUserNode(referralTree, user.id);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 animate-slideUp">My Referral Network</h1>
        <p className="text-muted-foreground mb-8 animate-slideUp">
          Track and manage your referrals across all levels
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-md animate-fadeIn overflow-hidden">
              <CardHeader>
                <CardTitle>My Referral Tree</CardTitle>
                <CardDescription>
                  Visual representation of your downline network
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userNode.length > 0 ? (
                  <ReferralTree data={userNode} />
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    You don't have any referrals yet. Share your referral code to start building your network.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <ReferralCodeCard />

            <Card className="backdrop-blur-md animate-fadeIn">
              <CardHeader>
                <CardTitle>Referral Statistics</CardTitle>
                <CardDescription>
                  Overview of your referral performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Direct Referrals:</span>
                    <span className="font-medium">{userStats?.directReferrals || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Indirect Referrals:</span>
                    <span className="font-medium">{userStats?.indirectReferrals || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Earnings:</span>
                    <span className="font-medium">${userStats?.totalEarnings.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending Commissions:</span>
                    <span className="font-medium">${userStats?.pendingCommissions.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="structure" className="space-y-6 animate-fadeIn">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 h-auto p-1">
            <TabsTrigger value="structure" className="py-2">MLM Structure</TabsTrigger>
            <TabsTrigger value="potential" className="py-2">Earning Potential</TabsTrigger>
          </TabsList>

          <TabsContent value="structure">
            <Card className="backdrop-blur-md">
              <CardHeader>
                <CardTitle>MLM Compensation Structure</CardTitle>
                <CardDescription>
                  How commissions are distributed across 10 levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-mlm-primary/10">
                      <TableRow>
                        <TableHead>Level</TableHead>
                        <TableHead>Commission Per Sale</TableHead>
                        <TableHead>Percentage of Sale</TableHead>
                        <TableHead className="hidden md:table-cell">Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MLM_LEVELS.map((level) => (
                        <TableRow key={level.level} className="hover:bg-mlm-primary/5">
                          <TableCell className="font-medium">Level {level.level}</TableCell>
                          <TableCell>${level.commission.toFixed(2)}</TableCell>
                          <TableCell>
                            {((level.commission / PRODUCT_PRICE) * 100).toFixed(2)}%
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {level.level === 1 
                              ? "Direct referrals you personally invited" 
                              : `People invited by your level ${level.level-1} referrals`}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  When someone purchases our trading bot for ${PRODUCT_PRICE}, a total of ${MLM_COMMISSION_TOTAL} is distributed among 10 levels of referrers.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="potential">
            <Card className="backdrop-blur-md">
              <CardHeader>
                <CardTitle>Earning Potential Calculator</CardTitle>
                <CardDescription>
                  See how much you can earn as your network grows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-mlm-primary/10">
                      <TableRow>
                        <TableHead>Example Scenario</TableHead>
                        <TableHead className="text-right">Number of Sales</TableHead>
                        <TableHead className="text-right">Your Earnings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>5 direct referrals</TableCell>
                        <TableCell className="text-right">5</TableCell>
                        <TableCell className="text-right">${(5 * 10).toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>10 direct referrals</TableCell>
                        <TableCell className="text-right">10</TableCell>
                        <TableCell className="text-right">${(10 * 10).toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Each direct referral gets 5 new referrals</TableCell>
                        <TableCell className="text-right">50</TableCell>
                        <TableCell className="text-right">${(10 * 10 + 50 * 6).toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Complete network - all 10 levels</TableCell>
                        <TableCell className="text-right">Full network</TableCell>
                        <TableCell className="text-right">Unlimited potential</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  This is a simplified view of your earning potential. Actual earnings will depend on the growth and activity of your referral network.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Referrals;
