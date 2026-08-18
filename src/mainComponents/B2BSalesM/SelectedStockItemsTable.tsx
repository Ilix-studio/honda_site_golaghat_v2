import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface SelectedStockItem {
  stockConceptCSVId: string;
  modelName: string;
  engineNumber: string;
  chassisNumber: string;
  costPrice: number;
  quantity: number;
}

interface SelectedStockItemsTableProps {
  items: SelectedStockItem[];
  onRemove: (stockConceptCSVId: string) => void;
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const SelectedStockItemsTable = ({
  items,
  onRemove,
}: SelectedStockItemsTableProps) => {
  if (items.length === 0) {
    return (
      <p className='text-sm text-muted-foreground border rounded-lg p-4 text-center'>
        No stock items selected yet — search above to add some.
      </p>
    );
  }

  return (
    <div className='border rounded-lg overflow-hidden'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Model</TableHead>
            <TableHead>Engine / Chassis</TableHead>
            <TableHead className='text-right'>Cost Price</TableHead>
            <TableHead className='w-24'>Quantity</TableHead>
            <TableHead className='text-right'>Line Total</TableHead>
            <TableHead className='w-10' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.stockConceptCSVId}>
              <TableCell className='font-medium'>{item.modelName}</TableCell>
              <TableCell className='text-xs text-muted-foreground'>
                {item.engineNumber} / {item.chassisNumber}
              </TableCell>
              <TableCell className='text-right'>{inr(item.costPrice)}</TableCell>
              <TableCell>
                <Input
                  type='number'
                  value={item.quantity}
                  disabled
                  title='Fixed at 1 — engine/chassis number is unique per vehicle'
                  className='h-8 w-20 disabled:opacity-100'
                />
              </TableCell>
              <TableCell className='text-right font-semibold'>
                {inr(item.costPrice * item.quantity)}
              </TableCell>
              <TableCell>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7'
                  onClick={() => onRemove(item.stockConceptCSVId)}
                  aria-label={`Remove ${item.modelName}`}
                >
                  <X className='h-4 w-4 text-red-600' />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SelectedStockItemsTable;
