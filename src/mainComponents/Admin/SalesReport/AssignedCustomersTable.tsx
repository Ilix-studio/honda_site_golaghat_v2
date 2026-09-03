import { Fragment, useState } from "react";
import {
  Search,
  Bike,
  Phone,
  CreditCard,
  ChevronRight,
  User,
  MapPin,
  Mail,
  Droplet,
  Users,
  FileText,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { AssignedCustomerProfile } from "@/redux-store/services/BikeSystemApi2/StockConceptApi";

/**
 * Normalized row shared by both Sales Report tabs. The manual (StockConcept)
 * and CSV (StockConceptCSV) models name their fields differently
 * (`modelName`/`chassisNumber` vs `modelVariant`/`frameNumber`), so each tab
 * maps its own records into this shape rather than the table branching on
 * which source it was handed.
 */
export interface AssignedRow {
  id: string;
  model: string;
  /** Small print under the model — colour, year, or stock id. */
  modelSubtitle?: string;
  category?: string;
  stockId?: string;
  engineNumber?: string;
  chassisNumber?: string;
  /** Provenance line in the expanded panel, e.g. the CSV file a row came from. */
  sourceLabel?: string;
  customerProfile: AssignedCustomerProfile | null;
  customerPhone?: string;
  salesPersonName?: string;
  branchName?: string;
  soldDate?: string;
  salePrice?: number;
  invoiceNumber?: string;
  paymentStatus?: "Paid" | "Partial" | "Pending";
  vehicle?: {
    numberPlate?: string;
    registeredOwnerName?: string;
    registrationDate?: string;
    isPaid: boolean;
    isFinance: boolean;
    insurance: boolean;
  };
}

interface AssignedCustomersTableProps {
  title: string;
  description: string;
  rows: AssignedRow[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  isLoading: boolean;
  isError: boolean;
  emptyMessage: string;
}

const paymentVariant = (
  status?: "Paid" | "Partial" | "Pending",
): "default" | "secondary" | "destructive" => {
  if (status === "Paid") return "default";
  if (status === "Partial") return "secondary";
  return "destructive";
};

const formatCurrency = (value?: number) =>
  value != null ? `₹${value.toLocaleString("en-IN")}` : "—";

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "—";

/** Joins the CustomerProfile address parts, skipping any that are missing. */
const formatAddress = (profile: AssignedCustomerProfile): string => {
  const parts = [
    profile.village,
    profile.postOffice && `PO ${profile.postOffice}`,
    profile.policeStation && `PS ${profile.policeStation}`,
    profile.district,
    profile.state,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
};

const displayName = (row: AssignedRow): string =>
  row.customerProfile?.fullName ||
  row.vehicle?.registeredOwnerName ||
  row.customerPhone ||
  "—";

const DetailField = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | number | null;
}) => (
  <div className='flex items-start gap-2'>
    <Icon className='h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground' />
    <div className='min-w-0'>
      <p className='text-[11px] uppercase tracking-wide text-muted-foreground'>
        {label}
      </p>
      <p className='text-sm break-words'>{value || "—"}</p>
    </div>
  </div>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <p className='text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>
    {children}
  </p>
);

/** Expanded panel: everything that doesn't fit as a column. */
const CustomerDetailPanel = ({ row }: { row: AssignedRow }) => {
  const profile = row.customerProfile;

  return (
    <div className='grid gap-6 rounded-lg bg-muted/40 p-4 md:grid-cols-3'>
      <div className='space-y-3'>
        <SectionHeading>Customer</SectionHeading>
        {profile ? (
          <div className='space-y-3'>
            <DetailField icon={User} label='Name' value={profile.fullName} />
            <DetailField
              icon={Phone}
              label='Phone'
              value={row.customerPhone}
            />
            <DetailField icon={Mail} label='Email' value={profile.email} />
            <DetailField
              icon={MapPin}
              label='Address'
              value={formatAddress(profile)}
            />
            <DetailField
              icon={Droplet}
              label='Blood group'
              value={profile.bloodGroup}
            />
            <DetailField
              icon={Users}
              label='Family contacts'
              value={
                [profile.familyNumber1, profile.familyNumber2]
                  .filter(Boolean)
                  .join(" / ") || undefined
              }
            />
            {!profile.profileCompleted && (
              <Badge variant='outline' className='text-xs'>
                Profile incomplete
              </Badge>
            )}
          </div>
        ) : (
          <div className='space-y-3'>
            <DetailField
              icon={Phone}
              label='Phone'
              value={row.customerPhone}
            />
            <p className='text-sm text-muted-foreground'>
              No customer profile on record — the buyer verified by phone but
              never completed their profile.
            </p>
          </div>
        )}
      </div>

      <div className='space-y-3'>
        <SectionHeading>Vehicle</SectionHeading>
        <DetailField
          icon={Bike}
          label='Number plate'
          value={row.vehicle?.numberPlate}
        />
        <DetailField
          icon={User}
          label='Registered owner'
          value={row.vehicle?.registeredOwnerName}
        />
        <DetailField
          icon={FileText}
          label='Registration date'
          value={
            row.vehicle?.registrationDate
              ? formatDate(row.vehicle.registrationDate)
              : undefined
          }
        />
        <DetailField icon={Bike} label='Stock ID' value={row.stockId} />
        <DetailField
          icon={FileText}
          label='Engine / chassis'
          value={
            [row.engineNumber, row.chassisNumber].filter(Boolean).join(" · ") ||
            undefined
          }
        />
        {row.vehicle && (
          <div className='flex flex-wrap gap-1 pt-1'>
            {row.vehicle.isFinance && (
              <Badge variant='secondary' className='text-xs'>
                Finance
              </Badge>
            )}
            {row.vehicle.insurance && (
              <Badge variant='secondary' className='text-xs'>
                Insurance
              </Badge>
            )}
            {row.vehicle.isPaid && (
              <Badge variant='default' className='text-xs'>
                Paid
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className='space-y-3'>
        <SectionHeading>Sale</SectionHeading>
        <DetailField
          icon={CreditCard}
          label='Sale price'
          value={formatCurrency(row.salePrice)}
        />
        <DetailField
          icon={FileText}
          label='Invoice'
          value={row.invoiceNumber}
        />
        <DetailField
          icon={FileText}
          label='Sold date'
          value={formatDate(row.soldDate)}
        />
        <DetailField
          icon={MapPin}
          label='Branch'
          value={row.branchName}
        />
        <DetailField
          icon={User}
          label='Assigned by'
          value={row.salesPersonName}
        />
        {row.sourceLabel && (
          <DetailField
            icon={FileText}
            label='Source'
            value={row.sourceLabel}
          />
        )}
      </div>
    </div>
  );
};

const AssignedCustomersTable: React.FC<AssignedCustomersTableProps> = ({
  title,
  description,
  rows,
  total,
  page,
  totalPages,
  onPageChange,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  isLoading,
  isError,
  emptyMessage,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) =>
    setExpandedId((current) => (current === id ? null : id));

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-3'>
          <Bike className='h-6 w-6 text-muted-foreground' />
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {isLoading
                ? "Loading..."
                : `${description} — ${total} total, page ${page} of ${totalPages}`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        <div className='relative'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            type='search'
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className='pl-8'
          />
        </div>

        {isLoading ? (
          <div className='text-center py-10 text-muted-foreground'>
            Loading...
          </div>
        ) : isError ? (
          <div className='text-center py-10 text-destructive'>
            Failed to load data. Please try again.
          </div>
        ) : rows.length === 0 ? (
          <div className='text-center py-10 text-muted-foreground'>
            {searchTerm ? "No results match your search." : emptyMessage}
          </div>
        ) : (
          <div className='rounded-md border overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-8' />
                  <TableHead>Model</TableHead>
                  <TableHead>
                    <span className='flex items-center gap-1'>
                      <User className='h-3.5 w-3.5' /> Customer
                    </span>
                  </TableHead>
                  <TableHead className='hidden sm:table-cell'>
                    <span className='flex items-center gap-1'>
                      <Phone className='h-3.5 w-3.5' /> Phone
                    </span>
                  </TableHead>
                  <TableHead className='hidden md:table-cell'>
                    Number Plate
                  </TableHead>
                  <TableHead className='hidden lg:table-cell'>
                    Sale Price
                  </TableHead>
                  <TableHead className='hidden lg:table-cell'>
                    Sold Date
                  </TableHead>
                  <TableHead>Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const isExpanded = expandedId === row.id;
                  return (
                    <Fragment key={row.id}>
                      <TableRow
                        onClick={() => toggle(row.id)}
                        aria-expanded={isExpanded}
                        className={cn(
                          "cursor-pointer",
                          isExpanded && "bg-muted/50",
                        )}
                      >
                        <TableCell className='pr-0'>
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform",
                              isExpanded && "rotate-90",
                            )}
                          />
                        </TableCell>
                        <TableCell className='font-medium'>
                          {row.model}
                          {row.modelSubtitle && (
                            <span className='block text-xs text-muted-foreground'>
                              {row.modelSubtitle}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className='text-sm'>
                          {displayName(row)}
                          {row.category && (
                            <Badge
                              variant='outline'
                              className='ml-2 text-[10px]'
                            >
                              {row.category}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className='hidden sm:table-cell text-sm'>
                          {row.customerPhone ?? "—"}
                        </TableCell>
                        <TableCell className='hidden md:table-cell font-mono text-sm'>
                          {row.vehicle?.numberPlate ?? "—"}
                        </TableCell>
                        <TableCell className='hidden lg:table-cell text-sm'>
                          {formatCurrency(row.salePrice)}
                        </TableCell>
                        <TableCell className='hidden lg:table-cell text-sm text-muted-foreground'>
                          {formatDate(row.soldDate)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={paymentVariant(row.paymentStatus)}>
                            {row.paymentStatus ?? "—"}
                          </Badge>
                        </TableCell>
                      </TableRow>

                      {isExpanded && (
                        <TableRow className='hover:bg-transparent'>
                          <TableCell colSpan={8} className='p-3'>
                            <CustomerDetailPanel row={row} />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {totalPages > 1 && (
          <div className='flex items-center justify-between pt-2'>
            <p className='text-sm text-muted-foreground'>
              Page {page} of {totalPages}
            </p>
            <div className='flex gap-2'>
              <button
                className='text-sm px-3 py-1 rounded border disabled:opacity-40'
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <button
                className='text-sm px-3 py-1 rounded border disabled:opacity-40'
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssignedCustomersTable;
