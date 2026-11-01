import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LoadingSpinner from "@/config/Loadingspinner";
import { useAppSelector } from "@/hooks/redux";
import { selectAuth } from "@/redux-store/slices/authSlice";
import {
  useGetPendingSalesReportsQuery,
  useUpdatePendingSalesReportMutation,
  useDeletePendingSalesReportMutation,
  type SalesReportPendingRow,
} from "@/redux-store/services/salesReportApi";

const PAGE_SIZE = 10;

type Draft = { exShowroom: string; insurance: string; registration: string };

const toDraft = (r: SalesReportPendingRow): Draft => ({
  exShowroom: r.exShowroom?.toString() ?? "",
  insurance: r.insuranceAmount?.toString() ?? "",
  registration: r.registrationAmount?.toString() ?? "",
});

const customerName = (r: SalesReportPendingRow) =>
  [r.customerFirstName, r.customerLastName].filter(Boolean).join(" ") || "—";

const AMOUNT_FIELDS = [
  ["exShowroom", "EX SHOWROOM"],
  ["insurance", "INSURANCE"],
  ["registration", "REGISTRATION"],
] as const;

/**
 * Register rows still waiting on EX SHOWROOM / INSURANCE / REGISTRATION. Saving
 * a row with all three filled imports it for real — the customer is added to
 * the database — and it leaves this table.
 */
export default function SalesReportPendingTable({ batchId }: { batchId?: string }) {
  const { isAuthenticated } = useAppSelector(selectAuth);
  const { data, isLoading } = useGetPendingSalesReportsQuery(
    batchId ? { batchId } : undefined,
    { skip: !isAuthenticated },
  );
  const [updatePending] = useUpdatePendingSalesReportMutation();
  const [deletePending] = useDeletePendingSalesReportMutation();

  // Typed-but-unsaved values, by row id; falls back to what the server holds.
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const rows = data?.data ?? [];
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  // Completing or discarding rows shrinks the list; never sit past the last page.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const draftOf = (r: SalesReportPendingRow) => drafts[r._id] ?? toDraft(r);

  const setField = (r: SalesReportPendingRow, key: keyof Draft, value: string) =>
    setDrafts((d) => ({ ...d, [r._id]: { ...draftOf(r), [key]: value } }));

  const handleSave = async (r: SalesReportPendingRow) => {
    const d = draftOf(r);
    const num = (v: string) => (v.trim() === "" ? null : Number(v));
    setBusyId(r._id);
    try {
      const res = await updatePending({
        id: r._id,
        exShowroom: num(d.exShowroom),
        insurance: num(d.insurance),
        registration: num(d.registration),
      }).unwrap();
      if (res.completed) toast.success(res.message);
      else toast("Saved. Enter the remaining amounts to add this customer.");
    } catch (err) {
      const msg = (err as { data?: { message?: string } })?.data?.message;
      toast.error(msg || "Failed to save");
    } finally {
      setBusyId(null);
    }
  };

  const handleDiscard = async (r: SalesReportPendingRow) => {
    setBusyId(r._id);
    try {
      await deletePending({ id: r._id }).unwrap();
      toast.success("Row discarded");
    } catch {
      toast.error("Failed to discard row");
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) return <LoadingSpinner message='Loading pending rows...' />;

  return (
    <div className='space-y-4'>
      <div>
        <h2 className='text-lg font-bold text-gray-900'>
          Pending amounts{batchId && <span className='font-mono text-sm font-normal'> · {batchId}</span>}
        </h2>
        <p className='text-sm text-gray-500'>
          Enter EX SHOWROOM, INSURANCE and REGISTRATION, then Save. A row is
          added to the customer database once all three are filled.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className='text-center py-12 border rounded-lg bg-white'>
          <h3 className='font-semibold mb-1'>Nothing pending</h3>
          <p className='text-sm text-muted-foreground'>Every row has its amounts.</p>
        </div>
      ) : (
        <>
          {/* Phones/tablets: one card per row, no sideways scrolling. */}
          <div className='space-y-3 lg:hidden'>
            {pageRows.map((r) => {
              const d = draftOf(r);
              const busy = busyId === r._id;
              return (
                <div key={r._id} className='rounded-lg border bg-white p-4 space-y-3'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='min-w-0'>
                      <p className='font-semibold text-gray-900 truncate'>{customerName(r)}</p>
                      <p className='text-xs text-gray-500'>{r.customerMobile || "—"}</p>
                      <p className='text-xs text-gray-500'>{r.modelName || "—"}</p>
                      <p className='font-mono text-[11px] text-gray-400 break-all'>{r.frameNo}</p>
                    </div>
                  </div>
                  <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
                    {AMOUNT_FIELDS.map(([key, label]) => (
                      <div key={key} className='space-y-1'>
                        <label className='text-[11px] font-medium text-gray-500'>{label}</label>
                        <Input
                          type='number'
                          min={0}
                          inputMode='numeric'
                          value={d[key]}
                          onChange={(e) => setField(r, key, e.target.value)}
                          className={d[key].trim() === "" ? "border-amber-400" : ""}
                        />
                      </div>
                    ))}
                  </div>
                  <div className='flex justify-end gap-2'>
                    <Button size='sm' variant='outline' onClick={() => handleDiscard(r)} disabled={busy}>
                      <Trash2 className='h-4 w-4 mr-1 text-red-600' /> Discard
                    </Button>
                    <Button size='sm' onClick={() => handleSave(r)} disabled={busy}>
                      {busy ? <Loader2 className='h-4 w-4 animate-spin' /> : "Save"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: the editable table. */}
          <div className='hidden lg:block rounded-md border bg-white overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Frame No</TableHead>
                  {AMOUNT_FIELDS.map(([, label]) => (
                    <TableHead key={label} className='min-w-[100px]'>{label}</TableHead>
                  ))}
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((r) => {
                  const d = draftOf(r);
                  const busy = busyId === r._id;
                  return (
                    <TableRow key={r._id}>
                      <TableCell className='font-medium'>{customerName(r)}</TableCell>
                      <TableCell>{r.customerMobile || "—"}</TableCell>
                      <TableCell>{r.modelName || "—"}</TableCell>
                      <TableCell className='font-mono text-xs'>{r.frameNo}</TableCell>
                      {AMOUNT_FIELDS.map(([key, label]) => (
                        <TableCell key={key}>
                          <Input
                            type='number'
                            min={0}
                            aria-label={`${label} for ${r.frameNo}`}
                            value={d[key]}
                            onChange={(e) => setField(r, key, e.target.value)}
                            className={`h-8 w-28 text-sm ${d[key].trim() === "" ? "border-amber-400" : ""}`}
                          />
                        </TableCell>
                      ))}
                      <TableCell className='text-right whitespace-nowrap'>
                        <Button size='sm' onClick={() => handleSave(r)} disabled={busy}>
                          {busy ? <Loader2 className='h-4 w-4 animate-spin' /> : "Save"}
                        </Button>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => handleDiscard(r)}
                          disabled={busy}
                          aria-label={`Discard ${r.frameNo}`}
                        >
                          <Trash2 className='h-4 w-4 text-red-600' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className='flex flex-col-reverse sm:flex-row items-center justify-between gap-2 pt-1'>
            <p className='text-xs text-muted-foreground'>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, rows.length)} of {rows.length} rows
            </p>
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm' className='h-8 px-2' disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label='Previous page'>
                <ChevronLeft className='w-4 h-4' />
              </Button>
              <span className='text-xs text-muted-foreground'>Page {page} of {totalPages}</span>
              <Button variant='outline' size='sm' className='h-8 px-2' disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-label='Next page'>
                <ChevronRight className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
