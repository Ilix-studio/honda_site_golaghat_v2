import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

interface TotalsSummaryProps {
  totalPrice: number;
  tcsAmount: number | "";
  payablePrice: number;
  onTcsAmountChange: (value: number | "") => void;
  onPayablePriceChange: (value: number) => void;
}

const TotalsSummary = ({
  totalPrice,
  tcsAmount,
  payablePrice,
  onTcsAmountChange,
  onPayablePriceChange,
}: TotalsSummaryProps) => {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 border rounded-lg p-4 bg-muted/30'>
      <div className='space-y-1.5'>
        <Label>Total Price</Label>
        <p className='h-9 flex items-center px-3 rounded-md border bg-white font-semibold'>
          {inr(totalPrice)}
        </p>
      </div>

      <div className='space-y-1.5'>
        <Label htmlFor='b2b-tcs-amount'>TCS (optional)</Label>
        <Input
          id='b2b-tcs-amount'
          type='number'
          min={0}
          value={tcsAmount}
          onChange={(e) => {
            const raw = e.target.value;
            onTcsAmountChange(raw === "" ? "" : Math.max(0, Number(raw) || 0));
          }}
          placeholder='0'
        />
      </div>

      <div className='space-y-1.5'>
        <Label htmlFor='b2b-payable-price'>Final Price</Label>
        <Input
          id='b2b-payable-price'
          type='number'
          min={0}
          value={payablePrice}
          onChange={(e) =>
            onPayablePriceChange(Math.max(0, Number(e.target.value) || 0))
          }
          className='font-semibold'
        />
      </div>
    </div>
  );
};

export default TotalsSummary;
