import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BranchCustomerVehicles = () => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container px-4 py-8'>
        <div className='mb-6'>
          <Button
            variant='ghost'
            onClick={() => navigate("/manager/dashboard")}
            className='gap-2 mb-4'
          >
            <ArrowLeft className='h-4 w-4' />
            Back to Dashboard
          </Button>
          <Card>
            <CardHeader>
              <div className='flex items-center gap-3'>
                <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-pink-500 text-white'>
                  <Settings className='h-5 w-5' />
                </div>
                <div>
                  <CardTitle>Customer Vehicles</CardTitle>
                  <CardDescription>
                    View customer vehicle information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-center py-12 text-gray-500'>
                <Settings className='h-12 w-12 mx-auto mb-4 text-gray-300' />
                <p className='text-lg font-medium mb-2'>
                  Customer Vehicles Module
                </p>
                <p className='text-sm'>
                  This module will allow you to view and manage customer vehicle
                  information for your branch.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BranchCustomerVehicles;
