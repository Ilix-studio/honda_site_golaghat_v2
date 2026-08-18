import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface B2BSalesPartyFieldsProps {
  from: string;
  to: string;
  date: string;
  onToChange: (value: string) => void;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const B2BSalesPartyFields = ({
  from,
  to,
  date,
  onToChange,
}: B2BSalesPartyFieldsProps) => {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
      <div className='space-y-1.5'>
        <Label>From</Label>
        <Input value={from} readOnly disabled className='bg-muted' />
      </div>
      <div className='space-y-1.5'>
        <Label htmlFor='b2b-to'>To</Label>
        <Input
          id='b2b-to'
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          placeholder='Recipient / dealer name'
        />
      </div>
      <div className='space-y-1.5'>
        <Label>Date</Label>
        <Input value={formatDate(date)} readOnly disabled className='bg-muted' />
      </div>
    </div>
  );
};

export default B2BSalesPartyFields;
