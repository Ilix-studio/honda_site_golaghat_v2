import  { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useGetMyBookingsQuery } from "@/redux-store/services/customer/ServiceBookCustomerApi";

export default function BookingData() {
  const [bookingsPage, setBookingsPage] = useState(1);

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

  if (bookingsError) {
    return (
      <Card className='border-red-200'>
        <CardContent className='p-6 text-center'>
          <AlertCircle className='h-8 w-8 mx-auto mb-2 text-red-500' />
          <p className='text-black'>No service data</p>
          <Button
            variant='outline'
            onClick={() => refetchBookings()}
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
    <div className='mt-6'>
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
                          booking.appointmentDate,
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
    </div>
  );
}
