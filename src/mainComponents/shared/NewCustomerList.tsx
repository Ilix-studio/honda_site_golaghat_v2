import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Info,
} from "lucide-react";
import { useGetNewCustomersQuery } from "@/redux-store/services/customer/customerAdminApi";
import { useNavigate } from "react-router-dom";

const SOURCE_LABEL: Record<string, string> = {
  otp: "Self sign-up (OTP)",
  automatic_creation: "Auto (service import)",
  branch_admin_manual: "Manual Assigned",
  new_csv_sales_report: "New (CSV Sales Report)",
};

/**
 * Legacy customer documents predate the creationSource field entirely (it
 * was added later), so they simply have no stored value — "Old Csv" is a
 * display-only fallback computed from that absence, not a stored enum value.
 */
const sourceLabelFor = (creationSource: string | undefined) =>
  !creationSource ? "Old Csv" : (SOURCE_LABEL[creationSource] ?? creationSource);

const formatINR = (value?: number | null) =>
  value == null ? "—" : `₹${value.toLocaleString("en-IN")}`;

export default function NewCustomerList() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const limit = 20;
  const { data, isLoading, isFetching } = useGetNewCustomersQuery({
    page,
    limit,
  });

  const customers = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-8'>
      <div className='max-w-5xl mx-auto space-y-4'>
        <div className='flex items-center gap-3'>
          <div className='flex items-start gap-4'>
            <button
              onClick={() => navigate(-1)}
              className='mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50'
              aria-label='Go back'
            >
              <ArrowLeft className='h-4 w-4' />
            </button>
          </div>
          <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-gray-900 text-white'>
            <Users className='h-5 w-5' />
          </div>
          <div>
            <h1 className='text-xl font-bold text-gray-900'>
              New Customer List
            </h1>
            <p className='text-sm text-gray-500'>
              Every customer on record, newest first
            </p>
          </div>
        </div>

        <Card className='border border-gray-200 shadow-sm'>
          <CardHeader>
            <CardTitle className='text-base'>
              {pagination ? `${pagination.total} customers` : "Customers"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex items-center justify-center py-16'>
                <Loader2 className='w-6 h-6 animate-spin text-gray-400' />
              </div>
            ) : customers.length === 0 ? (
              <p className='text-sm text-gray-400 py-8 text-center'>
                No customers yet.
              </p>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead className='text-gray-500 text-left'>
                    <tr>
                      <th className='py-2 pr-4'>Name</th>
                      <th className='py-2 pr-4'>Phone</th>
                      <th className='py-2 pr-4'>Source</th>
                      <th className='py-2 pr-4'>Vehicle</th>
                      <th className='py-2 pr-4'>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c._id} className='border-t border-gray-100'>
                        <td className='py-2 pr-4 font-medium text-gray-800'>
                          {c.name || "—"}
                        </td>
                        <td className='py-2 pr-4 tabular-nums text-gray-700'>
                          {c.phoneNumber}
                        </td>
                        <td className='py-2 pr-4'>
                          <div className='group relative inline-flex'>
                            <Badge
                              variant='outline'
                              className='bg-gray-50 text-gray-600 border-gray-200 cursor-help'
                            >
                              {sourceLabelFor(c.creationSource)}
                              <Info className='ml-1 h-3 w-3' />
                            </Badge>
                            <div className='pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 shadow-lg opacity-0 transition-opacity group-hover:opacity-100'>
                              <div className='font-medium text-gray-900'>
                                Creation source
                              </div>
                              <div className='mt-1 space-y-1'>
                                <div>
                                  Value:{" "}
                                  <span className='font-mono font-semibold'>
                                    {c.creationSource ?? "not stored"}
                                  </span>
                                </div>
                                <div className='text-gray-500'>
                                  Joined:{" "}
                                  {new Date(c.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='py-2 pr-4'>
                          {c.hasVehicle ? (
                            <div className='group relative inline-flex'>
                              <Badge
                                variant='outline'
                                className='bg-blue-50 text-blue-700 border-blue-200 cursor-help'
                              >
                                Assigned
                                <Info className='ml-1 h-3 w-3' />
                              </Badge>
                              <div className='pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-52 -translate-x-1/2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 shadow-lg opacity-0 transition-opacity group-hover:opacity-100'>
                                <div className='font-medium text-gray-900'>
                                  Vehicle pricing
                                </div>
                                <div className='mt-1 space-y-1'>
                                  <div>
                                    {c.vehicleSummary?.priceLabel ?? "Price"}:{" "}
                                    <span className='font-semibold'>
                                      {formatINR(c.vehicleSummary?.priceValue)}
                                    </span>
                                  </div>
                                  <div className='text-gray-500'>
                                    Stock ID: {c.vehicleSummary?.stockId ?? "—"}
                                  </div>
                                  <div className='text-gray-500 pt-1 border-t border-gray-100 mt-1'>
                                    Source: {sourceLabelFor(c.creationSource)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <Badge
                              variant='outline'
                              className='bg-gray-50 text-gray-500 border-gray-200'
                            >
                              None
                            </Badge>
                          )}
                        </td>
                        <td className='py-2 pr-4 text-gray-500'>
                          {new Date(c.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pagination && pagination.pages > 1 && (
              <div className='flex items-center justify-between mt-4 pt-4 border-t border-gray-100'>
                <p className='text-xs text-gray-500'>
                  Page {pagination.page} of {pagination.pages}
                </p>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className='w-4 h-4' />
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={page >= pagination.pages || isFetching}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className='w-4 h-4' />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
