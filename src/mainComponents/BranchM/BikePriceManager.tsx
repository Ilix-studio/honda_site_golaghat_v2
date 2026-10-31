import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Check, IndianRupee, Pencil, X } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { inr } from "@/mainComponents/DataImport/SalesKpiCharts";
import {
  adjustedPrice,
  useBulkAdjustBikePricesMutation,
  useGetBikePricesQuery,
  useUpdateBikePriceMutation,
  type BikePriceRow,
  type PriceAdjustMode,
} from "@/redux-store/services/BikeSystemApi/bikePriceApi";

const apiError = (err: unknown, fallback: string) =>
  (err as { data?: { message?: string } })?.data?.message || fallback;

/**
 * "Add New Price" — the bike catalogue's ex-showroom price per model, editable
 * one model at a time or all at once by a percentage or a fixed amount. The
 * catalogue is shared by every branch, the public site, quotations and the
 * sales-report price lookup, so changes here apply everywhere.
 */
const BikePriceManager = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetBikePricesQuery();
  const [updatePrice, { isLoading: isSaving }] = useUpdateBikePriceMutation();
  const [bulkAdjust, { isLoading: isAdjusting }] =
    useBulkAdjustBikePricesMutation();

  const rows = useMemo(() => data?.data ?? [], [data]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const [mode, setMode] = useState<PriceAdjustMode>("percent");
  const [rawValue, setRawValue] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const value = Number(rawValue);
  const previewing = rawValue.trim() !== "" && Number.isFinite(value) && value !== 0;
  const preview = useMemo(
    () =>
      new Map(
        previewing
          ? rows.map((r) => [r._id, adjustedPrice(r.exShowroomPrice, mode, value)])
          : [],
      ),
    [rows, previewing, mode, value],
  );
  const wouldGoNonPositive = rows.find((r) => (preview.get(r._id) ?? 1) <= 0);
  const adjustmentLabel =
    mode === "percent"
      ? `${value > 0 ? "+" : ""}${value}%`
      : `${value > 0 ? "+" : "−"}${inr(Math.abs(value))}`;

  const startEdit = (row: BikePriceRow) => {
    setEditingId(row._id);
    setDraft(String(row.exShowroomPrice));
  };

  const saveEdit = async (row: BikePriceRow) => {
    const price = Number(draft);
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Enter a price above zero");
      return;
    }
    if (Math.round(price) === row.exShowroomPrice) {
      setEditingId(null);
      return;
    }
    try {
      await updatePrice({ id: row._id, exShowroomPrice: price }).unwrap();
      toast.success(`${row.modelName}: ${inr(Math.round(price))}`);
      setEditingId(null);
    } catch (err) {
      toast.error(apiError(err, "Failed to update price"));
    }
  };

  const applyBulk = async () => {
    try {
      const res = await bulkAdjust({ mode, value }).unwrap();
      toast.success(res.message);
      setRawValue("");
    } catch (err) {
      toast.error(apiError(err, "Failed to update prices"));
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6'>
        <button
          onClick={() => navigate("/manager/dashboard")}
          className='flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to Dashboard
        </button>

        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-gray-900 text-white shrink-0'>
            <IndianRupee className='h-5 w-5' />
          </div>
          <div>
            <h1 className='text-xl font-bold text-gray-900'>Bike Prices</h1>
            <p className='text-sm text-gray-500'>
              Ex-showroom price of every model. Changes apply to all branches,
              the website, quotations and new sales-report imports.
            </p>
          </div>
        </div>

        {/* Bulk adjustment */}
        <div className='rounded-xl border border-gray-200 bg-white p-4 sm:p-6 space-y-3'>
          <div>
            <h2 className='font-semibold text-gray-900'>Update all prices</h2>
            <p className='text-sm text-gray-500'>
              Raise or lower every model at once. Use a negative value to lower
              prices. New prices are previewed in the table before you apply.
            </p>
          </div>
          <div className='flex flex-wrap items-end gap-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='bulk-mode'>Adjust by</Label>
              <Select
                value={mode}
                onValueChange={(v) => setMode(v as PriceAdjustMode)}
              >
                <SelectTrigger id='bulk-mode' className='w-44'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='percent'>Percentage (%)</SelectItem>
                  <SelectItem value='amount'>Amount (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='bulk-value'>
                {mode === "percent" ? "Percent" : "Rupees"}
              </Label>
              <Input
                id='bulk-value'
                type='number'
                inputMode='decimal'
                step={mode === "percent" ? "0.1" : "1"}
                placeholder={mode === "percent" ? "e.g. 5 or -2" : "e.g. 1500 or -500"}
                value={rawValue}
                onChange={(e) => setRawValue(e.target.value)}
                className='w-40'
              />
            </div>
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={!previewing || !!wouldGoNonPositive || rows.length === 0 || isAdjusting}
            >
              {isAdjusting
                ? "Updating..."
                : `Apply to all ${rows.length} models`}
            </Button>
          </div>
          {wouldGoNonPositive && (
            <p className='text-sm text-red-600'>
              {wouldGoNonPositive.modelName} would drop to{" "}
              {inr(preview.get(wouldGoNonPositive._id) ?? 0)} — use a smaller
              decrease.
            </p>
          )}
          <p className='text-xs text-gray-400'>
            Prices are rounded to the nearest rupee. Variant add-ons (e.g.
            H-Smart +₹4,877) stay as they are, on top of the new price.
          </p>
        </div>

        {/* Price list */}
        <div className='rounded-xl border border-gray-200 bg-white overflow-hidden'>
          {isLoading ? (
            <p className='p-6 text-sm text-gray-500'>Loading prices...</p>
          ) : isError ? (
            <p className='p-6 text-sm text-red-600'>Could not load bike prices.</p>
          ) : rows.length === 0 ? (
            <p className='p-6 text-sm text-gray-500'>No active bike models.</p>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='min-w-[180px]'>Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead className='min-w-[200px]'>Variants</TableHead>
                    <TableHead className='min-w-[150px] text-right'>
                      Ex-showroom price
                    </TableHead>
                    {previewing && (
                      <TableHead className='min-w-[130px] text-right'>
                        New price ({adjustmentLabel})
                      </TableHead>
                    )}
                    <TableHead className='w-[100px] text-right'>Edit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    const editing = editingId === row._id;
                    const next = preview.get(row._id);
                    return (
                      <TableRow key={row._id}>
                        <TableCell className='font-medium'>{row.modelName}</TableCell>
                        <TableCell className='text-gray-500'>{row.year}</TableCell>
                        <TableCell className='text-xs text-gray-500'>
                          {row.variants
                            .map((v) =>
                              v.priceAdjustment
                                ? `${v.name} +${inr(v.priceAdjustment)}`
                                : v.name,
                            )
                            .join(" · ") || "—"}
                        </TableCell>
                        <TableCell className='text-right tabular-nums'>
                          {editing ? (
                            <Input
                              type='number'
                              inputMode='numeric'
                              min={1}
                              autoFocus
                              value={draft}
                              onChange={(e) => setDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit(row);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              aria-label={`New price for ${row.modelName}`}
                              className='h-8 w-32 ml-auto text-right'
                            />
                          ) : (
                            inr(row.exShowroomPrice)
                          )}
                        </TableCell>
                        {previewing && (
                          <TableCell
                            className={`text-right tabular-nums font-medium ${
                              (next ?? 0) <= 0
                                ? "text-red-600"
                                : value > 0
                                  ? "text-emerald-700"
                                  : "text-amber-700"
                            }`}
                          >
                            {inr(next ?? 0)}
                          </TableCell>
                        )}
                        <TableCell className='text-right'>
                          {editing ? (
                            <div className='flex justify-end gap-1'>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-8 w-8 text-emerald-700'
                                aria-label='Save price'
                                disabled={isSaving}
                                onClick={() => saveEdit(row)}
                              >
                                <Check className='h-4 w-4' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-8 w-8'
                                aria-label='Cancel'
                                onClick={() => setEditingId(null)}
                              >
                                <X className='h-4 w-4' />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8'
                              aria-label={`Edit ${row.modelName} price`}
                              onClick={() => startEdit(row)}
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Change all {rows.length} prices by {adjustmentLabel}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Every model's ex-showroom price changes at once, for all branches
              and the website. The new prices are the ones shown in the table.
              There is no automatic undo, and an opposite percentage doesn't
              exactly reverse it (+5% then −5% ends 0.25% lower).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isAdjusting}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isAdjusting} onClick={applyBulk}>
              {isAdjusting ? "Updating..." : "Apply"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BikePriceManager;
