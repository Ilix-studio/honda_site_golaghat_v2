import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Loader2,
  AlertTriangle,
  Trash2,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useGetServiceInvoicesQuery,
  useGetServiceInvoiceByIdQuery,
  useDeleteServiceInvoiceMutation,
  useMarkLineAsAccessoryMutation,
  type InvoiceLineItem,
} from "@/redux-store/services/serviceInvoiceApi";

const inr = (n: number | undefined) =>
  `₹${(n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const fmt = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-IN") : "—";

interface Props {
  branchId?: string;
  uploadPath?: string;
  /** Super-Admin and Part-Admin may delete; others get a read-only view. */
  canDelete?: boolean;
}

/**
 * Imported service invoices, with a drill-down into each invoice's line items
 * showing how every part was classified.
 */
export default function ServiceInvoiceRecords({
  branchId,
  uploadPath,
  canDelete = false,
}: Props) {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [onlyReview, setOnlyReview] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useGetServiceInvoicesQuery({
    page,
    limit: 20,
    q: q || undefined,
    needsReview: onlyReview || undefined,
    branchId,
  });

  const [deleteInvoice, { isLoading: isDeleting }] =
    useDeleteServiceInvoiceMutation();

  const rows = data?.data.rows ?? [];
  const pages = data?.data.pages ?? 1;

  const handleDelete = async (id: string, invoiceNumber: string) => {
    const ok = window.confirm(
      `Delete invoice ${invoiceNumber}?\n\nThis returns its parts to stock, removes the accessories it recorded on the bike, and subtracts its revenue from the vehicle's service spend.`,
    );
    if (!ok) return;
    try {
      await deleteInvoice(id).unwrap();
      if (openId === id) setOpenId(null);
    } catch {
      /* surfaced by the mutation's error state */
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-wrap items-start justify-between gap-2'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              Service invoices
            </CardTitle>
            <CardDescription>
              {data?.data.total ?? 0} invoice(s) imported
            </CardDescription>
          </div>
          {uploadPath && (
            <Button asChild size='sm'>
              <Link to={uploadPath}>
                <UploadCloud className='mr-2 h-4 w-4' />
                Upload invoice
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='flex flex-wrap items-center gap-2'>
          <Input
            placeholder='Search invoice, job card, frame, customer, technician…'
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className='max-w-sm'
          />
          <Button
            variant={onlyReview ? "default" : "outline"}
            size='sm'
            onClick={() => {
              setOnlyReview((v) => !v);
              setPage(1);
            }}
          >
            <AlertTriangle className='mr-2 h-4 w-4' />
            Needs review
          </Button>
          {isFetching && (
            <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
          )}
        </div>

        {isLoading ? (
          <div className='flex items-center gap-2 py-8 text-sm text-muted-foreground'>
            <Loader2 className='h-4 w-4 animate-spin' /> Loading…
          </div>
        ) : rows.length === 0 ? (
          <p className='py-8 text-center text-sm text-muted-foreground'>
            No invoices found.
          </p>
        ) : (
          <div className='overflow-x-auto rounded-md border'>
            <table className='w-full min-w-[820px] text-sm'>
              <thead className='bg-muted/50 text-left text-xs uppercase text-muted-foreground'>
                <tr>
                  <th className='px-3 py-2'>Invoice</th>
                  <th className='px-3 py-2'>Closed</th>
                  <th className='px-3 py-2'>Customer</th>
                  <th className='px-3 py-2'>Vehicle</th>
                  <th className='px-3 py-2'>Technician</th>
                  <th className='px-3 py-2 text-right'>Total</th>
                  <th className='px-3 py-2' />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <>
                    <tr
                      key={r._id}
                      className='cursor-pointer border-t hover:bg-muted/40'
                      onClick={() => setOpenId(openId === r._id ? null : r._id)}
                    >
                      <td className='px-3 py-2'>
                        <div className='font-mono text-xs'>{r.invoiceNumber}</div>
                        {r.needsReview && (
                          <span className='text-xs text-amber-700'>
                            needs review
                          </span>
                        )}
                      </td>
                      <td className='px-3 py-2'>{fmt(r.jobCardClosedDate)}</td>
                      <td className='px-3 py-2'>
                        <div>{r.customerName || "—"}</div>
                        <div className='text-xs text-muted-foreground'>
                          {r.customerMobile}
                        </div>
                      </td>
                      <td className='px-3 py-2'>
                        <div>{r.modelName || "—"}</div>
                        <div className='font-mono text-xs text-muted-foreground'>
                          {r.registrationNumber || r.frameNumber}
                        </div>
                      </td>
                      <td className='px-3 py-2'>{r.technicianName || "—"}</td>
                      <td className='px-3 py-2 text-right font-medium'>
                        {inr(r.totalInvoiceAmount)}
                      </td>
                      <td className='px-3 py-2 text-right'>
                        {canDelete && (
                          <Button
                            variant='ghost'
                            size='sm'
                            disabled={isDeleting}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(r._id, r.invoiceNumber);
                            }}
                          >
                            <Trash2 className='h-4 w-4 text-red-600' />
                          </Button>
                        )}
                      </td>
                    </tr>
                    {openId === r._id && (
                      <tr key={`${r._id}-detail`} className='border-t bg-muted/20'>
                        <td colSpan={7} className='px-3 py-3'>
                          <InvoiceLines id={r._id} branchId={branchId} />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className='flex items-center justify-between'>
            <span className='text-xs text-muted-foreground'>
              Page {page} of {pages}
            </span>
            <div className='flex gap-1'>
              <Button
                variant='outline'
                size='sm'
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='sm'
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Line items for one invoice, showing how each part was classified. */
const TONE: Record<string, string> = {
  SOLD: "bg-emerald-100 text-emerald-800",
  PENDING_STOCK: "bg-sky-100 text-sky-800",
  ACCESSORY: "bg-amber-100 text-amber-800",
  LABOUR: "bg-slate-100 text-slate-700",
};

const LABEL: Record<string, string> = {
  SOLD: "Sold",
  PENDING_STOCK: "Awaiting stock",
  ACCESSORY: "Accessory",
  LABOUR: "Labour",
};

function InvoiceLines({ id, branchId }: { id: string; branchId?: string }) {
  const { data, isLoading } = useGetServiceInvoiceByIdQuery({ id, branchId });
  const [markAccessory, { isLoading: isTagging }] =
    useMarkLineAsAccessoryMutation();

  if (isLoading) {
    return (
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        <Loader2 className='h-4 w-4 animate-spin' /> Loading line items…
      </div>
    );
  }

  const lineItems: InvoiceLineItem[] = data?.data.lineItems ?? [];
  if (lineItems.length === 0) {
    return <p className='text-sm text-muted-foreground'>No line items.</p>;
  }

  return (
    <table className='w-full text-xs'>
      <thead className='text-left text-muted-foreground'>
        <tr>
          <th className='py-1'>#</th>
          <th className='py-1'>Part / Job code</th>
          <th className='py-1'>Description</th>
          <th className='py-1 text-right'>Qty</th>
          <th className='py-1 text-right'>Amount</th>
          <th className='py-1'>Result</th>
          <th className='py-1'>Sold on</th>
          <th className='py-1' />
        </tr>
      </thead>
      <tbody>
        {lineItems.map((l) => (
          <tr key={l._id || l.srNo} className='border-t'>
            <td className='py-1 text-muted-foreground'>{l.srNo}</td>
            <td className='py-1 font-mono'>{l.partNo}</td>
            <td className='py-1'>
              {l.description}
              {l.isLube && <span className='ml-2 text-blue-600'>lube</span>}
            </td>
            <td className='py-1 text-right'>{l.qty}</td>
            <td className='py-1 text-right'>{inr(l.taxableAmount)}</td>
            <td className='py-1'>
              <span
                className={`whitespace-nowrap rounded px-1.5 py-0.5 font-medium ${TONE[l.classification]}`}
                title={l.reviewReason}
              >
                {LABEL[l.classification] ?? l.classification}
                {l.matchQuality === "loose" ? " ~" : ""}
              </span>
            </td>
            <td className='py-1 text-muted-foreground'>
              {l.soldAt ? fmt(l.soldAt) : "—"}
            </td>
            <td className='py-1 text-right'>
              {l.classification === "PENDING_STOCK" && l._id && (
                <button
                  type='button'
                  disabled={isTagging}
                  onClick={() => markAccessory(l._id as string)}
                  className='text-[11px] text-amber-700 underline underline-offset-2 hover:text-amber-900 disabled:opacity-50'
                  title="Use this when the part is never carried as stock, so it stops waiting for an upload."
                >
                  It's an accessory
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
