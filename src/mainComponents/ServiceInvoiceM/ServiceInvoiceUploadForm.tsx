import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  FileText,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Wrench,
  Package,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  usePreviewServiceInvoiceMutation,
  useImportServiceInvoiceMutation,
  type InvoicePreviewResponse,
  type InvoiceCommitResponse,
  type InvoiceLineItem,
  type ApiErrorBody,
} from "@/redux-store/services/serviceInvoiceApi";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED = [".pdf"];

const validateFile = (file: File): string | null => {
  if (!ALLOWED.some((ext) => file.name.toLowerCase().endsWith(ext))) {
    return "Only PDF invoices are supported.";
  }
  if (file.size > MAX_SIZE) return "File exceeds the 10MB limit.";
  return null;
};

const inr = (n: number | undefined) =>
  `₹${(n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

type PreviewData = InvoicePreviewResponse["data"];
type CommitData = InvoiceCommitResponse["data"];

const CLASSIFICATION_STYLE: Record<string, string> = {
  SOLD: "bg-emerald-100 text-emerald-800 border-emerald-200",
  PENDING_STOCK: "bg-sky-100 text-sky-800 border-sky-200",
  ACCESSORY: "bg-amber-100 text-amber-800 border-amber-200",
  LABOUR: "bg-slate-100 text-slate-700 border-slate-200",
};

const CLASSIFICATION_LABEL: Record<string, string> = {
  SOLD: "Sold",
  PENDING_STOCK: "Awaiting stock",
  ACCESSORY: "Accessory",
  LABOUR: "Labour",
};

function ClassificationBadge({ item }: { item: InvoiceLineItem }) {
  const label =
    item.classification === "SOLD" && item.matchQuality === "loose"
      ? "Sold ~"
      : CLASSIFICATION_LABEL[item.classification] ?? item.classification;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded border px-2 py-0.5 text-xs font-medium ${CLASSIFICATION_STYLE[item.classification]}`}
      title={item.reviewReason}
    >
      {label}
    </span>
  );
}

interface Props {
  dashboardPath?: string;
}

/**
 * Two-step service-invoice upload.
 *
 * Unlike the parts-stock uploader (single shot), this one previews first: the
 * import writes to the consumption ledger and to the customer's vehicle, so
 * the user gets to see exactly which parts were matched as SOLD and which are
 * being treated as technician-fitted ACCESSORIES before any of that happens.
 */
export default function ServiceInvoiceUploadForm({
  dashboardPath = "/part-admin/dashboard",
}: Props) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, { isLoading: isPreviewing }] =
    usePreviewServiceInvoiceMutation();
  const [commit, { isLoading: isCommitting }] =
    useImportServiceInvoiceMutation();

  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [result, setResult] = useState<CommitData | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const reset = () => {
    setFile(null);
    setPreviewData(null);
    setResult(null);
    setApiError(null);
    setValidationError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFileSelect = (selected: File) => {
    const err = validateFile(selected);
    setPreviewData(null);
    setResult(null);
    setApiError(null);
    if (err) {
      setValidationError(err);
      setFile(null);
      return;
    }
    setValidationError(null);
    setFile(selected);
  };

  const runPreview = async () => {
    if (!file) return;
    setApiError(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await preview(fd).unwrap();
      setPreviewData(res.data);
    } catch (err) {
      setApiError(
        (err as ApiErrorBody)?.data?.message ||
          "Could not read this PDF. Is it a service invoice?",
      );
    }
  };

  const runCommit = async () => {
    if (!file) return;
    setApiError(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await commit(fd).unwrap();
      setResult(res.data);
    } catch (err) {
      setApiError((err as ApiErrorBody)?.data?.message || "Import failed.");
    }
  };

  // ── Success ──────────────────────────────────────────────────────────────
  if (result) {
    const dup = result.duplicate;
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            {dup ? (
              <AlertTriangle className='h-5 w-5 text-amber-600' />
            ) : (
              <CheckCircle2 className='h-5 w-5 text-emerald-600' />
            )}
            {dup ? "Already imported" : "Invoice imported"}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-sm text-muted-foreground'>
            {dup
              ? `Invoice ${result.invoiceNumber} is already on record. Nothing was changed.`
              : `Invoice ${result.invoiceNumber} was imported successfully.`}
          </p>

          {!dup && (
            <>
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
                <Stat label='Parts sold' value={result.counts.sold} />
                <Stat label='Awaiting stock' value={result.counts.pending} />
                <Stat label='Labour lines' value={result.counts.labour} />
                <Stat
                  label='Stock rows updated'
                  value={result.counts.consumptionRows}
                />
              </div>

              <div className='rounded-md border p-3 text-sm'>
                <div className='mb-1 font-medium'>Revenue recorded</div>
                <div className='grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground sm:grid-cols-4'>
                  <span>Parts {inr(result.revenue.partsRevenue)}</span>
                  <span>Lubes {inr(result.revenue.lubesRevenue)}</span>
                  <span>Labour {inr(result.revenue.labourRevenue)}</span>
                  <span>
                    Awaiting stock {inr(result.revenue.pendingRevenue)}
                  </span>
                </div>
              </div>

              {result.needsReview && (
                <div className='rounded-md border border-amber-200 bg-amber-50 p-3'>
                  <div className='mb-1 flex items-center gap-2 text-sm font-medium text-amber-900'>
                    <AlertTriangle className='h-4 w-4' /> Needs review
                  </div>
                  <ul className='list-inside list-disc space-y-0.5 text-xs text-amber-900'>
                    {result.reviewReasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <div className='flex gap-2'>
            <Button onClick={reset} variant='outline'>
              Upload another
            </Button>
            <Button onClick={() => navigate(dashboardPath)}>
              Back to dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Preview ──────────────────────────────────────────────────────────────
  if (previewData) {
    const p = previewData;
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Confirm import — invoice {p.header.invoiceNumber || "(unknown)"}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {p.duplicate && (
            <Banner tone='amber' icon={<AlertTriangle className='h-4 w-4' />}>
              This invoice has already been imported. Committing again will
              change nothing.
            </Banner>
          )}

          {!p.reconciliation.ok && (
            <Banner tone='red' icon={<AlertCircle className='h-4 w-4' />}>
              <div className='font-medium'>
                The line items don't add up to the totals printed on this invoice.
              </div>
              <ul className='mt-1 list-inside list-disc text-xs'>
                {p.reconciliation.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </Banner>
          )}

          {/* Header facts */}
          <div className='grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2'>
            <Field label='Job card' value={p.header.jobCardNumber} />
            <Field label='Closed' value={fmtDate(p.header.jobCardClosedDate)} />
            <Field label='Customer' value={p.customer.customerName} />
            <Field label='Phone' value={p.customer.customerMobile} />
            <Field label='Frame no.' value={p.header.frameNumber} />
            <Field label='Reg. no.' value={p.header.registrationNumber} />
            <Field label='Model' value={p.header.modelName} />
            <Field label='Technician' value={p.header.technicianName} />
            <Field label='Service type' value={p.header.serviceType} />
            <Field label='Service KM' value={p.header.serviceKm?.toString()} />
          </div>

          {/* Summary */}
          <div className='grid grid-cols-3 gap-3'>
            <Stat
              label='Parts sold'
              value={p.summary.sold}
              icon={<Package className='h-4 w-4 text-emerald-600' />}
            />
            <Stat
              label='Awaiting stock'
              value={p.summary.pending}
              icon={<Clock className='h-4 w-4 text-sky-600' />}
            />
            <Stat
              label='Labour'
              value={p.summary.labour}
              icon={<Wrench className='h-4 w-4 text-slate-500' />}
            />
          </div>

          {/* Line items */}
          <div className='overflow-x-auto rounded-md border'>
            <table className='w-full min-w-[640px] text-sm'>
              <thead className='bg-muted/50 text-left text-xs uppercase text-muted-foreground'>
                <tr>
                  <th className='px-3 py-2'>#</th>
                  <th className='px-3 py-2'>Part / Job code</th>
                  <th className='px-3 py-2'>Description</th>
                  <th className='px-3 py-2 text-right'>Qty</th>
                  <th className='px-3 py-2 text-right'>Amount</th>
                  <th className='px-3 py-2'>Result</th>
                </tr>
              </thead>
              <tbody>
                {p.lineItems.map((li) => (
                  <tr key={li.srNo} className='border-t'>
                    <td className='px-3 py-2 text-muted-foreground'>{li.srNo}</td>
                    <td className='px-3 py-2 font-mono text-xs'>{li.partNo}</td>
                    <td className='px-3 py-2'>
                      {li.description}
                      {li.isLube && (
                        <span className='ml-2 text-xs text-blue-600'>lube</span>
                      )}
                    </td>
                    <td className='px-3 py-2 text-right'>{li.qty}</td>
                    <td className='px-3 py-2 text-right'>
                      {inr(li.taxableAmount)}
                    </td>
                    <td className='px-3 py-2'>
                      <ClassificationBadge item={li} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {p.summary.pending > 0 && (
            <p className='text-xs text-muted-foreground'>
              {p.summary.pending} billed part(s) are not in this branch's parts
              stock yet. They're recorded against this invoice and left
              pending — the next parts-stock upload that includes them will mark
              them sold, dated and linked back here. They don't reduce stock or
              count as parts revenue until then.
            </p>
          )}

          {apiError && (
            <Banner tone='red' icon={<AlertCircle className='h-4 w-4' />}>
              {apiError}
            </Banner>
          )}

          <div className='flex gap-2'>
            <Button
              onClick={runCommit}
              disabled={isCommitting}
              className='bg-emerald-600 hover:bg-emerald-700'
            >
              {isCommitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Confirm &amp; import
            </Button>
            <Button variant='outline' onClick={reset} disabled={isCommitting}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Pick a file ──────────────────────────────────────────────────────────
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <UploadCloud className='h-5 w-5' />
          Upload service invoice
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div
          role='button'
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const dropped = e.dataTransfer.files?.[0];
            if (dropped) handleFileSelect(dropped);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
        >
          <FileText className='mb-2 h-8 w-8 text-muted-foreground' />
          <p className='text-sm font-medium'>
            {file ? file.name : "Drop the invoice PDF here, or click to browse"}
          </p>
          <p className='mt-1 text-xs text-muted-foreground'>
            One Honda DMS service invoice PDF, up to 10MB
          </p>
          <input
            ref={inputRef}
            type='file'
            accept='.pdf'
            className='hidden'
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected) handleFileSelect(selected);
            }}
          />
        </div>

        {validationError && (
          <Banner tone='red' icon={<AlertCircle className='h-4 w-4' />}>
            {validationError}
          </Banner>
        )}
        {apiError && (
          <Banner tone='red' icon={<AlertCircle className='h-4 w-4' />}>
            {apiError}
          </Banner>
        )}

        <Button onClick={runPreview} disabled={!file || isPreviewing}>
          {isPreviewing && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Read invoice
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Small presentational helpers ────────────────────────────────────────────

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className='rounded-md border p-3'>
      <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
        {icon}
        {label}
      </div>
      <div className='mt-1 text-xl font-semibold'>{value}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className='flex justify-between gap-4 border-b py-1 sm:border-none'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='font-medium'>{value || "—"}</span>
    </div>
  );
}

function Banner({
  tone,
  icon,
  children,
}: {
  tone: "amber" | "red";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const cls =
    tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-red-200 bg-red-50 text-red-900";
  return (
    <div className={`rounded-md border p-3 text-sm ${cls}`}>
      <div className='flex items-start gap-2'>
        {icon}
        <div>{children}</div>
      </div>
    </div>
  );
}

function fmtDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d.toLocaleDateString("en-IN");
}
