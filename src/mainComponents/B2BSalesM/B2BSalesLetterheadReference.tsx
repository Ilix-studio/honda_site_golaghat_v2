import { useState } from "react";
import toast from "react-hot-toast";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface B2BSalesLetterheadReferenceProps {
  text: string;
}

const B2BSalesLetterheadReference = ({ text }: B2BSalesLetterheadReferenceProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Letterhead copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className='flex items-start justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2'>
      <p className='text-xs whitespace-pre-line text-muted-foreground leading-relaxed'>
        {text}
      </p>
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={handleCopy}
        className='shrink-0'
      >
        {copied ? (
          <>
            <Check className='h-3.5 w-3.5 mr-1.5' />
            Copied
          </>
        ) : (
          <>
            <Copy className='h-3.5 w-3.5 mr-1.5' />
            Copy
          </>
        )}
      </Button>
    </div>
  );
};

export default B2BSalesLetterheadReference;
