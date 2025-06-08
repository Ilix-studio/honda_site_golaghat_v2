import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categories } from "../../../constants/formOptions";

interface CategoryTabsProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  className?: string;
}

export function CategoryTabs({
  selectedCategory,
  setSelectedCategory,
  className,
}: CategoryTabsProps) {
  return (
    <Tabs
      value={selectedCategory}
      onValueChange={setSelectedCategory}
      className={className}
    >
      <TabsList className='grid grid-cols-3 md:grid-cols-6 lg:flex h-auto'>
        {categories.map((category) => (
          <TabsTrigger key={category.id} value={category.id} className='py-2'>
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
