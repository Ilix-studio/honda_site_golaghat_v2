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

  // Only the categories the catalogue actually stocks. BikesSchema still allows
  // sport / adventure / cruiser / touring / electric / gearless, but no Honda
  // model here uses them, so those tabs only ever rendered "No bikes found".
  // Add a tab back here when a model of that category is added.
  const categories = [
    { id: "all", name: "All", value: undefined },
    { id: "commuter", name: "Commuter", value: "commuter" },
    { id: "naked", name: "Naked", value: "naked" },
    { id: "automatic", name: "Automatic", value: "automatic" },
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
      <TabsList className='flex w-full justify-start overflow-x-auto scrollbar-hidden snap-x snap-mandatory md:grid md:grid-cols-4 md:overflow-visible h-auto gap-1 bg-gray-100 dark:bg-gray-800 p-1'>
        {categories.map((category) => (
          <TabsTrigger
            key={category.id}
            value={category.id}
            className='shrink-0 snap-start py-2 px-3 text-xs md:text-sm whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm'
          >
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
