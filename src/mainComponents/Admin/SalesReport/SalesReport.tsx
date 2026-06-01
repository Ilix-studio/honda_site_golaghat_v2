import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Cog, BookAudio } from "lucide-react";
import ViewAssignedStock from "./ViewAssignedStock";
import ViewAssignedStockCSV from "./ViewAssignedStockCSV";

const SalesReport = () => {
  return (
    <>
      <div className='min-h-screen bg-gray-50'>
        <div className='container px-4 py-8 overflow-y-auto'>
          <Tabs defaultValue='assigned-stock' className='w-full'>
            <TabsList className='inline-flex h-12 w-full md:w-auto bg-white border border-gray-200 shadow-sm rounded-xl p-1 gap-1'>
              <TabsTrigger
                value='assigned-stock'
                className='flex items-center gap-2 px-5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md'
              >
                <Cog className='h-4 w-4' />
                <span>Assigned Stock</span>
              </TabsTrigger>
              <TabsTrigger
                value='assign-stock-excel'
                className='flex items-center gap-2 px-5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md'
              >
                <BookAudio className='h-4 w-4' />
                <span>Assign Stock Excel</span>
              </TabsTrigger>
              <TabsTrigger
                value='bulk-order-requests'
                className='flex items-center gap-2 px-5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md'
              >
                <BookAudio className='h-4 w-4' />
                <span>Bulk Order Requests</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value='assigned-stock' className='mt-6'>
              <Card className='border border-gray-200 shadow-sm rounded-2xl overflow-hidden'>
                <CardContent className='p-2'>
                  <ViewAssignedStock />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='assign-stock-excel' className='mt-6'>
              <Card className='border border-gray-200 shadow-sm rounded-2xl overflow-hidden'>
                <CardContent className='p-2'>
                  <ViewAssignedStockCSV />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value='bulk-order-requests' className='mt-6'>
              <Card className='border border-gray-200 shadow-sm rounded-2xl overflow-hidden'>
                <CardContent className='p-2'>
                  <h2 className='text-center text-2xl font-bold text-gray-900'>
                    Bulk Order Sales Report
                  </h2>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default SalesReport;
