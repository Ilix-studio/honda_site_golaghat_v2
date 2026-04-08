import React, { useState } from "react";
import {
  useGetAvailableBikesQuery,
  useAssignBikeToCustomerMutation,
  useUpdateBikeStockMutation,
} from "@/redux-store/services/admin/bikeManagementApi";
import { toast } from "react-hot-toast";

interface BikeFilters {
  page: number;
  limit: number;
  search: string;
  category?: string;
}

const AdminBikeManagement = () => {
  const [filters, setFilters] = useState<BikeFilters>({
    page: 1,
    limit: 10,
    search: "",
  });

  const [selectedBike, setSelectedBike] = useState<any>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);

  const { data, isLoading, error, refetch } =
    useGetAvailableBikesQuery(filters);
  const [assignBikeToCustomer, { isLoading: isAssigning }] =
    useAssignBikeToCustomerMutation();
  const [updateBikeStock, { isLoading: isUpdatingStock }] =
    useUpdateBikeStockMutation();

  const [assignmentForm, setAssignmentForm] = useState({
    customerId: "",
    registrationDate: "",
    numberPlate: "",
    registeredOwnerName: "",
    purchaseDate: "",
  });

  const [stockForm, setStockForm] = useState({
    stockAvailable: 0,
  });

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
      if (!selectedBike || !assignmentForm.customerId) {
        toast.error("Please fill all required fields");
        return;
      }

      await assignBikeToCustomer({
        bikeId: selectedBike._id,
        assignmentData: assignmentForm,
      }).unwrap();

      toast.success("Bike assigned successfully!");
      setShowAssignModal(false);
      setAssignmentForm({
        customerId: "",
        registrationDate: "",
        numberPlate: "",
        registeredOwnerName: "",
        purchaseDate: "",
      });
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to assign bike");
    }
  };

  const handleUpdateStock = async () => {
    try {
      if (!selectedBike) return;

      await updateBikeStock({
        bikeId: selectedBike._id,
        stockAvailable: stockForm.stockAvailable,
      }).unwrap();

      toast.success("Stock updated successfully!");
      setShowStockModal(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update stock");
    }
  };

  const openAssignModal = (bike: any) => {
    setSelectedBike(bike);
    setShowAssignModal(true);
  };

  const openStockModal = (bike: any) => {
    setSelectedBike(bike);
    setStockForm({ stockAvailable: bike.stockAvailable });
    setShowStockModal(true);
  };

  if (error) {
    toast.error("Failed to load bikes");
  }

  return (
    <div className='max-w-7xl mx-auto p-6'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Bike Management</h1>
        <button
          onClick={() => refetch()}
          className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className='bg-white p-4 rounded-lg shadow-md mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Search</label>
            <input
              type='text'
              name='search'
              value={filters.search || ""}
              onChange={handleFilterChange}
              placeholder='Search by model name...'
              className='w-full px-3 py-2 border border-gray-300 rounded-md'
            />
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
            <label className='block text-sm font-medium mb-1'>Limit</label>
            <select
              name='limit'
              value={filters.limit}
              onChange={handleFilterChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md'
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <button
          onClick={() =>
            setFilters({
              page: 1,
              limit: 10,
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
        <div className='bg-white rounded-lg shadow-md p-8 text-center'>
          <p className='text-gray-500'>Loading bikes...</p>
        </div>
      )}

      {/* Bikes Table */}
      {!isLoading && data && (
        <>
          <div className='bg-white rounded-lg shadow-md overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      ID
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Model
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Category
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Specs
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Stock
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Price
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {data?.data?.map((bike: any) => (
                    <tr key={bike._id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {bike._id.slice(-8)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-medium text-gray-900'>
                          {bike.modelName}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {bike.colors?.join(", ")} - {bike.variants?.[0]?.name}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {bike.mainCategory}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-xs text-gray-600'>
                          <div>Engine: {bike.engineSize}</div>
                          <div>Power: {bike.power} HP</div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {bike.stockAvailable} in stock
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        ¥{bike.priceBreakdown.onRoadPrice?.toLocaleString()}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <div className='flex gap-2'>
                          <button
                            onClick={() => openAssignModal(bike)}
                            disabled={isAssigning || bike.stockAvailable === 0}
                            className='px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50'
                          >
                            Assign
                          </button>
                          <button
                            onClick={() => openStockModal(bike)}
                            disabled={isUpdatingStock}
                            className='px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50'
                          >
                            Stock
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {data?.data && data?.data?.length > 0 && (
            <div className='mt-6 flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-md'>
              <div className='text-sm text-gray-700'>
                Showing {data?.data?.length || 0} of{" "}
                {data?.pagination?.total || 0} bikes
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
                  Page {filters.page} of {data?.pagination?.pages || 1}
                </span>
                <button
                  onClick={() => handlePageChange(filters.page! + 1)}
                  disabled={filters.page >= (data?.pagination?.pages || 1)}
                  className='px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-50'
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && data && data?.data?.length === 0 && (
        <div className='bg-white rounded-lg shadow-md p-8 text-center'>
          <p className='text-gray-500'>No bikes found</p>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedBike && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md'>
            <h3 className='text-lg font-bold mb-4'>
              Assign Bike: {selectedBike.modelName}
            </h3>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Customer ID *
                </label>
                <input
                  type='text'
                  value={assignmentForm.customerId}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      customerId: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  placeholder='Enter customer ID'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>
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
                  placeholder='Enter owner name'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>
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
              <button
                onClick={handleAssignBike}
                disabled={isAssigning || !assignmentForm.customerId}
                className='flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50'
              >
                {isAssigning ? "Assigning..." : "Assign Bike"}
              </button>
              <button
                onClick={() => setShowAssignModal(false)}
                className='flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Modal */}
      {showStockModal && selectedBike && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md'>
            <h3 className='text-lg font-bold mb-4'>
              Update Stock: {selectedBike.modelName}
            </h3>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Current Stock: {selectedBike.stockAvailable}
                </label>
                <label className='block text-sm font-medium mb-1'>
                  New Stock *
                </label>
                <input
                  type='number'
                  min='0'
                  value={stockForm.stockAvailable}
                  onChange={(e) =>
                    setStockForm({
                      ...stockForm,
                      stockAvailable: parseInt(e.target.value) || 0,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  placeholder='Enter new stock count'
                />
              </div>
            </div>

            <div className='flex gap-3 mt-6'>
              <button
                onClick={handleUpdateStock}
                disabled={isUpdatingStock}
                className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50'
              >
                {isUpdatingStock ? "Updating..." : "Update Stock"}
              </button>
              <button
                onClick={() => setShowStockModal(false)}
                className='flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBikeManagement;
