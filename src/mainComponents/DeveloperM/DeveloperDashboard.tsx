import { useState } from "react";
import { LifeBuoy, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricTile } from "@/mainComponents/Admin/AdminDash/StatCard";
import {
  useDeleteMaintenanceServiceMutation,
  useGetMaintenanceServicesQuery,
  useUpdateMaintenanceServiceMutation,
  type MaintenanceRecord,
  type MaintenanceStatus,
} from "@/redux-store/services/maintenanceApi";
import MaintenanceList from "./MaintenanceList";
import { getApiErrorMessage } from "@/lib/apiError";

type Filter = MaintenanceStatus | "all";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
];

/** What a request can move to from where it is now. */
const NEXT_STATUS: Record<
  MaintenanceStatus,
  { to: MaintenanceStatus; label: string }[]
> = {
  open: [
    { to: "in_progress", label: "Start" },
    { to: "resolved", label: "Resolve" },
  ],
  in_progress: [{ to: "resolved", label: "Resolve" }],
  resolved: [{ to: "open", label: "Reopen" }],
};

export default function DeveloperDashboard() {
  const [filter, setFilter] = useState<Filter>("open");

  const { data, isLoading, isFetching } = useGetMaintenanceServicesQuery(
    filter === "all" ? { limit: 100 } : { status: filter, limit: 100 },
  );
  const [updateRequest, { isLoading: isUpdating }] =
    useUpdateMaintenanceServiceMutation();
  const [deleteRequest, { isLoading: isDeleting }] =
    useDeleteMaintenanceServiceMutation();

  const counts = data?.counts ?? { open: 0, in_progress: 0, resolved: 0 };
  const total = counts.open + counts.in_progress + counts.resolved;

  const handleStatusChange = async (
    record: MaintenanceRecord,
    status: MaintenanceStatus,
  ) => {
    try {
      await updateRequest({ id: record._id, status }).unwrap();
      toast.success(`Marked "${record.title}" as ${status.replace("_", " ")}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update request"));
    }
  };

  const handleDelete = async (record: MaintenanceRecord) => {
    try {
      await deleteRequest(record._id).unwrap();
      toast.success(`Deleted "${record.title}"`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete request"));
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-violet-600 text-white'>
            <LifeBuoy className='h-5 w-5' />
          </div>
          <div>
            <h1 className='text-xl font-bold text-gray-900'>
              Maintenance Service Requests
            </h1>
            <p className='text-sm text-gray-500'>
              Raised by Branch, Service and Parts admins across every branch
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-4 gap-4'>
          <MetricTile
            index={0}
            label='Total'
            value={total.toLocaleString("en-IN")}
            bg='bg-gray-100'
            text='text-gray-900'
            sub='text-gray-500'
          />
          <MetricTile
            index={1}
            label='Open'
            value={counts.open.toLocaleString("en-IN")}
            bg='bg-amber-50'
            text='text-amber-700'
            sub='text-amber-500'
          />
          <MetricTile
            index={2}
            label='In Progress'
            value={counts.in_progress.toLocaleString("en-IN")}
            bg='bg-blue-50'
            text='text-blue-700'
            sub='text-blue-500'
          />
          <MetricTile
            index={3}
            label='Resolved'
            value={counts.resolved.toLocaleString("en-IN")}
            bg='bg-emerald-50'
            text='text-emerald-700'
            sub='text-emerald-500'
          />
        </div>

        <Card>
          <CardHeader className='space-y-3'>
            <div className='flex items-center justify-between gap-3 flex-wrap'>
              <div>
                <CardTitle className='text-base'>Request queue</CardTitle>
                <CardDescription>
                  Newest first. Status changes are visible to the reporter.
                </CardDescription>
              </div>
              {isFetching && !isLoading && (
                <Loader2 className='h-4 w-4 animate-spin text-gray-400' />
              )}
            </div>

            <div className='flex flex-wrap gap-1.5'>
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    filter === f.value
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                  {f.value !== "all" && (
                    <span className='ml-1.5 opacity-70'>
                      {counts[f.value as MaintenanceStatus]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            <MaintenanceList
              records={data?.data ?? []}
              isLoading={isLoading}
              emptyMessage={
                filter === "all"
                  ? "No maintenance requests yet."
                  : `No ${FILTERS.find((f) => f.value === filter)?.label.toLowerCase()} requests.`
              }
              renderActions={(record) => (
                <div className='flex flex-wrap gap-1.5'>
                  {NEXT_STATUS[record.status].map((action) => (
                    <Button
                      key={action.to}
                      size='sm'
                      variant='outline'
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(record, action.to)}
                    >
                      {action.label}
                    </Button>
                  ))}
                  {/* Deletion is locked server-side once work has started, so
                      the control is only offered while the request is open. */}
                  {record.status === "open" && (
                    <Button
                      size='sm'
                      variant='outline'
                      disabled={isDeleting}
                      onClick={() => handleDelete(record)}
                      className='text-red-600 border-red-200 hover:bg-red-50'
                    >
                      <Trash2 className='h-3.5 w-3.5' />
                    </Button>
                  )}
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
