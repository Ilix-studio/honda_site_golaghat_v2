import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useGetMyServiceStatsQuery,
  useGetMyBookingsQuery,
} from "@/redux-store/services/customer/ServiceBookCustomerApi";
import {
  BarChart3,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface ServiceStatsDisplayProps {}

const ServiceStatsDisplay: React.FC<ServiceStatsDisplayProps> = () => {
  const [activeTab, setActiveTab] = useState<"stats" | "bookings">("stats");
  const [bookingsPage, setBookingsPage] = useState(1);

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useGetMyServiceStatsQuery();

  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    error: bookingsError,
    refetch: refetchBookings,
  } = useGetMyBookingsQuery({
    page: bookingsPage,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const stats = statsData?.data;
  const bookings = bookingsData?.data || [];

  const getStatusColor = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      "in-progress": "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-gray-100 text-gray-800"
    );
  };

  if (statsError || bookingsError) {
    return (
      <Card className='border-red-200'>
        <CardContent className='p-6 text-center'>
          <AlertCircle className='h-8 w-8 mx-auto mb-2 text-red-500' />
          <p className='text-red-600'>Failed to load service data</p>
          <Button
            variant='outline'
            onClick={() => {
              refetchStats();
              refetchBookings();
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
    <div className='w-full max-w-6xl mx-auto space-y-6'>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "stats" | "bookings")}
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-2 lg:w-96'>
          <TabsTrigger value='stats' className='flex items-center gap-2'>
            <BarChart3 className='h-4 w-4' />
            <span className='hidden sm:inline'>Service Stats</span>
            <span className='sm:hidden'>Stats</span>
          </TabsTrigger>
          <TabsTrigger value='bookings' className='flex items-center gap-2'>
            <Calendar className='h-4 w-4' />
            <span className='hidden sm:inline'>My Bookings</span>
            <span className='sm:hidden'>Bookings</span>
          </TabsTrigger>
        </TabsList>

        {/* Service Stats Tab */}
        <TabsContent value='stats' className='mt-6'>
          {statsLoading ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className='p-6'>
                    <div className='animate-pulse'>
                      <div className='h-4 bg-gray-200 rounded mb-2' />
                      <div className='h-8 bg-gray-200 rounded' />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>
                    Total Services Used
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-0'>
                  <div className='text-2xl font-bold'>
                    {stats?.totalServicesUsed || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>
                    Available Services
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-0'>
                  <div className='text-2xl font-bold text-green-600'>
                    {stats?.availableServicesCount || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>
                    Used Services
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-0'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {stats?.usedServicesCount || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>
                    Free Services Used
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-0'>
                  <div className='text-2xl font-bold text-emerald-600'>
                    {stats?.breakdown?.freeServicesUsed || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>
                    Paid Services Used
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-0'>
                  <div className='text-2xl font-bold text-orange-600'>
                    {stats?.breakdown?.paidServicesUsed || 0}
                  </div>
                </CardContent>
              </Card>

              {/* Service Types Card - spans full width on mobile */}
              <Card className='md:col-span-2 lg:col-span-1'>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>
                    Used Service Types
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-0'>
                  <div className='flex flex-wrap gap-2'>
                    {stats?.usedServiceTypes?.length ? (
                      stats.usedServiceTypes.map((service, index) => (
                        <Badge
                          key={index}
                          variant='secondary'
                          className='text-xs'
                        >
                          {service}
                        </Badge>
                      ))
                    ) : (
                      <span className='text-sm text-muted-foreground'>
                        No services used yet
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value='bookings' className='mt-6'>
          {bookingsLoading ? (
            <div className='space-y-4'>
              {Array.from({ length: 3 }).map((_, i) => (
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
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className='p-12 text-center'>
                <Calendar className='h-12 w-12 mx-auto mb-4 text-gray-400' />
                <h3 className='text-lg font-semibold mb-2'>
                  No Bookings Found
                </h3>
                <p className='text-muted-foreground'>
                  You haven't made any service bookings yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-4'>
              {bookings.map((booking) => (
                <Card
                  key={booking._id}
                  className='hover:shadow-md transition-shadow'
                >
                  <CardContent className='p-4 sm:p-6'>
                    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <h3 className='font-semibold text-lg'>
                            {booking.bookingId}
                          </h3>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          Service: {booking.serviceType}
                        </p>
                        <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground'>
                          <div className='flex items-center gap-1'>
                            <Calendar className='h-4 w-4' />
                            {new Date(
                              booking.appointmentDate
                            ).toLocaleDateString()}
                          </div>
                          <div className='flex items-center gap-1'>
                            <Clock className='h-4 w-4' />
                            {booking.appointmentTime}
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center gap-2'>
                        {booking.status === "completed" && (
                          <CheckCircle className='h-5 w-5 text-green-500' />
                        )}
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {bookingsData && bookingsData.totalPages > 1 && (
                <div className='flex justify-center gap-2 mt-6'>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={bookingsPage === 1}
                    onClick={() => setBookingsPage((prev) => prev - 1)}
                  >
                    Previous
                  </Button>
                  <span className='flex items-center px-3 text-sm'>
                    {bookingsPage} of {bookingsData.totalPages}
                  </span>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={bookingsPage === bookingsData.totalPages}
                    onClick={() => setBookingsPage((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceStatsDisplay;
