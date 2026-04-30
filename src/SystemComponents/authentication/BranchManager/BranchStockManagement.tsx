// mainComponents/Admin/BranchM/BranchStockManagement.tsx

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ViewStockConcept from "@/SystemComponents/shared/ViewBS2/ViewStockConcept";
import GetAllStockFiles from "@/SystemComponents/shared/InventoryCSV/GetAllStockFiles";

const BranchStockManagement = () => {
  return (
    <div className='p-6 space-y-6'>
      <div>
        <h2 className='text-2xl font-semibold tracking-tight'>
          Stock Management
        </h2>
        <p className='text-sm text-muted-foreground mt-1'>
          View and manage stock items for your branch.
        </p>
      </div>

      <Tabs defaultValue='stock-concept'>
        <TabsList>
          <TabsTrigger value='stock-concept'>Stock Items</TabsTrigger>
          <TabsTrigger value='csv-stocks'>CSV Stock Files</TabsTrigger>
        </TabsList>

        <TabsContent value='stock-concept' className='mt-4'>
          <ViewStockConcept />
        </TabsContent>

        <TabsContent value='csv-stocks' className='mt-4'>
          <GetAllStockFiles />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BranchStockManagement;
