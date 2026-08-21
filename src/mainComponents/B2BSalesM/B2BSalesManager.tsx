import { useState } from "react";
import toast from "react-hot-toast";
import {
  Download,
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAppSelector } from "@/hooks/redux";
import { selectAuth } from "@/redux-store/slices/authSlice";
import {
  useDeleteB2BSaleMutation,
  useGetB2BSalesKPIsQuery,
  useGetB2BSalesQuery,
} from "@/redux-store/services/BikeSystemApi2/b2bSalesApi";
import type { B2BSale } from "@/types/b2bSales/b2bSales.types";
import B2BSalesForm from "./B2BSalesForm";
import B2BSalesKPICards from "./B2BSalesKPICards";
import { generateB2BChallanPdf } from "./b2bChallanPdf";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN");

const branchName = (branchId: B2BSale["branchId"]) =>
  typeof branchId === "string" ? branchId : (branchId.branchName ?? "—");

const B2BSalesManager = () => {
  const { user } = useAppSelector(selectAuth);
  const isBranchAdmin = user?.role === "Branch-Admin";
  const isSuperAdmin = user?.role === "Super-Admin";

  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingSale, setEditingSale] = useState<B2BSale | null>(null);

  const { data, isLoading, refetch } = useGetB2BSalesQuery();
  const { data: kpiData, isLoading: kpiLoading } = useGetB2BSalesKPIsQuery();
  const [deleteB2BSale, { isLoading: isDeleting }] = useDeleteB2BSaleMutation();

  const sales = data?.data ?? [];

  const handleDelete = async (sale: B2BSale) => {
    try {
      await deleteB2BSale(sale._id).unwrap();
      toast.success(`Challan ${sale.challanNo} cancelled — stock released`);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to cancel challan");
    }
  };

  if (view === "create") {
    return (
      <div className='max-w-6xl mx-auto p-4 sm:p-6'>
        <B2BSalesForm
          onDone={() => {
            setView("list");
            refetch();
          }}
        />
      </div>
    );
  }

  if (view === "edit" && editingSale) {
    return (
      <div className='max-w-6xl mx-auto p-4 sm:p-6'>
        <B2BSalesForm
          existingSale={editingSale}
          onDone={() => {
            setView("list");
            setEditingSale(null);
            refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 py-8'>
        <div className='flex items-center justify-between flex-wrap gap-3 mb-2.5'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-gray-900 text-white'>
              <FileText className='h-5 w-5' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>
                B2B Sales (Challans)
              </h1>
              <p className='text-sm text-gray-500'>
                Bulk stock sales to other dealers/parties
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {isBranchAdmin && (
              <Button size='sm' onClick={() => setView("create")}>
                <Plus className='h-4 w-4 mr-1.5' />
                New Challan
              </Button>
            )}
            <Button variant='outline' size='sm' onClick={() => refetch()}>
              <RefreshCw className='h-4 w-4 mr-2' />
              Refresh
            </Button>
          </div>
        </div>

        <B2BSalesKPICards kpis={kpiData?.data} loading={kpiLoading} />

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Challans</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className='text-sm text-muted-foreground'>
                Loading challans...
              </p>
            ) : sales.length === 0 ? (
              <div className='text-center py-12 border rounded-lg'>
                <FileText className='h-12 w-12 mx-auto mb-3 text-muted-foreground' />
                <h3 className='font-semibold mb-1'>No B2B sales yet</h3>
                <p className='text-sm text-muted-foreground'>
                  {isBranchAdmin
                    ? "Create a challan to record a bulk sale."
                    : "Challans created by branches will appear here."}
                </p>
              </div>
            ) : (
              <div className='border rounded-lg overflow-hidden'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Challan No</TableHead>
                      {isSuperAdmin && <TableHead>Branch</TableHead>}
                      <TableHead>To</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className='text-right'>Total Price</TableHead>
                      <TableHead className='text-right'>
                        Payable Price
                      </TableHead>
                      <TableHead className='w-32' />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale) => (
                      <TableRow key={sale._id}>
                        <TableCell className='font-mono font-medium'>
                          {sale.challanNo}
                        </TableCell>
                        {isSuperAdmin && (
                          <TableCell>{branchName(sale.branchId)}</TableCell>
                        )}
                        <TableCell>{sale.to}</TableCell>
                        <TableCell>{formatDate(sale.date)}</TableCell>
                        <TableCell className='text-right'>
                          {inr(sale.totalPrice)}
                        </TableCell>
                        <TableCell className='text-right font-semibold'>
                          {inr(sale.payablePrice)}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center justify-end gap-1'>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-7 w-7'
                              onClick={() => generateB2BChallanPdf(sale)}
                              aria-label={`Download PDF for ${sale.challanNo}`}
                            >
                              <Download className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-7 w-7'
                              onClick={() => {
                                setEditingSale(sale);
                                setView("edit");
                              }}
                              aria-label={`Edit ${sale.challanNo}`}
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-7 w-7 hover:bg-red-50'
                                  aria-label={`Cancel order ${sale.challanNo}`}
                                  title='Cancel order'
                                >
                                  <Trash2 className='h-4 w-4 text-red-600' />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Cancel this order?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This cancels challan{" "}
                                    <span className='font-mono'>
                                      {sale.challanNo}
                                    </span>{" "}
                                    to {sale.to} and releases its stock item(s)
                                    back to Available.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Keep Order
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    disabled={isDeleting}
                                    onClick={() => handleDelete(sale)}
                                    className='bg-red-600 text-white hover:bg-red-700'
                                  >
                                    Cancel Order
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default B2BSalesManager;
