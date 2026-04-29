import { formatCurrency } from "@/lib/formatters";
import {
  useGetAllVASQuery,
  useUpdateVASMutation,
  useDeleteVASMutation,
  IValueAddedService,
  UpdateVASRequest,
} from "@/redux-store/services/BikeSystemApi2/VASApi";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Shield,
  X,
  Trash2,
  Pencil,
} from "lucide-react";

interface VASFilters {
  page?: number;
  limit?: number;
  serviceType?: string;
  isActive?: boolean;
  search?: string;
}

// Cycle through accent colors per card
const CARD_ACCENTS = [
  {
    bar: "from-red-500 to-orange-400",
    price: "text-red-600",
    chip: "bg-red-50 text-red-600",
  },
  {
    bar: "from-blue-500 to-violet-500",
    price: "text-blue-600",
    chip: "bg-blue-50 text-blue-600",
  },
  {
    bar: "from-emerald-500 to-teal-400",
    price: "text-emerald-600",
    chip: "bg-emerald-50 text-emerald-600",
  },
  {
    bar: "from-amber-500 to-yellow-400",
    price: "text-amber-600",
    chip: "bg-amber-50 text-amber-600",
  },
  {
    bar: "from-violet-500 to-purple-400",
    price: "text-violet-600",
    chip: "bg-violet-50 text-violet-600",
  },
  {
    bar: "from-cyan-500 to-sky-400",
    price: "text-cyan-700",
    chip: "bg-cyan-50 text-cyan-700",
  },
];

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
  const [updateVAS, { isLoading: isUpdating }] = useUpdateVASMutation();
  const [deleteVAS, { isLoading: isDeleting }] = useDeleteVASMutation();

  const [editingVAS, setEditingVAS] = useState<IValueAddedService | null>(null);
  const [editForm, setEditForm] = useState<UpdateVASRequest>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openEditModal = (vas: IValueAddedService) => {
    setEditingVAS(vas);
    setEditForm({
      serviceName: vas.serviceName,
      coverageYears: vas.coverageYears,
      priceStructure: { basePrice: vas.priceStructure.basePrice },
      benefits: vas.benefits,
      applicableBranches: vas.applicableBranches,
      isActive: vas.isActive,
    });
  };

  const closeEditModal = () => {
    setEditingVAS(null);
    setEditForm({});
  };

  const handleUpdate = async () => {
    if (!editingVAS) return;
    try {
      await updateVAS({ id: editingVAS._id, data: editForm }).unwrap();
      toast.success("Service updated successfully");
      closeEditModal();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to update service");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVAS(id).unwrap();
      toast.success("Service deleted successfully");
      setDeleteConfirmId(null);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to delete service");
    }
  };

  const handleFilterChange = (newFilters: Partial<VASFilters>) =>
    setFilters((prev) => ({ ...prev, ...newFilters }));

  const handlePageChange = (newPage: number) =>
    setFilters((prev) => ({ ...prev, page: newPage }));

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center py-20 gap-3'>
        <div className='h-9 w-9 animate-spin rounded-full border-2 border-red-600 border-t-transparent' />
        <p className='text-sm text-gray-500'>Loading services…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='m-6 rounded-2xl border border-red-100 bg-red-50 p-6'>
        <h3 className='font-semibold text-red-800 mb-1'>Failed to load VAS</h3>
        <p className='text-sm text-red-600 mb-4'>
          {error && "data" in error
            ? String((error as any).data?.message)
            : "Unknown error"}
        </p>
        <button
          onClick={() => refetch()}
          className='rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700'
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className='p-6 space-y-5'>
        {/* ── header ── */}
        <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-red-500 to-orange-500 p-5 text-white shadow-md'>
          <div className='pointer-events-none absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white/10' />
          <div className='relative flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/20'>
                <Shield className='h-5 w-5 text-white' />
              </div>
              <div>
                <h2 className='text-lg font-bold'>Value Added Services</h2>
                <p className='text-xs text-red-100'>
                  {vasData?.total ?? 0} services total
                </p>
              </div>
            </div>
            <button
              onClick={() => refetch()}
              className='inline-flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 text-sm font-semibold backdrop-blur-sm hover:bg-white/30 transition-colors'
            >
              <RefreshCw className='h-3.5 w-3.5' />
              Refresh
            </button>
          </div>
        </div>

        {/* ── filters ── */}
        <div className='rounded-2xl border border-gray-100 bg-gray-50/60 p-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400' />
              <input
                type='text'
                placeholder='Search services…'
                className='w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400'
                onChange={(e) =>
                  handleFilterChange({ search: e.target.value, page: 1 })
                }
              />
            </div>
            <select
              className='w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400'
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
            <select
              className='w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400'
              value={filters.limit}
              onChange={(e) =>
                handleFilterChange({ limit: Number(e.target.value), page: 1 })
              }
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n} per page
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* results summary */}
        {vasData && (
          <p className='text-xs text-gray-400'>
            Showing{" "}
            <span className='font-semibold text-gray-700'>{vasData.count}</span>{" "}
            of{" "}
            <span className='font-semibold text-gray-700'>{vasData.total}</span>{" "}
            services &nbsp;·&nbsp; Page {vasData.currentPage} of {vasData.pages}
          </p>
        )}

        {/* ── cards ── */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
          {vasData?.data?.map((vas, i) => {
            const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
            return (
              <div
                key={vas._id}
                className='relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-200'
              >
                {/* gradient top bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${accent.bar}`} />

                <div className='p-5 flex flex-col gap-4'>
                  {/* title + status */}
                  <div className='flex items-start justify-between gap-2'>
                    <h3 className='text-sm font-bold text-gray-900 leading-snug flex-1'>
                      {vas.serviceName}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold shrink-0 ${
                        vas.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {vas.isActive ? (
                        <CheckCircle2 className='h-3 w-3' />
                      ) : (
                        <XCircle className='h-3 w-3' />
                      )}
                      {vas.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* price + coverage */}
                  <div className='flex items-center gap-3'>
                    <div
                      className={`rounded-xl px-3 py-1.5 text-sm font-bold ${accent.chip}`}
                    >
                      {formatCurrency(vas.priceStructure.basePrice)}
                    </div>
                    <span className='text-xs text-gray-400'>
                      {vas.coverageYears}{" "}
                      {vas.coverageYears === 1 ? "year" : "years"} coverage
                    </span>
                  </div>

                  {/* benefits */}
                  {vas.benefits && vas.benefits.length > 0 && (
                    <ul className='space-y-1'>
                      {vas.benefits.slice(0, 3).map((b, idx) => (
                        <li
                          key={idx}
                          className='flex items-start gap-1.5 text-xs text-gray-600'
                        >
                          <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5' />
                          {b}
                        </li>
                      ))}
                      {vas.benefits.length > 3 && (
                        <li
                          className={`text-xs font-semibold ${accent.chip.split(" ")[1]}`}
                        >
                          +{vas.benefits.length - 3} more
                        </li>
                      )}
                    </ul>
                  )}

                  {/* actions */}
                  <div className='flex gap-2 pt-3 border-t border-gray-50'>
                    <button
                      onClick={() => openEditModal(vas)}
                      className='flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gray-900 py-2 text-xs font-semibold text-white hover:bg-gray-700 transition-colors'
                    >
                      <Pencil className='h-3.5 w-3.5' />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(vas._id)}
                      className='flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors'
                    >
                      <Trash2 className='h-3.5 w-3.5' />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* empty */}
        {vasData?.data?.length === 0 && (
          <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 gap-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100'>
              <Search className='h-5 w-5 text-gray-400' />
            </div>
            <p className='text-sm font-semibold text-gray-700'>
              No services found
            </p>
            <p className='text-xs text-gray-400'>
              Try adjusting your filters or search terms.
            </p>
          </div>
        )}

        {/* ── pagination ── */}
        {vasData && vasData.pages > 1 && (
          <div className='flex items-center justify-center gap-2'>
            <button
              onClick={() => handlePageChange(vasData.currentPage - 1)}
              disabled={vasData.currentPage === 1}
              className='px-3 py-1.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'
            >
              ← Prev
            </button>
            <div className='flex gap-1'>
              {Array.from({ length: Math.min(5, vasData.pages) }, (_, i) => {
                const page = Math.max(1, vasData.currentPage - 2) + i;
                if (page > vasData.pages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 rounded-xl text-sm font-semibold transition-colors ${
                      page === vasData.currentPage
                        ? "bg-red-600 text-white"
                        : "border border-gray-200 hover:bg-gray-50 text-gray-700"
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
              className='px-3 py-1.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── edit modal ── */}
      {editingVAS && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
              <div className='flex items-center gap-2.5'>
                <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-gray-900'>
                  <Pencil className='h-3.5 w-3.5 text-white' />
                </div>
                <h3 className='text-base font-bold text-gray-900'>
                  Edit Value Added Service
                </h3>
              </div>
              <button
                onClick={closeEditModal}
                className='flex h-8 w-8 items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors'
              >
                <X className='h-4 w-4' />
              </button>
            </div>
            <div className='p-6 space-y-4'>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide'>
                  Service Name
                </label>
                <input
                  type='text'
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400'
                  value={editForm.serviceName || ""}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, serviceName: e.target.value }))
                  }
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide'>
                    Coverage Years
                  </label>
                  <input
                    type='number'
                    min={1}
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400'
                    value={editForm.coverageYears ?? ""}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        coverageYears: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide'>
                    Base Price (₹)
                  </label>
                  <input
                    type='number'
                    min={0}
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400'
                    value={editForm.priceStructure?.basePrice ?? ""}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        priceStructure: { basePrice: Number(e.target.value) },
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide'>
                  Benefits (one per line)
                </label>
                <textarea
                  rows={5}
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 resize-none'
                  value={(editForm.benefits || []).join("\n")}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      benefits: e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    }))
                  }
                />
              </div>
              <label className='inline-flex items-center gap-2 cursor-pointer'>
                <input
                  id='isActive'
                  type='checkbox'
                  className='h-4 w-4 rounded accent-red-600'
                  checked={editForm.isActive ?? false}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, isActive: e.target.checked }))
                  }
                />
                <span className='text-sm font-medium text-gray-700'>
                  Active
                </span>
              </label>
            </div>
            <div className='flex justify-end gap-3 px-6 py-4 border-t border-gray-100'>
              <button
                onClick={closeEditModal}
                disabled={isUpdating}
                className='px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50'
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className='px-4 py-2 text-sm font-semibold bg-gray-900 text-white rounded-xl hover:bg-gray-700 disabled:opacity-50 transition-colors'
              >
                {isUpdating ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── delete confirm modal ── */}
      {deleteConfirmId && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl shadow-2xl max-w-sm w-full'>
            <div className='p-6 flex flex-col items-center text-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100'>
                <Trash2 className='h-5 w-5 text-red-600' />
              </div>
              <h3 className='text-base font-bold text-gray-900'>
                Delete Service?
              </h3>
              <p className='text-sm text-gray-500'>
                This action cannot be undone. The VAS record will be permanently
                removed.
              </p>
            </div>
            <div className='flex gap-3 px-6 pb-6'>
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className='flex-1 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50'
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isDeleting}
                className='flex-1 py-2 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors'
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster position='top-center' reverseOrder={false} />
    </>
  );
};

export default ViewVAS;
