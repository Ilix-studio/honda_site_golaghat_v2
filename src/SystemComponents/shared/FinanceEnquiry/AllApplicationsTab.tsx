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
