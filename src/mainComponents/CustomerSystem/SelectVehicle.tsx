import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bike,
  Search,
  Loader2,
  CheckCircle,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
} from "lucide-react";
import { useGetBikesQuery } from "@/redux-store/services/BikeSystemApi/bikeApi";
import {
  useAssignBikeToCustomerMutation,
  BikeImage,
} from "@/redux-store/services/admin/bikeManagementApi";
import { useAppSelector } from "@/hooks/redux";
import { selectCustomerAuth } from "@/redux-store/slices/customer/customerAuthSlice";

interface BikeFilters {
  page: number;
  limit: number;
  search: string;
  category?: string;
}

const SelectVehicle = () => {
  const navigate = useNavigate();
  const { customer, isAuthenticated, firebaseToken } =
    useAppSelector(selectCustomerAuth);

  const [filters, setFilters] = useState<BikeFilters>({
    page: 1,
    limit: 12,
    search: "",
  });

  const [selectedBike, setSelectedBike] = useState<any>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    registrationDate: "",
    numberPlate: "",
    registeredOwnerName: "",
    purchaseDate: "",
  });

  const { data, isLoading, error, refetch } = useGetBikesQuery(filters);
  const [assignBikeToCustomer, { isLoading: isAssigning }] =
    useAssignBikeToCustomerMutation();

  useEffect(() => {
    if (!isAuthenticated || !customer || !firebaseToken) {
      navigate("/customer/login", { replace: true });
    }
  }, [isAuthenticated, customer, firebaseToken, navigate]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleAssignBike = async () => {
    try {
      if (!selectedBike || !customer?.id) {
        toast.error("Please select a bike and ensure you're logged in");
        return;
      }

      const assignmentData = {
        customerId: customer.id,
        registrationDate:
          assignmentForm.registrationDate ||
          new Date().toISOString().split("T")[0],
        numberPlate: assignmentForm.numberPlate,
        registeredOwnerName:
          assignmentForm.registeredOwnerName ||
          `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim(),
        purchaseDate: assignmentForm.purchaseDate || new Date().toISOString(),
      };

      await assignBikeToCustomer({
        bikeId: selectedBike._id,
        assignmentData,
      }).unwrap();

      toast.success("Vehicle assigned successfully!");
      setShowAssignModal(false);
      setSelectedBike(null);
      setAssignmentForm({
        registrationDate: "",
        numberPlate: "",
        registeredOwnerName: "",
        purchaseDate: "",
      });
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to assign vehicle");
    }
  };

  const openAssignModal = (bike: any) => {
    setSelectedBike(bike);
    setShowAssignModal(true);
  };

  if (error) {
    toast.error("Failed to load available bikes");
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => navigate(-1)}
              className='w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors'
            >
              <ArrowLeft className='w-4 h-4 text-gray-600' />
            </button>
            <div className='flex-1'>
              <h1 className='text-xl font-semibold text-gray-900'>
                Select Your Vehicle
              </h1>
              <p className='text-sm text-gray-600'>
                Choose from available bikes and scooters
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto p-6'>
        {/* Filters */}
        <div className='bg-white p-4 rounded-lg shadow-md mb-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>Search</label>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                <input
                  type='text'
                  name='search'
                  value={filters.search || ""}
                  onChange={handleFilterChange}
                  placeholder='Search by model name...'
                  className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium mb-1'>Category</label>
              <select
                name='category'
                value={filters.category || ""}
                onChange={handleFilterChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              >
                <option value=''>All Categories</option>
                <option value='bike'>Bike</option>
                <option value='scooter'>Scooter</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium mb-1'>
                Results per page
              </label>
              <select
                name='limit'
                value={filters.limit}
                onChange={handleFilterChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>
          </div>

          <button
            onClick={() =>
              setFilters({
                page: 1,
                limit: 12,
                search: "",
              })
            }
            className='mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300'
          >
            Clear Filters
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className='flex items-center justify-center py-12'>
            <div className='flex flex-col items-center gap-3 text-gray-500'>
              <Loader2 className='w-6 h-6 animate-spin' />
              <p className='text-sm'>Loading available bikes...</p>
            </div>
          </div>
        )}

        {/* Bikes Grid */}
        {!isLoading && data && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {data?.data?.bikes?.map((bike) => (
              <Card
                key={bike._id}
                className='hover:shadow-lg transition-shadow cursor-pointer group'
                onClick={() => openAssignModal(bike)}
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1 min-w-0'>
                      <CardTitle className='text-lg text-gray-900 truncate'>
                        {bike.modelName}
                      </CardTitle>
                      <Badge variant='outline' className='mt-1 text-xs'>
                        {bike.mainCategory}
                      </Badge>
                    </div>
                    {bike.stockAvailable > 0 ? (
                      <CheckCircle className='w-5 h-5 text-green-500 flex-shrink-0' />
                    ) : (
                      <div className='w-5 h-5 rounded-full bg-gray-300 flex-shrink-0' />
                    )}
                  </div>
                </CardHeader>
                <CardContent className='pt-0'>
                  <div className='space-y-3'>
                    {/* Bike Image */}
                    <div className='w-full h-32 bg-gray-100 rounded-lg overflow-hidden'>
                      {bike.images && bike.images.length > 0 ? (
                        <img
                          src={
                            bike.images?.find((img: BikeImage) => img.isPrimary)
                              ?.src || bike.images[0].src
                          }
                          alt={
                            bike.images?.find((img: BikeImage) => img.isPrimary)
                              ?.alt ||
                            bike.images[0].alt ||
                            bike.modelName
                          }
                          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                          <Bike className='w-8 h-8 text-gray-400' />
                        </div>
                      )}
                    </div>

                    {/* Bike Details */}
                    <div className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-600'>Engine:</span>
                        <span className='font-medium'>{bike.engineSize}</span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-600'>Power:</span>
                        <span className='font-medium'>{bike.power} HP</span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-600'>Stock:</span>
                        <span
                          className={`font-medium ${
                            bike.stockAvailable > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {bike.stockAvailable} available
                        </span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-600'>Price:</span>
                        <span className='font-bold text-gray-900'>
                          ¥{bike.priceBreakdown?.onRoadPrice?.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Colors */}
                    {bike.colors && bike.colors.length > 0 && (
                      <div className='flex items-center gap-1'>
                        <span className='text-xs text-gray-600'>Colors:</span>
                        <div className='flex gap-1'>
                          {bike.colors
                            .slice(0, 3)
                            .map((color: string, index: number) => (
                              <div
                                key={index}
                                className='w-4 h-4 rounded-full bg-gray-300 border border-gray-200'
                                title={color}
                              />
                            ))}
                          {bike.colors.length > 3 && (
                            <span className='text-xs text-gray-500'>
                              +{bike.colors.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && data && data?.data?.bikes?.length === 0 && (
          <div className='text-center py-12'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Bike className='w-6 h-6 text-gray-400' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              No bikes available
            </h3>
            <p className='text-gray-600 mb-6'>
              Try adjusting your filters or check back later.
            </p>
            <Button onClick={() => refetch()} variant='outline'>
              Refresh
            </Button>
          </div>
        )}

        {/* Pagination */}
        {data?.data?.bikes && data?.data?.bikes?.length > 0 && (
          <div className='mt-8 flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-md'>
            <div className='text-sm text-gray-700'>
              Showing {data?.data?.bikes?.length || 0} of{" "}
              {data?.data?.pagination?.total || 0} bikes
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => handlePageChange(filters.page! - 1)}
                disabled={filters.page === 1}
                className='px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-50'
              >
                Previous
              </button>
              <span className='px-3 py-1 text-sm text-gray-700'>
                Page {filters.page} of {data?.data?.pagination?.pages || 1}
              </span>
              <button
                onClick={() => handlePageChange(filters.page! + 1)}
                disabled={filters.page >= (data?.data?.pagination?.pages || 1)}
                className='px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-50'
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedBike && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md'>
            <div className='flex items-start gap-4 mb-4'>
              <div className='w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0'>
                {selectedBike.images && selectedBike.images.length > 0 ? (
                  <img
                    src={
                      selectedBike.images?.find(
                        (img: BikeImage) => img.isPrimary,
                      )?.src || selectedBike.images[0].src
                    }
                    alt={
                      selectedBike.images?.find(
                        (img: BikeImage) => img.isPrimary,
                      )?.alt ||
                      selectedBike.images[0].alt ||
                      selectedBike.modelName
                    }
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center'>
                    <Bike className='w-8 h-8 text-gray-400' />
                  </div>
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <h3 className='text-lg font-bold text-gray-900 truncate'>
                  {selectedBike.modelName}
                </h3>
                <p className='text-sm text-gray-600'>
                  {selectedBike.mainCategory}
                </p>
                <p className='text-sm font-semibold text-green-600'>
                  ¥{selectedBike.priceBreakdown?.onRoadPrice?.toLocaleString()}
                </p>
              </div>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  <User className='w-4 h-4 inline mr-1' />
                  Registered Owner Name
                </label>
                <input
                  type='text'
                  value={assignmentForm.registeredOwnerName}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      registeredOwnerName: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  placeholder={
                    `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim() ||
                    "Enter owner name"
                  }
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>
                  <MapPin className='w-4 h-4 inline mr-1' />
                  Number Plate
                </label>
                <input
                  type='text'
                  value={assignmentForm.numberPlate}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      numberPlate: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  placeholder='Enter number plate'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>
                  <Calendar className='w-4 h-4 inline mr-1' />
                  Registration Date
                </label>
                <input
                  type='date'
                  value={assignmentForm.registrationDate}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      registrationDate: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>
                  <Calendar className='w-4 h-4 inline mr-1' />
                  Purchase Date
                </label>
                <input
                  type='date'
                  value={assignmentForm.purchaseDate}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      purchaseDate: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                />
              </div>
            </div>

            <div className='flex gap-3 mt-6'>
              <Button
                onClick={handleAssignBike}
                disabled={isAssigning || selectedBike.stockAvailable === 0}
                className='flex-1'
              >
                {isAssigning ? "Assigning..." : "Assign Vehicle"}
              </Button>
              <Button
                onClick={() => setShowAssignModal(false)}
                variant='outline'
                className='flex-1'
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectVehicle;
