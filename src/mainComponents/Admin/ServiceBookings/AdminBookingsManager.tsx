import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  BarChart3,
  Calendar,
  Clock,
  Search,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
} from "lucide-react";
import {
  useGetAllBookingsQuery,
  useGetBookingStatsQuery,
  useUpdateBookingStatusMutation,
} from "@/redux-store/services/BikeSystemApi2/ServiceBookAdminApi";

interface AdminBookingsManagerProps {}

const AdminBookingsManager: React.FC<AdminBookingsManagerProps> = () => {
  const [activeTab, setActiveTab] = useState<"bookings" | "stats">("bookings");
  const [filters, setFilters] = useState({
    status: "",
    branchId: "",
    serviceType: "",
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    error: bookingsError,
    refetch: refetchBookings,
  } = useGetAllBookingsQuery(filters);

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useGetBookingStatsQuery({});

  const [updateBookingStatus, { isLoading: isUpdatingStatus }] =
    useUpdateBookingStatusMutation();

  const bookings = bookingsData?.data || [];
  const stats = statsData?.data;

  const handleStatusUpdate = useCallback(
    async (bookingId: string, newStatus: string) => {
      try {
        await updateBookingStatus({
          id: bookingId,
          status: newStatus,
        }).unwrap();
        refetchBookings();
        refetchStats();
      } catch (error) {
        console.error("Failed to update booking status:", error);
      }
    },
    [updateBookingStatus, refetchBookings, refetchStats]
  );

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  }, []);

  const getStatusColor = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmed: "bg-blue-100 text-blue-800 border-blue-300",
      "in-progress": "bg-purple-100 text-purple-800 border-purple-300",
      completed: "bg-green-100 text-green-800 border-green-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
    };
    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-gray-100 text-gray-800 border-gray-300"
    );
  };

  const getStatusOptions = (currentStatus: string) => {
    const statusFlow = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["in-progress", "cancelled"],
      "in-progress": ["completed"],
      completed: [],
      cancelled: [],
    };
    return statusFlow[currentStatus as keyof typeof statusFlow] || [];
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      searchQuery === "" ||
      booking.bookingId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (bookingsError || statsError) {
    return (
      <Card className='border-red-200'>
        <CardContent className='p-6 text-center'>
          <AlertCircle className='h-8 w-8 mx-auto mb-2 text-red-500' />
          <p className='text-red-600'>Failed to load booking data</p>
          <Button
            variant='outline'
            onClick={() => {
              refetchBookings();
              refetchStats();
            }}
            className='mt-2'
          >
            <RefreshCw className='h-4 w-4 mr-2' />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='w-full max-w-7xl mx-auto space-y-6'>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "bookings" | "stats")}
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-2 lg:w-96'>
          <TabsTrigger value='bookings' className='flex items-center gap-2'>
            <Calendar className='h-4 w-4' />
            <span className='hidden sm:inline'>All Bookings</span>
            <span className='sm:hidden'>Bookings</span>
          </TabsTrigger>
          <TabsTrigger value='stats' className='flex items-center gap-2'>
            <BarChart3 className='h-4 w-4' />
            <span className='hidden sm:inline'>Statistics</span>
            <span className='sm:hidden'>Stats</span>
          </TabsTrigger>
        </TabsList>

        {/* Statistics Tab */}
        <TabsContent value='stats' className='mt-6'>
          {statsLoading ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className='p-6'>
                    <div className='animate-pulse space-y-3'>
                      <div className='h-4 bg-gray-200 rounded' />
                      <div className='h-8 bg-gray-200 rounded' />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>
                    Total Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-0'>
                  <div className='text-2xl font-bold'>
                    {stats?.totalBookings || 0}
                  </div>
                </CardContent>
              </Card>

              {stats?.statusDistribution?.map((status: any) => (
                <Card key={status._id}>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm font-medium text-muted-foreground capitalize'>
                      {status._id} Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='pt-0'>
                    <div className='text-2xl font-bold'>{status.count}</div>
                  </CardContent>
                </Card>
              ))}

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-0'>
                  <div className='text-2xl font-bold text-green-600'>
                    ₹{stats?.revenue?.totalRevenue?.toLocaleString() || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>
                    Avg Booking Value
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-0'>
                  <div className='text-2xl font-bold text-blue-600'>
                    ₹{Math.round(stats?.revenue?.averageBookingValue || 0)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value='bookings' className='mt-6'>
          {/* Filters and Search */}
          <Card className='mb-6'>
            <CardContent className='p-4'>
              <div className='flex flex-col lg:flex-row gap-4'>
                <div className='flex-1'>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <Input
                      placeholder='Search by Booking ID or Phone Number'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className='pl-10'
                    />
                  </div>
                </div>
                <div className='flex flex-col sm:flex-row gap-2 lg:gap-4'>
                  <Select
                    onValueChange={(value) =>
                      handleFilterChange("status", value)
                    }
                  >
                    <SelectTrigger className='w-full sm:w-40'>
                      <SelectValue placeholder='Status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=''>All Status</SelectItem>
                      <SelectItem value='pending'>Pending</SelectItem>
                      <SelectItem value='confirmed'>Confirmed</SelectItem>
                      <SelectItem value='in-progress'>In Progress</SelectItem>
                      <SelectItem value='completed'>Completed</SelectItem>
                      <SelectItem value='cancelled'>Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    onValueChange={(value) =>
                      handleFilterChange("serviceType", value)
                    }
                  >
                    <SelectTrigger className='w-full sm:w-40'>
                      <SelectValue placeholder='Service Type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=''>All Services</SelectItem>
                      <SelectItem value='general-service'>
                        General Service
                      </SelectItem>
                      <SelectItem value='oil-change'>Oil Change</SelectItem>
                      <SelectItem value='brake-service'>
                        Brake Service
                      </SelectItem>
                      <SelectItem value='battery-service'>
                        Battery Service
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings List */}
          {bookingsLoading ? (
            <div className='space-y-4'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className='p-6'>
                    <div className='animate-pulse space-y-3'>
                      <div className='h-4 bg-gray-200 rounded w-1/4' />
                      <div className='h-3 bg-gray-200 rounded w-1/2' />
                      <div className='h-3 bg-gray-200 rounded w-1/3' />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <Card>
              <CardContent className='p-12 text-center'>
                <Calendar className='h-12 w-12 mx-auto mb-4 text-gray-400' />
                <h3 className='text-lg font-semibold mb-2'>
                  No Bookings Found
                </h3>
                <p className='text-muted-foreground'>
                  No bookings match your current filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-4'>
              {filteredBookings.map((booking) => (
                <Card
                  key={booking._id}
                  className='hover:shadow-md transition-shadow'
                >
                  <CardContent className='p-4 lg:p-6'>
                    <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
                      <div className='space-y-3 flex-1'>
                        <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
                          <h3 className='font-semibold text-lg'>
                            {booking.bookingId}
                          </h3>
                          <Badge
                            className={`${getStatusColor(
                              booking.status
                            )} w-fit`}
                          >
                            {booking.status}
                          </Badge>
                        </div>

                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground'>
                          <div className='flex items-center gap-2'>
                            <Settings className='h-4 w-4' />
                            <span>{booking.serviceType}</span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Calendar className='h-4 w-4' />
                            <span>
                              {new Date(
                                booking.appointmentDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Clock className='h-4 w-4' />
                            <span>{booking.appointmentTime}</span>
                          </div>
                        </div>

                        {booking.specialRequests && (
                          <div className='text-sm'>
                            <span className='font-medium'>Notes:</span>{" "}
                            {booking.specialRequests}
                          </div>
                        )}
                      </div>

                      <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
                        {booking.estimatedCost && (
                          <div className='text-right'>
                            <p className='text-sm text-muted-foreground'>
                              Estimated Cost
                            </p>
                            <p className='font-semibold'>
                              ₹{booking.estimatedCost}
                            </p>
                          </div>
                        )}

                        {getStatusOptions(booking.status).length > 0 && (
                          <Select
                            onValueChange={(value) =>
                              handleStatusUpdate(booking._id, value)
                            }
                            disabled={isUpdatingStatus}
                          >
                            <SelectTrigger className='w-full sm:w-40'>
                              <SelectValue placeholder='Update Status' />
                            </SelectTrigger>
                            <SelectContent>
                              {getStatusOptions(booking.status).map(
                                (status) => (
                                  <SelectItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() +
                                      status.slice(1)}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        )}

                        {booking.status === "completed" && (
                          <CheckCircle className='h-5 w-5 text-green-500' />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {bookingsData && bookingsData.totalPages > 1 && (
                <div className='flex flex-col sm:flex-row justify-between items-center gap-4 mt-6'>
                  <p className='text-sm text-muted-foreground'>
                    Showing {(filters.page - 1) * filters.limit + 1} to{" "}
                    {Math.min(filters.page * filters.limit, bookingsData.total)}{" "}
                    of {bookingsData.total} bookings
                  </p>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={filters.page === 1}
                      onClick={() =>
                        handleFilterChange(
                          "page",
                          (filters.page - 1).toString()
                        )
                      }
                    >
                      Previous
                    </Button>
                    <span className='flex items-center px-3 text-sm'>
                      {filters.page} of {bookingsData.totalPages}
                    </span>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={filters.page === bookingsData.totalPages}
                      onClick={() =>
                        handleFilterChange(
                          "page",
                          (filters.page + 1).toString()
                        )
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminBookingsManager;
