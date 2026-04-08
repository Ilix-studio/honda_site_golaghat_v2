import {
  useGetAvailableBikesQuery,
  useAssignBikeToCustomerMutation,
} from "@/redux-store/services/admin/bikeManagementApi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setVehicleCompleted } from "@/redux-store/slices/setupProgressSlice";
import { selectCustomerAuth } from "@/redux-store/slices/customer/customerAuthSlice";
import {
  Search,
  Filter,
  X,
  Bike,
  Gauge,
  Zap,
  Palette,
  CreditCard,
  MapPin,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

interface BikeFilters {
  page: number;
  limit: number;
  search: string;
  category?: string;
}

// ─── Helper: Format currency ─────────────────────────────────────────────
const formatCurrency = (amount?: number) => {
  if (amount == null) return "—";
  return `₹${amount.toLocaleString("en-IN")}`;
};

// ─── Bike Detail Modal (integrates CustomerVehicleDetail layout) ─────────
const BikeDetailModal = ({
  bike,
  onClose,
  onAssign,
  isAssigning,
}: {
  bike: any;
  onClose: () => void;
  onAssign: () => void;
  isAssigning: boolean;
}) => {
  if (!bike) return null;

  const InfoRow = ({
    label,
    value,
    icon: Icon,
  }: {
    label: string;
    value: React.ReactNode;
    icon?: React.ElementType;
  }) => (
    <div className='flex items-start gap-3 py-2.5'>
      {Icon && (
        <div className='w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5'>
          <Icon className='w-4 h-4 text-gray-500' />
        </div>
      )}
      <div className='min-w-0 flex-1'>
        <p className='text-xs text-gray-500 font-medium'>{label}</p>
        <p className='text-sm text-gray-900 mt-0.5'>{value || "—"}</p>
      </div>
    </div>
  );

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className='bg-white border border-gray-200 rounded-lg p-5'>
      <h3 className='text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-100'>
        {title}
      </h3>
      <div className='divide-y divide-gray-50'>{children}</div>
    </div>
  );

  const primaryImage =
    bike.images?.find((img: any) => img.isPrimary) || bike.images?.[0];
  const otherImages =
    bike.images?.filter((img: any) => img !== primaryImage) || [];

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-start justify-center p-4'>
      <div className='relative bg-gray-50 rounded-2xl w-full max-w-3xl my-8 shadow-2xl'>
        {/* Header */}
        <div className='sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 px-5 py-4 flex items-center justify-between'>
          <div>
            <h2 className='text-lg font-bold text-gray-900'>
              {bike.modelName}
            </h2>
            <p className='text-xs text-gray-500'>{bike.mainCategory}</p>
          </div>
          <button
            onClick={onClose}
            className='p-2 rounded-full hover:bg-gray-100 transition-colors'
          >
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        {/* Content */}
        <div className='p-5 space-y-5 max-h-[calc(100vh-120px)] overflow-y-auto'>
          {/* Images */}
          {(primaryImage || otherImages.length > 0) && (
            <Section title='Images'>
              <div className='grid grid-cols-2 gap-4'>
                {primaryImage && (
                  <div className='col-span-2 sm:col-span-1'>
                    <div className='w-full h-48 bg-gray-100 rounded-lg overflow-hidden'>
                      <img
                        src={primaryImage.src}
                        alt={primaryImage.alt || "Primary"}
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <p className='text-xs text-gray-500 mt-1 text-center'>
                      {primaryImage.alt || "Primary Image"}
                    </p>
                  </div>
                )}
                {otherImages.slice(0, 3).map((img: any, idx: number) => (
                  <div key={idx} className='col-span-2 sm:col-span-1'>
                    <div className='w-full h-48 bg-gray-100 rounded-lg overflow-hidden'>
                      <img
                        src={img.src}
                        alt={img.alt || `Image ${idx + 1}`}
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <p className='text-xs text-gray-500 mt-1 text-center truncate'>
                      {img.alt || `Image ${idx + 1}`}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Key Specifications */}
          <Section title='Specifications'>
            <InfoRow label='Model' value={bike.modelName} icon={Bike} />
            <InfoRow label='Category' value={bike.mainCategory} />
            <InfoRow label='Variant' value={bike.variants?.[0]?.name} />
            <InfoRow label='Color Options' value={bike.colors?.join(", ")} />
            <InfoRow label='Year' value={bike.year} />
            <InfoRow
              label='Engine Capacity'
              value={`${bike.engineSize} cc`}
              icon={Gauge}
            />
            <InfoRow label='Power' value={`${bike.power} HP`} icon={Zap} />
            <InfoRow
              label='Mileage'
              value={bike.mileage ? `${bike.mileage} km/l` : "—"}
            />
            <InfoRow label='Fuel Type' value={bike.fuelType || "Petrol"} />
          </Section>

          {/* Pricing Breakdown */}
          {bike.priceBreakdown && (
            <Section title='Pricing'>
              <InfoRow
                label='Ex-Showroom Price'
                value={formatCurrency(bike.priceBreakdown.exShowroomPrice)}
                icon={CreditCard}
              />
              <InfoRow
                label='RTO + Registration'
                value={formatCurrency(bike.priceBreakdown.rtoCharges)}
              />
              <InfoRow
                label='Insurance'
                value={formatCurrency(bike.priceBreakdown.insuranceCost)}
              />
              <InfoRow
                label='On-Road Price'
                value={formatCurrency(bike.priceBreakdown.onRoadPrice)}
              />
            </Section>
          )}

          {/* Stock & Location */}
          <Section title='Availability'>
            <InfoRow
              label='Stock Available'
              value={`${bike.stockAvailable} unit(s)`}
              icon={MapPin}
            />
            {bike.location && (
              <InfoRow label='Location' value={bike.location} />
            )}
          </Section>
        </div>

        {/* Footer */}
        <div className='sticky bottom-0 bg-white border-t border-gray-200 px-5 py-4 rounded-b-2xl flex gap-3'>
          <button
            onClick={onClose}
            className='flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors'
          >
            Close
          </button>
          <button
            onClick={onAssign}
            disabled={isAssigning}
            className='flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isAssigning ? "Assigning..." : "Assign to Me"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────
const CustomerVehicleInfo = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { customer, isAuthenticated } = useAppSelector(selectCustomerAuth);
  const [assignBikeToCustomer, { isLoading: isAssigning }] =
    useAssignBikeToCustomerMutation();

  const [filters, setFilters] = useState<BikeFilters>({
    page: 1,
    limit: 9,
    search: "",
  });
  const [selectedBike, setSelectedBike] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error, refetch } =
    useGetAvailableBikesQuery(filters);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 9, search: "" });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAssignVehicle = async (bikeId: string) => {
    if (!customer?.id || !isAuthenticated) {
      toast.error("Customer not authenticated");
      return;
    }
    try {
      await assignBikeToCustomer({
        bikeId,
        assignmentData: {
          customerId: customer.id,
          purchaseDate: new Date().toISOString(),
        },
      }).unwrap();
      toast.success("Vehicle assigned successfully!");
      dispatch(setVehicleCompleted(true));
      navigate("/customer/initialize", { state: { vehicleCompleted: true } });
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to assign vehicle");
    }
  };

  // Loading skeleton cards
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='animate-pulse'>
            <div className='h-10 bg-gray-200 rounded-lg w-48 mb-6' />
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className='bg-white rounded-2xl shadow-sm overflow-hidden'
                >
                  <div className='h-48 bg-gray-200' />
                  <div className='p-5 space-y-3'>
                    <div className='h-5 bg-gray-200 rounded w-3/4' />
                    <div className='h-4 bg-gray-200 rounded w-1/2' />
                    <div className='grid grid-cols-2 gap-2'>
                      <div className='h-8 bg-gray-200 rounded' />
                      <div className='h-8 bg-gray-200 rounded' />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <div className='bg-white rounded-2xl shadow-xl p-8 max-w-md text-center'>
          <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
          <h3 className='text-xl font-bold text-gray-900 mb-2'>
            Unable to Load Vehicles
          </h3>
          <p className='text-gray-600 mb-6'>
            Please check your connection and try again.
          </p>
          <button
            onClick={() => refetch()}
            className='px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const bikes = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10'>
        {/* Header */}
        <div className='mb-8'>
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <div>
                <h1 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                  Available Vehicles
                </h1>
                <p className='text-gray-500 text-sm mt-1'>
                  Choose your ride from our collection
                </p>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors sm:hidden'
              >
                <Filter className='w-4 h-4' />
                Filters
              </button>
            </div>

            {/* Filters - Desktop always, Mobile togglable */}
            <div
              className={`mt-5 ${showFilters ? "block" : "hidden sm:block"}`}
            >
              <div className='flex flex-col sm:flex-row gap-4'>
                <div className='flex-1'>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                    <input
                      type='text'
                      name='search'
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder='Search by model, engine, or stock ID...'
                      className='w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                </div>
                <div className='sm:w-48'>
                  <select
                    name='category'
                    value={filters.category || ""}
                    onChange={handleFilterChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500'
                  >
                    <option value=''>All Categories</option>
                    <option value='bike'>Motorcycle</option>
                    <option value='scooter'>Scooter</option>
                  </select>
                </div>
                <button
                  onClick={clearFilters}
                  className='px-4 py-2 text-gray-600 hover:text-gray-900 underline text-sm'
                >
                  Clear filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Grid */}
        {bikes.length === 0 ? (
          <div className='bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100'>
            <Bike className='w-12 h-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-gray-900'>
              No vehicles found
            </h3>
            <p className='text-gray-500 mt-1'>
              Try adjusting your search or filters.
            </p>
            <button
              onClick={clearFilters}
              className='mt-4 text-blue-600 hover:underline'
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {bikes.map((bike: any) => {
              const primaryImage =
                bike.images?.find((img: any) => img.isPrimary) ||
                bike.images?.[0];
              const categoryLabel =
                bike.mainCategory === "scooter" ? "Scooter" : "Motorcycle";
              const categoryColor =
                bike.mainCategory === "scooter"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-100 text-blue-700";

              return (
                <div
                  key={bike._id}
                  className='group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200'
                >
                  {/* Image */}
                  <div className='relative h-48 sm:h-52 overflow-hidden bg-gray-100'>
                    {primaryImage ? (
                      <img
                        src={primaryImage.src}
                        alt={primaryImage.alt || bike.modelName}
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center'>
                        <Bike className='w-12 h-12 text-gray-400' />
                      </div>
                    )}
                    <div className='absolute top-3 left-3'>
                      <span
                        className={`${categoryColor} text-xs font-medium px-2.5 py-1 rounded-full shadow-sm`}
                      >
                        {categoryLabel}
                      </span>
                    </div>
                    {bike.stockAvailable > 0 && (
                      <div className='absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md'>
                        In Stock
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className='p-5 space-y-3'>
                    <div>
                      <h3 className='text-xl font-bold text-gray-900 line-clamp-1'>
                        {bike.modelName}
                      </h3>
                      <p className='text-sm text-gray-500 mt-0.5'>
                        {bike.variants?.[0]?.name || "Standard"}
                      </p>
                    </div>

                    {/* Specs chips */}
                    <div className='flex flex-wrap gap-2'>
                      <div className='flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg text-xs'>
                        <Gauge className='w-3 h-3 text-blue-500' />
                        <span>{bike.engineSize} cc</span>
                      </div>
                      <div className='flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg text-xs'>
                        <Zap className='w-3 h-3 text-amber-500' />
                        <span>{bike.power} HP</span>
                      </div>
                      <div className='flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg text-xs'>
                        <Palette className='w-3 h-3 text-purple-500' />
                        <span>{bike.colors?.length || 0} colors</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className='pt-2'>
                      <p className='text-xs text-gray-500'>On-Road Price</p>
                      <p className='text-xl font-bold text-gray-900'>
                        {formatCurrency(bike.priceBreakdown?.onRoadPrice)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className='flex gap-2 pt-2'>
                      <button
                        onClick={() => setSelectedBike(bike)}
                        className='flex-1 flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded-xl transition-colors'
                      >
                        <Eye className='w-4 h-4' />
                        <span className='text-sm'>Details</span>
                      </button>
                      <button
                        onClick={() => handleAssignVehicle(bike._id)}
                        disabled={isAssigning}
                        className='flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-xl transition-colors disabled:opacity-50'
                      >
                        {isAssigning ? "Assigning..." : "Assign"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className='mt-8 flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100'>
            <div className='text-sm text-gray-600'>
              Showing {bikes.length} of {pagination.total} vehicles
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                className='p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>
              <span className='px-3 py-1 text-sm text-gray-700'>
                Page {filters.page} of {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page >= pagination.pages}
                className='p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50'
              >
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedBike && (
        <BikeDetailModal
          bike={selectedBike}
          onClose={() => setSelectedBike(null)}
          onAssign={() => {
            setSelectedBike(null);
            handleAssignVehicle(selectedBike._id);
          }}
          isAssigning={isAssigning}
        />
      )}
    </div>
  );
};

export default CustomerVehicleInfo;
