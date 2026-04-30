import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Search, Filter, X, UserCheck } from "lucide-react";
import {
  StockConceptFilters,
  useGetAllStockItemsQuery,
} from "@/redux-store/services/BikeSystemApi2/StockConceptApi";

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> =
  {
    Available: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    Sold: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    Reserved: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-400",
    },
    Service: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      dot: "bg-purple-500",
    },
    Damaged: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
    Transit: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  };

const ViewStockConcept = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<StockConceptFilters>({
    page: 1,
    limit: 10,
    search: "",
  });

  const { data, isLoading, error } = useGetAllStockItemsQuery(filters);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => setFilters({ page: 1, limit: 10, search: "" });

  const getStatusBadge = (status: string) => {
    const cfg = STATUS_CONFIG[status] ?? {
      bg: "bg-gray-100",
      text: "text-gray-600",
      dot: "bg-gray-400",
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
        {status}
      </span>
    );
  };

  if (error) toast.error("Failed to load stock items");

  const hasActiveFilters =
    filters.search || filters.status || filters.category || filters.location;

  return (
    <div className='p-6 space-y-5'>
      {/* ── filters ── */}
      <div className='rounded-2xl border border-gray-100 bg-gray-50/60 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
          {/* search */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400' />
            <input
              type='text'
              name='search'
              value={filters.search || ""}
              onChange={handleFilterChange}
              placeholder='Stock ID, model, engine…'
              className='w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400'
            />
          </div>

          {/* status */}
          <div className='relative'>
            <Filter className='absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none' />
            <select
              name='status'
              value={filters.status || ""}
              onChange={handleFilterChange}
              className='w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400'
            >
              <option value=''>All Status</option>
              {Object.keys(STATUS_CONFIG).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* category */}
          <select
            name='category'
            value={filters.category || ""}
            onChange={handleFilterChange}
            className='w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400'
          >
            <option value=''>All Categories</option>
            <option value='Bike'>Bike</option>
            <option value='Scooty'>Scooty</option>
          </select>

          {/* location */}
          <select
            name='location'
            value={filters.location || ""}
            onChange={handleFilterChange}
            className='w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400'
          >
            <option value=''>All Locations</option>
            <option value='Showroom'>Showroom</option>
            <option value='Warehouse'>Warehouse</option>
            <option value='Service Center'>Service Center</option>
            <option value='Customer'>Customer</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className='mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700'
          >
            <X className='h-3.5 w-3.5' />
            Clear filters
          </button>
        )}
      </div>

      {/* ── loading ── */}
      {isLoading && (
        <div className='flex flex-col items-center justify-center py-16 gap-3'>
          <div className='h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent' />
          <p className='text-sm text-gray-500'>Loading stock items…</p>
        </div>
      )}

      {/* ── table ── */}
      {!isLoading && data && (
        <>
          <div className='rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm'>
            <div className='overflow-x-auto'>
              <table className='min-w-full'>
                <thead>
                  <tr className='bg-gradient-to-r from-gray-900 to-gray-800'>
                    {[
                      "Stock ID",
                      "Model",
                      "Category",
                      "Engine / Chassis",
                      "Status",
                      "Location",
                      "Price",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className='px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300'
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-50'>
                  {data.data.map((stock, i) => (
                    <tr
                      key={stock._id}
                      className={`transition-colors hover:bg-red-50/30 ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                      }`}
                    >
                      <td className='px-5 py-4 whitespace-nowrap'>
                        <span className='inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-mono font-semibold text-gray-700'>
                          {stock.stockId}
                        </span>
                      </td>
                      <td className='px-5 py-4 whitespace-nowrap'>
                        <p className='text-sm font-semibold text-gray-900'>
                          {stock.modelName}
                        </p>
                        <p className='text-xs text-gray-400 mt-0.5'>
                          {stock.color} · {stock.variant}
                        </p>
                      </td>
                      <td className='px-5 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${
                            stock.category === "Bike"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-violet-50 text-violet-700"
                          }`}
                        >
                          {stock.category}
                        </span>
                      </td>
                      <td className='px-5 py-4 whitespace-nowrap'>
                        <p className='text-xs text-gray-500 font-mono leading-relaxed'>
                          <span className='text-gray-400'>E:</span>{" "}
                          {stock.engineNumber}
                          <br />
                          <span className='text-gray-400'>C:</span>{" "}
                          {stock.chassisNumber}
                        </p>
                      </td>
                      <td className='px-5 py-4 whitespace-nowrap'>
                        {getStatusBadge(stock.stockStatus.status)}
                      </td>
                      <td className='px-5 py-4 whitespace-nowrap'>
                        <span className='inline-flex items-center rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700'>
                          {stock.stockStatus.location}
                        </span>
                      </td>
                      <td className='px-5 py-4 whitespace-nowrap text-sm font-bold text-gray-900'>
                        ₹{stock.priceInfo.onRoadPrice.toLocaleString()}
                      </td>
                      <td className='px-5 py-4 whitespace-nowrap'>
                        {stock.stockStatus.status === "Available" && (
                          <button
                            onClick={() =>
                              navigate(`/assign/stock-concept/${stock._id}`)
                            }
                            className='inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors'
                          >
                            <UserCheck className='h-3.5 w-3.5' />
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

          {/* ── pagination ── */}
          <div className='flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-5 py-3 shadow-sm'>
            <p className='text-sm text-gray-500'>
              Showing{" "}
              <span className='font-semibold text-gray-900'>{data.count}</span>{" "}
              of{" "}
              <span className='font-semibold text-gray-900'>{data.total}</span>{" "}
              results
            </p>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => handlePageChange(filters.page! - 1)}
                disabled={filters.page === 1}
                className='px-3 py-1.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
              >
                ← Prev
              </button>
              <span className='px-3 py-1.5 rounded-xl bg-red-600 text-white text-sm font-semibold'>
                {filters.page} / {data.pages}
              </span>
              <button
                onClick={() => handlePageChange(filters.page! + 1)}
                disabled={filters.page === data.pages}
                className='px-3 py-1.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── empty ── */}
      {!isLoading && data && data.data.length === 0 && (
        <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 gap-3'>
          <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100'>
            <Search className='h-5 w-5 text-gray-400' />
          </div>
          <p className='text-sm font-medium text-gray-600'>
            No stock items found
          </p>
          <button
            onClick={clearFilters}
            className='text-xs text-red-600 hover:underline'
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewStockConcept;
