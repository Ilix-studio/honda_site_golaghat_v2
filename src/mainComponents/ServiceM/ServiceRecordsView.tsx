import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileSpreadsheet,
  Loader2,
  Search,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetDatasetsQuery,
  useGetDatasetRowsQuery,
} from "@/redux-store/services/dataImportApi";

export default function ServiceRecordsView() {
  const navigate = useNavigate();
  const [batchId, setBatchId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: datasetsData, isLoading: batchesLoading } = useGetDatasetsQuery(
    { datasetType: "service-jobcard", limit: 100 },
  );
  const { data: rowsData, isLoading: rowsLoading } = useGetDatasetRowsQuery(
    { batchId: batchId || "", limit: 200 },
    { skip: !batchId },
  );

  const batches = datasetsData?.data ?? [];
  const rows = rowsData?.data ?? [];

  const filteredRows = rows.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const n = r.normalized || {};
    return (
      String(n.customerName ?? "").toLowerCase().includes(q) ||
      String(n.customerMobile ?? "").toLowerCase().includes(q) ||
      String(n.frameNumber ?? "").toLowerCase().includes(q) ||
      String(n.jobCardNumber ?? "").toLowerCase().includes(q)
    );
  });

  const selectedBatch = batches.find((b) => b.batchId === batchId);

  if (batchId) {
    return (
      <div className='max-w-7xl mx-auto p-6'>
        <Card className='border border-gray-200 shadow-sm'>
          <CardHeader>
            <div className='flex items-center justify-between flex-wrap gap-3'>
              <div className='flex items-center gap-3'>
                <Button variant='outline' size='sm' onClick={() => setBatchId(null)}>
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Back to Uploads
                </Button>
                <div>
                  <CardTitle>{selectedBatch?.fileName ?? batchId}</CardTitle>
                  <p className='text-sm text-muted-foreground'>
                    {rowsData?.pagination.total ?? 0} row(s)
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='relative max-w-md'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search by customer name, mobile, frame, or job card #'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>

            {rowsLoading ? (
              <div className='text-center py-12'>
                <Loader2 className='h-8 w-8 animate-spin mx-auto mb-3 text-primary' />
                <p className='text-muted-foreground'>Loading rows...</p>
              </div>
            ) : filteredRows.length === 0 ? (
              <div className='text-center py-12 border rounded-lg'>
                <p className='text-muted-foreground'>
                  {searchQuery ? "No rows match your search" : "No rows in this batch"}
                </p>
              </div>
            ) : (
              <div className='border rounded-lg overflow-hidden'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Card #</TableHead>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Customer Mobile</TableHead>
                      <TableHead>Frame Number</TableHead>
                      <TableHead>Model Name</TableHead>
                      <TableHead>Model Variant</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>AMC Service</TableHead>
                      <TableHead className='text-right'>Current KMs</TableHead>
                      <TableHead className='text-right'>Parts Revenue</TableHead>
                      <TableHead className='text-right'>Lubes Revenue</TableHead>
                      <TableHead className='text-right'>Total Job Card Revenue</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Closed Date</TableHead>
                      <TableHead>Review</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((r) => {
                      const n = r.normalized || {};
                      return (
                        <TableRow key={r._id}>
                          <TableCell className='font-mono text-xs'>
                            {n.jobCardNumber ?? "—"}
                          </TableCell>
                          <TableCell>{n.customerName ?? "—"}</TableCell>
                          <TableCell className='font-mono text-xs'>
                            {n.customerMobile ?? "—"}
                          </TableCell>
                          <TableCell className='font-mono text-xs'>
                            {n.frameNumber ?? "—"}
                          </TableCell>
                          <TableCell>{n.modelName ?? "—"}</TableCell>
                          <TableCell>{n.modelVariant ?? "—"}</TableCell>
                          <TableCell>
                            {n.serviceType ? (
                              <Badge variant='outline'>{n.serviceType}</Badge>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>{n.amcService ?? "—"}</TableCell>
                          <TableCell className='text-right tabular-nums'>
                            {n.currentKms ?? "—"}
                          </TableCell>
                          <TableCell className='text-right tabular-nums'>
                            {n.partsRevenue != null
                              ? `₹${Number(n.partsRevenue).toLocaleString("en-IN")}`
                              : "—"}
                          </TableCell>
                          <TableCell className='text-right tabular-nums'>
                            {n.lubesRevenue != null
                              ? `₹${Number(n.lubesRevenue).toLocaleString("en-IN")}`
                              : "—"}
                          </TableCell>
                          <TableCell className='text-right tabular-nums font-medium'>
                            {n.totalJobCardRevenue != null
                              ? `₹${Number(n.totalJobCardRevenue).toLocaleString("en-IN")}`
                              : "—"}
                          </TableCell>
                          <TableCell>{n.technicianName ?? "—"}</TableCell>
                          <TableCell className='text-xs text-muted-foreground'>
                            {n.jobCardClosedDate
                              ? new Date(n.jobCardClosedDate).toLocaleDateString("en-IN")
                              : "—"}
                          </TableCell>
                          <TableCell>
                            {r.needsReview && (
                              <Badge
                                variant='outline'
                                className='bg-amber-50 text-amber-700 border-amber-200'
                              >
                                Review
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto p-6'>
      <Card className='border border-gray-200 shadow-sm'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <FileSpreadsheet className='h-5 w-5' />
                Service Records — Uploaded Batches
              </CardTitle>
              <p className='text-sm text-muted-foreground mt-1'>
                Every service job-card file uploaded so far
              </p>
            </div>
            <Button variant='outline' size='sm' onClick={() => navigate(-1)}>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {batchesLoading ? (
            <div className='text-center py-12'>
              <Loader2 className='h-8 w-8 animate-spin mx-auto mb-3 text-primary' />
              <p className='text-muted-foreground'>Loading batches...</p>
            </div>
          ) : batches.length === 0 ? (
            <div className='text-center py-12 border rounded-lg'>
              <p className='text-muted-foreground'>
                No service job-card files uploaded yet.
              </p>
            </div>
          ) : (
            <div className='border rounded-lg overflow-hidden'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead className='text-right'>Rows</TableHead>
                    <TableHead className='text-right'>Duplicates</TableHead>
                    <TableHead className='text-right'>Review</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className='text-right'>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((b) => (
                    <TableRow key={b.batchId}>
                      <TableCell className='font-medium'>{b.fileName}</TableCell>
                      <TableCell className='text-xs text-muted-foreground'>
                        {b.uploadedByRole}
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {b.importedRows}
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {b.duplicateRows}
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {b.reviewRows}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={b.status === "completed" ? "default" : "secondary"}
                        >
                          {b.status}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-xs text-muted-foreground'>
                        {new Date(b.createdAt).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button size='sm' onClick={() => setBatchId(b.batchId)}>
                          <Eye className='h-4 w-4 mr-1' />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
