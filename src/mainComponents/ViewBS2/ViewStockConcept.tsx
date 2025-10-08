import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  StockConceptFilters,
  useGetAllStockItemsQuery,
} from "@/redux-store/services/BikeSystemApi2/StockConceptApi";

const ViewStockConcept = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<StockConceptFilters>({
    page: 1,
    limit: 10,
    search: "",
  });

  const { data, isLoading, error } = useGetAllStockItemsQuery(filters);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1, // Reset to first page on filter change
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      Available: "bg-green-100 text-green-800",
      Sold: "bg-blue-100 text-blue-800",
      Reserved: "bg-yellow-100 text-yellow-800",
      Service: "bg-purple-100 text-purple-800",
      Damaged: "bg-red-100 text-red-800",
      Transit: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusColors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  if (error) {
    toast.error("Failed to load stock items");
  }

  return (
    <div className='max-w-7xl mx-auto p-6'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Stock Concept</h1>
        <button
          onClick={() => navigate("/admin/stock-concept")}
          className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
        >
          Add Stock Item
        </button>
      </div>

      {/* Filters */}
      <div className='bg-white p-4 rounded-lg shadow-md mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Search</label>
            <input
              type='text'
              name='search'
              value={filters.search || ""}
              onChange={handleFilterChange}
              placeholder='Search by stock ID, model, engine...'
              className='w-full px-3 py-2 border border-gray-300 rounded-md'
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>Status</label>
            <select
              name='status'
              value={filters.status || ""}
              onChange={handleFilterChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md'
            >
              <option value=''>All Status</option>
              <option value='Available'>Available</option>
              <option value='Sold'>Sold</option>
              <option value='Reserved'>Reserved</option>
              <option value='Service'>Service</option>
              <option value='Damaged'>Damaged</option>
              <option value='Transit'>Transit</option>
            </select>
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
              <option value='Bike'>Bike</option>
              <option value='Scooty'>Scooty</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>Location</label>
            <select
              name='location'
              value={filters.location || ""}
              onChange={handleFilterChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md'
            >
              <option value=''>All Locations</option>
              <option value='Showroom'>Showroom</option>
              <option value='Warehouse'>Warehouse</option>
              <option value='Service Center'>Service Center</option>
              <option value='Customer'>Customer</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setFilters({ page: 1, limit: 10, search: "" })}
          className='mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300'
        >
          Clear Filters
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className='text-center py-8'>
          <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          <p className='mt-2 text-gray-600'>Loading stock items...</p>
        </div>
      )}

      {/* Stock Table */}
      {!isLoading && data && (
        <>
          <div className='bg-white rounded-lg shadow-md overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Stock ID
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Model Name
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Category
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Engine/Chassis
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Location
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
                  {data.data.map((stock) => (
                    <tr key={stock._id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {stock.stockId}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-medium text-gray-900'>
                          {stock.modelName}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {stock.color} - {stock.variant}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {stock.category}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-xs text-gray-600'>
                          <div>E: {stock.engineNumber}</div>
                          <div>C: {stock.chassisNumber}</div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        {getStatusBadge(stock.stockStatus.status)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {stock.stockStatus.location}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        ₹{stock.priceInfo.onRoadPrice.toLocaleString()}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        {stock.stockStatus.status === "Available" && (
                          <button
                            onClick={() =>
                              navigate(`/assign/stock-concept/${stock._id}`)
                            }
                            className='text-green-600 hover:text-green-900'
                          >
                            Assign
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className='mt-6 flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-md'>
            <div className='text-sm text-gray-700'>
              Showing {data.count} of {data.total} results
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => handlePageChange(filters.page! - 1)}
                disabled={filters.page === 1}
                className='px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
              >
                Previous
              </button>
              <span className='px-3 py-1 bg-blue-50 text-blue-600 rounded-md'>
                Page {filters.page} of {data.pages}
              </span>
              <button
                onClick={() => handlePageChange(filters.page! + 1)}
                disabled={filters.page === data.pages}
                className='px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && data && data.data.length === 0 && (
        <div className='bg-white rounded-lg shadow-md p-8 text-center'>
          <p className='text-gray-500'>No stock items found</p>
        </div>
      )}
    </div>
  );
};

export default ViewStockConcept;
