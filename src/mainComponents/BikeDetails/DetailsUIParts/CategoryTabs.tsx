import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
  setFilters,
  selectBikesFilters,
} from "../../../redux-store/slices/BikeSystemSlice/bikesSlice";

interface CategoryTabsProps {
  className?: string;
}

export function CategoryTabs({ className }: CategoryTabsProps) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectBikesFilters);

  const categories = [
    { id: "all", name: "All", value: undefined },
    { id: "sport", name: "Sport", value: "sport" },
    { id: "adventure", name: "Adventure", value: "adventure" },
    { id: "cruiser", name: "Cruiser", value: "cruiser" },
    { id: "touring", name: "Touring", value: "touring" },
    { id: "naked", name: "Naked", value: "naked" },
    { id: "electric", name: "Electric", value: "electric" },
    { id: "commuter", name: "Commuter", value: "commuter" },
    { id: "automatic", name: "Automatic", value: "automatic" },
    { id: "gearless", name: "Gearless", value: "gearless" },
  ];

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    dispatch(setFilters({ category: category?.value }));
  };

  const getCurrentCategory = () => {
    return filters.category ? filters.category : "all";
  };

  return (
    <Tabs
      value={getCurrentCategory()}
      onValueChange={handleCategoryChange}
      className={className}
    >
      <TabsList className='grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 h-auto gap-1 bg-gray-100 dark:bg-gray-800 p-1'>
        {categories.map((category) => (
          <TabsTrigger
            key={category.id}
            value={category.id}
            className='py-2 px-3 text-xs md:text-sm whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm'
          >
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
