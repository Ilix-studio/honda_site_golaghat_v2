import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetAllApplicationsQuery } from "@/redux-store/services/customer/getApprovedApi";
import {
  GetApplicationsFilters,
  GetApprovedApplication,
} from "@/types/getApproved.types";
import { RefreshCw, Search } from "lucide-react";
import { useState } from "react";
import { STATUS_COLORS } from "./WithBikesTab";
import { Badge } from "@/components/ui/badge";

const PAGE_SIZE = 10;

/**
 * What the "Credit Score" column actually means. The applicant picks one of
 * these four bands on the public finance form — it is self-reported, not a
 * bureau score we pulled, so the column shows a band and never a number.
 *
 * The bands must stay in step with the options offered on the two customer
 * forms (`GetApproved/GetApprovedForm.tsx` and `NavMenu/Finance.tsx`), which
 * are the source of truth for the ranges.
 */
export const CREDIT_SCORE_BANDS: {
  value: GetApprovedApplication["creditScoreRange"];
  label: string;
  range: string;
}[] = [
  { value: "excellent", label: "Excellent", range: "750+" },
  { value: "good", label: "Good", range: "700–749" },
  { value: "fair", label: "Fair", range: "650–699" },
  { value: "poor", label: "Poor", range: "below 650" },
];
export const AllApplicationsTab = () => {
  const [filters, setFilters] = useState<GetApplicationsFilters>({
    page: 1,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching, refetch } =
    useGetAllApplicationsQuery(filters);

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleStatusFilter = (val: string) => {
    setFilters((prev) => ({
      ...prev,
      status: val === "all" ? undefined : val,
      page: 1,
    }));
  };

  const handlePage = (dir: 1 | -1) => {
    setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + dir }));
  };

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='flex gap-2 flex-1'>
          <Input
            placeholder='Search by name, email, ID...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className='max-w-sm'
          />
          <Button variant='outline' size='icon' onClick={handleSearch}>
            <Search className='h-4 w-4' />
          </Button>
        </div>
        <Select onValueChange={handleStatusFilter} defaultValue='all'>
          <SelectTrigger className='w-44'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Statuses</SelectItem>
            <SelectItem value='pending'>Pending</SelectItem>
            <SelectItem value='under-review'>Under Review</SelectItem>
            <SelectItem value='pre-approved'>Pre-Approved</SelectItem>
            <SelectItem value='approved'>Approved</SelectItem>
            <SelectItem value='rejected'>Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button variant='outline' size='icon' onClick={refetch}>
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {/* Legend — the Credit Score column shows a band label with no number
          attached, so without this the reader cannot tell whether "Fair" is
          good or bad, or that the applicant chose it themselves. */}
      <div className='rounded-md border bg-muted/30 px-3 py-2.5'>
        <div className='flex flex-wrap items-center gap-x-4 gap-y-1.5'>
          <span className='text-xs font-medium text-gray-900'>
            Credit Score
          </span>
          {CREDIT_SCORE_BANDS.map((band) => (
            <span
              key={band.value}
              className='text-xs text-muted-foreground'
            >
              <span className='font-medium text-gray-900'>{band.label}</span>{" "}
              {band.range}
            </span>
          ))}
        </div>
        <p className='mt-1.5 text-xs text-muted-foreground'>
          Self-reported by the applicant on the finance form — not a verified
          bureau score.
        </p>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Employment</TableHead>
              <TableHead>Credit Score</TableHead>
              <TableHead>Monthly Income</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className='text-center py-8 text-muted-foreground'
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : !data?.data?.length ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className='text-center py-8 text-muted-foreground'
                >
                  No applications found.
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((app: GetApprovedApplication) => (
                <TableRow key={app._id}>
                  <TableCell className='font-mono text-sm'>
                    {app.applicationId}
                  </TableCell>
                  <TableCell>{`${app.firstName} ${app.lastName}`}</TableCell>
                  <TableCell className='text-sm text-muted-foreground'>
                    {app.email}
                  </TableCell>
                  <TableCell className='capitalize'>
                    {app.employmentType}
                  </TableCell>
                  <TableCell className='capitalize'>
                    {app.creditScoreRange}
                  </TableCell>
                  <TableCell>
                    ₹{app.monthlyIncome.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[app.status] ?? ""}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-sm text-muted-foreground'>
                    {new Date(app.createdAt).toLocaleDateString("en-IN")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.totalPages > 1 && (
        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <span>
            Page {data.currentPage} of {data.totalPages} — {data.total} total
          </span>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={data.currentPage <= 1}
              onClick={() => handlePage(-1)}
            >
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={data.currentPage >= data.totalPages}
              onClick={() => handlePage(1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
