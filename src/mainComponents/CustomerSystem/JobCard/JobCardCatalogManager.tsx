import { useState } from "react";
import toast from "react-hot-toast";
import {
  useListCatalogItemsQuery,
  useUpdateCatalogItemMutation,
  useDeleteCatalogItemMutation,
  CatalogItemResponse,
} from "@/redux-store/services/ServiceM/jobCardCatalogApi";
import { LINE_ITEM_TYPES, LineItemType } from "@/types/jobCard.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Wrench,
  Package,
  Scissors,
  FileText,
  Loader2,
  ToggleLeft,
  ToggleRight,
  X,
  Check,
} from "lucide-react";
import JobCardCatalogCreate from "./JobCardCatalogCreate";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_ICON: Record<LineItemType, React.ReactNode> = {
  labour: <Wrench className='w-3.5 h-3.5' />,
  part: <Package className='w-3.5 h-3.5' />,
  accessory: <Scissors className='w-3.5 h-3.5' />,
  custom: <FileText className='w-3.5 h-3.5' />,
};

const TYPE_COLOR: Record<LineItemType, string> = {
  labour: "bg-blue-50 text-blue-700 border-blue-200",
  part: "bg-orange-50 text-orange-700 border-orange-200",
  accessory: "bg-purple-50 text-purple-700 border-purple-200",
  custom: "bg-gray-50 text-gray-600 border-gray-200",
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

// ─── Inline edit row ──────────────────────────────────────────────────────────

interface EditRowProps {
  item: CatalogItemResponse;
  onSave: (id: string, body: Partial<CatalogItemResponse>) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

function EditRow({ item, onSave, onCancel, saving }: EditRowProps) {
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description ?? "");
  const [price, setPrice] = useState(String(item.defaultUnitPrice));
  const [tax, setTax] = useState(String(item.defaultTaxRate));

  const handleSave = () => {
    if (!name.trim()) return toast.error("Name is required");
    const p = Number(price);
    if (isNaN(p) || p < 0) return toast.error("Invalid price");
    const t = Number(tax);
    if (isNaN(t) || t < 0 || t > 100) return toast.error("Tax must be 0–100");
    onSave(item._id, {
      name: name.trim(),
      description: description.trim() || undefined,
      defaultUnitPrice: p,
      defaultTaxRate: t,
    });
  };

  return (
    <tr className='bg-amber-50/60 border-y border-amber-200'>
      <td className='px-3 py-2' colSpan={2}>
        <div className='space-y-1.5'>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='h-8 text-xs rounded-lg border border-gray-200 px-3 w-full bg-white outline-none focus:ring-2 focus:ring-amber-200'
            placeholder='Name'
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className='h-8 text-xs rounded-lg border border-gray-200 px-3 w-full bg-white outline-none focus:ring-2 focus:ring-amber-200'
            placeholder='Description (optional)'
          />
        </div>
      </td>
      <td className='px-3 py-2'>
        <div className='relative w-28'>
          <span className='absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400'>
            ₹
          </span>
          <input
            type='number'
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className='h-8 text-xs rounded-lg border border-gray-200 pl-6 pr-2 w-full bg-white outline-none focus:ring-2 focus:ring-amber-200'
          />
        </div>
      </td>
      <td className='px-3 py-2'>
        <div className='relative w-20'>
          <input
            type='number'
            min={0}
            max={100}
            value={tax}
            onChange={(e) => setTax(e.target.value)}
            className='h-8 text-xs rounded-lg border border-gray-200 px-2 pr-6 w-full bg-white outline-none focus:ring-2 focus:ring-amber-200'
          />
          <span className='absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400'>
            %
          </span>
        </div>
      </td>
      <td className='px-3 py-2' />
      <td className='px-3 py-2'>
        <div className='flex items-center gap-1 justify-end'>
          <button
            onClick={handleSave}
            disabled={saving}
            className='w-7 h-7 rounded-lg flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-600 transition-colors'
          >
            {saving ? (
              <Loader2 className='w-3.5 h-3.5 animate-spin' />
            ) : (
              <Check className='w-3.5 h-3.5' />
            )}
          </button>
          <button
            onClick={onCancel}
            className='w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors'
          >
            <X className='w-3.5 h-3.5' />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Delete confirm row ───────────────────────────────────────────────────────

function DeleteRow({
  item,
  onConfirm,
  onCancel,
  deleting,
}: {
  item: CatalogItemResponse;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <tr className='bg-red-50/60 border-y border-red-200'>
      <td className='px-4 py-3' colSpan={5}>
        <div className='flex items-center gap-3'>
          <Trash2 className='w-4 h-4 text-red-400 shrink-0' />
          <p className='text-xs text-gray-700 flex-1'>
            Delete <strong className='text-gray-900'>{item.name}</strong>? This
            cannot be undone.
          </p>
        </div>
      </td>
      <td className='px-3 py-3'>
        <div className='flex items-center gap-1 justify-end'>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className='h-7 px-3 rounded-lg text-[11px] font-bold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 transition-colors'
          >
            {deleting ? <Loader2 className='w-3 h-3 animate-spin' /> : "Delete"}
          </button>
          <button
            onClick={onCancel}
            className='w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors'
          >
            <X className='w-3.5 h-3.5' />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type View = "list" | "create";

export default function JobCardCatalogManager() {
  const [view, setView] = useState<View>("list");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<LineItemType | "all">("all");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useListCatalogItemsQuery({
    itemType: typeFilter === "all" ? undefined : typeFilter,
    includeInactive,
  });

  const [updateCatalogItem, { isLoading: updating }] =
    useUpdateCatalogItemMutation();
  const [deleteCatalogItem, { isLoading: deleting }] =
    useDeleteCatalogItemMutation();

  const items = (data?.data ?? []).filter((item) =>
    search
      ? item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
      : true,
  );

  const handleSave = async (id: string, body: Partial<CatalogItemResponse>) => {
    try {
      await updateCatalogItem({ id, body }).unwrap();
      toast.success("Item updated");
      setEditingId(null);
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Failed to update");
    }
  };

  const handleToggleActive = async (item: CatalogItemResponse) => {
    try {
      await updateCatalogItem({
        id: item._id,
        body: { isActive: !item.isActive },
      }).unwrap();
      toast.success(item.isActive ? "Item deactivated" : "Item activated");
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCatalogItem(id).unwrap();
      toast.success("Item deleted");
      setDeletingId(null);
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Failed to delete");
    }
  };

  // ── Create view ───────────────────────────────────────────────────────────

  if (view === "create") {
    return (
      <div className='border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm p-6'>
        <JobCardCatalogCreate
          onCreated={() => setView("list")}
          onCancel={() => setView("list")}
        />
      </div>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────

  return (
    <div className='border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm p-5'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <div>
          <h2 className='text-lg font-black text-gray-900'>Job Card Catalog</h2>
          <p className='text-xs text-gray-400 mt-px'>
            {data?.count ?? 0} items · branch-scoped
          </p>
        </div>
        <Button
          onClick={() => setView("create")}
          className='h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold gap-1.5 border-0 shadow-sm w-fit'
        >
          <Plus className='w-3.5 h-3.5' />
          New Item
        </Button>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap items-center gap-2 mt-4'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400' />
          <Input
            placeholder='Search items...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-9 h-9 text-sm rounded-xl w-56 border-gray-200'
          />
        </div>

        <div className='flex items-center gap-1.5 flex-wrap'>
          {(["all", ...LINE_ITEM_TYPES] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`h-8 px-3 rounded-full text-xs font-semibold border transition-all capitalize ${
                typeFilter === t
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIncludeInactive((p) => !p)}
          className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold border transition-all ${
            includeInactive
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
          }`}
        >
          {includeInactive ? (
            <ToggleRight className='w-3.5 h-3.5' />
          ) : (
            <ToggleLeft className='w-3.5 h-3.5' />
          )}
          Show inactive
        </button>
      </div>

      {/* Table */}
      <div className='rounded-2xl border border-gray-200 bg-white overflow-hidden mt-4'>
        {isLoading ? (
          <div className='flex items-center justify-center py-16'>
            <Loader2 className='w-5 h-5 text-gray-300 animate-spin' />
          </div>
        ) : items.length === 0 ? (
          <div className='text-center py-16 text-gray-400'>
            <Package className='w-8 h-8 mx-auto mb-2 text-gray-200' />
            <p className='text-sm font-medium'>No catalog items found</p>
            <button
              onClick={() => setView("create")}
              className='mt-2 text-xs text-red-500 font-semibold hover:underline'
            >
              Add first item →
            </button>
          </div>
        ) : (
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-gray-100 bg-gray-50'>
                {["Item", "Type", "Unit Price", "Tax", "Status", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className='px-4 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wide'
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {items.map((item) => {
                if (editingId === item._id) {
                  return (
                    <EditRow
                      key={item._id}
                      item={item}
                      onSave={handleSave}
                      onCancel={() => setEditingId(null)}
                      saving={updating}
                    />
                  );
                }
                if (deletingId === item._id) {
                  return (
                    <DeleteRow
                      key={item._id}
                      item={item}
                      onConfirm={() => handleDelete(item._id)}
                      onCancel={() => setDeletingId(null)}
                      deleting={deleting}
                    />
                  );
                }
                return (
                  <tr
                    key={item._id}
                    className={`hover:bg-gray-50 transition-colors ${
                      !item.isActive ? "opacity-50" : ""
                    }`}
                  >
                    <td className='px-4 py-3'>
                      <p className='font-semibold text-gray-900 text-xs'>
                        {item.name}
                      </p>
                      {item.description && (
                        <p className='text-[11px] text-gray-400 mt-px truncate max-w-[200px]'>
                          {item.description}
                        </p>
                      )}
                    </td>

                    <td className='px-4 py-3'>
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${TYPE_COLOR[item.itemType]}`}
                      >
                        {TYPE_ICON[item.itemType]}
                        {item.itemType}
                      </span>
                    </td>

                    <td className='px-4 py-3 text-xs font-semibold text-gray-900'>
                      {fmt(item.defaultUnitPrice)}
                    </td>

                    <td className='px-4 py-3 text-xs text-gray-500'>
                      {item.defaultTaxRate}%
                    </td>

                    <td className='px-4 py-3'>
                      <Badge
                        variant='outline'
                        className={
                          item.isActive
                            ? "text-green-600 border-green-200 bg-green-50 text-[10px]"
                            : "text-gray-400 border-gray-200 text-[10px]"
                        }
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>

                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-1 justify-end'>
                        <button
                          onClick={() => handleToggleActive(item)}
                          title={item.isActive ? "Deactivate" : "Activate"}
                          className='w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors'
                        >
                          {item.isActive ? (
                            <ToggleRight className='w-4 h-4 text-green-500' />
                          ) : (
                            <ToggleLeft className='w-4 h-4' />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(null);
                            setEditingId(item._id);
                          }}
                          title='Edit'
                          className='w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors'
                        >
                          <Pencil className='w-3.5 h-3.5' />
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setDeletingId(item._id);
                          }}
                          title='Delete'
                          className='w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors'
                        >
                          <Trash2 className='w-3.5 h-3.5' />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
