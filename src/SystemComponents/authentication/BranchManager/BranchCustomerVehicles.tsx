// mainComponents/Admin/BranchM/BranchCustomerVehicles.tsx
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  RefreshCw,
  Phone,
  ChevronLeft,
  ChevronRight,
  Bike,
  Calendar,
  Settings,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetCustomerVehiclesQuery } from "@/redux-store/services/BikeSystemApi2/AdminVehicleApi";

const formatDate = (iso: string | undefined) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const TableSkeleton = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: 6 }).map((__, j) => (
          <TableCell key={j}>
            <div className='h-4 bg-gray-100 rounded animate-pulse' />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

const BranchCustomerVehicles = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 15;

  const { data, isLoading, isFetching, error, refetch } =
    useGetCustomerVehiclesQuery({ page, limit });

  const vehicles = data?.data ?? [];
  const total = data?.pagination?.totalCount ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 1;
  const currentPage = data?.pagination?.currentPage ?? 1;

  const handleSearch = useCallback(() => {
    setSearchQuery(search);
    setPage(1);
  }, [search]);

  // Client-side filter when search is active
  const filteredVehicles = searchQuery
    ? vehicles.filter((vehicle: any) => {
        const query = searchQuery.toLowerCase();
        const modelName = (vehicle.modelName ?? "").toLowerCase();
        const numberPlate = (vehicle.numberPlate ?? "").toLowerCase();
        const phone =
          typeof vehicle.customer === "object"
            ? (vehicle.customer?.phoneNumber ?? "").toLowerCase()
            : "";
        return (
          modelName.includes(query) ||
          numberPlate.includes(query) ||
          phone.includes(query)
        );
      })
    : vehicles;

  if (error) {
    return (
      <div className='p-6'>
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='p-8 text-center'>
            <p className='text-red-600 font-medium mb-3'>
              Failed to load vehicles
            </p>
            <Button variant='outline' onClick={refetch}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-5'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-semibold tracking-tight'>
            Customer Vehicles
          </h2>
          <p className='text-sm text-gray-500 mt-1'>
            {total} vehicles registered
          </p>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={refetch}
          disabled={isFetching}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex gap-2'>
            <Input
              placeholder='Search by model, number plate, phone...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className='max-w-sm'
            />
            <Button variant='outline' size='icon' onClick={handleSearch}>
              <Search className='h-4 w-4' />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Number Plate</TableHead>
                  <TableHead>Customer Phone</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Service Status</TableHead>
                  <TableHead>VAS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton />
                ) : filteredVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='text-center py-12 text-gray-400'
                    >
                      <Bike className='h-10 w-10 mx-auto mb-3 text-gray-300' />
                      <p className='text-sm'>No vehicles found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVehicles.map((vehicle: any, i: number) => (
                    <motion.tr
                      key={vehicle._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className='border-b border-gray-50 hover:bg-gray-50/50'
                    >
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <div className='h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center'>
                            <Bike className='h-3.5 w-3.5 text-gray-500' />
                          </div>
                          <div>
                            <p className='font-medium text-gray-900 text-sm'>
                              {vehicle.modelName ?? "—"}
                            </p>
                            <p className='text-xs text-gray-400'>
                              {vehicle.color ?? ""}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className='font-mono text-sm text-gray-700'>
                        {vehicle.numberPlate ?? "—"}
                      </TableCell>
                      <TableCell>
                        <span className='flex items-center gap-1 text-sm text-gray-600'>
                          <Phone className='h-3.5 w-3.5 text-gray-400' />
                          {typeof vehicle.customer === "object"
                            ? vehicle.customer?.phoneNumber
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className='flex items-center gap-1 text-sm text-gray-500'>
                          <Calendar className='h-3.5 w-3.5 text-gray-400' />
                          {formatDate(vehicle.purchaseDate)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline' className='text-xs capitalize'>
                          <Settings className='h-3 w-3 mr-1' />
                          {vehicle.serviceStatus?.serviceType ?? "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {vehicle.activeValueAddedServices?.length > 0 ? (
                          <Badge className='bg-green-100 text-green-700 text-xs'>
                            {
                              vehicle.activeValueAddedServices.filter(
                                (s: any) => s.isActive,
                              ).length
                            }{" "}
                            active
                          </Badge>
                        ) : (
                          <span className='text-xs text-gray-400'>None</span>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <p className='text-xs text-gray-500'>
            Showing {(currentPage - 1) * limit + 1}–
            {Math.min(currentPage * limit, total)} of {total}
          </p>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={currentPage === 1 || isFetching}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <span className='text-sm text-gray-600'>
              {currentPage} / {totalPages}
            </span>
            <Button
              variant='outline'
              size='sm'
              disabled={currentPage === totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchCustomerVehicles;
