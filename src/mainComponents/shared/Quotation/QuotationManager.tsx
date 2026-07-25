// mainComponents/shared/Quotation/QuotationManager.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Bike as BikeIcon,
  X,
  FileDown,
  Trash2,
  PlusCircle,
  List as ListIcon,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppSelector } from "@/hooks/redux";
import { selectAuth, selectIsBranchAdmin } from "@/redux-store/slices/authSlice";
import { useGetBikesQuery } from "@/redux-store/services/BikeSystemApi/bikeApi";
import { useGetBikeImagesQuery } from "@/redux-store/services/BikeSystemApi/bikeImageApi";
import { useGetAllVASQuery } from "@/redux-store/services/BikeSystemApi2/VASApi";
import {
  useCreateQuotationMutation,
  useDeleteQuotationMutation,
  useGetQuotationsQuery,
  type Quotation,
  type QuotationPricingType,
} from "@/redux-store/services/NewFeatures/quotationApi";
import { generateQuotationPdf } from "./generateQuotationPdf";

export interface QuotationManagerProps {
  dashboardPath: string;
}

const fmtMoney = (n: number) => `₹${n.toLocaleString("en-IN")}`;

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
  const isBranchAdmin = useAppSelector(selectIsBranchAdmin);

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
      onRoadPrice: bike.priceBreakdown.onRoadPrice ?? bike.priceBreakdown.exShowroomPrice,
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
          <p className='truncate font-semibold text-gray-900'>{selected.modelName}</p>
          <p className='text-xs capitalize text-gray-500'>{selected.category}</p>
        </div>
        <Button type='button' variant='ghost' size='sm' onClick={() => onSelect(null)}>
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
        {isBranchAdmin ? (
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

// ─── Create Form ───────────────────────────────────────────────────────────────

const CreateQuotationForm: React.FC<{ onCreated: () => void }> = ({ onCreated }) => {
  const [bike, setBike] = useState<SelectedBike | null>(null);
  const [pricingType, setPricingType] = useState<QuotationPricingType>("standard");
  const [exShowroomPrice, setExShowroomPrice] = useState<string>("");
  const [onRoadTax, setOnRoadTax] = useState<string>("");
  const [variationLabel, setVariationLabel] = useState("");
  const [variationPrice, setVariationPrice] = useState<string>("");
  const [variationOnRoadPrice, setVariationOnRoadPrice] = useState<string>("");
  const [showInsurance, setShowInsurance] = useState(false);
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [insurancePremium, setInsurancePremium] = useState<string>("");
  const [insuranceNotes, setInsuranceNotes] = useState("");
  const [selectedVasIds, setSelectedVasIds] = useState<string[]>([]);

  const { data: vasData } = useGetAllVASQuery({ isActive: true });
  const vasOptions = vasData?.data ?? [];

  const [createQuotation, { isLoading }] = useCreateQuotationMutation();

  // Pre-fill standard pricing once a bike is picked.
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

  const resetForm = () => {
    setBike(null);
    setPricingType("standard");
    setExShowroomPrice("");
    setOnRoadTax("");
    setVariationLabel("");
    setVariationPrice("");
    setVariationOnRoadPrice("");
    setShowInsurance(false);
    setInsuranceProvider("");
    setInsurancePremium("");
    setInsuranceNotes("");
    setSelectedVasIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bike) {
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

    try {
      await createQuotation({
        bikeId: bike._id,
        pricingType,
        ...(pricingType === "standard"
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
            }),
        insurance: showInsurance
          ? {
              provider: insuranceProvider || undefined,
              premium: insurancePremium ? Number(insurancePremium) : undefined,
              notes: insuranceNotes || undefined,
            }
          : undefined,
        vasSelections: selectedVasIds.map((vasId) => ({ vasId })),
      }).unwrap();

      toast.success("Quotation created");
      resetForm();
      onCreated();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create quotation");
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
      <div className='space-y-1.5'>
        <Label>Vehicle</Label>
        <BikePicker selected={bike} onSelect={setBike} />
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
          <span className='text-xs text-gray-400'>{showInsurance ? "Hide" : "Add"}</span>
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

      <Button type='submit' disabled={isLoading} className='w-full bg-red-600 hover:bg-red-700'>
        {isLoading ? (
          <>
            <Loader2 className='h-4 w-4 mr-2 animate-spin' /> Creating…
          </>
        ) : (
          "Create Quotation"
        )}
      </Button>
    </form>
  );
};

// ─── List ──────────────────────────────────────────────────────────────────────

const QuotationCard: React.FC<{ quotation: Quotation }> = ({ quotation }) => {
  const [deleteQuotation, { isLoading: isDeleting }] = useDeleteQuotationMutation();
  const [isGenerating, setIsGenerating] = useState(false);

  const isVariation = quotation.pricingType === "variation" && quotation.variation;
  const total = isVariation
    ? quotation.variation!.onRoadPrice
    : quotation.exShowroomPrice + quotation.onRoadTax;

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await generateQuotationPdf(quotation);
    } catch {
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete quotation for "${quotation.bikeSnapshot.modelName}"?`)) return;
    try {
      await deleteQuotation(quotation._id).unwrap();
      toast.success("Quotation deleted");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className='flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3'>
      <div className='h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-200'>
        {quotation.bikeSnapshot.image ? (
          <img
            src={quotation.bikeSnapshot.image.src}
            alt={quotation.bikeSnapshot.image.alt}
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
          {quotation.bikeSnapshot.modelName}
        </p>
        <p className='text-xs text-gray-500'>
          {isVariation ? quotation.variation!.label : "Standard"} ·{" "}
          {fmtMoney(total)} on-road
        </p>
      </div>
      <Button type='button' variant='ghost' size='sm' onClick={handleDownload} disabled={isGenerating}>
        {isGenerating ? (
          <Loader2 className='h-4 w-4 animate-spin' />
        ) : (
          <FileDown className='h-4 w-4' />
        )}
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={handleDelete}
        disabled={isDeleting}
        className='text-red-500 hover:text-red-700 hover:bg-red-50'
      >
        <Trash2 className='h-4 w-4' />
      </Button>
    </div>
  );
};

const QuotationListView: React.FC = () => {
  const { data, isLoading } = useGetQuotationsQuery();
  const quotations = data?.data ?? [];

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
    <div className='space-y-2'>
      {quotations.map((q) => (
        <QuotationCard key={q._id} quotation={q} />
      ))}
    </div>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────

const QuotationManager: React.FC<QuotationManagerProps> = ({ dashboardPath }) => {
  const [mode, setMode] = useState<"create" | "list">("create");
  const { user } = useAppSelector(selectAuth);

  return (
    <div className='mx-auto max-w-2xl px-4 py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold text-gray-900'>Quotations</h1>
          <p className='text-sm text-gray-500'>
            {user?.name ? `Signed in as ${user.name}` : "Build a customer quotation"}
          </p>
        </div>
        <Link to={dashboardPath} className='text-sm text-gray-500 underline'>
          Back to dashboard
        </Link>
      </div>

      <div className='mb-5 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1'>
        <button
          type='button'
          onClick={() => setMode("create")}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
            mode === "create" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
          }`}
        >
          <PlusCircle className='h-4 w-4' /> New Quotation
        </button>
        <button
          type='button'
          onClick={() => setMode("list")}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
            mode === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
          }`}
        >
          <ListIcon className='h-4 w-4' /> My Quotations
        </button>
      </div>

      {mode === "create" ? (
        <CreateQuotationForm onCreated={() => setMode("list")} />
      ) : (
        <QuotationListView />
      )}
    </div>
  );
};

export default QuotationManager;
