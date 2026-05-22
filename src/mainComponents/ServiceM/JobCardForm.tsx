import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Plus,
  Wrench,
  ClipboardList,
  FileText,
  CheckCircle2,
  Trash2,
  Send,
  AlertTriangle,
  Loader2,
  ChevronRight,
  User,
  Bike,
  Receipt,
  Clock,
  Ban,
  PackageCheck,
  Search,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  useCreateJobCardMutation,
  useAddLineItemMutation,
  useRemoveLineItemMutation,
  useSendTempBillMutation,
  useAcknowledgeReviewMutation,
  useSendFinalBillMutation,
  useCancelJobCardMutation,
  useListJobCardsQuery,
  useGetJobCardAdminQuery,
  useGetInvoiceAdminQuery,
} from "@/redux-store/services/ServiceM/jobCardApi";
import { useListCatalogItemsQuery } from "@/redux-store/services/ServiceM/jobCardCatalogApi";
import { useGetVehiclesByCustomerQuery } from "@/redux-store/services/BikeSystemApi2/AdminVehicleApi";

import {
  JobCard,
  JobCardStatus,
  JobCardLineItem,
  AddLineItemBody,
  CreateJobCardBody,
  JOB_CARD_STATUS_LABELS,
  MUTABLE_STATUSES,
} from "@/types/jobCard.types";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = "list" | "create" | "detail" | "invoice";
type FilterTab = "all" | "ongoing" | "completed" | "cancelled";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<
  JobCardStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
  temp_bill_sent: {
    label: "Temp Bill",
    className: "bg-amber-50 text-amber-600 border-amber-200",
  },
  customer_reviewed: {
    label: "Reviewed",
    className: "bg-blue-50 text-blue-600 border-blue-200",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-orange-50 text-orange-600 border-orange-200",
  },
  final_bill_sent: {
    label: "Final Bill",
    className: "bg-purple-50 text-purple-600 border-purple-200",
  },
  customer_confirmed: {
    label: "Confirmed",
    className: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  invoice_generated: {
    label: "Invoiced",
    className: "bg-teal-50 text-teal-600 border-teal-200",
  },
  closed: {
    label: "Closed",
    className: "bg-gray-100 text-gray-400 border-gray-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-500 border-red-200",
  },
};

const FILTER_STATUSES: Record<FilterTab, JobCardStatus[]> = {
  all: [],
  ongoing: [
    "draft",
    "temp_bill_sent",
    "customer_reviewed",
    "in_progress",
    "final_bill_sent",
  ],
  completed: ["customer_confirmed", "invoice_generated", "closed"],
  cancelled: ["cancelled"],
};

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Status progress bar ──────────────────────────────────────────────────────

const STATUS_ORDER: JobCardStatus[] = [
  "draft",
  "temp_bill_sent",
  "customer_reviewed",
  "in_progress",
  "final_bill_sent",
  "customer_confirmed",
  "invoice_generated",
  "closed",
];

function StatusProgress({ status }: { status: JobCardStatus }) {
  if (status === "cancelled") {
    return (
      <div className='flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200'>
        <Ban className='w-3.5 h-3.5 text-red-500' />
        <span className='text-xs font-semibold text-red-600'>Cancelled</span>
      </div>
    );
  }
  const idx = STATUS_ORDER.indexOf(status);
  return (
    <div className='flex items-center gap-1'>
      {STATUS_ORDER.map((s, i) => {
        const done = i <= idx;
        const active = i === idx;
        return (
          <div key={s} className='flex items-center gap-1'>
            <div
              className={`h-1.5 rounded-full transition-all ${
                active
                  ? "w-6 bg-red-500"
                  : done
                    ? "w-3 bg-red-400"
                    : "w-3 bg-gray-200"
              }`}
            />
          </div>
        );
      })}
      <span
        className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${STATUS_BADGE[status].className}`}
      >
        {JOB_CARD_STATUS_LABELS[status]}
      </span>
    </div>
  );
}

// ─── Next action button bar ───────────────────────────────────────────────────

interface ActionBarProps {
  card: JobCard;
  onSendTemp: () => void;
  onAcknowledge: () => void;
  onSendFinal: () => void;
  onCancel: () => void;
  onViewInvoice: () => void;
  loading: boolean;
}

function ActionBar({
  card,
  onSendTemp,
  onAcknowledge,
  onSendFinal,
  onCancel,
  onViewInvoice,
  loading,
}: ActionBarProps) {
  const { status } = card;

  return (
    <div className='flex flex-wrap items-center gap-2'>
      {(status === "draft" || status === "customer_reviewed") && (
        <Button
          onClick={onSendTemp}
          disabled={loading}
          size='sm'
          className='h-8 px-3 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-white border-0 gap-1.5'
        >
          <Send className='w-3.5 h-3.5' />
          Send Temp Bill
        </Button>
      )}
      {status === "customer_reviewed" && (
        <Button
          onClick={onAcknowledge}
          disabled={loading}
          size='sm'
          className='h-8 px-3 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white border-0 gap-1.5'
        >
          <PackageCheck className='w-3.5 h-3.5' />
          Start Work
        </Button>
      )}
      {(status === "in_progress" ||
        status === "draft" ||
        status === "customer_reviewed") && (
        <Button
          onClick={onSendFinal}
          disabled={loading}
          size='sm'
          className='h-8 px-3 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white border-0 gap-1.5'
        >
          <CheckCircle2 className='w-3.5 h-3.5' />
          Send Final Bill
        </Button>
      )}
      {(status === "customer_confirmed" || status === "invoice_generated") && (
        <Button
          onClick={onViewInvoice}
          size='sm'
          className='h-8 px-3 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-500 text-white border-0 gap-1.5'
        >
          <Receipt className='w-3.5 h-3.5' />
          View Invoice
        </Button>
      )}
      {![
        "customer_confirmed",
        "invoice_generated",
        "closed",
        "cancelled",
      ].includes(status) && (
        <Button
          onClick={onCancel}
          disabled={loading}
          variant='ghost'
          size='sm'
          className='h-8 px-3 text-xs font-semibold rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 gap-1.5'
        >
          <Ban className='w-3.5 h-3.5' />
          Cancel
        </Button>
      )}
    </div>
  );
}

// ─── Line item row ────────────────────────────────────────────────────────────

function LineItemRow({
  item,
  canRemove,
  onRemove,
  removing,
}: {
  item: JobCardLineItem;
  canRemove: boolean;
  onRemove: () => void;
  removing: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
        item.isRemoved
          ? "opacity-40 bg-gray-50 border-gray-100 line-through"
          : "bg-white border-gray-200"
      }`}
    >
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <span className='text-xs font-bold text-gray-900 truncate'>
            {item.name}
          </span>
          <span className='shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200'>
            {item.itemType}
          </span>
          {item.addedBy === "customer" && (
            <span className='shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-500 border border-blue-200'>
              by customer
            </span>
          )}
        </div>
        {item.description && (
          <p className='text-[11px] text-gray-400 mt-0.5 truncate'>
            {item.description}
          </p>
        )}
        <div className='flex items-center gap-3 mt-1 text-[11px] text-gray-500'>
          <span>Qty: {item.quantity}</span>
          <span>Unit: {fmt(item.unitPrice)}</span>
          {item.discount > 0 && <span>Disc: {item.discount}%</span>}
          <span>GST: {item.taxRate}%</span>
        </div>
      </div>
      <div className='shrink-0 flex items-center gap-2'>
        <span className='text-sm font-black text-gray-900'>
          {fmt(item.lineTotal)}
        </span>
        {canRemove && !item.isRemoved && (
          <button
            onClick={onRemove}
            disabled={removing}
            className='w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50'
          >
            {removing ? (
              <Loader2 className='w-3.5 h-3.5 animate-spin' />
            ) : (
              <Trash2 className='w-3.5 h-3.5' />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Add line item dialog ─────────────────────────────────────────────────────

interface AddLineItemDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (body: AddLineItemBody) => Promise<void>;
  adding: boolean;
  jobCardId: string;
}

function AddLineItemDialog({
  open,
  onClose,
  onAdd,
  adding,
}: AddLineItemDialogProps) {
  const [mode, setMode] = useState<"catalog" | "custom">("catalog");
  const [selectedCatalogId, setSelectedCatalogId] = useState("");
  const [form, setForm] = useState<AddLineItemBody>({
    itemType: "labour",
    name: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    taxRate: 18,
  });

  const { data: catalogData, isLoading: catalogLoading } =
    useListCatalogItemsQuery({});
  const catalog = catalogData?.data ?? [];

  const handleCatalogSelect = (id: string) => {
    setSelectedCatalogId(id);
    const item = catalog.find((c) => c._id === id);
    if (!item) return;
    setForm((p) => ({
      ...p,
      catalogRef: id,
      name: item.name,
      description: item.description ?? "",
      itemType: item.itemType,
      unitPrice: item.defaultUnitPrice,
      taxRate: item.defaultTaxRate,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error("Item name is required");
    if (!form.unitPrice || form.unitPrice <= 0)
      return toast.error("Unit price must be greater than 0");
    await onAdd({
      ...form,
      catalogRef: mode === "catalog" ? selectedCatalogId : undefined,
    });
    setForm({
      itemType: "labour",
      name: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 18,
    });
    setSelectedCatalogId("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='sm:max-w-[500px] rounded-2xl'>
        <DialogHeader>
          <DialogTitle className='text-base font-black text-gray-900'>
            Add Line Item
          </DialogTitle>
        </DialogHeader>

        {/* Mode toggle */}
        <div className='flex gap-2'>
          {(["catalog", "custom"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                mode === m
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              {m === "catalog" ? "From Catalog" : "Custom Item"}
            </button>
          ))}
        </div>

        <div className='space-y-4'>
          {/* Catalog picker */}
          {mode === "catalog" && (
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-gray-600'>
                Select from catalog
              </Label>
              {catalogLoading ? (
                <div className='flex items-center gap-2 py-3 text-sm text-gray-400'>
                  <Loader2 className='w-4 h-4 animate-spin' /> Loading...
                </div>
              ) : (
                <Select
                  value={selectedCatalogId}
                  onValueChange={handleCatalogSelect}
                >
                  <SelectTrigger className='h-9 rounded-xl text-sm border-gray-200'>
                    <SelectValue placeholder='Choose catalog item...' />
                  </SelectTrigger>
                  <SelectContent>
                    {catalog.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        <span className='font-medium'>{item.name}</span>
                        <span className='ml-2 text-gray-400 text-xs'>
                          {fmt(item.defaultUnitPrice)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Fields — always shown, pre-filled from catalog */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='col-span-2 space-y-1.5'>
              <Label className='text-xs font-semibold text-gray-600'>
                Name *
              </Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder='e.g. Engine oil change'
                className='h-9 rounded-xl text-sm border-gray-200'
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-gray-600'>
                Type
              </Label>
              <Select
                value={form.itemType}
                onValueChange={(v: any) =>
                  setForm((p) => ({ ...p, itemType: v }))
                }
              >
                <SelectTrigger className='h-9 rounded-xl text-sm border-gray-200'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["labour", "part", "accessory", "custom"].map((t) => (
                    <SelectItem key={t} value={t} className='capitalize'>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-gray-600'>
                Quantity
              </Label>
              <Input
                type='number'
                min={1}
                value={form.quantity}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    quantity: Math.max(1, Number(e.target.value)),
                  }))
                }
                className='h-9 rounded-xl text-sm border-gray-200'
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-gray-600'>
                Unit Price (₹) *
              </Label>
              <Input
                type='number'
                min={0}
                value={form.unitPrice}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    unitPrice: Math.max(0, Number(e.target.value)),
                  }))
                }
                className='h-9 rounded-xl text-sm border-gray-200'
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-gray-600'>
                Discount (%)
              </Label>
              <Input
                type='number'
                min={0}
                max={100}
                value={form.discount}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    discount: Math.min(
                      100,
                      Math.max(0, Number(e.target.value)),
                    ),
                  }))
                }
                className='h-9 rounded-xl text-sm border-gray-200'
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-gray-600'>
                GST Rate (%)
              </Label>
              <Input
                type='number'
                min={0}
                max={100}
                value={form.taxRate}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    taxRate: Math.min(100, Math.max(0, Number(e.target.value))),
                  }))
                }
                className='h-9 rounded-xl text-sm border-gray-200'
              />
            </div>

            <div className='col-span-2 space-y-1.5'>
              <Label className='text-xs font-semibold text-gray-600'>
                Description (optional)
              </Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder='Short description...'
                className='h-9 rounded-xl text-sm border-gray-200'
              />
            </div>
          </div>

          {/* Live price preview */}
          {form.unitPrice > 0 && (
            <div className='flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 border border-gray-200'>
              <span className='text-xs text-gray-500'>
                Estimated line total
              </span>
              <span className='text-sm font-black text-gray-900'>
                {fmt(
                  form.quantity *
                    form.unitPrice *
                    (1 - (form.discount ?? 0) / 100) *
                    (1 + (form.taxRate ?? 18) / 100),
                )}
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant='ghost'
            onClick={onClose}
            className='rounded-xl text-sm'
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={adding}
            className='rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold gap-1.5 border-0'
          >
            {adding ? (
              <Loader2 className='w-3.5 h-3.5 animate-spin' />
            ) : (
              <Plus className='w-3.5 h-3.5' />
            )}
            Add Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Cancel dialog ────────────────────────────────────────────────────────────

function CancelDialog({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='sm:max-w-[400px] rounded-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-base font-black text-red-600'>
            <AlertTriangle className='w-4 h-4' /> Cancel Job Card
          </DialogTitle>
        </DialogHeader>
        <p className='text-sm text-gray-600'>
          This action cannot be undone. Please provide a reason.
        </p>
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder='Cancellation reason...'
          className='h-9 rounded-xl text-sm border-gray-200'
        />
        <DialogFooter>
          <Button
            variant='ghost'
            onClick={onClose}
            className='rounded-xl text-sm'
          >
            Keep Card
          </Button>
          <Button
            onClick={() => reason.trim() && onConfirm(reason)}
            disabled={loading || !reason.trim()}
            className='rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold border-0'
          >
            {loading ? (
              <Loader2 className='w-3.5 h-3.5 animate-spin' />
            ) : (
              "Confirm Cancel"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW: LIST
// ─────────────────────────────────────────────────────────────────────────────

interface ListViewProps {
  onSelect: (id: string) => void;
  onCreate: () => void;
}

function ListView({ onSelect, onCreate }: ListViewProps) {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const queryStatus = filter === "all" ? undefined : FILTER_STATUSES[filter][0];

  const { data, isLoading } = useListJobCardsQuery({
    status: queryStatus,
    limit: 50,
  });

  const cards: JobCard[] = (data?.data ?? []) as JobCard[];

  const filtered =
    filter === "all"
      ? cards
      : cards.filter((c) => FILTER_STATUSES[filter].includes(c.status));

  const searched = search.trim()
    ? filtered.filter(
        (c) =>
          c.jobCardNumber.toLowerCase().includes(search.toLowerCase()) ||
          c.customer?.phoneNumber?.includes(search) ||
          c.vehicle?.stockConcept?.modelName
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          c.vehicle?.numberPlate?.toLowerCase().includes(search.toLowerCase()),
      )
    : filtered;

  const TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "ongoing", label: "Ongoing" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-black text-gray-900 tracking-tight'>
            Job Cards
          </h2>
          <p className='text-xs text-gray-400 mt-px'>
            {data?.total ?? 0} total · branch-scoped
          </p>
        </div>
        <Button
          onClick={onCreate}
          className='h-9 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold gap-2 border-0 shadow-sm'
        >
          <Plus className='w-4 h-4' />
          New Job Card
        </Button>
      </div>

      {/* Filters + search */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='flex gap-1 p-1 rounded-xl bg-gray-100 border border-gray-200'>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === t.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
              {filter === t.key && (
                <span className='ml-1.5 text-[10px] text-gray-400'>
                  {searched.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className='relative flex-1 max-w-xs'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400' />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search job card, phone, model...'
            className='pl-8 h-9 rounded-xl text-sm border-gray-200'
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className='absolute right-2.5 top-1/2 -translate-y-1/2'
            >
              <X className='w-3.5 h-3.5 text-gray-400' />
            </button>
          )}
        </div>
      </div>

      {/* Card list */}
      {isLoading ? (
        <div className='flex items-center justify-center py-16'>
          <Loader2 className='w-5 h-5 text-gray-400 animate-spin' />
        </div>
      ) : searched.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-16 text-center'>
          <ClipboardList className='w-10 h-10 text-gray-200 mb-3' />
          <p className='text-sm font-semibold text-gray-400'>
            No job cards found
          </p>
          <p className='text-xs text-gray-300 mt-1'>
            {search
              ? "Try a different search term"
              : "Create your first job card"}
          </p>
        </div>
      ) : (
        <div className='space-y-2'>
          {searched.map((card) => {
            const badge = STATUS_BADGE[card.status];
            return (
              <button
                key={card._id}
                onClick={() => onSelect(card._id)}
                className='w-full group flex items-center gap-4 px-4 py-3.5 rounded-xl
                           bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50
                           transition-all duration-150 text-left'
              >
                <div className='shrink-0 w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center group-hover:border-gray-300 transition-colors'>
                  <Wrench className='w-4 h-4 text-gray-400' />
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-black text-gray-900 tracking-tight'>
                      {card.jobCardNumber}
                    </span>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                    {card.priority === "urgent" && (
                      <span className='inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-red-50 text-red-600 border border-red-200'>
                        Urgent
                      </span>
                    )}
                  </div>
                  <div className='flex items-center gap-4 mt-0.5'>
                    <span className='flex items-center gap-1 text-[11px] text-gray-400'>
                      <User className='w-3 h-3' />
                      {card.customer?.phoneNumber ?? "—"}
                    </span>
                    <span className='flex items-center gap-1 text-[11px] text-gray-400'>
                      <Bike className='w-3 h-3' />
                      {card.vehicle?.stockConcept?.modelName ??
                        card.vehicle?.numberPlate ??
                        "—"}
                    </span>
                    <span className='flex items-center gap-1 text-[11px] text-gray-400'>
                      <Clock className='w-3 h-3' />
                      {timeAgo(card.createdAt)}
                    </span>
                  </div>
                </div>

                <div className='shrink-0 text-right'>
                  <p className='text-sm font-black text-gray-900'>
                    {fmt(card.grandTotal)}
                  </p>
                  <p className='text-[11px] text-gray-400 mt-0.5'>
                    {card.lineItems.filter((i) => !i.isRemoved).length} items
                  </p>
                </div>

                <ChevronRight className='shrink-0 w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors' />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW: CREATE
// ─────────────────────────────────────────────────────────────────────────────

interface CreateViewProps {
  onBack: () => void;
  onCreated: (id: string) => void;
}

function CreateView({ onBack, onCreated }: CreateViewProps) {
  const [createJobCard, { isLoading }] = useCreateJobCardMutation();
  const [mode, setMode] = useState<"booking" | "walkin">("walkin");

  const [form, setForm] = useState<CreateJobCardBody>({
    customerId: "",
    vehicleId: "",
    serviceBookingId: "",
    priority: "normal",
    assignedTechnician: "",
    customerRequests: "",
    internalNotes: "",
    physicalChecklist: {
      fuelLevel: 50,
      vehicleCondition: "good",
      paintCondition: "",
      remarks: "",
    },
  });

  // Customer vehicle lookup for walk-in
  const canFetchVehicles =
    mode === "walkin" && !!form.customerId && form.customerId.length === 24;

  const { data: vehicleData, isFetching: vehiclesFetching } =
    useGetVehiclesByCustomerQuery(
      { customerId: form.customerId! },
      { skip: !canFetchVehicles },
    );

  const vehicles = vehicleData?.data ?? [];

  const handleSubmit = async () => {
    const body: CreateJobCardBody = { ...form };

    if (mode === "booking") {
      if (!form.serviceBookingId?.trim()) {
        return toast.error("Service booking ID is required");
      }
      delete body.customerId;
      delete body.vehicleId;
    } else {
      if (!form.customerId?.trim())
        return toast.error("Customer ID is required");
      if (!form.vehicleId?.trim()) return toast.error("Vehicle is required");
      delete body.serviceBookingId;
    }

    try {
      const result = await createJobCard(body).unwrap();
      toast.success(`Job card ${result.data.jobCardNumber} created`);
      onCreated(result.data._id);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to create job card");
    }
  };

  return (
    <div className='space-y-5'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <button
          onClick={onBack}
          className='w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors'
        >
          <ArrowLeft className='w-3.5 h-3.5 text-gray-600' />
        </button>
        <div>
          <h2 className='text-lg font-black text-gray-900 tracking-tight'>
            New Job Card
          </h2>
          <p className='text-xs text-gray-400 mt-px'>
            Fill customer & vehicle details
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
        {/* ── Left: Customer & vehicle ── */}
        <div className='lg:col-span-2 space-y-4'>
          {/* Mode toggle */}
          <div className='p-1 rounded-xl bg-gray-100 border border-gray-200 flex gap-1 w-fit'>
            {(["walkin", "booking"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === m
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {m === "walkin" ? "Walk-in" : "From Booking"}
              </button>
            ))}
          </div>

          {/* Card */}
          <div className='rounded-2xl border border-gray-200 bg-white p-5 space-y-4'>
            <h3 className='text-xs font-black text-gray-500 uppercase tracking-wider'>
              {mode === "walkin" ? "Customer & Vehicle" : "Booking Reference"}
            </h3>

            {mode === "booking" ? (
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold text-gray-600'>
                  Service Booking ID
                </Label>
                <Input
                  value={form.serviceBookingId ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, serviceBookingId: e.target.value }))
                  }
                  placeholder='MongoDB ObjectId from service booking'
                  className='h-9 rounded-xl text-sm border-gray-200 font-mono'
                />
                <p className='text-[11px] text-gray-400'>
                  Customer, vehicle and service type will be pulled from the
                  booking automatically.
                </p>
              </div>
            ) : (
              <>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-semibold text-gray-600'>
                    Customer ID
                  </Label>
                  <Input
                    value={form.customerId ?? ""}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        customerId: e.target.value,
                        vehicleId: "",
                      }))
                    }
                    placeholder='MongoDB ObjectId of the customer'
                    className='h-9 rounded-xl text-sm border-gray-200 font-mono'
                  />
                  <p className='text-[11px] text-gray-400'>
                    Paste the customer _id (24-char hex). Vehicles load
                    automatically.
                  </p>
                </div>

                {/* Vehicle selector */}
                <div className='space-y-1.5'>
                  <Label className='text-xs font-semibold text-gray-600'>
                    Vehicle
                  </Label>
                  {vehiclesFetching ? (
                    <div className='flex items-center gap-2 py-2 text-xs text-gray-400'>
                      <Loader2 className='w-3.5 h-3.5 animate-spin' />
                      Loading vehicles...
                    </div>
                  ) : canFetchVehicles && vehicles.length === 0 ? (
                    <p className='text-xs text-red-500 py-1'>
                      No active vehicles found for this customer.
                    </p>
                  ) : vehicles.length > 0 ? (
                    <div className='space-y-1.5'>
                      {vehicles.map((v) => {
                        const label =
                          (v as any).stockConcept?.modelName ??
                          (v as any).numberPlate ??
                          v._id;
                        return (
                          <label
                            key={v._id}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                              form.vehicleId === v._id
                                ? "border-red-300 bg-red-50"
                                : "border-gray-200 hover:border-gray-300 bg-gray-50"
                            }`}
                          >
                            <input
                              type='radio'
                              name='vehicle'
                              value={v._id}
                              checked={form.vehicleId === v._id}
                              onChange={() =>
                                setForm((p) => ({ ...p, vehicleId: v._id }))
                              }
                              className='accent-red-600'
                            />
                            <div>
                              <p className='text-xs font-bold text-gray-900'>
                                {label}
                              </p>
                              {(v as any).numberPlate && (
                                <p className='text-[11px] text-gray-400'>
                                  {(v as any).numberPlate}
                                </p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <p className='text-[11px] text-gray-400'>
                      Enter a valid customer ID above to load vehicles.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Physical checklist */}
          <div className='rounded-2xl border border-gray-200 bg-white p-5 space-y-4'>
            <h3 className='text-xs font-black text-gray-500 uppercase tracking-wider'>
              Physical Inspection
            </h3>
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold text-gray-600'>
                  Fuel Level ({form.physicalChecklist?.fuelLevel ?? 50}%)
                </Label>
                <input
                  type='range'
                  min={0}
                  max={100}
                  step={5}
                  value={form.physicalChecklist?.fuelLevel ?? 50}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      physicalChecklist: {
                        ...p.physicalChecklist,
                        fuelLevel: Number(e.target.value),
                      },
                    }))
                  }
                  className='w-full accent-red-600'
                />
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold text-gray-600'>
                  Vehicle Condition
                </Label>
                <Select
                  value={form.physicalChecklist?.vehicleCondition ?? "good"}
                  onValueChange={(v: any) =>
                    setForm((p) => ({
                      ...p,
                      physicalChecklist: {
                        ...p.physicalChecklist,
                        vehicleCondition: v,
                      },
                    }))
                  }
                >
                  <SelectTrigger className='h-9 rounded-xl text-sm border-gray-200'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["good", "fair", "poor", "damaged"].map((c) => (
                      <SelectItem key={c} value={c} className='capitalize'>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold text-gray-600'>
                  Paint Condition
                </Label>
                <Input
                  value={form.physicalChecklist?.paintCondition ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      physicalChecklist: {
                        ...p.physicalChecklist,
                        paintCondition: e.target.value,
                      },
                    }))
                  }
                  placeholder='e.g. Minor scratches'
                  className='h-9 rounded-xl text-sm border-gray-200'
                />
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold text-gray-600'>
                  Technician
                </Label>
                <Input
                  value={form.assignedTechnician ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      assignedTechnician: e.target.value,
                    }))
                  }
                  placeholder='Technician name'
                  className='h-9 rounded-xl text-sm border-gray-200'
                />
              </div>

              <div className='col-span-2 space-y-1.5'>
                <Label className='text-xs font-semibold text-gray-600'>
                  Inspection Remarks
                </Label>
                <Input
                  value={form.physicalChecklist?.remarks ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      physicalChecklist: {
                        ...p.physicalChecklist,
                        remarks: e.target.value,
                      },
                    }))
                  }
                  placeholder='Any visible damage or notes...'
                  className='h-9 rounded-xl text-sm border-gray-200'
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Meta + notes ── */}
        <div className='space-y-4'>
          <div className='rounded-2xl border border-gray-200 bg-white p-5 space-y-4'>
            <h3 className='text-xs font-black text-gray-500 uppercase tracking-wider'>
              Job Details
            </h3>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-gray-600'>
                Priority
              </Label>
              <div className='flex gap-2'>
                {(["normal", "urgent"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setForm((f) => ({ ...f, priority: p }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all capitalize ${
                      form.priority === p
                        ? p === "urgent"
                          ? "bg-red-600 text-white border-red-600"
                          : "bg-gray-900 text-white border-gray-900"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-gray-600'>
                Customer Requests
              </Label>
              <textarea
                value={form.customerRequests ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, customerRequests: e.target.value }))
                }
                rows={3}
                placeholder='Verbally stated requests from customer...'
                className='w-full px-3 py-2 rounded-xl text-sm border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400'
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-gray-600'>
                Internal Notes
                <span className='ml-1 text-[10px] text-gray-400'>
                  (not shown to customer)
                </span>
              </Label>
              <textarea
                value={form.internalNotes ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, internalNotes: e.target.value }))
                }
                rows={3}
                placeholder='SA internal notes...'
                className='w-full px-3 py-2 rounded-xl text-sm border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400'
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className='w-full h-10 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm gap-2 border-0 shadow-sm'
          >
            {isLoading ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Plus className='w-4 h-4' />
            )}
            Open Job Card
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW: DETAIL (workspace)
// ─────────────────────────────────────────────────────────────────────────────

interface DetailViewProps {
  jobCardId: string;
  onBack: () => void;
  onViewInvoice: (id: string) => void;
}

function DetailView({ jobCardId, onBack, onViewInvoice }: DetailViewProps) {
  const [addLineItem, { isLoading: adding }] = useAddLineItemMutation();
  const [removeLineItem] = useRemoveLineItemMutation();
  const [sendTempBill, { isLoading: sendingTemp }] = useSendTempBillMutation();
  const [acknowledgeReview, { isLoading: acknowledging }] =
    useAcknowledgeReviewMutation();
  const [sendFinalBill, { isLoading: sendingFinal }] =
    useSendFinalBillMutation();
  const [cancelJobCard, { isLoading: cancelling }] = useCancelJobCardMutation();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useGetJobCardAdminQuery(jobCardId);
  const card = data?.data as JobCard | undefined;

  const isBusy =
    sendingTemp || acknowledging || sendingFinal || cancelling || isFetching;
  const canEdit = card ? MUTABLE_STATUSES.includes(card.status) : false;

  const handleAddItem = useCallback(
    async (body: AddLineItemBody) => {
      try {
        await addLineItem({ id: jobCardId, body }).unwrap();
        toast.success("Item added");
        setAddDialogOpen(false);
      } catch (err: any) {
        toast.error(err?.data?.message ?? "Failed to add item");
      }
    },
    [addLineItem, jobCardId],
  );

  const handleRemoveItem = async (itemId: string) => {
    setRemovingId(itemId);
    try {
      await removeLineItem({ id: jobCardId, itemId }).unwrap();
      toast.success("Item removed");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  const handleSendTemp = async () => {
    try {
      await sendTempBill(jobCardId).unwrap();
      toast.success("Temp bill sent to customer");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to send temp bill");
    }
  };

  const handleAcknowledge = async () => {
    try {
      await acknowledgeReview(jobCardId).unwrap();
      toast.success("Work started");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to acknowledge");
    }
  };

  const handleSendFinal = async () => {
    try {
      await sendFinalBill({ id: jobCardId }).unwrap();
      toast.success("Final bill sent to customer");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to send final bill");
    }
  };

  const handleCancel = async (reason: string) => {
    try {
      await cancelJobCard({
        id: jobCardId,
        cancellationReason: reason,
      }).unwrap();
      toast.success("Job card cancelled");
      setCancelDialogOpen(false);
      onBack();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to cancel");
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-24'>
        <Loader2 className='w-5 h-5 text-gray-400 animate-spin' />
      </div>
    );
  }

  if (!card) {
    return (
      <div className='text-center py-24 text-gray-400 text-sm'>
        Job card not found.
      </div>
    );
  }

  const activeItems = card.lineItems.filter((i) => !i.isRemoved);
  const removedItems = card.lineItems.filter((i) => i.isRemoved);

  return (
    <>
      <div className='space-y-5'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <button
              onClick={onBack}
              className='w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors'
            >
              <ArrowLeft className='w-3.5 h-3.5 text-gray-600' />
            </button>
            <div>
              <h2 className='text-lg font-black text-gray-900 tracking-tight'>
                {card.jobCardNumber}
              </h2>
              <StatusProgress status={card.status} />
            </div>
          </div>

          <ActionBar
            card={card}
            onSendTemp={handleSendTemp}
            onAcknowledge={handleAcknowledge}
            onSendFinal={handleSendFinal}
            onCancel={() => setCancelDialogOpen(true)}
            onViewInvoice={() => onViewInvoice(card._id)}
            loading={isBusy}
          />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
          {/* ── Left: Line items ── */}
          <div className='lg:col-span-2 space-y-4'>
            {/* Line items */}
            <div className='rounded-2xl border border-gray-200 bg-white overflow-hidden'>
              <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100'>
                <div>
                  <h3 className='text-sm font-black text-gray-900'>
                    Line Items
                  </h3>
                  <p className='text-[11px] text-gray-400 mt-px'>
                    {activeItems.length} active
                    {removedItems.length > 0 &&
                      ` · ${removedItems.length} removed`}
                  </p>
                </div>
                {canEdit && (
                  <Button
                    onClick={() => setAddDialogOpen(true)}
                    size='sm'
                    className='h-8 px-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold gap-1.5 border-0'
                  >
                    <Plus className='w-3.5 h-3.5' />
                    Add Item
                  </Button>
                )}
              </div>

              <div className='p-4 space-y-2'>
                {card.lineItems.length === 0 ? (
                  <div className='text-center py-10 text-gray-400'>
                    <FileText className='w-8 h-8 mx-auto mb-2 text-gray-200' />
                    <p className='text-xs font-medium'>No line items yet</p>
                    {canEdit && (
                      <button
                        onClick={() => setAddDialogOpen(true)}
                        className='mt-2 text-xs text-red-500 font-semibold hover:underline'
                      >
                        Add first item →
                      </button>
                    )}
                  </div>
                ) : (
                  card.lineItems.map((item) => (
                    <LineItemRow
                      key={item._id}
                      item={item}
                      canRemove={canEdit}
                      onRemove={() => handleRemoveItem(item._id)}
                      removing={removingId === item._id}
                    />
                  ))
                )}
              </div>

              {/* Totals */}
              {activeItems.length > 0 && (
                <div className='border-t border-gray-100 px-5 py-4 space-y-1.5 bg-gray-50'>
                  <div className='flex justify-between text-xs text-gray-500'>
                    <span>Subtotal</span>
                    <span>{fmt(card.subtotal)}</span>
                  </div>
                  <div className='flex justify-between text-xs text-gray-500'>
                    <span>GST</span>
                    <span>{fmt(card.taxTotal)}</span>
                  </div>
                  <div className='flex justify-between text-sm font-black text-gray-900 pt-1 border-t border-gray-200'>
                    <span>Grand Total</span>
                    <span>{fmt(card.grandTotal)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bill version history */}
            {card.billVersions.length > 0 && (
              <div className='rounded-2xl border border-gray-200 bg-white overflow-hidden'>
                <div className='px-5 py-4 border-b border-gray-100'>
                  <h3 className='text-sm font-black text-gray-900'>
                    Bill History
                  </h3>
                </div>
                <div className='divide-y divide-gray-100'>
                  {card.billVersions.map((v) => (
                    <div
                      key={v.version}
                      className='flex items-center justify-between px-5 py-3'
                    >
                      <div className='flex items-center gap-2'>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${
                            v.billType === "final"
                              ? "bg-purple-50 text-purple-600 border-purple-200"
                              : "bg-amber-50 text-amber-600 border-amber-200"
                          }`}
                        >
                          v{v.version} · {v.billType}
                        </span>
                        <span className='text-[11px] text-gray-400'>
                          {new Date(v.sentAt).toLocaleString("en-IN", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                      <span className='text-sm font-bold text-gray-900'>
                        {fmt(v.grandTotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Info panel ── */}
          <div className='space-y-4'>
            {/* Customer */}
            <div className='rounded-2xl border border-gray-200 bg-white p-5 space-y-3'>
              <h3 className='text-xs font-black text-gray-500 uppercase tracking-wider'>
                Customer
              </h3>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center'>
                  <User className='w-3.5 h-3.5 text-gray-500' />
                </div>
                <div>
                  <p className='text-xs font-bold text-gray-900'>
                    {card.customer?.phoneNumber ?? "—"}
                  </p>
                  <p className='text-[11px] text-gray-400 font-mono'>
                    {(card.customer as any)?._id ?? ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicle */}
            <div className='rounded-2xl border border-gray-200 bg-white p-5 space-y-3'>
              <h3 className='text-xs font-black text-gray-500 uppercase tracking-wider'>
                Vehicle
              </h3>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center'>
                  <Bike className='w-3.5 h-3.5 text-gray-500' />
                </div>
                <div>
                  <p className='text-xs font-bold text-gray-900'>
                    {card.vehicle?.stockConcept?.modelName ?? "Unknown model"}
                  </p>
                  <p className='text-[11px] text-gray-400'>
                    {card.vehicle?.numberPlate ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className='rounded-2xl border border-gray-200 bg-white p-5 space-y-3'>
              <h3 className='text-xs font-black text-gray-500 uppercase tracking-wider'>
                Inspection
              </h3>
              <div className='space-y-2 text-xs'>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Fuel</span>
                  <span className='font-bold text-gray-900'>
                    {card.physicalChecklist?.fuelLevel ?? "—"}%
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Condition</span>
                  <span className='font-bold text-gray-900 capitalize'>
                    {card.physicalChecklist?.vehicleCondition ?? "—"}
                  </span>
                </div>
                {card.physicalChecklist?.paintCondition && (
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Paint</span>
                    <span className='font-bold text-gray-900'>
                      {card.physicalChecklist.paintCondition}
                    </span>
                  </div>
                )}
                {card.physicalChecklist?.remarks && (
                  <div className='pt-1 border-t border-gray-100'>
                    <span className='text-gray-500'>Remarks</span>
                    <p className='text-gray-700 mt-0.5'>
                      {card.physicalChecklist.remarks}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Requests + notes */}
            {card.customerRequests && (
              <div className='rounded-2xl border border-gray-200 bg-white p-5 space-y-2'>
                <h3 className='text-xs font-black text-gray-500 uppercase tracking-wider'>
                  Customer Requests
                </h3>
                <p className='text-xs text-gray-700 whitespace-pre-wrap'>
                  {card.customerRequests}
                </p>
              </div>
            )}

            {card.internalNotes && (
              <div className='rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-2'>
                <h3 className='text-xs font-black text-amber-600 uppercase tracking-wider'>
                  Internal Notes
                </h3>
                <p className='text-xs text-amber-800 whitespace-pre-wrap'>
                  {card.internalNotes}
                </p>
              </div>
            )}

            {/* Meta */}
            <div className='rounded-2xl border border-gray-200 bg-white p-5 space-y-2 text-xs'>
              <h3 className='font-black text-gray-500 uppercase tracking-wider'>
                Meta
              </h3>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Technician</span>
                <span className='font-bold text-gray-900'>
                  {card.assignedTechnician ?? "—"}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Priority</span>
                <span
                  className={`font-bold capitalize ${
                    card.priority === "urgent"
                      ? "text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  {card.priority}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Service type</span>
                <span className='font-bold text-gray-900'>
                  {card.serviceType}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Opened</span>
                <span className='font-bold text-gray-900'>
                  {new Date(card.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddLineItemDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={handleAddItem}
        adding={adding}
        jobCardId={jobCardId}
      />

      <CancelDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleCancel}
        loading={cancelling}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW: INVOICE
// ─────────────────────────────────────────────────────────────────────────────

interface InvoiceViewProps {
  jobCardId: string;
  onBack: () => void;
}

function InvoiceView({ jobCardId, onBack }: InvoiceViewProps) {
  const { data, isLoading } = useGetInvoiceAdminQuery(jobCardId);
  const invoice = data?.data;

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-24'>
        <Loader2 className='w-5 h-5 text-gray-400 animate-spin' />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className='text-center py-24 text-gray-400 text-sm'>
        Invoice not found.
      </div>
    );
  }

  const activeItems = invoice.lineItemsSnapshot.filter((i) => !i.isRemoved);

  return (
    <div className='space-y-5'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <button
          onClick={onBack}
          className='w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors'
        >
          <ArrowLeft className='w-3.5 h-3.5 text-gray-600' />
        </button>
        <div>
          <h2 className='text-lg font-black text-gray-900 tracking-tight'>
            {invoice.invoiceNumber}
          </h2>
          <p className='text-xs text-gray-400 mt-px'>
            Issued{" "}
            {new Date(invoice.issuedAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>

      <div className='rounded-2xl border border-gray-200 bg-white overflow-hidden'>
        {/* Invoice header */}
        <div className='px-6 py-5 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
          <div>
            <p className='text-xs text-gray-500 font-semibold'>Branch</p>
            <p className='text-sm font-black text-gray-900'>
              {invoice.branch?.branchName ?? "—"}
            </p>
            <p className='text-xs text-gray-500'>
              {invoice.branch?.address ?? ""}
            </p>
          </div>
          <div className='text-right'>
            <p className='text-xs text-gray-500 font-semibold'>Customer</p>
            <p className='text-sm font-bold text-gray-900'>
              {invoice.customer?.phoneNumber ?? "—"}
            </p>
            <p className='text-xs text-gray-500'>
              {invoice.vehicle?.numberPlate ?? ""}
            </p>
          </div>
        </div>

        {/* Line items */}
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-gray-100 bg-gray-50'>
              <th className='px-5 py-2.5 text-left text-xs font-black text-gray-500 uppercase tracking-wider'>
                Item
              </th>
              <th className='px-3 py-2.5 text-right text-xs font-black text-gray-500 uppercase tracking-wider'>
                Qty
              </th>
              <th className='px-3 py-2.5 text-right text-xs font-black text-gray-500 uppercase tracking-wider'>
                Unit
              </th>
              <th className='px-3 py-2.5 text-right text-xs font-black text-gray-500 uppercase tracking-wider'>
                GST
              </th>
              <th className='px-5 py-2.5 text-right text-xs font-black text-gray-500 uppercase tracking-wider'>
                Total
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {activeItems.map((item, i) => (
              <tr key={i} className='hover:bg-gray-50 transition-colors'>
                <td className='px-5 py-3'>
                  <p className='font-semibold text-gray-900 text-xs'>
                    {item.name}
                  </p>
                  {item.description && (
                    <p className='text-[11px] text-gray-400'>
                      {item.description}
                    </p>
                  )}
                  <span className='inline-flex items-center px-1.5 py-0.5 mt-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200'>
                    {item.itemType}
                  </span>
                </td>
                <td className='px-3 py-3 text-right text-xs text-gray-600'>
                  {item.quantity}
                </td>
                <td className='px-3 py-3 text-right text-xs text-gray-600'>
                  {fmt(item.unitPrice)}
                </td>
                <td className='px-3 py-3 text-right text-xs text-gray-600'>
                  {item.taxRate}%
                </td>
                <td className='px-5 py-3 text-right text-xs font-bold text-gray-900'>
                  {fmt(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className='border-t border-gray-100 px-6 py-4 space-y-1.5 bg-gray-50'>
          <div className='flex justify-between text-xs text-gray-500'>
            <span>Subtotal</span>
            <span>{fmt(invoice.subtotal)}</span>
          </div>
          <div className='flex justify-between text-xs text-gray-500'>
            <span>GST</span>
            <span>{fmt(invoice.taxTotal)}</span>
          </div>
          <div className='flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-200'>
            <span>Grand Total</span>
            <span>{fmt(invoice.grandTotal)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className='border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
          <div>
            <p className='text-[10px] text-gray-400 font-semibold uppercase tracking-wider'>
              Digital Signature
            </p>
            <p className='text-[10px] font-mono text-gray-400 mt-0.5 break-all max-w-xs'>
              {invoice.digitalSignatureToken}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            {invoice.pdfUrl ? (
              <a
                href={invoice.pdfUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-1.5 h-8 px-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-colors'
              >
                <FileText className='w-3.5 h-3.5' />
                Download PDF
              </a>
            ) : (
              <span className='flex items-center gap-1.5 text-xs text-gray-400'>
                <Loader2 className='w-3.5 h-3.5 animate-spin' />
                PDF generating...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const JobCardForm = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewMode>("list");
  const [activeJobCardId, setActiveJobCardId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setActiveJobCardId(id);
    setView("detail");
  };

  const handleCreated = (id: string) => {
    setActiveJobCardId(id);
    setView("detail");
  };

  const handleViewInvoice = (id: string) => {
    setActiveJobCardId(id);
    setView("invoice");
  };

  const handleBack = () => {
    if (view === "invoice" && activeJobCardId) {
      setView("detail");
    } else {
      setView("list");
      setActiveJobCardId(null);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Top bar */}
      <div className='sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 h-12 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => navigate("/service-admin/dashboard")}
            className='w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors'
          >
            <ArrowLeft className='w-3.5 h-3.5 text-gray-600' />
          </button>
          <div className='flex items-center gap-1.5 text-xs text-gray-400'>
            <span
              className='hover:text-gray-700 cursor-pointer font-medium'
              onClick={() => {
                setView("list");
                setActiveJobCardId(null);
              }}
            >
              Job Cards
            </span>
            {(view === "detail" || view === "invoice") && activeJobCardId && (
              <>
                <ChevronRight className='w-3 h-3' />
                <span
                  className={`font-medium ${view === "detail" ? "text-gray-900" : "hover:text-gray-700 cursor-pointer"}`}
                  onClick={() => view === "invoice" && setView("detail")}
                >
                  Detail
                </span>
              </>
            )}
            {view === "create" && (
              <>
                <ChevronRight className='w-3 h-3' />
                <span className='font-medium text-gray-900'>New</span>
              </>
            )}
            {view === "invoice" && (
              <>
                <ChevronRight className='w-3 h-3' />
                <span className='font-medium text-gray-900'>Invoice</span>
              </>
            )}
          </div>
        </div>

        <div className='flex items-center gap-1.5'>
          <div className='flex items-center justify-center w-6 h-6 rounded-lg bg-red-50 border border-red-100'>
            <Wrench className='w-3 h-3 text-red-500' />
          </div>
          <span className='text-xs font-black text-gray-900 hidden sm:block'>
            Service Workspace
          </span>
        </div>
      </div>

      {/* Content */}
      <div className='container px-4 sm:px-6 py-6 max-w-6xl'>
        {view === "list" && (
          <ListView
            onSelect={handleSelect}
            onCreate={() => setView("create")}
          />
        )}
        {view === "create" && (
          <CreateView
            onBack={() => setView("list")}
            onCreated={handleCreated}
          />
        )}
        {view === "detail" && activeJobCardId && (
          <DetailView
            jobCardId={activeJobCardId}
            onBack={() => {
              setView("list");
              setActiveJobCardId(null);
            }}
            onViewInvoice={handleViewInvoice}
          />
        )}
        {view === "invoice" && activeJobCardId && (
          <InvoiceView jobCardId={activeJobCardId} onBack={handleBack} />
        )}
      </div>
    </div>
  );
};

export default JobCardForm;
