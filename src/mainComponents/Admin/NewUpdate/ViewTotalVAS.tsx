import { useMemo, useState } from "react";
import { Search, Shield } from "lucide-react";
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
import { useGetCustomersWithActiveVASQuery } from "@/redux-store/services/BikeSystemApi2/VASApi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomerVASRecord {
  customer: {
    _id: string;
    phoneNumber: string | null;
    firstName: string | null;
    middleName?: string | null;
    lastName: string | null;
    village: string | null;
    postOffice: string | null;
    policeStation: string | null;
    district: string | null;
    state: string | null;
    profileCompleted: boolean;
  };
  vehicle: {
    _id: string;
    modelName: string | null;
    variantName: string | null;
    color: string | null;
  };
  activeServices: {
    serviceId: string;
    serviceName: string | null;
    serviceType: string | null;
    activatedDate: string;
    expiryDate: string;
    purchasePrice: number;
  }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fullName = (c: CustomerVASRecord["customer"]): string =>
  [c.firstName, c.middleName, c.lastName].filter(Boolean).join(" ") || "—";

const vehicleLabel = (v: CustomerVASRecord["vehicle"]): string =>
  [v.modelName, v.variantName, v.color].filter(Boolean).join(" · ") || "—";

// ─── Component ────────────────────────────────────────────────────────────────

const ViewTotalVAS: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const { data, isLoading, isError } = useGetCustomersWithActiveVASQuery({
    page,
    limit: LIMIT,
  });

  const records = (data?.data ?? []) as CustomerVASRecord[];
  const totalPages = data?.pages ?? 1;

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return records;
    return records.filter((r) => {
      const c = r.customer;
      return (
        fullName(c).toLowerCase().includes(term) ||
        c.phoneNumber?.includes(term) ||
        c.district?.toLowerCase().includes(term) ||
        c.state?.toLowerCase().includes(term) ||
        c.village?.toLowerCase().includes(term) ||
        vehicleLabel(r.vehicle).toLowerCase().includes(term)
      );
    });
  }, [records, searchTerm]);

  return (
    <div className='p-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <Shield className='h-6 w-6 text-muted-foreground' />
            <div>
              <CardTitle>Customers with Active VAS</CardTitle>
              <CardDescription>
                {isLoading
                  ? "Loading..."
                  : `${data?.total ?? 0} total — page ${page} of ${totalPages}`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          <div className='relative'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              type='search'
              placeholder='Search by name, phone, vehicle, district...'
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
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
          ) : filtered.length === 0 ? (
            <div className='text-center py-10 text-muted-foreground'>
              {searchTerm
                ? "No results match your search."
                : "No active VAS customers found."}
            </div>
          ) : (
            <div className='rounded-md border overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead className='hidden md:table-cell'>
                      Village
                    </TableHead>
                    <TableHead className='hidden lg:table-cell'>
                      District
                    </TableHead>
                    <TableHead className='hidden lg:table-cell'>
                      State
                    </TableHead>
                    <TableHead>Active Services</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={`${r.customer._id}-${r.vehicle._id}`}>
                      <TableCell className='font-medium'>
                        {fullName(r.customer)}
                        {!r.customer.profileCompleted && (
                          <span className='ml-1.5 text-[10px] text-gray-400'>
                            (no profile)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className='text-sm'>
                        {r.customer.phoneNumber ?? "—"}
                      </TableCell>
                      <TableCell className='text-sm'>
                        {vehicleLabel(r.vehicle)}
                      </TableCell>
                      <TableCell className='hidden md:table-cell text-sm'>
                        {r.customer.village ?? "—"}
                      </TableCell>

                      <TableCell className='hidden lg:table-cell text-sm'>
                        {r.customer.district ?? "—"}
                      </TableCell>
                      <TableCell className='hidden lg:table-cell text-sm'>
                        {r.customer.state ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-wrap gap-1'>
                          {r.activeServices.map((s, i) => (
                            <Badge
                              key={i}
                              variant='secondary'
                              className='text-xs'
                            >
                              {s.serviceName ?? s.serviceType ?? "—"}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className='text-sm font-semibold tabular-nums'>
                        ₹
                        {r.activeServices
                          .reduce((sum, s) => sum + (s.purchasePrice ?? 0), 0)
                          .toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))}
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
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <button
                  className='text-sm px-3 py-1 rounded border disabled:opacity-40'
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewTotalVAS;
