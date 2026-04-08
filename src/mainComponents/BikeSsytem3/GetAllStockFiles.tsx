// src/components/admin/forms/GetAllStockFiles.tsx

import { useState } from "react";
import { FileSpreadsheet, Database, Package2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ViewStockConcept from "../ViewBS2/ViewStockConcept";
import CSVFolder from "./CSVFolder";

const GetAllStockFiles = () => {
  const [activeTab, setActiveTab] = useState<"manual" | "csv">("manual");

  return (
    <div className='max-w-7xl mx-auto p-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Package2 className='h-5 w-5' />
            Stock Management
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "manual" | "csv")}
          >
            <TabsList className='grid w-full grid-cols-2 mb-6'>
              <TabsTrigger value='manual' className='flex items-center gap-2'>
                <Database className='h-4 w-4' />
                Manual Entries
              </TabsTrigger>
              <TabsTrigger value='csv' className='flex items-center gap-2'>
                <FileSpreadsheet className='h-4 w-4' />
                CSV Entries
              </TabsTrigger>
            </TabsList>

            <TabsContent value='manual' className='mt-0'>
              <ViewStockConcept />
            </TabsContent>

            <TabsContent value='csv' className='mt-0'>
              <CSVFolder />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GetAllStockFiles;
