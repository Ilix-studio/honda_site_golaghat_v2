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
  AlertCircle,
  RefreshCw,
  Plus,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import CustomerTempBillReview from "../JobCard/CustomerTempBillReview";

import CustomerFinalBillConfirm from "../JobCard/CustomerFinalBillConfirm";
import { useGetJobCardCustomerQuery } from "@/redux-store/services/ServiceM/jobCardApi";
import BookingData from "./BookingData";

interface ServiceStatsDisplayProps {}

const ServiceStatsDisplay: React.FC<ServiceStatsDisplayProps> = () => {
  const [activeTab, setActiveTab] = useState<
    "stats"  | "bill-info"
  >("stats");
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useGetMyServiceStatsQuery();

    const {
      data: bookingsData,   
    } = useGetMyBookingsQuery({limit: 50,
  sortBy: "createdAt",
  sortOrder: "desc",});


  const bookings = bookingsData?.data || [];
  const stats = statsData?.data;

  const ACTIONABLE_JOB_STATUSES = [
  "temp_bill_sent",
  "final_bill_sent",
  "customer_reviewed",
  "in_progress",
  "draft",
];

const activeBookingWithJobCard =
  bookings.find(
    (b) =>
      b.jobCard &&
      !["completed", "cancelled"].includes(b.status) &&
      ACTIONABLE_JOB_STATUSES.includes((b as any).jobCardStatus ?? "")
  ) ??
  // Fallback: any non-completed booking with a job card (newest first)
  bookings.find(
    (b) =>
      b.jobCard && !["completed", "cancelled"].includes(b.status)
  );


  const {
    data: jobCardData,
    isLoading: jobCardLoading,
  } = useGetJobCardCustomerQuery(
    activeBookingWithJobCard?.jobCard || "",
    { skip: !activeBookingWithJobCard?.jobCard }
  );
  const jobCard = jobCardData?.data;

  if (statsError) {
    return (
      <Card className='border-red-200'>
        <CardContent className='p-6 text-center'>
          <AlertCircle className='h-8 w-8 mx-auto mb-2 text-red-500' />
          <p className='text-black'>No service data</p>
          <Button
            variant='outline'
            onClick={() => {
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
    <div className='w-full max-w-6xl mx-auto space-y-6'>
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "stats"  | "bill-info")
        }
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-2 lg:w-96 border rounded-full bg-white  '>
          <TabsTrigger value='stats' className='flex items-center gap-2'>
            <BarChart3 className='h-4 w-4' />
            <span className='hidden sm:inline'>Service Stats</span>
            <span className='sm:hidden'>Stats</span>
          </TabsTrigger>
  
          <TabsTrigger value='bill-info' className='flex items-center gap-2'>
            <Calendar className='h-4 w-4' />
            <span className='hidden sm:inline'>Bill Info</span>
            <span className='sm:hidden'>Bill Info</span>
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
              <Link to='/customer/book-service' className='group'>
                <Card className='border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer'>
                  <CardContent className='p-6 flex flex-col items-center justify-center text-center min-h-[120px]'>
                    <div className='w-12 h-12 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors'>
                      <Plus className='w-6 h-6 text-gray-500 group-hover:text-blue-600 transition-colors' />
                    </div>
                    <CardTitle className='text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors'>
                      Book New Service
                    </CardTitle>
                    <p className='text-xs text-gray-500 mt-1 group-hover:text-blue-600 transition-colors'>
                      Schedule your next service
                    </p>
                  </CardContent>
                </Card>
              </Link>
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
             <BookingData />
        </TabsContent>

        {/* Bookings Tab */}
       

        {/* Bill Info Tab */}
        <TabsContent value='bill-info' className='mt-6'>
          { jobCardLoading ? (
            <div className='flex items-center justify-center min-h-[300px]'>
              <p className='text-gray-500 text-sm animate-pulse'>
                Checking for active service bills...
              </p>
            </div>
          ) : !activeBookingWithJobCard?.jobCard || !jobCard ? (
            <Card>
              <CardContent className='p-12 text-center'>
                <AlertCircle className='h-12 w-12 mx-auto mb-4 text-gray-400' />
                <h3 className='text-lg font-semibold mb-2'>
                  No Pending Bills
                </h3>
                <p className='text-muted-foreground'>
                  There are no active service bills pending your review at this time.
                </p>
              </CardContent>
            </Card>
          ) : jobCard.status === "temp_bill_sent" ? (
            <CustomerTempBillReview jobCardId={activeBookingWithJobCard.jobCard} />
          ) : jobCard.status === "final_bill_sent" ? (
            <CustomerFinalBillConfirm jobCardId={activeBookingWithJobCard.jobCard} />
          ) : jobCard.status === "customer_reviewed" ? (
            <Card>
              <CardContent className='p-12 text-center'>
                <CheckCircle className='h-12 w-12 mx-auto mb-4 text-green-500' />
                <h3 className='text-lg font-semibold mb-2'>
                  Review Submitted
                </h3>
                <p className='text-muted-foreground'>
                  You've already submitted your review. The service team has been notified and will proceed with the approved items.
                </p>
              </CardContent>
            </Card>
          ) : ["customer_confirmed", "invoice_generated", "closed"].includes(jobCard.status) ? (
            <Card>
              <CardContent className='p-12 text-center'>
                <CheckCircle className='h-12 w-12 mx-auto mb-4 text-green-500' />
                <h3 className='text-lg font-semibold mb-2'>
                  Bill Confirmed
                </h3>
                <p className='text-muted-foreground mb-3'>
                  You have already confirmed this bill.
                </p>
                <p className='text-sm text-gray-500'>
                  Please collect your vehicle and settle payment at the counter.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className='p-12 text-center'>
                <AlertCircle className='h-12 w-12 mx-auto mb-4 text-gray-400' />
                <h3 className='text-lg font-semibold mb-2'>
                  No Pending Actions
                </h3>
                <p className='text-muted-foreground'>
                  There are no active service bills pending your action at this time.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceStatsDisplay;
