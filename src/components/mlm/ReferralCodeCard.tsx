
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMLM } from '@/contexts/MLMContext';
import { Copy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function ReferralCodeCard() {
  const { user } = useAuth();
  const { copyReferralLink } = useMLM();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const handleCopyClick = () => {
    copyReferralLink(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referralLink = `${window.location.origin}/register?ref=${user.referralCode}`;

  return (
    <Card className="backdrop-blur-md overflow-hidden">
      <CardHeader className="bg-mlm-primary/10 pb-4">
        <CardTitle>Your Referral Code</CardTitle>
        <CardDescription>Share this code to earn commissions</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between p-3 bg-card border rounded-md">
          <code className="text-lg font-mono font-semibold">
            {user.referralCode}
          </code>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCopyClick}
            className="ml-2 hover:bg-mlm-primary/10"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-4 mb-2 text-sm text-muted-foreground">
          Your referral link:
        </div>
        <div className="flex items-center justify-between p-3 bg-card border rounded-md text-sm">
          <div className="truncate max-w-[220px] md:max-w-[380px]">
            {referralLink}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCopyClick}
            className="ml-2 hover:bg-mlm-primary/10 flex-shrink-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      <CardFooter className="bg-mlm-primary/5 border-t flex flex-col items-stretch pt-4">
        <Button 
          onClick={handleCopyClick} 
          className="w-full bg-mlm-primary hover:bg-mlm-accent"
        >
          {copied ? 'Copied!' : 'Copy Referral Link'}
        </Button>
      </CardFooter>
    </Card>
  );
}
