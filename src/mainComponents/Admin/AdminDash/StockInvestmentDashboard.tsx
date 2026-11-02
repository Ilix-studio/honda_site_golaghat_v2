import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Equal } from "lucide-react";
import { ManualAssignDashboard } from "./KPIDashs/AssignSystem";

export default function StockInvestmentDashboard() {
  // A tab saved before the Investment tab was removed falls back to the only one left.

  return (
    <div className='container px-2 py-2'>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className='sticky top-0.5 z-10 mb-0.1'
      >
        <Card
          size='sm'
          className='border border-gray-200 shadow-sm rounded-2xl overflow-hidden'
        >
          <CardHeader className='bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-4 py-3'>
            <div className='flex items-center gap-2'>
              <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-gray-900 text-white shadow-sm'>
                <Equal className='h-5 w-5' />
              </div>
              <div>
                <CardTitle className='text-lg font-semibold text-gray-900'>
                  Vehicles Analytics
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-2'>
            <ManualAssignDashboard />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
