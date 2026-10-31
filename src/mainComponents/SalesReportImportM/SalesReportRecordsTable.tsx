import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  ReceiptText,
  Search,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
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
import {
  useGetAllSalesReportsQuery,
  useDeleteSalesReportRowMutation,
  type SalesReportRow,
} from "@/redux-store/services/salesReportApi";
import SalesReportRowEditDialog from "./SalesReportRowEditDialog";
import { inr } from "@/mainComponents/DataImport/SalesKpiCharts";
import { useAppSelector } from "@/hooks/redux";
import { selectAuth } from "@/redux-store/slices/authSlice";

const RECORDS_PAGE_SIZE = 25;

type SortKey =
  | "saleDate"
  | "customer"
  | "customerMobile"
  | "location"
  | "frameNo"
  | "engineNo"
  | "modelName"
  | "colour"
  | "finance"
  | "executive"
  | "status"
  | "totalPayment";

interface SortState {
  key: SortKey;
  dir: "asc" | "desc";
}

/** Sortable columns in table order — each label is also its Sort-by option. */
const SORT_COLUMNS: {
  key: SortKey;
  label: string;
  value: (r: SalesReportRow) => string | number | undefined;
}[] = [
  {
    key: "saleDate",
    label: "Date",
    value: (r) => {
      const t = r.saleDate ? Date.parse(r.saleDate) : NaN;
      return Number.isNaN(t) ? undefined : t;
    },
  },
  {
    key: "customer",
    label: "Customer Name",
    value: (r) => [r.customerFirstName, r.customerLastName].filter(Boolean).join(" "),
  },
  { key: "customerMobile", label: "Phone No.", value: (r) => r.customerMobile },
  { key: "location", label: "Location", value: (r) => r.location },
  { key: "frameNo", label: "Frame No", value: (r) => r.frameNo },
  { key: "engineNo", label: "Engine No", value: (r) => r.engineNo },
  { key: "modelName", label: "Model Name", value: (r) => r.modelName },
  { key: "colour", label: "Colour", value: (r) => r.colour },
  { key: "finance", label: "Finance", value: (r) => r.finance },
  { key: "executive", label: "Executive", value: (r) => r.executive },
  { key: "status", label: "Status", value: (r) => r.status },
  { key: "totalPayment", label: "Total Payment", value: (r) => r.totalPayment },
];

const isBlank = (v: string | number | undefined) => v === undefined || v === "";

/** Numbers numerically; text case-insensitively with embedded numbers in order (DIO 110 < DIO 125). */
const compareValues = (a: string | number, b: string | number) =>
  typeof a === "number" && typeof b === "number"
    ? a - b
    : String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });

interface SortableHeadProps {
  column: SortKey;
  label: string;
  sort: SortState;
  onSort: (key: SortKey) => void;
  className?: string;
}

const SortableHead = ({ column, label, sort, onSort, className }: SortableHeadProps) => {
  const active = sort.key === column;
  const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <TableHead
      className={className}
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type='button'
        onClick={() => onSort(column)}
        className='inline-flex items-center gap-1 hover:text-foreground'
      >
        {label}
        <Icon className={cn("h-3.5 w-3.5", !active && "opacity-40")} />
      </button>
    </TableHead>
  );
};

export interface SalesReportRecordsTableProps {
  /** One batch's rows. Omit when `globalSearch` is used. */
  batchId?: string;
  /** Phone / Frame No / Engine No looked up across every batch. */
  globalSearch?: string;
  /** Global mode only: open the batch a result row belongs to. */
  onOpenBatch?: (batchId: string) => void;
}

const SalesReportRecordsTable = ({
  batchId,
  globalSearch,
  onOpenBatch,
}: SalesReportRecordsTableProps) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>({ key: "saleDate", dir: "asc" });
  const { isAuthenticated, user } = useAppSelector(selectAuth);

  // Clicking the sorted column flips its direction; a new column starts ascending.
  const toggleSort = (key: SortKey) =>
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );
  const [editing, setEditing] = useState<SalesReportRow | null>(null);
  const [deleting, setDeleting] = useState<SalesReportRow | null>(null);
  const [deleteRow, { isLoading: isDeleting }] = useDeleteSalesReportRowMutation();

  // Mirrors the server's scoping: Super-Admin any row, Branch-Admin own branch only.
  const canModify = (r: SalesReportRow) => {
    if (user?.role === "Super-Admin") return true;
    const rowBranch = typeof r.branchId === "string" ? r.branchId : r.branchId?._id;
    return user?.role === "Branch-Admin" && user?.branch?._id === rowBranch;
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteRow({ id: deleting._id }).unwrap();
      toast.success("Record deleted");
    } catch (err) {
      toast.error((err as { data?: { message?: string } })?.data?.message || "Failed to delete record");
    } finally {
      setDeleting(null);
    }
  };

  const { data, isLoading } = useGetAllSalesReportsQuery(
    { batchId, search: globalSearch, page: 1, limit: 1000 },
    { skip: !isAuthenticated || (!batchId && !globalSearch) },
  );

  // Every imported row is listed — the batch total, the duplicate check and
  // the KPIs all count each row, so hiding any would leave a batch that shows
  // money but no rows. Register order — oldest sale first, then the order the
  // file listed them — so the serial number counts up from the first sale. That order is also the
  // default sort (Date, ascending) and the tie-break for every other sort.
  const rows = useMemo(() => {
    const time = (iso?: string) => (iso ? Date.parse(iso) : Infinity);
    return [...(data?.data ?? [])]
      .sort(
        (a, b) =>
          time(a.saleDate) - time(b.saleDate) ||
          time(a.createdAt) - time(b.createdAt),
      );
  }, [data]);

  // Blank cells stay at the bottom in both directions; ties keep register
  // order in the chosen direction, so Date descending is its exact reverse.
  const sortedRows = useMemo(() => {
    const column = SORT_COLUMNS.find((c) => c.key === sort.key)!;
    const dir = sort.dir === "asc" ? 1 : -1;
    return rows
      .map((r, i) => ({ r, i, v: column.value(r) }))
      .sort((a, b) => {
        if (isBlank(a.v) !== isBlank(b.v)) return isBlank(a.v) ? 1 : -1;
        const byValue = isBlank(a.v) ? 0 : compareValues(a.v!, b.v!);
        return dir * (byValue || a.i - b.i);
      })
      .map(({ r }) => r);
  }, [rows, sort]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedRows;
    return sortedRows.filter((r) =>
      [r.customerFirstName, r.customerLastName, r.customerMobile, r.location, r.frameNo, r.engineNo, r.modelName, r.finance, r.executive]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q)),
    );
  }, [sortedRows, search]);

  useEffect(() => {
    setPage(1);
  }, [search, batchId, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / RECORDS_PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * RECORDS_PAGE_SIZE;
    return filteredRows.slice(start, start + RECORDS_PAGE_SIZE);
  }, [filteredRows, page]);

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
        <div className='relative max-w-md flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search by customer, phone, location, frame no, engine no, model, finance, or executive'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-10'
          />
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground whitespace-nowrap'>Sort by</span>
          <Select
            value={sort.key}
            onValueChange={(key) => setSort((s) => ({ ...s, key: key as SortKey }))}
          >
            <SelectTrigger className='w-40' aria-label='Sort by'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_COLUMNS.map((c) => (
                <SelectItem key={c.key} value={c.key}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant='outline'
            className='w-32'
            onClick={() => setSort((s) => ({ ...s, dir: s.dir === "asc" ? "desc" : "asc" }))}
          >
            {sort.dir === "asc" ? <ArrowUp className='h-4 w-4' /> : <ArrowDown className='h-4 w-4' />}
            {sort.dir === "asc" ? "Ascending" : "Descending"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className='text-sm text-muted-foreground'>Loading records...</p>
      ) : filteredRows.length === 0 ? (
        <div className='text-center py-12 border rounded-lg'>
          <ReceiptText className='h-12 w-12 mx-auto mb-3 text-muted-foreground' />
          <h3 className='font-semibold mb-1'>No records found</h3>
          <p className='text-sm text-muted-foreground'>
            {search ? "Try adjusting your search." : "This batch has no rows."}
          </p>
        </div>
      ) : (
        <>
          <div className='rounded-md border overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='min-w-[60px]'>Sl No.</TableHead>
                  {globalSearch && <TableHead className='min-w-[170px]'>Batch</TableHead>}
                  <SortableHead column='saleDate' label='Date' sort={sort} onSort={toggleSort} className='min-w-[110px]' />
                  <SortableHead column='customer' label='Customer Name' sort={sort} onSort={toggleSort} className='min-w-[160px]' />
                  <SortableHead column='customerMobile' label='Phone No.' sort={sort} onSort={toggleSort} className='min-w-[130px]' />
                  <SortableHead column='location' label='Location' sort={sort} onSort={toggleSort} className='min-w-[140px]' />
                  <SortableHead column='frameNo' label='Frame No' sort={sort} onSort={toggleSort} className='min-w-[140px]' />
                  <SortableHead column='engineNo' label='Engine No' sort={sort} onSort={toggleSort} className='min-w-[140px]' />
                  <SortableHead column='modelName' label='Model Name' sort={sort} onSort={toggleSort} className='min-w-[140px]' />
                  <SortableHead column='colour' label='Colour' sort={sort} onSort={toggleSort} className='min-w-[90px]' />
                  <TableHead className='text-center'>EW</TableHead>
                  <TableHead className='text-center'>AMC</TableHead>
                  <TableHead className='text-center'>RSA</TableHead>
                  <TableHead className='min-w-[80px] text-center'>Joy Club</TableHead>
                  <SortableHead column='finance' label='Finance' sort={sort} onSort={toggleSort} className='min-w-[100px]' />
                  <SortableHead column='executive' label='Executive' sort={sort} onSort={toggleSort} className='min-w-[110px]' />
                  <SortableHead column='status' label='Status' sort={sort} onSort={toggleSort} className='min-w-[80px]' />
                  <SortableHead column='totalPayment' label='Total Payment' sort={sort} onSort={toggleSort} className='min-w-[120px]' />
                  <TableHead className='min-w-[100px] text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.map((r, i) => (
                  <TableRow key={r._id}>
                    {/* Running serial number across pages. The file's own SL NO. is
                        mostly blank in register exports, so it isn't shown here. */}
                    <TableCell className='text-muted-foreground tabular-nums'>
                      {(page - 1) * RECORDS_PAGE_SIZE + i + 1}
                    </TableCell>
                    {globalSearch && (
                      <TableCell className='font-mono text-xs'>
                        <button
                          type='button'
                          className='underline underline-offset-2 hover:text-primary'
                          onClick={() => onOpenBatch?.(r.importBatch)}
                        >
                          {r.importBatch}
                        </button>
                      </TableCell>
                    )}
                    <TableCell className='whitespace-nowrap'>
                      {r.saleDate ? format(new Date(r.saleDate), "dd MMM yyyy") : "—"}
                    </TableCell>
                    <TableCell>
                      {[r.customerFirstName, r.customerLastName].filter(Boolean).join(" ") || "—"}
                    </TableCell>
                    <TableCell className='font-mono text-xs'>{r.customerMobile || "—"}</TableCell>
                    <TableCell>{r.location || "—"}</TableCell>
                    <TableCell className='font-mono text-xs'>{r.frameNo}</TableCell>
                    <TableCell className='font-mono text-xs'>{r.engineNo || "—"}</TableCell>
                    <TableCell className='font-medium'>{r.modelName || "—"}</TableCell>
                    <TableCell>{r.colour || "—"}</TableCell>
                    <TableCell className='text-center'>{r.ew || "—"}</TableCell>
                    <TableCell className='text-center'>{r.amc || "—"}</TableCell>
                    <TableCell className='text-center'>{r.rsa || "—"}</TableCell>
                    <TableCell className='text-center'>{r.joyClub || "—"}</TableCell>
                    <TableCell>{r.finance || "—"}</TableCell>
                    <TableCell>{r.executive || "—"}</TableCell>
                    <TableCell>{r.status || "—"}</TableCell>
                    <TableCell className='whitespace-nowrap'>{inr(r.totalPayment)}</TableCell>
                    <TableCell className='text-right'>
                      {canModify(r) && (
                        <div className='flex justify-end gap-1'>
                          <Button variant='ghost' size='icon' className='h-8 w-8' aria-label='Edit record' onClick={() => setEditing(r)}>
                            <Pencil className='h-4 w-4' />
                          </Button>
                          <Button variant='ghost' size='icon' className='h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50' aria-label='Delete record' onClick={() => setDeleting(r)}>
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className='flex items-center justify-between pt-1'>
            <p className='text-xs text-muted-foreground'>
              Showing {(page - 1) * RECORDS_PAGE_SIZE + 1}–
              {Math.min(page * RECORDS_PAGE_SIZE, filteredRows.length)} of{" "}
              {filteredRows.length} rows
            </p>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='h-8 px-2'
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className='w-4 h-4' />
              </Button>
              <span className='text-xs text-muted-foreground'>
                Page {page} of {totalPages}
              </span>
              <Button
                variant='outline'
                size='sm'
                className='h-8 px-2'
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </>
      )}

      <SalesReportRowEditDialog row={editing} onClose={() => setEditing(null)} />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes Frame No <span className='font-mono'>{deleting?.frameNo}</span> from
              reports. It does not revert any stock/customer record it already matched — the
              Frame No can be re-imported later, and the deletion is logged for Super-Admin review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SalesReportRecordsTable;
