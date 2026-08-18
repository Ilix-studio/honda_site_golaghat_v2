import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAppSelector } from "@/hooks/redux";
import { selectAuth } from "@/redux-store/slices/authSlice";
import {
  useCreateB2BSaleMutation,
  useUpdateB2BSaleMutation,
} from "@/redux-store/services/BikeSystemApi2/b2bSalesApi";
import type {
  B2BSale,
  CreateB2BSaleRequest,
  StockSearchResult,
} from "@/types/b2bSales/b2bSales.types";
import B2BSalesHeading from "./B2BSalesHeading";
import B2BSalesLetterheadReference from "./B2BSalesLetterheadReference";
import { getBranchLetterhead } from "./branchLetterhead";
import B2BSalesPartyFields from "./B2BSalesPartyFields";
import StockItemSearch from "./StockItemSearch";
import SelectedStockItemsTable, {
  type SelectedStockItem,
} from "./SelectedStockItemsTable";
import ExtraItemsFields, { type ExtraItemDraft } from "./ExtraItemsFields";
import TotalsSummary from "./TotalsSummary";
import B2BSalesSubmitBar from "./B2BSalesSubmitBar";
import { generateB2BChallanPdf } from "./b2bChallanPdf";

interface B2BSalesFormProps {
  existingSale?: B2BSale;
  onDone: () => void;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

const B2BSalesForm = ({ existingSale, onDone }: B2BSalesFormProps) => {
  const { user } = useAppSelector(selectAuth);
  const mode: "create" | "edit" = existingSale ? "edit" : "create";

  // Same branch-name resolution B2BSalesPartyFields' `from` prop uses below —
  // the sale's own snapshotted branch when editing, the session branch when
  // creating.
  const letterheadText = getBranchLetterhead(
    existingSale?.from ?? user?.branch?.branchName,
  );

  const [to, setTo] = useState(existingSale?.to ?? "");
  const [topHeading, setTopHeading] = useState(existingSale?.topHeading ?? letterheadText);
  const [stockItems, setStockItems] = useState<SelectedStockItem[]>(
    existingSale?.stockItems.map((item) => ({
      stockConceptCSVId: item.stockConceptCSVId,
      modelName: item.modelName,
      engineNumber: item.engineNumber,
      chassisNumber: item.chassisNumber,
      costPrice: item.costPrice,
      quantity: item.quantity,
    })) ?? [],
  );
  const [extraItems, setExtraItems] = useState<ExtraItemDraft[]>(
    existingSale?.extraItems.map((item) => ({
      name: item.name,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
    })) ?? [],
  );
  // "" (not 0) is the genuine "not entered" state — a real 0 and "no TCS
  // at all" are different things, and the input should render blank, not "0".
  // A flat number added to Total Price, not a percentage.
  const [tcsAmount, setTcsAmount] = useState<number | "">(existingSale?.tcsAmount ?? "");
  const [payablePrice, setPayablePrice] = useState(existingSale?.payablePrice ?? 0);
  // Existing challans already have a deliberate payablePrice — don't
  // silently recompute it on mount, only once the user changes totals/TCS.
  const [payablePriceManual, setPayablePriceManual] = useState(mode === "edit");

  const [savedSale, setSavedSale] = useState<B2BSale | null>(null);
  const [createdSale, setCreatedSale] = useState<B2BSale | null>(null);

  const totalPrice = useMemo(() => {
    const stockTotal = stockItems.reduce((s, i) => s + i.costPrice * i.quantity, 0);
    const extraTotal = extraItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    return round2(stockTotal + extraTotal);
  }, [stockItems, extraItems]);

  useEffect(() => {
    if (!payablePriceManual) {
      const amount = tcsAmount === "" ? 0 : tcsAmount;
      setPayablePrice(round2(totalPrice + amount));
    }
  }, [totalPrice, tcsAmount, payablePriceManual]);

  const handleTcsAmountChange = (value: number | "") => {
    setTcsAmount(value);
    // A fresh TCS change should re-sync Payable Price even if it was
    // previously hand-edited — the Branch-Admin just made a new choice.
    setPayablePriceManual(false);
  };

  const handlePayablePriceChange = (value: number) => {
    setPayablePrice(value);
    setPayablePriceManual(true);
  };

  const handleSelectStockItem = (item: StockSearchResult) => {
    setStockItems((prev) => [
      ...prev,
      {
        stockConceptCSVId: item._id,
        modelName: item.modelName,
        engineNumber: item.engineNumber,
        chassisNumber: item.chassisNumber,
        costPrice: item.costPrice,
        quantity: 1,
      },
    ]);
  };

  const [createB2BSale, { isLoading: isCreating }] = useCreateB2BSaleMutation();
  const [updateB2BSale, { isLoading: isUpdating }] = useUpdateB2BSaleMutation();

  const handleSubmit = async () => {
    if (!to.trim()) {
      toast.error("'To' is required");
      return;
    }
    if (stockItems.length === 0 && extraItems.length === 0) {
      toast.error("Add at least one stock item or extra item");
      return;
    }
    if (extraItems.some((item) => !item.name.trim())) {
      toast.error("Every extra item needs a name");
      return;
    }

    const payload: CreateB2BSaleRequest = {
      to: to.trim(),
      topHeading: topHeading.trim() || undefined,
      stockItems: stockItems.map((item) => ({
        stockConceptCSVId: item.stockConceptCSVId,
        quantity: item.quantity,
      })),
      extraItems: extraItems.map((item) => ({
        name: item.name.trim(),
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      })),
      tcsAmount: tcsAmount === "" ? undefined : tcsAmount,
      payablePrice,
    };

    try {
      if (mode === "edit" && existingSale) {
        const res = await updateB2BSale({ id: existingSale._id, data: payload }).unwrap();
        setSavedSale(res.data);
        toast.success(`Challan ${res.data.challanNo} updated`);
      } else {
        const res = await createB2BSale(payload).unwrap();
        setCreatedSale(res.data);
        toast.success(`Challan ${res.data.challanNo} created`);
      }
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to save challan");
    }
  };

  if (createdSale) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Challan Created</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-sm'>
            Challan <span className='font-semibold font-mono'>{createdSale.challanNo}</span>{" "}
            was created successfully.
          </p>
          <div className='flex flex-wrap gap-3'>
            <Button onClick={() => generateB2BChallanPdf(createdSale)}>
              <Download className='h-4 w-4 mr-2' />
              Download PDF
            </Button>
            <Button variant='outline' onClick={onDone}>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to List
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>
            {mode === "create" ? "New B2B Sale (Challan)" : `Edit Challan ${existingSale?.challanNo}`}
          </CardTitle>
          <Button variant='outline' size='sm' onClick={onDone}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back
          </Button>
        </div>
        <B2BSalesLetterheadReference text={letterheadText} />
      </CardHeader>
      <CardContent className='space-y-6'>
        <B2BSalesHeading topHeading={topHeading} onChange={setTopHeading} />

        <B2BSalesPartyFields
          from={existingSale?.from ?? user?.branch?.branchName ?? ""}
          to={to}
          date={existingSale?.date ?? new Date().toISOString()}
          onToChange={setTo}
        />

        <div className='space-y-2'>
          <Label>Select Stock Items</Label>
          <StockItemSearch
            selectedIds={stockItems.map((i) => i.stockConceptCSVId)}
            onSelect={handleSelectStockItem}
          />
          <SelectedStockItemsTable
            items={stockItems}
            onRemove={(id) =>
              setStockItems((prev) => prev.filter((i) => i.stockConceptCSVId !== id))
            }
          />
        </div>

        <ExtraItemsFields items={extraItems} onChange={setExtraItems} />

        <TotalsSummary
          totalPrice={totalPrice}
          tcsAmount={tcsAmount}
          payablePrice={payablePrice}
          onTcsAmountChange={handleTcsAmountChange}
          onPayablePriceChange={handlePayablePriceChange}
        />

        <B2BSalesSubmitBar
          mode={mode}
          isSubmitting={isCreating || isUpdating}
          onSubmit={handleSubmit}
          onDownloadPdf={
            savedSale ?? existingSale
              ? () => generateB2BChallanPdf(savedSale ?? existingSale!)
              : undefined
          }
        />
      </CardContent>
    </Card>
  );
};

export default B2BSalesForm;
