import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface B2BSalesHeadingProps {
  topHeading: string;
  onChange: (value: string) => void;
}

const B2BSalesHeading = ({ topHeading, onChange }: B2BSalesHeadingProps) => {
  return (
    <div className='space-y-1.5'>
      <Label htmlFor='b2b-heading'>Top Heading (editable)</Label>
      <Textarea
        id='b2b-heading'
        value={topHeading}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className='text-center font-medium'
      />
    </div>
  );
};

export default B2BSalesHeading;
