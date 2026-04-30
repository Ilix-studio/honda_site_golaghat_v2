// src/components/admin/forms/GetAllStockFiles.tsx

import { useState } from "react";
import { FileSpreadsheet, Database, Package2, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ViewStockConcept from "../ViewBS2/ViewStockConcept";
import CSVFolder from "./CSVFolder";

const GetAllStockFiles = () => {
  const [activeTab, setActiveTab] = useState<"manual" | "csv">("manual");

  return (
    <div className='max-w-7xl mx-auto p-6 space-y-6'>
      {/* ── header ── */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-red-500 to-orange-500 p-6 text-white shadow-lg'>
        {/* decorative circles */}
        <div className='pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10' />
        <div className='pointer-events-none absolute -bottom-10 -left-4 h-32 w-32 rounded-full bg-white/5' />

        <div className='relative flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
              <Package2 className='h-5 w-5 text-white' />
            </div>
            <div>
              <h1 className='text-xl font-bold tracking-tight'>
                Stock Management
              </h1>
              <p className='text-sm text-red-100'>
                Manual entries &amp; CSV import batches
              </p>
            </div>
          </div>
          <div className='hidden sm:flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 backdrop-blur-sm'>
            <TrendingUp className='h-4 w-4 text-white/80' />
            <span className='text-sm font-medium'>Inventory Tracker</span>
          </div>
        </div>
      </div>

      {/* ── tabs ── */}
      <div className='rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden'>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "manual" | "csv")}
        >
          {/* tab bar */}
          <div className='border-b border-gray-100 px-4 pt-4'>
            <TabsList className='h-auto bg-transparent gap-1 p-0'>
              <TabsTrigger
                value='manual'
                className='
                  relative flex items-center gap-2 rounded-t-xl px-5 py-3 text-sm font-semibold
                  text-gray-500 transition-all
                  data-[state=active]:bg-blue-50
                  data-[state=active]:text-blue-700
                  data-[state=active]:shadow-none
                  hover:text-gray-800 hover:bg-gray-50
                '
              >
                <div className='flex h-6 w-6 items-center justify-center rounded-md bg-blue-100'>
                  <Database className='h-3.5 w-3.5 text-blue-600' />
                </div>
                Manual Entries
                {/* active underline */}
                <span className='absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-blue-500 opacity-0 data-[state=active]:opacity-100 transition-opacity' />
              </TabsTrigger>

              <TabsTrigger
                value='csv'
                className='
                  relative flex items-center gap-2 rounded-t-xl px-5 py-3 text-sm font-semibold
                  text-gray-500 transition-all
                  data-[state=active]:bg-emerald-50
                  data-[state=active]:text-emerald-700
                  data-[state=active]:shadow-none
                  hover:text-gray-800 hover:bg-gray-50
                '
              >
                <div className='flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100'>
                  <FileSpreadsheet className='h-3.5 w-3.5 text-emerald-600' />
                </div>
                CSV Entries
                <span className='absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-emerald-500 opacity-0 data-[state=active]:opacity-100 transition-opacity' />
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='manual' className='mt-0 p-0'>
            <ViewStockConcept />
          </TabsContent>

          <TabsContent value='csv' className='mt-0 p-0'>
            <CSVFolder />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GetAllStockFiles;
