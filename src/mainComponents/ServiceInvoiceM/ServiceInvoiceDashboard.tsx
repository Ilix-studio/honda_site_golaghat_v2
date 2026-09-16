import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, FileText, PackageSearch } from "lucide-react";
import { useAppSelector } from "@/hooks/redux";
import { selectAuth } from "@/redux-store/slices/authSlice";
import type { UserBranch } from "@/redux-store/slices/authSlice";
import ServiceInvoiceKpiCharts from "./ServiceInvoiceKpiCharts";
import ServiceInvoiceRecords from "./ServiceInvoiceRecords";
import EffectiveStockPanel from "./EffectiveStockPanel";

interface Props {
  /** Where the "Upload invoice" button points for this role. */
  uploadPath?: string;
}

/**
 * `branch` is typed as a populated object, but some endpoints return it as a
 * bare id string — accept either without falling back to `any`.
 */
function branchIdOf(branch: UserBranch | string | undefined): string | undefined {
  if (!branch) return undefined;
  return typeof branch === "string" ? branch : branch._id;
}

/**
 * Shared service-invoice dashboard, mounted under each role's own prefix.
 *
 * Branch scoping is handled server-side: branch-scoped roles are forced to
 * their own branch and the `branchId` sent from here is ignored, so passing
 * the logged-in user's branch only matters for Super-Admin, whose effective
 * stock view needs a specific branch to be meaningful.
 */
export default function ServiceInvoiceDashboard({ uploadPath }: Props) {
  const { user } = useAppSelector(selectAuth);
  const branchId = branchIdOf(user?.branch);
  const canDelete = user?.role === "Super-Admin" || user?.role === "Part-Admin";

  return (
    <div className='container mx-auto space-y-4 p-4'>
      <div>
        <h1 className='text-2xl font-bold'>Service Invoices</h1>
        <p className='text-sm text-muted-foreground'>
          Parts sold and accessories fitted, read from Honda DMS service invoice
          PDFs.
        </p>
      </div>

      <Tabs defaultValue='overview'>
        <TabsList>
          <TabsTrigger value='overview'>
            <BarChart3 className='mr-2 h-4 w-4' />
            Overview
          </TabsTrigger>
          <TabsTrigger value='invoices'>
            <FileText className='mr-2 h-4 w-4' />
            Invoices
          </TabsTrigger>
          <TabsTrigger value='stock'>
            <PackageSearch className='mr-2 h-4 w-4' />
            Effective stock
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='mt-4'>
          <ServiceInvoiceKpiCharts branchId={branchId} />
        </TabsContent>

        <TabsContent value='invoices' className='mt-4'>
          <ServiceInvoiceRecords
            branchId={branchId}
            uploadPath={uploadPath}
            canDelete={canDelete}
          />
        </TabsContent>

        <TabsContent value='stock' className='mt-4'>
          <EffectiveStockPanel branchId={branchId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
