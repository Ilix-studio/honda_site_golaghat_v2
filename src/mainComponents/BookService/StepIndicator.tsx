interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator = ({
  currentStep,
  totalSteps,
}: StepIndicatorProps) => {
  return (
    <div className='mt-4'>
      <div className='flex justify-between mb-2'>
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((i) => (
          <div
            key={i}
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep === i
                ? "bg-red-600 text-white"
                : currentStep > i
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {i}
          </div>
        ))}
      </div>
      <div className='w-full bg-gray-200 h-2 rounded-full'>
        <div
          className='bg-red-600 h-2 rounded-full transition-all duration-300'
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};
