import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SortSelectorProps {
  sortBy: string;
  setSortBy: (value: string) => void;
  className?: string;
}

export function SortSelector({
  sortBy,
  setSortBy,
  className = "w-[180px]",
}: SortSelectorProps) {
  return (
    <Select value={sortBy} onValueChange={setSortBy}>
      <SelectTrigger className={className}>
        <SelectValue placeholder='Sort by' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='featured'>Featured</SelectItem>
        <SelectItem value='price-low'>Price: Low to High</SelectItem>
        <SelectItem value='price-high'>Price: High to Low</SelectItem>
        <SelectItem value='newest'>Newest</SelectItem>
        <SelectItem value='engine-size'>Engine Size</SelectItem>
        <SelectItem value='power'>Power</SelectItem>
      </SelectContent>
    </Select>
  );
}
