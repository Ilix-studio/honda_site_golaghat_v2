import { useState } from "react";
import { Search, Bike, Phone, CreditCard, } from "lucide-react";

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

import {
  useGetAssignedStockQuery,
  type AssignedStockItem,
} from "../../../redux-store/services/BikeSystemApi2/StockConceptApi";

// ─── Component ───────────────────────────────────────────────────────────────

const ViewAssignedStock: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  const { data, isLoading, isError } = useGetAssignedStockQuery({
    page,
    limit: LIMIT,
    search: searchTerm.trim() || undefined,
  });

  const records: AssignedStockItem[] = data?.data ?? [];
  const totalPages = data?.pages ?? 1;

  // search is server-driven via the `search` param — no client-side filter needed
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const paymentVariant = (
    status?: "Paid" | "Partial" | "Pending",
  ): "default" | "secondary" | "destructive" => {
    if (status === "Paid") return "default";
    if (status === "Partial") return "secondary";
    return "destructive";
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bike className="h-6 w-6 text-muted-foreground" />
            <div>
              <CardTitle>Assigned Vehicles</CardTitle>
              <CardDescription>
                {isLoading
                  ? "Loading..."
                  : `${data?.total ?? 0} total — page ${page} of ${totalPages}`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by stock ID, model, engine, chassis..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">Loading...</div>
          ) : isError ? (
            <div className="text-center py-10 text-destructive">
              Failed to load data. Please try again.
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {searchTerm ? "No results match your search." : "No assigned vehicles found."}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stock ID</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" /> Customer
                      </span>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Number Plate</TableHead>
                    <TableHead className="hidden md:table-cell">Registered Owner</TableHead>
                    <TableHead className="hidden lg:table-cell">Sale Price</TableHead>
                    <TableHead className="hidden lg:table-cell">Invoice</TableHead>
                    <TableHead className="hidden lg:table-cell">Sold Date</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3.5 w-3.5" /> Finance
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((item: AssignedStockItem) => {
                    const cv = item.salesInfo?.customerVehicleId;
                    return (
                      <TableRow key={item._id}>
                        <TableCell className="font-mono text-sm">
                          {item.stockId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.modelName}
                          <span className="block text-xs text-muted-foreground">
                            {item.color} · {item.yearOfManufacture}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.salesInfo?.soldTo?.phoneNumber ?? "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell font-mono text-sm">
                          {cv?.numberPlate ?? "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          {cv?.registeredOwnerName ?? "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">
                          {item.salesInfo?.salePrice != null
                            ? `₹${item.salesInfo.salePrice.toLocaleString("en-IN")}`
                            : "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell font-mono text-sm">
                          {item.salesInfo?.invoiceNumber ?? "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {item.salesInfo?.soldDate
                            ? new Date(item.salesInfo.soldDate).toLocaleDateString("en-IN")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={paymentVariant(item.salesInfo?.paymentStatus)}>
                            {item.salesInfo?.paymentStatus ?? "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {cv ? (
                            <div className="flex gap-1 flex-wrap">
                              {cv.isFinance && (
                                <Badge variant="secondary" className="text-xs">Finance</Badge>
                              )}
                              {cv.insurance && (
                                <Badge variant="secondary" className="text-xs">Insurance</Badge>
                              )}
                              {cv.isPaid && (
                                <Badge variant="default" className="text-xs">Paid</Badge>
                              )}
                            </div>
                          ) : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  className="text-sm px-3 py-1 rounded border disabled:opacity-40"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <button
                  className="text-sm px-3 py-1 rounded border disabled:opacity-40"
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

export default ViewAssignedStock;