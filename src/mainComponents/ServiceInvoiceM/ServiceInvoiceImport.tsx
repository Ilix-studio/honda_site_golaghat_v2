import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ServiceInvoiceUploadForm from "./ServiceInvoiceUploadForm";

interface Props {
  dashboardPath?: string;
}

/** Page shell for the service-invoice uploader. */
export default function ServiceInvoiceImport({
  dashboardPath = "/part-admin/dashboard",
}: Props) {
  return (
    <div className='container mx-auto max-w-4xl space-y-4 p-4'>
      <Button asChild variant='ghost' size='sm' className='-ml-2'>
        <Link to={dashboardPath}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to dashboard
        </Link>
      </Button>

      <div>
        <h1 className='flex items-center gap-2 text-2xl font-bold'>
          <FileText className='h-6 w-6' />
          Import service invoice
        </h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Upload one Honda DMS service invoice PDF. Each billed part is checked
          against this branch's parts stock: parts found in stock are recorded
          as sold, and parts not in stock are recorded as accessories fitted to
          the bike by the technician.
        </p>
      </div>

      <ServiceInvoiceUploadForm dashboardPath={dashboardPath} />
    </div>
  );
}
