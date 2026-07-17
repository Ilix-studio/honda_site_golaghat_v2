import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetNewCustomersQuery } from "@/redux-store/services/customer/customerAdminApi";

const SOURCE_LABEL: Record<string, string> = {
  otp: "Self sign-up (OTP)",
  automatic_creation: "Auto (service import)",
  branch_admin_manual: "Branch-Admin",
};

export default function NewCustomerList() {
  const [page, setPage] = useState(1);
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
                      <th className='py-2 pr-4'>Verified</th>
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
                        <td className='py-2 pr-4 text-gray-500'>
                          {SOURCE_LABEL[c.creationSource] ?? c.creationSource}
                        </td>
                        <td className='py-2 pr-4'>
                          <Badge
                            variant='outline'
                            className={
                              c.isVerified
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-gray-50 text-gray-600 border-gray-200"
                            }
                          >
                            {c.isVerified ? "Verified" : "Unverified"}
                          </Badge>
                        </td>
                        <td className='py-2 pr-4'>
                          <Badge
                            variant='outline'
                            className={
                              c.hasVehicle
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-gray-50 text-gray-500 border-gray-200"
                            }
                          >
                            {c.hasVehicle ? "Assigned" : "None"}
                          </Badge>
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
