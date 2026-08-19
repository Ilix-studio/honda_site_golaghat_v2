// mainComponents/shared/Quotation/QuotationManager.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { format } from "date-fns";
import {
  Bike as BikeIcon,
  X,
  FileDown,
  Trash2,
  PlusCircle,
  Loader2,
  ShieldCheck,
  Pencil,
  Eye,
  Calendar as CalendarIcon,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CopyButton } from "@/components/ui/copy-button";
import { useAppSelector } from "@/hooks/redux";
import { selectUserBranch } from "@/redux-store/slices/authSlice";
import { useGetBikesQuery } from "@/redux-store/services/BikeSystemApi/bikeApi";
import { useGetBikeImagesQuery } from "@/redux-store/services/BikeSystemApi/bikeImageApi";
import { useGetAllVASQuery } from "@/redux-store/services/BikeSystemApi2/VASApi";
import {
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
  useDeleteQuotationMutation,
  useBulkExpireQuotationsMutation,
  useGetQuotationsQuery,
  type Quotation,
  type QuotationPricingType,
  type QuotationAccessory,
} from "@/redux-store/services/NewFeatures/quotationApi";
import { getBranchLetterhead } from "@/mainComponents/B2BSalesM/branchLetterhead";
import B2BSalesHeading from "@/mainComponents/B2BSalesM/B2BSalesHeading";
import { generateQuotationPdf } from "./generateQuotationPdf";
import {
  ACCESSORY_PRESETS,
  DEFAULT_QUOTATION_BANK_DETAILS,
  DEFAULT_QUOTATION_TERMS,
  buildPublicQuotationUrl,
} from "./quotationDefaults";

export interface QuotationManagerProps {
  dashboardPath: string;
}

// Same 10-digit Indian mobile pattern as client/src/zod/loginSchema.ts.
const PHONE_REGEX = /^[6-9]\d{9}$/;

const fmtMoney = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// ─── Bike Picker ───────────────────────────────────────────────────────────────

interface SelectedBike {
  _id: string;
  modelName: string;
  category: string;
  mainCategory: "bike" | "scooter";
  exShowroomPrice: number;
  onRoadPrice: number;
  image?: { src: string; alt: string };
}

const BikePicker: React.FC<{
  selected: SelectedBike | null;
  onSelect: (bike: SelectedBike | null) => void;
}> = ({ selected, onSelect }) => {
  const branch = useAppSelector(selectUserBranch);

  const { data, isFetching } = useGetBikesQuery({ limit: 200 });
  const results = [...(data?.data?.bikes ?? [])].sort((a, b) =>
    a.modelName.localeCompare(b.modelName),
  );

  const { data: imagesData } = useGetBikeImagesQuery(selected?._id ?? "", {
    skip: !selected,
  });

  const handlePick = (bikeId: string) => {
    const bike = results.find((b) => b._id === bikeId);
    if (!bike) return;
    onSelect({
      _id: bike._id,
      modelName: bike.modelName,
      category: bike.category,
      mainCategory: bike.mainCategory,
      exShowroomPrice: bike.priceBreakdown.exShowroomPrice,
      onRoadPrice:
        bike.priceBreakdown.onRoadPrice ?? bike.priceBreakdown.exShowroomPrice,
    });
  };

  // Once images resolve for the selected bike, attach the primary one.
  useEffect(() => {
    if (!selected || selected.image) return;
    const images = imagesData?.data?.images ?? [];
    const primary = images.find((img) => img.isPrimary) ?? images[0];
    if (primary) {
      onSelect({ ...selected, image: { src: primary.src, alt: primary.alt } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesData]);

  if (selected) {
    return (
      <div className='flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3'>
        <div className='h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white border border-gray-200'>
          {selected.image ? (
            <img
              src={selected.image.src}
              alt={selected.image.alt}
              className='h-full w-full object-cover'
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center'>
              <BikeIcon className='h-6 w-6 text-gray-300' />
            </div>
          )}
        </div>
        <div className='min-w-0 flex-1'>
          <p className='truncate font-semibold text-gray-900'>
            {selected.modelName}
          </p>
          <p className='text-xs capitalize text-gray-500'>
            {selected.category}
          </p>
        </div>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => onSelect(null)}
        >
          <X className='h-4 w-4' />
        </Button>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className='flex items-center justify-center rounded-xl border border-gray-200 py-4'>
        <Loader2 className='h-4 w-4 animate-spin text-gray-400' />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className='rounded-xl border border-gray-200 p-4 text-center text-sm'>
        <p className='text-gray-500 mb-1'>No bikes found in the catalog.</p>
        {branch ? (
          <Link to='/bikes/add' className='text-red-600 underline text-xs'>
            Add one to the catalog
          </Link>
        ) : (
          <p className='text-xs text-gray-400'>
            Ask your Branch-Admin to add a vehicle to the catalog.
          </p>
        )}
      </div>
    );
  }

  return (
    <select
      value=''
      onChange={(e) => handlePick(e.target.value)}
      className='w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500'
    >
      <option value='' disabled>
        Select a bike or scooter…
      </option>
      {results.map((bike) => (
        <option key={bike._id} value={bike._id}>
          {bike.modelName} ({bike.category})
        </option>
      ))}
    </select>
  );
};

// ─── Accessory row draft ────────────────────────────────────────────────────

interface AccessoryDraft {
  name: string;
  quantity: string;
  amount: string;
}

// ─── Create / Edit Form ─────────────────────────────────────────────────────

const QuotationForm: React.FC<{
  existingQuotation?: Quotation | null;
  onDone: () => void;
}> = ({ existingQuotation, onDone }) => {
  const isEdit = !!existingQuotation;
  const branch = useAppSelector(selectUserBranch);

  const [bike, setBike] = useState<SelectedBike | null>(null);
  const [pricingType, setPricingType] = useState<QuotationPricingType>(
    existingQuotation?.pricingType ?? "standard",
  );
  const [exShowroomPrice, setExShowroomPrice] = useState<string>(
    existingQuotation ? String(existingQuotation.exShowroomPrice) : "",
  );
  const [onRoadTax, setOnRoadTax] = useState<string>(
    existingQuotation ? String(existingQuotation.onRoadTax) : "",
  );
  const [variationLabel, setVariationLabel] = useState(
    existingQuotation?.variation?.label ?? "",
  );
  const [variationPrice, setVariationPrice] = useState<string>(
    existingQuotation?.variation
      ? String(existingQuotation.variation.price)
      : "",
  );
  const [variationOnRoadPrice, setVariationOnRoadPrice] = useState<string>(
    existingQuotation?.variation
      ? String(existingQuotation.variation.onRoadPrice)
      : "",
  );
  const [showInsurance, setShowInsurance] = useState(
    !!existingQuotation?.insurance,
  );
  const [insuranceProvider, setInsuranceProvider] = useState(
    existingQuotation?.insurance?.provider ?? "",
  );
  const [insurancePremium, setInsurancePremium] = useState<string>(
    existingQuotation?.insurance?.premium != null
      ? String(existingQuotation.insurance.premium)
      : "",
  );
  const [insuranceNotes, setInsuranceNotes] = useState(
    existingQuotation?.insurance?.notes ?? "",
  );
  const [selectedVasIds, setSelectedVasIds] = useState<string[]>(
    existingQuotation?.vasSelections?.map((v) => v.vas) ?? [],
  );

  const [toName, setToName] = useState(existingQuotation?.to?.name ?? "");
  const [toPhone, setToPhone] = useState(existingQuotation?.to?.phone ?? "");
  const [toAddress1, setToAddress1] = useState(
    existingQuotation?.to?.addressLine1 ?? "",
  );
  const [toAddress2, setToAddress2] = useState(
    existingQuotation?.to?.addressLine2 ?? "",
  );

  const [accessories, setAccessories] = useState<AccessoryDraft[]>(
    existingQuotation?.accessories?.map((a) => ({
      name: a.name,
      quantity: String(a.quantity),
      amount: String(a.amount),
    })) ?? [],
  );

  const [topHeading, setTopHeading] = useState(
    existingQuotation?.topHeading ?? getBranchLetterhead(branch?.branchName),
  );
  const [bankDetails, setBankDetails] = useState(
    existingQuotation?.bankDetails ?? DEFAULT_QUOTATION_BANK_DETAILS,
  );
  const [termsAndConditions, setTermsAndConditions] = useState(
    existingQuotation?.termsAndConditions ?? DEFAULT_QUOTATION_TERMS,
  );

  const [createdQuotation, setCreatedQuotation] = useState<Quotation | null>(
    null,
  );

  const { data: vasData } = useGetAllVASQuery({ isActive: true });
  const vasOptions = vasData?.data ?? [];

  const [createQuotation, { isLoading: isCreating }] =
    useCreateQuotationMutation();
  const [updateQuotation, { isLoading: isUpdating }] =
    useUpdateQuotationMutation();
  const isSubmitting = isCreating || isUpdating;

  // Pre-fill standard pricing once a bike is picked (create mode only — the
  // bike picker isn't rendered in edit mode, so `bike` never changes there).
  useEffect(() => {
    if (!bike) return;
    setExShowroomPrice(String(bike.exShowroomPrice));
    setOnRoadTax(String(Math.max(0, bike.onRoadPrice - bike.exShowroomPrice)));
  }, [bike]);

  const toggleVas = (id: string) => {
    setSelectedVasIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const addAccessoryPreset = (name: string) => {
    setAccessories((prev) => {
      if (name && prev.some((a) => a.name === name)) return prev;
      return [...prev, { name, quantity: "1", amount: "" }];
    });
  };
  const updateAccessory = (
    idx: number,
    field: keyof AccessoryDraft,
    value: string,
  ) => {
    setAccessories((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a)),
    );
  };
  const removeAccessory = (idx: number) => {
    setAccessories((prev) => prev.filter((_, i) => i !== idx));
  };

  const onRoadPricePreview =
    (Number(exShowroomPrice) || 0) + (Number(onRoadTax) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEdit && !bike) {
      toast.error("Select a bike first");
      return;
    }

    if (
      pricingType === "variation" &&
      (!variationLabel.trim() || !variationPrice || !variationOnRoadPrice)
    ) {
      toast.error("Variation label, price, and on-road price are required");
      return;
    }

    if (!toName.trim() || !toPhone.trim() || !toAddress1.trim()) {
      toast.error("Customer name, phone, and address line 1 are required");
      return;
    }

    if (!PHONE_REGEX.test(toPhone.trim())) {
      toast.error("Enter a valid 10-digit phone number starting with 6-9");
      return;
    }

    const accessoriesPayload: QuotationAccessory[] = accessories
      .filter((a) => a.name.trim() && Number(a.quantity) > 0)
      .map((a) => ({
        name: a.name.trim(),
        quantity: Number(a.quantity),
        amount: Number(a.amount) || 0,
      }));

    const to = {
      name: toName.trim(),
      phone: toPhone.trim(),
      addressLine1: toAddress1.trim(),
      addressLine2: toAddress2.trim() || undefined,
    };

    const pricingPayload =
      pricingType === "standard"
        ? {
            exShowroomPrice: Number(exShowroomPrice),
            onRoadTax: Number(onRoadTax),
          }
        : {
            variation: {
              label: variationLabel,
              price: Number(variationPrice),
              onRoadPrice: Number(variationOnRoadPrice),
            },
          };

    const insurancePayload = showInsurance
      ? {
          provider: insuranceProvider || undefined,
          premium: insurancePremium ? Number(insurancePremium) : undefined,
          notes: insuranceNotes || undefined,
        }
      : undefined;

    try {
      if (isEdit && existingQuotation) {
        await updateQuotation({
          id: existingQuotation._id,
          pricingType,
          ...pricingPayload,
          insurance: insurancePayload,
          vasSelections: selectedVasIds.map((vasId) => ({ vasId })),
          accessories: accessoriesPayload,
          to,
          topHeading,
          bankDetails,
          termsAndConditions,
        }).unwrap();
        toast.success("Quotation updated");
        onDone();
      } else {
        const result = await createQuotation({
          bikeId: bike!._id,
          pricingType,
          ...pricingPayload,
          insurance: insurancePayload,
          vasSelections: selectedVasIds.map((vasId) => ({ vasId })),
          accessories: accessoriesPayload,
          to,
          topHeading,
          bankDetails,
          termsAndConditions,
        }).unwrap();
        toast.success("Quotation created");
        setCreatedQuotation(result.data);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save quotation");
    }
  };

  if (createdQuotation) {
    const publicUrl = buildPublicQuotationUrl(createdQuotation);
    return (
      <div className='space-y-4 rounded-xl border border-green-200 bg-green-50 p-5'>
        <div>
          <p className='text-sm font-semibold text-green-800'>
            Quotation Created
          </p>
          <p className='text-xs text-green-700'>
            Quotation No: {createdQuotation.quotationNo}
          </p>
        </div>
        <div className='space-y-1.5'>
          <Label>Public Link (share with customer)</Label>
          <div className='flex items-center gap-2'>
            <Input readOnly value={publicUrl} className='font-mono text-xs' />
            <CopyButton
              text={publicUrl}
              label='Copy Link'
              successMessage='Link copied'
            />
          </div>
          <p className='text-xs font-medium text-amber-700'>
            Please save the link.
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            type='button'
            onClick={() => generateQuotationPdf(createdQuotation)}
            className='flex-1 bg-red-600 hover:bg-red-700'
          >
            <FileDown className='h-4 w-4 mr-2' /> Download PDF
          </Button>
          <Button
            type='button'
            variant='outline'
            onClick={onDone}
            className='flex-1'
          >
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
      <div className='space-y-1.5'>
        <Label>Vehicle</Label>
        {isEdit ? (
          <div className='flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3'>
            <div className='h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white border border-gray-200'>
              {existingQuotation!.bikeSnapshot.image ? (
                <img
                  src={existingQuotation!.bikeSnapshot.image.src}
                  alt={existingQuotation!.bikeSnapshot.image.alt}
                  className='h-full w-full object-cover'
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center'>
                  <BikeIcon className='h-6 w-6 text-gray-300' />
                </div>
              )}
            </div>
            <div className='min-w-0 flex-1'>
              <p className='truncate font-semibold text-gray-900'>
                {existingQuotation!.bikeSnapshot.modelName}
              </p>
              <p className='text-xs capitalize text-gray-500'>
                {existingQuotation!.bikeSnapshot.category} · vehicle can't be
                changed after creation
              </p>
            </div>
          </div>
        ) : (
          <BikePicker selected={bike} onSelect={setBike} />
        )}
      </div>

      <div className='space-y-1.5'>
        <Label>Pricing Type</Label>
        <div className='grid grid-cols-2 gap-2'>
          <button
            type='button'
            onClick={() => setPricingType("standard")}
            className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
              pricingType === "standard"
                ? "border-red-500 bg-red-50 text-red-700"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            Standard
          </button>
          <button
            type='button'
            onClick={() => setPricingType("variation")}
            className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
              pricingType === "variation"
                ? "border-red-500 bg-red-50 text-red-700"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            Variation
          </button>
        </div>
      </div>

      {pricingType === "standard" ? (
        <div className='space-y-3'>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='exShowroomPrice'>Price (Ex-Showroom)</Label>
              <Input
                id='exShowroomPrice'
                type='number'
                value={exShowroomPrice}
                onChange={(e) => setExShowroomPrice(e.target.value)}
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='onRoadTax'>On-Road Tax</Label>
              <Input
                id='onRoadTax'
                type='number'
                value={onRoadTax}
                onChange={(e) => setOnRoadTax(e.target.value)}
              />
            </div>
          </div>
          <div className='flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2'>
            <span className='text-sm text-gray-600'>On-Road Price</span>
            <span className='text-sm font-semibold text-gray-900'>
              {fmtMoney(onRoadPricePreview)}
            </span>
          </div>
        </div>
      ) : (
        <div className='space-y-3'>
          <div className='space-y-1.5'>
            <Label htmlFor='variationLabel'>Variation Label</Label>
            <Input
              id='variationLabel'
              placeholder='e.g. Deluxe Edition'
              value={variationLabel}
              onChange={(e) => setVariationLabel(e.target.value)}
            />
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='variationPrice'>Price</Label>
              <Input
                id='variationPrice'
                type='number'
                value={variationPrice}
                onChange={(e) => setVariationPrice(e.target.value)}
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='variationOnRoadPrice'>On-Road Price</Label>
              <Input
                id='variationOnRoadPrice'
                type='number'
                value={variationOnRoadPrice}
                onChange={(e) => setVariationOnRoadPrice(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      <div className='space-y-3 rounded-xl border border-gray-200 p-3'>
        <p className='text-sm font-medium text-gray-700'>To (Customer)</p>
        <div className='grid grid-cols-2 gap-3'>
          <div className='space-y-1.5'>
            <Label htmlFor='toName'>Full Name</Label>
            <Input
              id='toName'
              value={toName}
              onChange={(e) => setToName(e.target.value)}
            />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='toPhone'>Phone Number</Label>
            <Input
              id='toPhone'
              type='tel'
              inputMode='numeric'
              maxLength={10}
              value={toPhone}
              onChange={(e) =>
                setToPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              className={
                toPhone && !PHONE_REGEX.test(toPhone)
                  ? "border-red-400 focus-visible:ring-red-400"
                  : undefined
              }
            />
            {toPhone && !PHONE_REGEX.test(toPhone) && (
              <p className='text-xs text-red-600'>
                Enter a valid 10-digit phone number starting with 6-9
              </p>
            )}
          </div>
        </div>
        <div className='space-y-1.5'>
          <Label htmlFor='toAddress1'>Address Line 1</Label>
          <Input
            id='toAddress1'
            value={toAddress1}
            onChange={(e) => setToAddress1(e.target.value)}
          />
        </div>
        <div className='space-y-1.5'>
          <Label htmlFor='toAddress2'>Address Line 2 (optional)</Label>
          <Input
            id='toAddress2'
            value={toAddress2}
            onChange={(e) => setToAddress2(e.target.value)}
          />
        </div>
      </div>

      <div className='rounded-xl border border-gray-200 p-3'>
        <button
          type='button'
          onClick={() => setShowInsurance((s) => !s)}
          className='flex w-full items-center justify-between text-sm font-medium text-gray-700'
        >
          <span className='flex items-center gap-2'>
            <ShieldCheck className='h-4 w-4 text-gray-400' />
            Insurance {showInsurance ? "" : "(optional)"}
          </span>
          <span className='text-xs text-gray-400'>
            {showInsurance ? "Hide" : "Add"}
          </span>
        </button>
        {showInsurance && (
          <div className='mt-3 space-y-3'>
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='insProvider'>Provider</Label>
                <Input
                  id='insProvider'
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='insPremium'>Premium</Label>
                <Input
                  id='insPremium'
                  type='number'
                  value={insurancePremium}
                  onChange={(e) => setInsurancePremium(e.target.value)}
                />
              </div>
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='insNotes'>Notes</Label>
              <Input
                id='insNotes'
                value={insuranceNotes}
                onChange={(e) => setInsuranceNotes(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {vasOptions.length > 0 && (
        <div className='space-y-1.5'>
          <Label>Value Added Services</Label>
          <div className='rounded-xl border border-gray-200 divide-y divide-gray-100 max-h-52 overflow-y-auto'>
            {vasOptions.map((vas) => (
              <label
                key={vas._id}
                className='flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50'
              >
                <Checkbox
                  checked={selectedVasIds.includes(vas._id)}
                  onCheckedChange={() => toggleVas(vas._id)}
                />
                <span className='flex-1 text-gray-700'>{vas.serviceName}</span>
                <span className='text-xs font-medium text-gray-500'>
                  {fmtMoney(vas.priceStructure.basePrice)}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className='space-y-3 rounded-xl border border-gray-200 p-3'>
        <p className='text-sm font-medium text-gray-700'>
          Accessories (optional)
        </p>
        <div className='flex flex-wrap gap-2'>
          {ACCESSORY_PRESETS.map((preset) => (
            <button
              key={preset}
              type='button'
              onClick={() => addAccessoryPreset(preset)}
              className='rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50'
            >
              + {preset}
            </button>
          ))}
        </div>
        {accessories.length > 0 && (
          <div className='space-y-2'>
            {accessories.map((row, idx) => (
              <div key={idx} className='flex items-center gap-2'>
                <Input
                  value={row.name}
                  onChange={(e) => updateAccessory(idx, "name", e.target.value)}
                  placeholder='Accessory name'
                  className='flex-1'
                />
                <Input
                  type='number'
                  value={row.quantity}
                  onChange={(e) =>
                    updateAccessory(idx, "quantity", e.target.value)
                  }
                  placeholder='Qty'
                  className='w-20'
                />
                <Input
                  type='number'
                  value={row.amount}
                  onChange={(e) =>
                    updateAccessory(idx, "amount", e.target.value)
                  }
                  placeholder='Amount'
                  className='w-28'
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => removeAccessory(idx)}
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            ))}
          </div>
        )}
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => addAccessoryPreset("")}
        >
          <PlusCircle className='h-3.5 w-3.5 mr-1.5' /> Add Custom Accessory
        </Button>
      </div>

      <B2BSalesHeading topHeading={topHeading} onChange={setTopHeading} />

      <div className='space-y-1.5'>
        <div className='flex items-center justify-between'>
          <Label htmlFor='bankDetails'>Bank Details (editable)</Label>
          <CopyButton
            text={bankDetails}
            label='Copy'
            successMessage='Bank details copied'
          />
        </div>
        <Textarea
          id='bankDetails'
          value={bankDetails}
          onChange={(e) => setBankDetails(e.target.value)}
          rows={5}
          className='font-mono text-xs'
        />
      </div>

      <div className='space-y-1.5'>
        <Label htmlFor='terms'>Terms &amp; Conditions (editable)</Label>
        <Textarea
          id='terms'
          value={termsAndConditions}
          onChange={(e) => setTermsAndConditions(e.target.value)}
          rows={6}
          className='text-xs'
        />
      </div>

      <div className='flex gap-2'>
        {isEdit && (
          <Button
            type='button'
            variant='outline'
            onClick={onDone}
            className='flex-1'
          >
            Cancel
          </Button>
        )}
        <Button
          type='submit'
          disabled={isSubmitting}
          className='flex-1 bg-red-600 hover:bg-red-700'
        >
          {isSubmitting ? (
            <>
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              {isEdit ? "Saving…" : "Creating…"}
            </>
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Create Quotation"
          )}
        </Button>
      </div>
    </form>
  );
};

// ─── List ──────────────────────────────────────────────────────────────────────

const QuotationTable: React.FC<{ onEdit: (q: Quotation) => void }> = ({
  onEdit,
}) => {
  const { data, isLoading } = useGetQuotationsQuery();
  const quotations = data?.data ?? [];
  const [deleteQuotation, { isLoading: isDeleting }] =
    useDeleteQuotationMutation();

  const handleDelete = async (q: Quotation) => {
    try {
      await deleteQuotation(q._id).unwrap();
      toast.success("Quotation deleted");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete");
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center py-12'>
        <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
      </div>
    );
  }

  if (quotations.length === 0) {
    return (
      <p className='py-12 text-center text-sm text-gray-400'>
        No quotations created yet.
      </p>
    );
  }

  return (
    <div className='border rounded-lg overflow-hidden'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Quotation No</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='w-40' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotations.map((q) => (
            <TableRow key={q._id}>
              <TableCell className='font-mono font-medium'>
                {q.quotationNo}
              </TableCell>
              <TableCell>{q.to?.name}</TableCell>
              <TableCell>{fmtDate(q.createdAt)}</TableCell>
              <TableCell>
                {q.isExpired ? (
                  <span className='inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700'>
                    Expired
                  </span>
                ) : (
                  <span className='inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700'>
                    Active
                  </span>
                )}
              </TableCell>
              <TableCell>
                <div className='flex items-center justify-end gap-1'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7'
                    onClick={() =>
                      window.open(
                        buildPublicQuotationUrl(q),
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                    aria-label={`View ${q.quotationNo}`}
                  >
                    <Eye className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7'
                    onClick={() => onEdit(q)}
                    aria-label={`Edit ${q.quotationNo}`}
                  >
                    <Pencil className='h-4 w-4' />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 hover:bg-red-50'
                        aria-label={`Delete ${q.quotationNo}`}
                      >
                        <Trash2 className='h-4 w-4 text-red-600' />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete this quotation?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This permanently deletes quotation{" "}
                          <span className='font-mono'>{q.quotationNo}</span> for{" "}
                          {q.to?.name}. Its public link will stop working.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep</AlertDialogCancel>
                        <AlertDialogAction
                          disabled={isDeleting}
                          onClick={() => handleDelete(q)}
                          className='bg-red-600 text-white hover:bg-red-700'
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// ─── Bulk "Mark Price Increase" (expire everything before a cutoff date) ───

const BulkExpireDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [cutoffDate, setCutoffDate] = useState<Date | undefined>(undefined);
  const [bulkExpire, { isLoading }] = useBulkExpireQuotationsMutation();

  const handleConfirm = async () => {
    if (!cutoffDate) return;
    try {
      const result = await bulkExpire({
        beforeDate: cutoffDate.toISOString(),
      }).unwrap();
      toast.success(result.message);
      setOpen(false);
      setCutoffDate(undefined);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to mark quotations expired");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setCutoffDate(undefined);
      }}
    >
      <DialogTrigger asChild>
        <Button type='button' variant='outline'>
          <TrendingUp className='h-4 w-4 mr-2' /> Mark Price Increase
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Mark quotations expired due to price increase
          </DialogTitle>
          <DialogDescription>
            Every quotation issued before the date you pick will be marked as
            expired due to a price increase — their public links will show a
            price-increase notice instead of the old price. This can't be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-1.5'>
          <Label>Prices increased on</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline' className='w-full justify-start'>
                <CalendarIcon className='h-4 w-4 mr-2' />
                {cutoffDate ? format(cutoffDate, "dd MMM yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                mode='single'
                selected={cutoffDate}
                onSelect={setCutoffDate}
              />
            </PopoverContent>
          </Popover>
          {cutoffDate && (
            <p className='text-xs text-gray-500'>
              All quotations created before{" "}
              <span className='font-medium text-gray-700'>
                {format(cutoffDate, "dd MMM yyyy")}
              </span>{" "}
              will be marked expired. Quotations created on or after this date
              are unaffected.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type='button'
            disabled={!cutoffDate || isLoading}
            onClick={handleConfirm}
            className='bg-amber-600 text-white hover:bg-amber-700'
          >
            {isLoading ? (
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
            ) : null}
            Mark Expired
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────

const QuotationManager: React.FC<QuotationManagerProps> = () => {
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(
    null,
  );

  const handleDone = () => {
    setView("list");
    setEditingQuotation(null);
  };

  if (view === "create" || (view === "edit" && editingQuotation)) {
    return (
      <div className='mx-auto max-w-2xl px-4 py-8'>
        <div className='mb-5 flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-gray-900'>
            {view === "edit" ? "Edit Quotation" : "New Quotation"}
          </h2>
          <Button type='button' variant='ghost' size='sm' onClick={handleDone}>
            <X className='h-4 w-4 mr-1' /> Close
          </Button>
        </div>
        <QuotationForm
          existingQuotation={view === "edit" ? editingQuotation : undefined}
          onDone={handleDone}
        />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-4xl px-4 py-8 space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-gray-900'>Quotations</h2>
          <div className='flex items-center gap-2'>
            <BulkExpireDialog />
            <Button
              type='button'
              onClick={() => setView("create")}
              className='bg-red-600 hover:bg-red-700'
            >
              <PlusCircle className='h-4 w-4 mr-2' /> New Quotation
            </Button>
          </div>
        </div>
        <QuotationTable
          onEdit={(q) => {
            setEditingQuotation(q);
            setView("edit");
          }}
        />
      </div>
    </div>
  );
};

export default QuotationManager;
