import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BranchAccidentReports = () => {
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
                <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-red-500 text-white'>
                  <FileText className='h-5 w-5' />
                </div>
                <div>
                  <CardTitle>Accident Reports</CardTitle>
                  <CardDescription>
                    View and manage accident reports
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-center py-12 text-gray-500'>
                <FileText className='h-12 w-12 mx-auto mb-4 text-gray-300' />
                <p className='text-lg font-medium mb-2'>
                  Accident Reports Module
                </p>
                <p className='text-sm'>
                  This module will allow you to view, download, and update
                  accident reports for your branch.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BranchAccidentReports;
