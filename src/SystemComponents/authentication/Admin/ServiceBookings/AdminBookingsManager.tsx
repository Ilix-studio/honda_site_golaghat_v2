import React, { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Calendar,
  Clock,
  Search,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Wrench,
} from "lucide-react";
import {
  useGetAllBookingsQuery,
  useGetBookingStatsQuery,
  useUpdateBookingStatusMutation,
} from "@/redux-store/services/VASnStock/ServiceBookAdminApi";

// ── status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> =
  {
    pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
    confirmed: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    "in-progress": {
      bg: "bg-violet-50",
      text: "text-violet-700",
      dot: "bg-violet-500",
    },
    completed: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    cancelled: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },
  };

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] ?? {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ── component ────────────────────────────────────────────────────────────────
const AdminBookingsManager: React.FC = () => {
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
      if (!newStatus) return;
      try {
        await updateBookingStatus({
          id: bookingId,
          status: newStatus,
        }).unwrap();
        refetchBookings();
        refetchStats();
      } catch (e) {
        console.error(e);
      }
    },
    [updateBookingStatus, refetchBookings, refetchStats],
  );

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const getStatusOptions = (currentStatus: string): string[] =>
    ({
      pending: ["confirmed", "cancelled"],
      confirmed: ["in-progress", "cancelled"],
      "in-progress": ["completed"],
      completed: [],
      cancelled: [],
    })[currentStatus] || [];

  const filteredBookings = bookings.filter(
    (b) =>
      searchQuery === "" ||
      b.bookingId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const inputClass =
    "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400";

  if (bookingsError || statsError) {
    return (
      <div className='rounded-2xl border border-red-100 bg-red-50 p-8 text-center'>
        <AlertCircle className='h-8 w-8 mx-auto mb-2 text-red-500' />
        <p className='text-red-600 font-medium mb-3'>
          Failed to load booking data
        </p>
        <button
          onClick={() => {
            refetchBookings();
            refetchStats();
          }}
          className='inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100'
        >
          <RefreshCw className='h-3.5 w-3.5' /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className='w-full max-w-7xl mx-auto space-y-5'>
      <br />
      {/* ── header ── */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-600 via-gray-500 to-gray-400 p-5 text-white shadow-md'>
        <div className='pointer-events-none absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white/10' />
        <div className='relative flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/20'>
              <Wrench className='h-5 w-5 text-white' />
            </div>
            <div>
              <h2 className='text-lg font-bold'>Service Bookings</h2>
              <p className='text-xs text-red-100'>
                {bookingsData?.total ?? 0} total bookings
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              refetchBookings();
              refetchStats();
            }}
            className='inline-flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 text-sm font-semibold backdrop-blur-sm hover:bg-white/30 transition-colors'
          >
            <RefreshCw className='h-3.5 w-3.5' /> Refresh
          </button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "bookings" | "stats")}
      >
        {/* tab bar */}
        <div className='rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden'>
          <div className='border-b border-gray-100 px-4 pt-4'>
            <TabsList className='h-auto bg-transparent gap-1 p-0'>
              <TabsTrigger
                value='bookings'
                className='relative flex items-center gap-2 rounded-t-xl px-5 py-3 text-sm font-semibold text-gray-500
                  data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:shadow-none
                  hover:text-gray-800 hover:bg-gray-50'
              >
                <div className='flex h-6 w-6 items-center justify-center rounded-md bg-red-100'>
                  <Calendar className='h-3.5 w-3.5 text-red-600' />
                </div>
                All Bookings
                <span className='absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-red-500 opacity-0 data-[state=active]:opacity-100 transition-opacity' />
              </TabsTrigger>
              <TabsTrigger
                value='stats'
                className='relative flex items-center gap-2 rounded-t-xl px-5 py-3 text-sm font-semibold text-gray-500
                  data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700 data-[state=active]:shadow-none
                  hover:text-gray-800 hover:bg-gray-50'
              >
                <div className='flex h-6 w-6 items-center justify-center rounded-md bg-violet-100'>
                  <BarChart3 className='h-3.5 w-3.5 text-violet-600' />
                </div>
                Statistics
                <span className='absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-violet-500 opacity-0 data-[state=active]:opacity-100 transition-opacity' />
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── stats tab ── */}
          <TabsContent value='stats' className='mt-0 p-5'>
            {statsLoading ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className='h-28 rounded-2xl bg-gray-100 animate-pulse'
                  />
                ))}
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                {/* total */}
                <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-orange-400 p-5 text-white'>
                  <div className='pointer-events-none absolute -bottom-3 -right-3 h-16 w-16 rounded-full bg-white/10' />
                  <p className='text-xs font-semibold uppercase tracking-widest text-red-100 mb-2'>
                    Total Bookings
                  </p>
                  <p className='text-3xl font-black tabular-nums'>
                    {stats?.totalBookings ?? 0}
                  </p>
                </div>

                {/* status distribution */}
                {stats?.statusDistribution?.map((s: any, _i: number) => {
                  const cfg = STATUS_CONFIG[s._id] ?? {
                    bg: "bg-gray-50",
                    text: "text-gray-700",
                    dot: "bg-gray-300",
                  };
                  return (
                    <div
                      key={s._id}
                      className={`rounded-2xl border border-gray-100 p-5 ${cfg.bg}`}
                    >
                      <p
                        className={`text-xs font-semibold uppercase tracking-widest mb-2 ${cfg.text}`}
                      >
                        {s._id} bookings
                      </p>
                      <p
                        className={`text-3xl font-black tabular-nums ${cfg.text}`}
                      >
                        {s.count}
                      </p>
                    </div>
                  );
                })}

                {/* revenue */}
                <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 p-5 text-white'>
                  <div className='pointer-events-none absolute -bottom-3 -right-3 h-16 w-16 rounded-full bg-white/10' />
                  <p className='text-xs font-semibold uppercase tracking-widest text-emerald-100 mb-2'>
                    Total Revenue
                  </p>
                  <p className='text-3xl font-black tabular-nums'>
                    ₹{stats?.revenue?.totalRevenue?.toLocaleString() ?? 0}
                  </p>
                </div>

                {/* avg */}
                <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 p-5 text-white'>
                  <div className='pointer-events-none absolute -bottom-3 -right-3 h-16 w-16 rounded-full bg-white/10' />
                  <p className='text-xs font-semibold uppercase tracking-widest text-blue-100 mb-2'>
                    Avg Booking Value
                  </p>
                  <p className='text-3xl font-black tabular-nums'>
                    ₹
                    {Math.round(
                      stats?.revenue?.averageBookingValue ?? 0,
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── bookings tab ── */}
          <TabsContent value='bookings' className='mt-0 p-5 space-y-4'>
            {/* filters */}
            <div className='rounded-2xl border border-gray-100 bg-gray-50/60 p-4'>
              <div className='flex flex-col lg:flex-row gap-3'>
                <div className='relative flex-1'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400' />
                  <input
                    placeholder='Search by Booking ID…'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`${inputClass} pl-9`}
                  />
                </div>
                <select
                  className={`${inputClass} lg:w-44`}
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value=''>All Status</option>
                  {Object.keys(STATUS_CONFIG).map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  className={`${inputClass} lg:w-44`}
                  value={filters.serviceType}
                  onChange={(e) =>
                    handleFilterChange("serviceType", e.target.value)
                  }
                >
                  <option value=''>All Services</option>
                  <option value='general-service'>General Service</option>
                  <option value='oil-change'>Oil Change</option>
                  <option value='brake-service'>Brake Service</option>
                  <option value='battery-service'>Battery Service</option>
                </select>
              </div>
            </div>

            {/* loading */}
            {bookingsLoading && (
              <div className='space-y-3'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className='h-24 rounded-2xl bg-gray-100 animate-pulse'
                  />
                ))}
              </div>
            )}

            {/* empty */}
            {!bookingsLoading && filteredBookings.length === 0 && (
              <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 gap-3'>
                <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100'>
                  <Calendar className='h-5 w-5 text-gray-400' />
                </div>
                <p className='text-sm font-semibold text-gray-700'>
                  No Bookings Found
                </p>
                <p className='text-xs text-gray-400'>
                  Try adjusting your filters.
                </p>
              </div>
            )}

            {/* booking cards */}
            {!bookingsLoading && filteredBookings.length > 0 && (
              <div className='space-y-3'>
                {filteredBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className='rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200'
                  >
                    {/* colored left accent per status */}
                    <div className='flex'>
                      <div
                        className={`w-1 rounded-l-2xl shrink-0 ${STATUS_CONFIG[booking.status]?.dot ?? "bg-gray-300"}`}
                      />
                      <div className='flex-1 p-4 lg:p-5'>
                        <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
                          <div className='space-y-2 flex-1'>
                            <div className='flex flex-wrap items-center gap-2'>
                              <span className='font-mono text-sm font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-lg'>
                                {booking.bookingId}
                              </span>
                              <StatusBadge status={booking.status} />
                              {booking.status === "completed" && (
                                <CheckCircle className='h-4 w-4 text-emerald-500' />
                              )}
                            </div>
                            <div className='flex flex-wrap gap-4 text-xs text-gray-500'>
                              <span className='inline-flex items-center gap-1.5'>
                                <Settings className='h-3.5 w-3.5 text-gray-400' />
                                {booking.serviceType}
                              </span>
                              <span className='inline-flex items-center gap-1.5'>
                                <Calendar className='h-3.5 w-3.5 text-gray-400' />
                                {new Date(
                                  booking.appointmentDate,
                                ).toLocaleDateString()}
                              </span>
                              <span className='inline-flex items-center gap-1.5'>
                                <Clock className='h-3.5 w-3.5 text-gray-400' />
                                {booking.appointmentTime}
                              </span>
                            </div>
                          </div>

                          <div className='flex items-center gap-3 shrink-0'>
                            {booking.estimatedCost && (
                              <div className='rounded-xl bg-emerald-50 px-3 py-2 text-right'>
                                <p className='text-xs text-emerald-600'>
                                  Est. Cost
                                </p>
                                <p className='text-sm font-bold text-emerald-700'>
                                  ₹{booking.estimatedCost}
                                </p>
                              </div>
                            )}
                            {getStatusOptions(booking.status).length > 0 && (
                              <select
                                className={`${inputClass} w-40`}
                                defaultValue=''
                                disabled={isUpdatingStatus}
                                onChange={(e) => {
                                  if (e.target.value)
                                    handleStatusUpdate(
                                      booking._id,
                                      e.target.value,
                                    );
                                }}
                              >
                                <option value='' disabled>
                                  Update Status
                                </option>
                                {getStatusOptions(booking.status).map((s) => (
                                  <option key={s} value={s}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* pagination */}
                {bookingsData && bookingsData.totalPages > 1 && (
                  <div className='flex flex-col sm:flex-row justify-between items-center gap-4 pt-2'>
                    <p className='text-xs text-gray-400'>
                      Showing{" "}
                      <span className='font-semibold text-gray-700'>
                        {(filters.page - 1) * filters.limit + 1}–
                        {Math.min(
                          filters.page * filters.limit,
                          bookingsData.total,
                        )}
                      </span>{" "}
                      of{" "}
                      <span className='font-semibold text-gray-700'>
                        {bookingsData.total}
                      </span>
                    </p>
                    <div className='flex items-center gap-2'>
                      <button
                        disabled={filters.page === 1}
                        onClick={() =>
                          handleFilterChange(
                            "page",
                            (filters.page - 1).toString(),
                          )
                        }
                        className='px-3 py-1.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'
                      >
                        ← Prev
                      </button>
                      <span className='px-3 py-1.5 rounded-xl bg-red-600 text-white text-sm font-semibold'>
                        {filters.page} / {bookingsData.totalPages}
                      </span>
                      <button
                        disabled={filters.page === bookingsData.totalPages}
                        onClick={() =>
                          handleFilterChange(
                            "page",
                            (filters.page + 1).toString(),
                          )
                        }
                        className='px-3 py-1.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AdminBookingsManager;
