import { formatCurrency } from "@/lib/formatters";
import { useGetAllVASQuery } from "@/redux-store/services/BikeSystemApi2/VASApi";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

interface VASFilters {
  page?: number;
  limit?: number;
  serviceType?: string;
  isActive?: boolean;
  search?: string;
}

const ViewVAS = () => {
  const [filters, setFilters] = useState<VASFilters>({
    page: 1,
    limit: 10,
    isActive: true,
  });

  const {
    data: vasData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAllVASQuery(filters);

  const handleFilterChange = (newFilters: Partial<VASFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleSearch = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center p-8'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='p-6 bg-red-50 border border-red-200 rounded-lg'>
        <h3 className='text-red-800 font-semibold mb-2'>Error Loading VAS</h3>
        <p className='text-red-600 mb-4'>
          {error && "data" in error ? (
            <Toaster position='top-center' reverseOrder={false} />
          ) : (
            "Failed to load Value Added Services"
          )}
        </p>
        <button
          onClick={() => refetch()}
          className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <br />
      <br />
      <div className='p-6 space-y-6'>
        <div className='flex justify-between items-center'>
          <h2 className='text-2xl font-bold text-gray-900'>
            Value Added Services
          </h2>
          <button
            onClick={() => refetch()}
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className='bg-white p-4 rounded-lg border space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            {/* Search */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Search
              </label>
              <input
                type='text'
                placeholder='Search services...'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Status
              </label>
              <select
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                value={filters.isActive?.toString() || "all"}
                onChange={(e) =>
                  handleFilterChange({
                    isActive:
                      e.target.value === "all"
                        ? undefined
                        : e.target.value === "true",
                  })
                }
              >
                <option value='all'>All Status</option>
                <option value='true'>Active</option>
                <option value='false'>Inactive</option>
              </select>
            </div>

            {/* Items per page */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Per Page
              </label>
              <select
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                value={filters.limit}
                onChange={(e) =>
                  handleFilterChange({ limit: Number(e.target.value), page: 1 })
                }
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {vasData && (
          <div className='text-sm text-gray-600'>
            Showing {vasData.count} of {vasData.total} services (Page{" "}
            {vasData.currentPage} of {vasData.pages})
          </div>
        )}

        {/* VAS Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {vasData?.data?.map((vas) => (
            <div
              key={vas._id}
              className='bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow'
            >
              <div className='p-6'>
                <div className='flex justify-between items-start mb-4'>
                  <h3 className='text-lg font-semibold text-gray-900 flex-1'>
                    {vas.serviceName}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      vas.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {vas.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className='space-y-3'>
                  <div>
                    <span className='text-sm font-medium text-gray-700'>
                      Base Price:
                    </span>
                    <span className='ml-2 text-lg font-bold text-blue-600'>
                      {formatCurrency(vas.priceStructure.basePrice)}
                    </span>
                  </div>

                  <div>
                    <span className='text-sm font-medium text-gray-700'>
                      Coverage:
                    </span>
                    <span className='ml-2 text-gray-900'>
                      {vas.coverageYears}{" "}
                      {vas.coverageYears === 1 ? "year" : "years"}
                    </span>
                  </div>

                  {vas.benefits && vas.benefits.length > 0 && (
                    <div>
                      <span className='text-sm font-medium text-gray-700 block mb-1'>
                        Benefits:
                      </span>
                      <ul className='text-sm text-gray-600 space-y-1'>
                        {vas.benefits.slice(0, 3).map((benefit, index) => (
                          <li key={index} className='flex items-start'>
                            <span className='text-green-500 mr-2'>✓</span>
                            <span className='flex-1'>{benefit}</span>
                          </li>
                        ))}
                        {vas.benefits.length > 3 && (
                          <li className='text-blue-600 font-medium'>
                            +{vas.benefits.length - 3} more benefits
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {vasData?.data?.length === 0 && (
          <div className='text-center py-12'>
            <div className='text-gray-400 text-6xl mb-4'>🔍</div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No Services Found
            </h3>
            <p className='text-gray-600'>
              Try adjusting your filters or search terms.
            </p>
          </div>
        )}

        {/* Pagination */}
        {vasData && vasData.pages > 1 && (
          <div className='flex justify-center items-center space-x-2'>
            <button
              onClick={() => handlePageChange(vasData.currentPage - 1)}
              disabled={vasData.currentPage === 1}
              className='px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
            >
              Previous
            </button>

            <div className='flex space-x-1'>
              {Array.from({ length: Math.min(5, vasData.pages) }, (_, i) => {
                const page = Math.max(1, vasData.currentPage - 2) + i;
                if (page > vasData.pages) return null;

                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 border rounded-md ${
                      page === vasData.currentPage
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(vasData.currentPage + 1)}
              disabled={vasData.currentPage === vasData.pages}
              className='px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ViewVAS;
