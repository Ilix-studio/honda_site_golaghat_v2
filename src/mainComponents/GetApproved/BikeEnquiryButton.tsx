import { Button } from "@/components/ui/button";
import { GetApprovedForm } from "./GetApprovedForm";
import { useState } from "react";
import { DollarSign } from "lucide-react";

export const BikeEnquiryButton: React.FC<{ bike: any }> = ({ bike }) => {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
        <div className='bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
          <div className='p-4 border-b flex justify-between items-center'>
            <h2 className='text-xl font-semibold'>
              Finance Application for {bike.modelName}
            </h2>
            <Button variant='ghost' onClick={() => setShowForm(false)}>
              ×
            </Button>
          </div>
          <GetApprovedForm
            selectedBike={bike}
            onSubmit={() => {
              setShowForm(false);
              // Handle success
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setShowForm(true)}
      className='w-full bg-red-600 hover:bg-red-700'
    >
      <DollarSign className='h-4 w-4 mr-2' />
      Apply for Financing
    </Button>
  );
};
