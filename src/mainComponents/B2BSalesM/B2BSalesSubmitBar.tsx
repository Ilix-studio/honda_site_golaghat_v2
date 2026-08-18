import { Download, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface B2BSalesSubmitBarProps {
  mode: "create" | "edit";
  isSubmitting: boolean;
  onSubmit: () => void;
  onDownloadPdf?: () => void;
  isDownloading?: boolean;
}

const B2BSalesSubmitBar = ({
  mode,
  isSubmitting,
  onSubmit,
  onDownloadPdf,
  isDownloading,
}: B2BSalesSubmitBarProps) => {
  return (
    <div className='flex flex-wrap items-center gap-3 pt-2'>
      <Button type='button' onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
            {mode === "create" ? "Creating..." : "Updating..."}
          </>
        ) : (
          <>
            <Save className='h-4 w-4 mr-2' />
            {mode === "create" ? "Create Challan" : "Update Challan"}
          </>
        )}
      </Button>

      {onDownloadPdf && (
        <Button type='button' variant='outline' onClick={onDownloadPdf} disabled={isDownloading}>
          {isDownloading ? (
            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
          ) : (
            <Download className='h-4 w-4 mr-2' />
          )}
          Download PDF
        </Button>
      )}
    </div>
  );
};

export default B2BSalesSubmitBar;
