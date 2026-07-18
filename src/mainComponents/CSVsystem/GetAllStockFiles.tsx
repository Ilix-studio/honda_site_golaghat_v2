// src/components/admin/forms/GetAllStockFiles.tsx

import { useState } from "react";
import { FileSpreadsheet, Database, Package2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ViewStockConcept from "../ViewBS2/ViewStockConcept";
import CSVFolder from "./CSVFolder";
import { motion } from "framer-motion";

const GetAllStockFiles = () => {
  const [activeTab, setActiveTab] = useState<"manual" | "csv">("manual");

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto p-6'>
        <Card size='sm'>
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
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className='sticky top-1 z-10 mb-0.1'
              >
                <TabsList className='inline-flex h-12 w-full md:w-auto bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md rounded-xl p-1 gap-1'>
                  <TabsTrigger
                    value='manual'
                    className='flex items-center gap-1.5 px-5 rounded-lg text-sm font-medium text-gray-500 transition-all duration-200 hover:text-gray-900 hover:bg-gray-50 data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md'
                  >
                    <Database className='h-4 w-4' />
                    Manual Entries
                  </TabsTrigger>
                  <TabsTrigger
                    value='csv'
                    className='flex items-center gap-2 px-5 rounded-lg text-sm font-medium text-gray-500 transition-all duration-200 hover:text-blue-700 hover:bg-blue-50 data-[state=active]:bg-blue-800 data-[state=active]:text-white data-[state=active]:shadow-md'
                  >
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
              </motion.div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GetAllStockFiles;
