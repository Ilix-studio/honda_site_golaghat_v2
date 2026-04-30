import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetMyVehicleInfoQuery,
  useGetMyServiceStatsQuery,
  useCreateServiceBookingMutation,
  useLazyCheckAvailabilityQuery,
} from "@/redux-store/services/customer/ServiceBookCustomerApi";
import { useGetBranchesQuery } from "@/redux-store/services/branchApi";
import { useAppDispatch } from "@/hooks/redux";
import { addNotification } from "@/redux-store/slices/uiSlice";

const FREE_SERVICES = [
  { id: "free-service-one", name: "First Service" },
  { id: "free-service-two", name: "Second Service" },
  { id: "free-service-three", name: "Third Service" },
];

const PAID_SERVICES = [
  { id: "paid-service-one", name: "Paid Service One", price: "₹2,500" },
  { id: "paid-service-two", name: "Paid Service Two", price: "₹5,000" },
  { id: "paid-service-three", name: "Paid Service Three", price: "₹3,000" },
  { id: "paid-service-four", name: "Paid Service Four", price: "₹1,500" },
  { id: "paid-service-five", name: "Paid Service Five", price: "₹2,000" },
];

interface ServiceLocation {
  _id: string;
  branchName: string;
  address: string;
}

const getAvailableDates = (): Date[] => {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() !== 0) dates.push(d);
  }
  return dates;
};

export const SimpleBookService: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { data: vehicleResponse, isLoading: vehicleLoading } =
    useGetMyVehicleInfoQuery();
  const { data: statsResponse } = useGetMyServiceStatsQuery();
  const { data: branchesResponse, isLoading: branchesLoading } =
    useGetBranchesQuery();
  const [checkAvailability] = useLazyCheckAvailabilityQuery();
  const [createServiceBooking, { isLoading: isSubmitting }] =
    useCreateServiceBookingMutation();

  const vehicle = vehicleResponse?.data ?? null;
  const usedServices = statsResponse?.data?.usedServiceTypes ?? [];
  const serviceLocations: ServiceLocation[] = branchesResponse?.data ?? [];
  const availableDates = getAvailableDates();

  const [serviceType, setServiceType] = useState("");
  const [branch, setBranch] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [time, setTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [checkingSlots, setCheckingSlots] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Auto-check slots when branch + date selected
  useEffect(() => {
    if (!branch || !selectedDate) return;
    setCheckingSlots(true);
    setTime("");
    checkAvailability({ branchId: branch, date: selectedDate })
      .unwrap()
      .then((res) => setAvailableSlots(res.data.availableSlots))
      .catch(() => setAvailableSlots([]))
      .finally(() => setCheckingSlots(false));
  }, [branch, selectedDate]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!vehicle) e.vehicle = "No vehicle found in your account";
    if (!serviceType) e.serviceType = "Please select a service";
    if (!branch) e.branch = "Please select a service location";
    if (!selectedDate) e.date = "Please select a date";
    if (!time) e.time = "Please select a time slot";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const result = await createServiceBooking({
        vehicle: vehicle!.vehicleId,
        serviceType,
        branch,
        appointmentDate: selectedDate,
        appointmentTime: time,
        location: "branch" as const,
      }).unwrap();

      setBookingId(result.data.bookingId);
      dispatch(
        addNotification({
          type: "success",
          message: `Booking confirmed! ID: ${result.data.bookingId}`,
        })
      );
    } catch (err: any) {
      const msg = err?.data?.message ?? "Failed to create booking";
      dispatch(addNotification({ type: "error", message: msg }));
      setErrors({ submit: msg });
    }
  };

  // Success screen
  if (bookingId) {
    return (
      <div className='max-w-lg mx-auto mt-10 p-6 border-2 border-green-500 rounded-xl text-center space-y-4'>
        <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-8 w-8 text-green-500'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 13l4 4L19 7'
            />
          </svg>
        </div>
        <h2 className='text-2xl font-semibold'>Service Booked!</h2>
        <p className='text-muted-foreground'>
          Booking ID:{" "}
          <span className='font-mono font-semibold text-green-700'>
            {bookingId}
          </span>
        </p>
        <div className='text-sm text-left bg-gray-50 rounded-lg p-4 space-y-1'>
          <p>
            <span className='text-muted-foreground'>Motorcycle:</span>{" "}
            <span className='font-medium'>{vehicle?.modelName}</span>
          </p>
          <p>
            <span className='text-muted-foreground'>Service:</span>{" "}
            <span className='font-medium'>
              {
                [...FREE_SERVICES, ...PAID_SERVICES].find(
                  (s) => s.id === serviceType
                )?.name
              }
            </span>
          </p>
          <p>
            <span className='text-muted-foreground'>Location:</span>{" "}
            <span className='font-medium'>
              {serviceLocations.find((l) => l._id === branch)?.branchName}
            </span>
          </p>
          <p>
            <span className='text-muted-foreground'>Date:</span>{" "}
            <span className='font-medium'>{selectedDate}</span>
          </p>
          <p>
            <span className='text-muted-foreground'>Time:</span>{" "}
            <span className='font-medium'>{time}</span>
          </p>
        </div>
        <div className='flex gap-3 justify-center pt-2'>
          <button
            onClick={() => navigate("/")}
            className='px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700'
          >
            Return to Home
          </button>
          <button
            onClick={() => {
              setBookingId(null);
              setServiceType("");
              setBranch("");
              setSelectedDate("");
              setTime("");
            }}
            className='px-4 py-2 border rounded-md text-sm hover:bg-gray-50'
          >
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className=' mx-auto space-y-6'>
      <main className='max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6'>
        <div>
          <h2 className='text-2xl font-semibold'>Book a Service</h2>
          <p className='text-sm text-muted-foreground'>
            Schedule maintenance for your Honda motorcycle
          </p>
        </div>

        {/* Vehicle */}
        <div className='space-y-1'>
          <label className='text-sm font-medium'>Your Motorcycle</label>
          {vehicleLoading ? (
            <p className='text-sm text-muted-foreground'>Loading vehicle...</p>
          ) : vehicle ? (
            <div className='p-3 bg-gray-50 rounded-md border text-sm'>
              <span className='font-medium'>{vehicle.modelName}</span>
            </div>
          ) : (
            <p className='text-sm text-amber-600 p-3 bg-amber-50 rounded-md'>
              No vehicle found. Please add a vehicle to your profile first.
            </p>
          )}
          {errors.vehicle && (
            <p className='text-red-500 text-xs'>{errors.vehicle}</p>
          )}
        </div>

        {/* Service Type */}
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Service Type</label>
          <div className='space-y-2'>
            <p className='text-xs font-medium text-green-600 uppercase tracking-wide'>
              Free Services
            </p>
            {FREE_SERVICES.map((s) => {
              const isUsed = usedServices.includes(s.id);
              return (
                <label
                  key={s.id}
                  className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                    isUsed
                      ? "opacity-50 cursor-not-allowed bg-gray-50"
                      : serviceType === s.id
                      ? "border-red-600 bg-red-50"
                      : "hover:border-gray-400"
                  }`}
                >
                  <input
                    type='radio'
                    name='serviceType'
                    value={s.id}
                    disabled={isUsed}
                    checked={serviceType === s.id}
                    onChange={() => setServiceType(s.id)}
                    className='accent-red-600'
                  />
                  <span className='text-sm flex-1'>{s.name}</span>
                  <span className='text-xs text-green-600 font-medium'>
                    FREE
                  </span>
                  {isUsed && (
                    <span className='text-xs text-gray-500'>Used</span>
                  )}
                </label>
              );
            })}

            <p className='text-xs font-medium text-blue-600 uppercase tracking-wide mt-3'>
              Paid Services
            </p>
            {PAID_SERVICES.map((s) => {
              const isUsed = usedServices.includes(s.id);
              return (
                <label
                  key={s.id}
                  className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                    isUsed
                      ? "opacity-50 cursor-not-allowed bg-gray-50"
                      : serviceType === s.id
                      ? "border-red-600 bg-red-50"
                      : "hover:border-gray-400"
                  }`}
                >
                  <input
                    type='radio'
                    name='serviceType'
                    value={s.id}
                    disabled={isUsed}
                    checked={serviceType === s.id}
                    onChange={() => setServiceType(s.id)}
                    className='accent-red-600'
                  />
                  <span className='text-sm flex-1'>{s.name}</span>
                  <span className='text-xs text-muted-foreground'>
                    {s.price}
                  </span>
                  {isUsed && (
                    <span className='text-xs text-gray-500'>Used</span>
                  )}
                </label>
              );
            })}
          </div>
          {errors.serviceType && (
            <p className='text-red-500 text-xs'>{errors.serviceType}</p>
          )}
        </div>

        {/* Branch */}
        <div className='space-y-1'>
          <label className='text-sm font-medium'>Service Location</label>
          <select
            value={branch}
            disabled={branchesLoading}
            onChange={(e) => setBranch(e.target.value)}
            className='w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50'
          >
            <option value='' disabled>
              Select a service center
            </option>
            {serviceLocations.map((l) => (
              <option key={l._id} value={l._id}>
                {l.branchName}
              </option>
            ))}
          </select>
          {errors.branch && (
            <p className='text-red-500 text-xs'>{errors.branch}</p>
          )}
        </div>

        {/* Date */}
        <div className='space-y-1'>
          <label className='text-sm font-medium'>Preferred Date</label>
          <select
            value={selectedDate}
            disabled={!branch}
            onChange={(e) => setSelectedDate(e.target.value)}
            className='w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50'
          >
            <option value='' disabled>
              {!branch ? "Select a location first" : "Select a date"}
            </option>
            {availableDates.map((d) => {
              const iso = d.toISOString().split("T")[0];
              return (
                <option key={iso} value={iso}>
                  {d.toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </option>
              );
            })}
          </select>
          {errors.date && <p className='text-red-500 text-xs'>{errors.date}</p>}
        </div>

        {/* Time */}
        <div className='space-y-1'>
          <label className='text-sm font-medium flex items-center gap-2'>
            Preferred Time
            {checkingSlots && (
              <span className='animate-spin h-3 w-3 border-2 border-red-600 rounded-full border-t-transparent inline-block' />
            )}
          </label>
          <select
            value={time}
            disabled={!selectedDate || checkingSlots}
            onChange={(e) => setTime(e.target.value)}
            className='w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50'
          >
            <option value='' disabled>
              {!selectedDate
                ? "Select a date first"
                : checkingSlots
                ? "Checking availability..."
                : "Select a time slot"}
            </option>
            {availableSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
            {!checkingSlots && selectedDate && availableSlots.length === 0 && (
              <option value='' disabled>
                No slots available for this date
              </option>
            )}
          </select>
          {errors.time && <p className='text-red-500 text-xs'>{errors.time}</p>}
          {availableSlots.length > 0 && !checkingSlots && (
            <p className='text-xs text-green-600'>
              {availableSlots.length} slots available
            </p>
          )}
        </div>

        {errors.submit && (
          <p className='text-red-500 text-sm p-3 bg-red-50 rounded-md'>
            {errors.submit}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !vehicle}
          className='w-full h-10 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          {isSubmitting ? "Booking..." : "Book Service"}
        </button>
      </main>
    </div>
  );
};
