
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useMLM } from '@/contexts/MLMContext';
import ReferralTree from '@/components/mlm/ReferralTree';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, DollarSign, ShieldCheck, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { User, Commission } from '@/lib/types';
import { MLM_LEVELS } from '@/lib/mlm-config';
import { format } from 'date-fns';

const Admin = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const { referralTree, users, transactions, commissions } = useMLM();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  if (!isAuthenticated || !isAdmin || !user) {
    return null;
  }

  // Filter users based on search query
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.referralCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get commissions for a specific user
  const getUserCommissions = (userId: string): Commission[] => {
    return commissions.filter(c => c.userId === userId);
  };

  // Calculate totals for statistics
  const totalUsers = users.length;
  const totalPurchases = transactions.filter(t => t.type === 'purchase').length;
  const totalCommissions = transactions.filter(t => t.type === 'commission')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold animate-slideUp">Admin Dashboard</h1>
            <p className="text-muted-foreground animate-slideUp">
              Manage users and track MLM performance
            </p>
          </div>
          <Badge className="mt-2 md:mt-0 bg-mlm-primary" variant="default">
            <ShieldCheck className="h-4 w-4 mr-1" />
            Admin Access
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="backdrop-blur-md animate-fadeIn">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-muted-foreground text-sm">Total Users</p>
                <p className="text-3xl font-bold">{totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-mlm-primary/10 rounded-full flex items-center justify-center text-mlm-primary">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-md animate-fadeIn">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-muted-foreground text-sm">Total Purchases</p>
                <p className="text-3xl font-bold">{totalPurchases}</p>
              </div>
              <div className="w-12 h-12 bg-mlm-primary/10 rounded-full flex items-center justify-center text-mlm-primary">
                <UserPlus className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-md animate-fadeIn">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-muted-foreground text-sm">Total Commissions</p>
                <p className="text-3xl font-bold">${totalCommissions.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-mlm-primary/10 rounded-full flex items-center justify-center text-mlm-primary">
                <DollarSign className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 h-auto p-1">
            <TabsTrigger value="users" className="py-2">Users</TabsTrigger>
            <TabsTrigger value="network" className="py-2">Network Structure</TabsTrigger>
            <TabsTrigger value="commissions" className="py-2">Commissions</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="backdrop-blur-md animate-fadeIn">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage all users in the system
                </CardDescription>
                <div className="mt-4 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name, email or referral code"
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Referral Code</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id} className="animate-fadeIn">
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <code className="px-2 py-1 bg-mlm-primary/10 rounded text-xs">
                                {user.referralCode}
                              </code>
                            </TableCell>
                            <TableCell>{user.level}</TableCell>
                            <TableCell>{format(user.registeredAt, 'MMM d, yyyy')}</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                            No users found matching your search criteria
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {selectedUser && (
                  <div className="mt-8 p-6 border rounded-lg animate-slideUp">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{selectedUser.name}</h3>
                        <p className="text-muted-foreground">{selectedUser.email}</p>
                      </div>
                      <Button variant="ghost" onClick={() => setSelectedUser(null)}>
                        Close
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold mb-3">User Details</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Referral Code:</span>
                            <code className="px-2 py-1 bg-mlm-primary/10 rounded text-xs">
                              {selectedUser.referralCode}
                            </code>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Level:</span>
                            <span>{selectedUser.level}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Registered:</span>
                            <span>{format(selectedUser.registeredAt, 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Referred By:</span>
                            <span>
                              {selectedUser.referredBy 
                                ? users.find(u => u.id === selectedUser.referredBy)?.name || 'Unknown' 
                                : 'None'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-semibold mb-3">Commission Summary</h4>
                        <div className="space-y-3">
                          {getUserCommissions(selectedUser.id).length > 0 ? (
                            <>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Commissions:</span>
                                <span className="font-medium">
                                  ${getUserCommissions(selectedUser.id)
                                    .reduce((sum, c) => sum + c.amount, 0)
                                    .toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Pending:</span>
                                <span>
                                  ${getUserCommissions(selectedUser.id)
                                    .filter(c => c.status === 'pending')
                                    .reduce((sum, c) => sum + c.amount, 0)
                                    .toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Paid:</span>
                                <span>
                                  ${getUserCommissions(selectedUser.id)
                                    .filter(c => c.status === 'paid')
                                    .reduce((sum, c) => sum + c.amount, 0)
                                    .toFixed(2)}
                                </span>
                              </div>
                            </>
                          ) : (
                            <p className="text-muted-foreground">No commissions earned yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network">
            <Card className="backdrop-blur-md animate-fadeIn">
              <CardHeader>
                <CardTitle>Complete Referral Network</CardTitle>
                <CardDescription>
                  Full tree structure of all users in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReferralTree 
                  data={referralTree}
                  onUserClick={handleUserClick}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions">
            <Card className="backdrop-blur-md animate-fadeIn">
              <CardHeader>
                <CardTitle>Commission Structure & Payouts</CardTitle>
                <CardDescription>
                  Overview of the MLM commission structure and payout statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Commission Levels</h3>
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-mlm-primary/10">
                          <TableRow>
                            <TableHead>Level</TableHead>
                            <TableHead className="text-right">Commission ($)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {MLM_LEVELS.map((level) => (
                            <TableRow key={level.level}>
                              <TableCell>Level {level.level}</TableCell>
                              <TableCell className="text-right">${level.commission}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Recent Commissions</h3>
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {commissions.slice(0, 5).map((commission) => {
                            const recipient = users.find(u => u.id === commission.userId);
                            return (
                              <TableRow key={commission.id}>
                                <TableCell>{recipient?.name || 'Unknown'}</TableCell>
                                <TableCell>${commission.amount}</TableCell>
                                <TableCell>Level {commission.level}</TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={commission.status === 'paid' ? 'default' : 'outline'}
                                    className={commission.status === 'paid' ? 'bg-green-600' : ''}
                                  >
                                    {commission.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Commission Actions</h3>
                  <div className="p-6 border rounded-lg bg-card">
                    <p className="text-muted-foreground mb-4">
                      This panel would allow administrators to process pending commissions, 
                      configure payout settings, and generate reports.
                    </p>
                    <div className="flex gap-4">
                      <Button className="bg-mlm-primary hover:bg-mlm-accent">
                        Process Pending Commissions
                      </Button>
                      <Button variant="outline">
                        Export Commission Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Admin;
