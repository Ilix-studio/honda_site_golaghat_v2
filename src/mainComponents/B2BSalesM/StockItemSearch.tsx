import { useEffect, useState } from "react";
import { Search, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppSelector } from "@/hooks/redux";
import { selectAuth } from "@/redux-store/slices/authSlice";
import { useSearchStockForB2BSaleQuery } from "@/redux-store/services/BikeSystemApi2/b2bSalesApi";
import type { StockSearchResult } from "@/types/b2bSales/b2bSales.types";

interface StockItemSearchProps {
  selectedIds: string[];
  onSelect: (item: StockSearchResult) => void;
}

const StockItemSearch = ({ selectedIds, onSelect }: StockItemSearchProps) => {
  const { user } = useAppSelector(selectAuth);
  // Every result here already belongs to the searching Branch-Admin's own
  // branch — show a clean city name derived from Branch.branchName's last
  // word (e.g. "Tsangpool Honda Golaghat" -> "Golaghat") instead of
  // StockConceptCSV's raw, free-text `location` column ("From CSV, not
  // enum" — whatever a dealer typed into that sheet cell).
  const branchDisplayName = user?.branch?.branchName?.trim().split(/\s+/).pop() ?? "";

  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(term.trim()), 300);
    return () => clearTimeout(handle);
  }, [term]);

  const handleClear = () => {
    setTerm("");
    setDebounced("");
  };

  // No `skip` — an empty search still runs, surfacing a default list of up
  // to 5 Available items; typing narrows it via the same query.
  const { data, isFetching } = useSearchStockForB2BSaleQuery(debounced);

  const results = data?.data ?? [];

  return (
    <div className='space-y-2'>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder='Search Available stock by model or engine number...'
          className='pl-9 pr-9'
        />
        {isFetching ? (
          <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground' />
        ) : (
          term.length > 0 && (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={handleClear}
              aria-label='Clear search'
              className='absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7'
            >
              <X className='h-4 w-4 text-muted-foreground' />
            </Button>
          )
        )}
      </div>

      {!isFetching && results.length === 0 && (
        <p className='text-sm text-muted-foreground px-1'>
          {debounced
            ? `No Available stock matches "${debounced}".`
            : "No Available stock in this branch."}
        </p>
      )}

      {results.length > 0 && (
        <div className='border rounded-lg divide-y'>
          {results.map((item) => {
            const checked = selectedIds.includes(item._id);
            return (
              <label
                key={item._id}
                className='flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/50'
              >
                <Checkbox
                  checked={checked}
                  disabled={checked}
                  onCheckedChange={() => {
                    if (!checked) onSelect(item);
                  }}
                />
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium truncate'>
                    {item.modelName}
                  </p>
                  <p className='text-xs text-muted-foreground truncate'>
                    Engine: {item.engineNumber} · Chassis: {item.chassisNumber}
                  </p>
                </div>
                <Badge variant='outline' className='text-[10px] bg-green-50 text-green-700'>
                  {item.status}
                </Badge>
                <Badge variant='outline' className='text-[10px]'>
                  {branchDisplayName || item.location}
                </Badge>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StockItemSearch;
