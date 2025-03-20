
import { MLM_LEVELS, PRODUCT_PRICE, MLM_COMMISSION_TOTAL } from '@/lib/mlm-config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

export default function CommissionLevelsTable() {
  return (
    <div className="animate-slideUp space-y-4">
      <div className="text-xl font-semibold mb-2">Commission Structure</div>
      <div className="bg-card rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h4 className="text-lg font-medium">Trading Bot Price: <span className="text-mlm-primary">${PRODUCT_PRICE}</span></h4>
            <p className="text-muted-foreground">MLM Commission: <span className="font-medium">${MLM_COMMISSION_TOTAL}</span> ({(MLM_COMMISSION_TOTAL/PRODUCT_PRICE*100).toFixed(0)}% of purchase price)</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="text-sm text-muted-foreground mb-1">Total Commission Distribution</div>
            <Progress value={100} className="h-2 w-48" />
          </div>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden backdrop-blur-md">
        <Table>
          <TableHeader className="bg-mlm-primary/10">
            <TableRow>
              <TableHead>Level</TableHead>
              <TableHead className="text-right">Commission ($)</TableHead>
              <TableHead className="text-right hidden md:table-cell">Percentage of Total</TableHead>
              <TableHead className="hidden md:table-cell">Distribution</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MLM_LEVELS.map((level) => (
              <TableRow key={level.level} className="hover:bg-mlm-primary/5">
                <TableCell className="font-medium">Level {level.level}</TableCell>
                <TableCell className="text-right">${level.commission.toFixed(2)}</TableCell>
                <TableCell className="text-right hidden md:table-cell">
                  {((level.commission / MLM_COMMISSION_TOTAL) * 100).toFixed(0)}%
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Progress 
                    value={(level.commission / MLM_COMMISSION_TOTAL) * 100} 
                    className="h-2" 
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
