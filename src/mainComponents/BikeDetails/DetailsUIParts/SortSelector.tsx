import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
  setFilters,
  selectBikesFilters,
} from "../../../redux-store/slices/BikeSystemSlice/bikesSlice";

interface SortSelectorProps {
  className?: string;
}

export function SortSelector({ className = "w-[180px]" }: SortSelectorProps) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectBikesFilters);

  const sortOptions = [
    { value: "createdAt", label: "Newest First" },
    { value: "modelName", label: "Name A-Z" },
    { value: "priceBreakdown.exShowroomPrice", label: "Price: Low to High" },
    { value: "-priceBreakdown.exShowroomPrice", label: "Price: High to Low" },
    { value: "power", label: "Power: Low to High" },
    { value: "-power", label: "Power: High to Low" },
    { value: "year", label: "Year: Old to New" },
    { value: "-year", label: "Year: New to Old" },
  ];

  const handleSortChange = (value: string) => {
    dispatch(
      setFilters({
        sortBy: value,
        sortOrder: value.startsWith("-") ? "desc" : "asc",
      })
    );
  };

  const getCurrentSortValue = () => {
    const { sortBy, sortOrder } = filters;
    if (!sortBy) return "createdAt";

    if (sortOrder === "desc" && !sortBy.startsWith("-")) {
      return `-${sortBy}`;
    }
    return sortBy;
  };

  return (
    <Select value={getCurrentSortValue()} onValueChange={handleSortChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder='Sort by' />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
