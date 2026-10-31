import { useEffect, useState } from "react";
import { Search } from "lucide-react";
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
import { useSearchStockQuery } from "@/redux-store/services/BikeSystemApi3/csvStockApi";

const MIN_CHARS = 3;

/** Global Engine / Chassis lookup across CSV-imported and manually entered stock. */
const StockGlobalSearch = () => {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      const q = input.trim();
      setQuery(q.length >= MIN_CHARS ? q : "");
    }, 350);
    return () => clearTimeout(t);
  }, [input]);

  const { data, isFetching, isError } = useSearchStockQuery(query, {
    skip: !query,
  });
  const results = data?.data ?? [];

  return (
    <div className='mb-8'>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Search all stock by engine number or chassis number (3+ characters)'
          className='pl-9 bg-white border-black'
        />
      </div>

      {query && (
        <div className='mt-3 rounded-md border bg-white overflow-x-auto'>
          {isFetching ? (
            <p className='p-4 text-sm text-muted-foreground'>Searching...</p>
          ) : isError ? (
            <p className='p-4 text-sm text-red-600'>Search failed. Try again.</p>
          ) : results.length === 0 ? (
            <p className='p-4 text-sm text-muted-foreground'>
              No stock found for "{query}".
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Engine No</TableHead>
                  <TableHead>Chassis No</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Colour</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Batch / Stock ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r) => (
                  <TableRow key={`${r.source}-${r.id}`}>
                    <TableCell>
                      <Badge variant='outline'>
                        {r.source === "csv" ? "CSV" : "Manual"}
                      </Badge>
                    </TableCell>
                    <TableCell className='font-mono text-xs'>{r.engineNumber || "—"}</TableCell>
                    <TableCell className='font-mono text-xs'>{r.chassisNumber || "—"}</TableCell>
                    <TableCell className='font-medium'>{r.model || "—"}</TableCell>
                    <TableCell>{r.colour || "—"}</TableCell>
                    <TableCell>{r.status || "—"}</TableCell>
                    <TableCell>{r.branchName || "—"}</TableCell>
                    <TableCell className='font-mono text-xs'>{r.reference || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
};

export default StockGlobalSearch;
