
import { Transaction } from '@/lib/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface TransactionListProps {
  transactions: Transaction[];
  limit?: number;
}

export default function TransactionList({ transactions, limit }: TransactionListProps) {
  // Sort transactions by date (newest first) and apply limit if specified
  const displayTransactions = [...transactions]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit || transactions.length);

  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No transactions available.
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayTransactions.map((transaction) => (
            <TableRow key={transaction.id} className="animate-fadeIn">
              <TableCell className="font-medium">
                {format(transaction.createdAt, 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <Badge variant={transaction.type === 'purchase' ? 'default' : 'secondary'}>
                  {transaction.type === 'purchase' ? 'Purchase' : 'Commission'}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {transaction.description}
              </TableCell>
              <TableCell className={`text-right font-medium ${
                transaction.type === 'commission' ? 'text-green-600' : ''
              }`}>
                ${transaction.amount.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
