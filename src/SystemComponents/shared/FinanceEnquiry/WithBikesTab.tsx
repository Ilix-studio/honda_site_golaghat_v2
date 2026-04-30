import { Badge } from "@/components/ui/badge";
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
import { useGetApplicationsWithBikesQuery } from "@/redux-store/services/customer/getApprovedApi";
import {
  GetApplicationsWithBikesFilters,
  GetApprovedApplicationWithBikes,
} from "@/types/getApproved.types";
import { Bike, RefreshCw, Search } from "lucide-react";
import { useState } from "react";

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  "under-review": "bg-blue-100 text-blue-800",
  "pre-approved": "bg-purple-100 text-purple-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const PAGE_SIZE = 10;

export const WithBikesTab = () => {
  const [filters, setFilters] = useState<GetApplicationsWithBikesFilters>({
    page: 1,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching, refetch } =
    useGetApplicationsWithBikesQuery(filters);

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleCategoryFilter = (val: string) => {
    setFilters((prev) => ({
      ...prev,
      category: val === "all" ? undefined : val,
      page: 1,
    }));
  };

  const handleUrgencyFilter = (val: string) => {
    setFilters((prev) => ({
      ...prev,
      urgency: val === "all" ? undefined : val,
      page: 1,
    }));
  };

  const handlePage = (dir: 1 | -1) => {
    setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + dir }));
  };

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row gap-3 flex-wrap'>
        <div className='flex gap-2 flex-1'>
          <Input
            placeholder='Search by name, email, bike model...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className='max-w-sm'
          />
          <Button variant='outline' size='icon' onClick={handleSearch}>
            <Search className='h-4 w-4' />
          </Button>
        </div>
        <Select onValueChange={handleCategoryFilter} defaultValue='all'>
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='Category' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Categories</SelectItem>
            <SelectItem value='sport'>Sport</SelectItem>
            <SelectItem value='adventure'>Adventure</SelectItem>
            <SelectItem value='cruiser'>Cruiser</SelectItem>
            <SelectItem value='touring'>Touring</SelectItem>
            <SelectItem value='naked'>Naked</SelectItem>
            <SelectItem value='electric'>Electric</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={handleUrgencyFilter} defaultValue='all'>
          <SelectTrigger className='w-44'>
            <SelectValue placeholder='Urgency' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Urgencies</SelectItem>
            <SelectItem value='immediate'>Immediate</SelectItem>
            <SelectItem value='within-month'>Within Month</SelectItem>
            <SelectItem value='within-3months'>Within 3 Months</SelectItem>
            <SelectItem value='exploring'>Exploring</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant='outline'
          size='sm'
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              hasTradeIn: prev.hasTradeIn ? undefined : true,
              page: 1,
            }))
          }
          className={filters.hasTradeIn ? "border-red-500 text-red-600" : ""}
        >
          Trade-In {filters.hasTradeIn ? "✓" : ""}
        </Button>
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
              <TableHead>Enquiry Type</TableHead>
              <TableHead>Bike Interest</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Trade-In</TableHead>
              <TableHead>Status</TableHead>
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
                  No bike enquiry applications found.
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((app: GetApprovedApplicationWithBikes) => {
                const bike = app.bikeEnquiry;
                const bikeLabel =
                  typeof bike?.bikeId === "object"
                    ? bike.bikeId?.modelName
                    : bike?.bikeModel ?? "—";

                return (
                  <TableRow key={app._id}>
                    <TableCell className='font-mono text-sm'>
                      {app.applicationId}
                    </TableCell>
                    <TableCell>{`${app.firstName} ${app.lastName}`}</TableCell>
                    <TableCell className='capitalize'>
                      {app.enquiryType?.replace(/-/g, " ") ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1'>
                        <Bike className='h-3 w-3 text-muted-foreground' />
                        <span className='text-sm'>{bikeLabel}</span>
                      </div>
                    </TableCell>
                    <TableCell className='capitalize'>
                      {bike?.category ?? "—"}
                    </TableCell>
                    <TableCell className='capitalize text-sm'>
                      {bike?.urgency?.replace(/-/g, " ") ?? "—"}
                    </TableCell>
                    <TableCell>
                      {bike?.tradeInBike?.hasTradeIn ? (
                        <Badge className='bg-orange-100 text-orange-800'>
                          Yes
                        </Badge>
                      ) : (
                        <span className='text-muted-foreground text-sm'>
                          No
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[app.status] ?? ""}>
                        {app.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
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
