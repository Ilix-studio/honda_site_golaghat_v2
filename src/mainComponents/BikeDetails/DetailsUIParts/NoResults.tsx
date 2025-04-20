import { Button } from "@/components/ui/button";

interface NoResultsProps {
  resetFilters: () => void;
}

export function NoResults({ resetFilters }: NoResultsProps) {
  return (
    <div className='text-center py-12 border rounded-lg'>
      <h3 className='text-lg font-medium mb-2'>No bikes found</h3>
      <p className='text-muted-foreground mb-4'>
        Try adjusting your filters to find what you're looking for.
      </p>
      <Button variant='outline' onClick={resetFilters}>
        Reset All Filters
      </Button>
    </div>
  );
}
