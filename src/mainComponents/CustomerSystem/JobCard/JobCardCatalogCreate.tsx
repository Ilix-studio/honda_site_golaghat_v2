import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useCreateCatalogItemMutation } from "@/redux-store/services/ServiceM/jobCardCatalogApi";
import { LINE_ITEM_TYPES, LineItemType } from "@/types/jobCard.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Wrench,
  Package,
  Scissors,
  FileText,
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

// ─── Type pill selector ───────────────────────────────────────────────────────

const TYPE_META: Record<
  LineItemType,
  { icon: React.ReactNode; color: string; bg: string; border: string }
> = {
  labour: {
    icon: <Wrench className='w-4 h-4' />,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-300",
  },
  part: {
    icon: <Package className='w-4 h-4' />,
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-300",
  },
  accessory: {
    icon: <Scissors className='w-4 h-4' />,
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-300",
  },
  custom: {
    icon: <FileText className='w-4 h-4' />,
    color: "text-gray-700",
    bg: "bg-gray-50",
    border: "border-gray-300",
  },
};

interface FormState {
  itemType: LineItemType;
  name: string;
  description: string;
  defaultUnitPrice: string;
  defaultTaxRate: string;
}

const EMPTY: FormState = {
  itemType: "labour",
  name: "",
  description: "",
  defaultUnitPrice: "",
  defaultTaxRate: "18",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface JobCardCatalogCreateProps {
  /** Called after successful creation — use to navigate back or refresh */
  onCreated?: () => void;
  /** Called on cancel */
  onCancel?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function JobCardCatalogCreate({
  onCreated,
  onCancel,
}: JobCardCatalogCreateProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [done, setDone] = useState(false);

  const [createCatalogItem, { isLoading }] = useCreateCatalogItemMutation();

  const set = (key: keyof FormState, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const validate = (): string | null => {
    if (!form.name.trim()) return "Name is required";
    const price = Number(form.defaultUnitPrice);
    if (isNaN(price) || price < 0) return "Enter a valid unit price";
    const tax = Number(form.defaultTaxRate);
    if (isNaN(tax) || tax < 0 || tax > 100) return "Tax rate must be 0–100";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
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
      setDone(true);
      onCreated?.();
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Failed to create item");
    }
  };

  const handleBack = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  const handleAddAnother = () => {
    setForm(EMPTY);
    setDone(false);
  };

  // ── Success state ─────────────────────────────────────────────────────────

  if (done) {
    return (
      <div className='flex flex-col items-center justify-center py-20 gap-4 text-center'>
        <div className='flex items-center justify-center w-14 h-14 rounded-2xl bg-green-50 border border-green-200'>
          <CheckCircle2 className='w-7 h-7 text-green-500' />
        </div>
        <div>
          <h3 className='text-base font-black text-gray-900'>Item Created</h3>
          <p className='text-sm text-gray-400 mt-1'>
            <span className='font-semibold text-gray-700'>{form.name}</span> has
            been added to the catalog.
          </p>
        </div>
        <div className='flex items-center gap-3 mt-2'>
          <Button
            variant='outline'
            size='sm'
            className='rounded-xl'
            onClick={handleBack}
          >
            Back to Catalog
          </Button>
          <Button
            size='sm'
            className='rounded-xl bg-red-600 hover:bg-red-700 text-white'
            onClick={handleAddAnother}
          >
            Add Another
          </Button>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <div className='max-w-xl'>
      {/* Back */}
      <button
        onClick={handleBack}
        className='flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 mb-5 transition-colors'
      >
        <ArrowLeft className='w-3.5 h-3.5' />
        Back to Catalog
      </button>

      {/* Header */}
      <div className='mb-6'>
        <h2 className='text-lg font-black text-gray-900'>New Catalog Item</h2>
        <p className='text-xs text-gray-400 mt-0.5'>
          Added to your branch catalog — available when creating job cards.
        </p>
      </div>

      <div className='space-y-5'>
        {/* Item Type */}
        <div className='space-y-2'>
          <Label className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>
            Item Type
          </Label>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
            {LINE_ITEM_TYPES.map((t) => {
              const meta = TYPE_META[t];
              const active = form.itemType === t;
              return (
                <button
                  key={t}
                  onClick={() => set("itemType", t)}
                  className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 text-xs font-semibold capitalize transition-all ${
                    active
                      ? `${meta.bg} ${meta.border} ${meta.color}`
                      : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                  }`}
                >
                  <span className={active ? meta.color : "text-gray-300"}>
                    {meta.icon}
                  </span>
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Name */}
        <div className='space-y-1.5'>
          <Label className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>
            Name <span className='text-red-500'>*</span>
          </Label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder='e.g. Engine Oil Change'
            maxLength={200}
            className='h-10 text-sm rounded-xl border border-gray-200 px-4 w-full bg-white outline-none focus:ring-2 focus:ring-gray-200 transition'
          />
        </div>

        {/* Description */}
        <div className='space-y-1.5'>
          <Label className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>
            Description{" "}
            <span className='text-gray-300 font-normal normal-case'>
              (optional)
            </span>
          </Label>
          <Input
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder='Brief description visible on job card...'
            maxLength={500}
            className='h-10 text-sm rounded-xl'
          />
        </div>

        {/* Price + Tax */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1.5'>
            <Label className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>
              Unit Price (₹) <span className='text-red-500'>*</span>
            </Label>
            <div className='relative'>
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold'>
                ₹
              </span>
              <Input
                type='number'
                min={0}
                value={form.defaultUnitPrice}
                onChange={(e) => set("defaultUnitPrice", e.target.value)}
                placeholder='0'
                className='h-10 text-sm rounded-xl pl-7'
              />
            </div>
          </div>
          <div className='space-y-1.5'>
            <Label className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>
              Tax Rate (%)
            </Label>
            <div className='relative'>
              <Input
                type='number'
                min={0}
                max={100}
                value={form.defaultTaxRate}
                onChange={(e) => set("defaultTaxRate", e.target.value)}
                className='h-10 text-sm rounded-xl pr-8'
              />
              <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold'>
                %
              </span>
            </div>
          </div>
        </div>

        {/* Preview */}
        {form.name && form.defaultUnitPrice && (
          <div className='rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className={`text-xs ${TYPE_META[form.itemType].color}`}>
                {TYPE_META[form.itemType].icon}
              </span>
              <span className='text-xs font-semibold text-gray-700'>
                {form.name}
              </span>
            </div>
            <div className='text-right'>
              <p className='text-xs font-black text-gray-900'>
                ₹
                {(
                  Number(form.defaultUnitPrice) *
                  (1 + Number(form.defaultTaxRate) / 100)
                ).toFixed(2)}
              </p>
              <p className='text-[10px] text-gray-400'>incl. GST</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className='flex items-center gap-3 pt-1'>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className='h-10 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold'
          >
            {isLoading ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              "Create Item"
            )}
          </Button>
          <Button
            variant='outline'
            onClick={handleBack}
            className='h-10 px-5 rounded-xl text-sm'
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
