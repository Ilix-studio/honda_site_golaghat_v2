import { useState } from "react";
import { AlertTriangle, PackageSearch, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useGetEffectiveStockQuery,
  type ApiErrorBody,
} from "@/redux-store/services/serviceInvoiceApi";

interface Props {
  /** Required — effective stock is inherently per-branch. */
  branchId?: string;
}

/**
 * On-hand stock net of service consumption.
 *
 * The parts-stock figure is whatever the last dealer upload said; this view
 * subtracts everything consumed by service invoices since that upload, which
 * is the number the counter actually cares about. Stock rows themselves are
 * never written to — see models/ServiceInvoice/PartsConsumption.ts for why.
 */
export default function EffectiveStockPanel({ branchId }: Props) {
  const [filter, setFilter] = useState("");
  const { data, isLoading, isError, error } = useGetEffectiveStockQuery(
    { branchId },
    { skip: !branchId },
  );

  const rows = data?.data.rows ?? [];
  const totals = data?.data.totals;

  const visible = filter
    ? rows.filter(
        (r) =>
          r.partNumber.toLowerCase().includes(filter.toLowerCase()) ||
          (r.description || "").toLowerCase().includes(filter.toLowerCase()),
      )
    : rows;

  if (!branchId) {
    return (
      <Card>
        <CardContent className='py-8 text-center text-sm text-muted-foreground'>
          Select a branch to see effective stock.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <PackageSearch className='h-5 w-5' />
          Effective stock
        </CardTitle>
        <CardDescription>
          Counted stock minus parts consumed by service since the last count.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-3'>
        {totals && (
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
            <Tile label='Parts tracked' value={totals.partsTracked} />
            <Tile label='Counted' value={totals.totalStockQty} />
            <Tile label='Consumed' value={totals.totalConsumedQty} />
            <Tile label='Effective' value={totals.totalEffectiveQty} />
          </div>
        )}

        {!!totals?.oversoldCount && (
          <div className='flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900'>
            <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0' />
            <span>
              {totals.oversoldCount} part(s) show more consumed than counted.
              That usually means a stock upload is overdue, or a part was billed
              under a slightly different number.
            </span>
          </div>
        )}

        <Input
          placeholder='Filter by part number or description…'
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className='max-w-sm'
        />

        {isLoading ? (
          <div className='flex items-center gap-2 py-8 text-sm text-muted-foreground'>
            <Loader2 className='h-4 w-4 animate-spin' /> Loading…
          </div>
        ) : isError ? (
          <p className='py-6 text-sm text-red-600'>
            {(error as ApiErrorBody | undefined)?.data?.message ||
              "Could not load effective stock."}
          </p>
        ) : visible.length === 0 ? (
          <p className='py-6 text-center text-sm text-muted-foreground'>
            {rows.length === 0
              ? "No parts stock on record for this branch yet."
              : "No parts match that filter."}
          </p>
        ) : (
          <div className='overflow-x-auto rounded-md border'>
            <table className='w-full min-w-[560px] text-sm'>
              <thead className='bg-muted/50 text-left text-xs uppercase text-muted-foreground'>
                <tr>
                  <th className='px-3 py-2'>Part number</th>
                  <th className='px-3 py-2'>Description</th>
                  <th className='px-3 py-2 text-right'>Counted</th>
                  <th className='px-3 py-2 text-right'>Consumed</th>
                  <th className='px-3 py-2 text-right'>Effective</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr
                    key={r.partNumber}
                    className={`border-t ${r.oversold ? "bg-amber-50" : ""}`}
                  >
                    <td className='px-3 py-2 font-mono text-xs'>{r.partNumber}</td>
                    <td className='px-3 py-2'>{r.description || "—"}</td>
                    <td className='px-3 py-2 text-right'>{r.stockQty}</td>
                    <td className='px-3 py-2 text-right text-muted-foreground'>
                      {r.consumedQty ? `−${r.consumedQty}` : "0"}
                    </td>
                    <td className='px-3 py-2 text-right font-semibold'>
                      {r.effectiveQty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className='rounded-md border p-3'>
      <div className='text-xs text-muted-foreground'>{label}</div>
      <div className='mt-1 text-xl font-semibold'>{value}</div>
    </div>
  );
}
