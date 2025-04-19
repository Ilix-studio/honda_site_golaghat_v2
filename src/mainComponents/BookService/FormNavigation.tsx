import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FormNavigationProps {
  step: number;
  totalSteps: number;
  handleBack: () => void;
  handleNext: () => void;
  handleSubmit: () => void;
  isSubmitting: boolean;
}

export const FormNavigation = ({
  step,
  totalSteps,
  handleBack,
  handleNext,
  handleSubmit,
  isSubmitting,
}: FormNavigationProps) => {
  return (
    <div className='flex justify-between'>
      {step > 1 ? (
        <Button
          type='button'
          variant='outline'
          onClick={handleBack}
          disabled={isSubmitting}
        >
          <ChevronLeft className='mr-2 h-4 w-4' /> Back
        </Button>
      ) : (
        <div />
      )}

      {step < totalSteps ? (
        <Button
          type='button'
          onClick={handleNext}
          className='bg-red-600 hover:bg-red-700'
        >
          Next <ChevronRight className='ml-2 h-4 w-4' />
        </Button>
      ) : (
        <Button
          type='button'
          onClick={handleSubmit}
          className='bg-red-600 hover:bg-red-700'
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Book Service"}
        </Button>
      )}
    </div>
  );
};
