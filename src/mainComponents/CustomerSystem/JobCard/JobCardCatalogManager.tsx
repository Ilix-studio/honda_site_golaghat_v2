import { useState } from "react";
import toast from "react-hot-toast";
import {
  useCreateCatalogItemMutation,
  useListCatalogItemsQuery,
  useUpdateCatalogItemMutation,
  useDeleteCatalogItemMutation,
  CatalogItemResponse,
} from "@/redux-store/services/ServiceM/jobCardCatalogApi";
import { LINE_ITEM_TYPES, LineItemType } from "@/types/jobCard.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_ICON: Record<LineItemType, React.ReactNode> = {
  labour:    <Wrench className="w-3.5 h-3.5" />,
  part:      <Package className="w-3.5 h-3.5" />,
  accessory: <Scissors className="w-3.5 h-3.5" />,
  custom:    <FileText className="w-3.5 h-3.5" />,
};

const TYPE_COLOR: Record<LineItemType, string> = {
  labour:    "bg-blue-50 text-blue-700 border-blue-200",
  part:      "bg-orange-50 text-orange-700 border-orange-200",
  accessory: "bg-purple-50 text-purple-700 border-purple-200",
  custom:    "bg-gray-50 text-gray-600 border-gray-200",
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

// ─── Form State ───────────────────────────────────────────────────────────────

interface CatalogForm {
  itemType: LineItemType;
  name: string;
  description: string;
  defaultUnitPrice: string;
  defaultTaxRate: string;
}

const EMPTY_FORM: CatalogForm = {
  itemType: "labour",
  name: "",
  description: "",
  defaultUnitPrice: "",
  defaultTaxRate: "18",
};

// ─── Modal ────────────────────────────────────────────────────────────────────

const Modal = ({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl">
        {children}
      </div>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function JobCardCatalogManager() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<LineItemType | "all">("all");
  const [includeInactive, setIncludeInactive] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<CatalogItemResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogItemResponse | null>(null);
  const [form, setForm] = useState<CatalogForm>(EMPTY_FORM);

  const { data, isLoading } = useListCatalogItemsQuery({
    itemType: typeFilter === "all" ? undefined : typeFilter,
    includeInactive,
  });

  const [createCatalogItem, { isLoading: creating }] = useCreateCatalogItemMutation();
  const [updateCatalogItem, { isLoading: updating }] = useUpdateCatalogItemMutation();
  const [deleteCatalogItem, { isLoading: deleting }] = useDeleteCatalogItemMutation();

  const items = (data?.data ?? []).filter((item) =>
    search
      ? item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
      : true,
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setCreateOpen(true);
  };

  const openEdit = (item: CatalogItemResponse) => {
    setForm({
      itemType: item.itemType,
      name: item.name,
      description: item.description ?? "",
      defaultUnitPrice: String(item.defaultUnitPrice),
      defaultTaxRate: String(item.defaultTaxRate),
    });
    setEditItem(item);
  };

  const validateForm = (): string | null => {
    if (!form.name.trim()) return "Name is required";
    const price = Number(form.defaultUnitPrice);
    if (isNaN(price) || price < 0) return "Enter a valid unit price";
    const tax = Number(form.defaultTaxRate);
    if (isNaN(tax) || tax < 0 || tax > 100) return "Tax rate must be 0–100";
    return null;
  };

  const handleCreate = async () => {
    const err = validateForm();
    if (err) return toast.error(err);
    try {
      await createCatalogItem({
        itemType: form.itemType,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        defaultUnitPrice: Number(form.defaultUnitPrice),
        defaultTaxRate: Number(form.defaultTaxRate),
      }).unwrap();
      toast.success("Catalog item created");
      setCreateOpen(false);
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Failed to create item");
    }
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    const err = validateForm();
    if (err) return toast.error(err);
    try {
      await updateCatalogItem({
        id: editItem._id,
        body: {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          defaultUnitPrice: Number(form.defaultUnitPrice),
          defaultTaxRate: Number(form.defaultTaxRate),
        },
      }).unwrap();
      toast.success("Item updated");
      setEditItem(null);
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Failed to update item");
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCatalogItem(deleteTarget._id).unwrap();
      toast.success("Item deleted");
      setDeleteTarget(null);
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Failed to delete");
    }
  };

  // ── Form Dialog ────────────────────────────────────────────────────────────

  const FormDialog = ({
    open,
    onClose,
    onSubmit,
    busy,
    title,
  }: {
    open: boolean;
    onClose: () => void;
    onSubmit: () => void;
    busy: boolean;
    title: string;
  }) => (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
        <h2 className="text-base font-black text-gray-900">{title}</h2>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 px-5 py-4">
        {/* Item Type */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-600">Item Type</Label>
          <select
            value={form.itemType}
            onChange={(e) =>
              setForm((p) => ({ ...p, itemType: e.target.value as LineItemType }))
            }
            className="h-9 text-sm rounded-xl border border-gray-200 px-3 w-full bg-white"
          >
            {LINE_ITEM_TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Name */}
<div className="space-y-1.5">
  <Label className="text-xs font-semibold text-gray-600">
    Name <span className="text-red-500">*</span>
  </Label>
  <input
    value={form.name}
    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
    placeholder="e.g. Engine Oil Change"
    maxLength={200}
    className="h-9 text-sm rounded-xl border border-gray-200 px-3 w-full bg-white outline-none focus:ring-2 focus:ring-gray-200"
  />
</div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-600">
            Description{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </Label>
          <Input
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Brief description..."
            maxLength={500}
            className="h-9 text-sm rounded-xl"
          />
        </div>

        {/* Price + Tax */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-600">
              Unit Price (₹) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              min={0}
              value={form.defaultUnitPrice}
              onChange={(e) => setForm((p) => ({ ...p, defaultUnitPrice: e.target.value }))}
              placeholder="0"
              className="h-9 text-sm rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-600">Tax Rate (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={form.defaultTaxRate}
              onChange={(e) => setForm((p) => ({ ...p, defaultTaxRate: e.target.value }))}
              className="h-9 text-sm rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 px-5 pb-5">
        <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={busy}
          className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : title}
        </Button>
      </div>
    </Modal>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm p-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-gray-900">Job Card Catalog</h2>
          <p className="text-xs text-gray-400 mt-px">
            {data?.count ?? 0} items · branch-scoped
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold gap-1.5 border-0 shadow-sm w-fit"
        >
          <Plus className="w-3.5 h-3.5" />
          New Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm rounded-xl w-56 border-gray-200"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
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
            <ToggleRight className="w-3.5 h-3.5" />
          ) : (
            <ToggleLeft className="w-3.5 h-3.5" />
          )}
          Show inactive
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package className="w-8 h-8 mx-auto mb-2 text-gray-200" />
            <p className="text-sm font-medium">No catalog items found</p>
            <button
              onClick={openCreate}
              className="mt-2 text-xs text-red-500 font-semibold hover:underline"
            >
              Add first item →
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Item", "Type", "Unit Price", "Tax", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr
                  key={item._id}
                  className={`hover:bg-gray-50 transition-colors ${!item.isActive ? "opacity-50" : ""}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900 text-xs">{item.name}</p>
                    {item.description && (
                      <p className="text-[11px] text-gray-400 mt-px truncate max-w-[200px]">
                        {item.description}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${TYPE_COLOR[item.itemType]}`}
                    >
                      {TYPE_ICON[item.itemType]}
                      {item.itemType}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-xs font-semibold text-gray-900">
                    {fmt(item.defaultUnitPrice)}
                  </td>

                  <td className="px-4 py-3 text-xs text-gray-500">
                    {item.defaultTaxRate}%
                  </td>

                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={
                        item.isActive
                          ? "text-green-600 border-green-200 bg-green-50 text-[10px]"
                          : "text-gray-400 border-gray-200 text-[10px]"
                      }
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => handleToggleActive(item)}
                        title={item.isActive ? "Deactivate" : "Activate"}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        {item.isActive ? (
                          <ToggleRight className="w-4 h-4 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => openEdit(item)}
                        title="Edit"
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteTarget(item)}
                        title="Delete"
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create dialog */}
      <FormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        busy={creating}
        title="Create Item"
      />

      {/* Edit dialog */}
      <FormDialog
        open={!!editItem}
        onClose={() => setEditItem(null)}
        onSubmit={handleUpdate}
        busy={updating}
        title="Update Item"
      />

      {/* Delete confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <div className="p-5">
          <h2 className="text-base font-black text-gray-900 mb-1">Delete Item</h2>
          <p className="text-sm text-gray-500">
            Delete <strong className="text-gray-800">{deleteTarget?.name}</strong>? This
            cannot be undone. Job cards using this item are unaffected.
          </p>
          <div className="flex justify-end gap-2 mt-5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}