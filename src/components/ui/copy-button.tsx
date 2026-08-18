import { useState } from "react";
import toast from "react-hot-toast";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  label?: string;
  successMessage?: string;
  className?: string;
}

export const CopyButton = ({
  text,
  label = "Copy",
  successMessage = "Copied to clipboard",
  className,
}: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(successMessage);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Button
      type='button'
      variant='outline'
      size='sm'
      onClick={handleCopy}
      className={cn("shrink-0", className)}
    >
      {copied ? (
        <>
          <Check className='h-3.5 w-3.5 mr-1.5' />
          Copied
        </>
      ) : (
        <>
          <Copy className='h-3.5 w-3.5 mr-1.5' />
          {label}
        </>
      )}
    </Button>
  );
};
