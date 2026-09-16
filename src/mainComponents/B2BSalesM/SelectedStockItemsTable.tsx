import { useState } from "react";
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
  /**
   * Edit a line's price. B2B deals are negotiated, so the challan price is
   * often not the stock's book cost — the edit applies to this challan only
   * and never writes back to the stock record.
   */
  onCostPriceChange?: (stockConceptCSVId: string, costPrice: number) => void;
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/**
 * Editable price cell.
 *
 * Keeps its own draft string while focused so the field can be cleared and
 * retyped — binding a number straight to the input makes deleting the last
 * digit snap back to "0" mid-edit. The committed value is pushed up on every
 * valid keystroke (so Line Total and the totals below follow along live), and
 * the draft is reconciled back to the real value on blur.
 */
function CostPriceInput({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <Input
      type='number'
      min={0}
      step='0.01'
      inputMode='decimal'
      aria-label={label}
      value={draft ?? String(value)}
      onChange={(e) => {
        const next = e.target.value;
        setDraft(next);
        const parsed = Number(next);
        // Ignore transient states ("" while clearing, "-", "1e") — the draft
        // still shows them, but nothing invalid reaches the totals.
        if (next !== "" && Number.isFinite(parsed) && parsed >= 0) {
          onChange(parsed);
        }
      }}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={() => {
        // An empty or invalid field falls back to the last good value rather
        // than silently becoming 0.
        setDraft(null);
      }}
      className='h-8 w-32 ml-auto text-right'
    />
  );
}

const SelectedStockItemsTable = ({
  items,
  onRemove,
  onCostPriceChange,
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
              <TableCell className='text-right'>
                {onCostPriceChange ? (
                  <CostPriceInput
                    value={item.costPrice}
                    onChange={(next) =>
                      onCostPriceChange(item.stockConceptCSVId, next)
                    }
                    label={`Cost price for ${item.modelName} ${item.engineNumber}`}
                  />
                ) : (
                  inr(item.costPrice)
                )}
              </TableCell>
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
