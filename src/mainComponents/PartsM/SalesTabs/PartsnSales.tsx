import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
  selectActiveTab,
  setActiveTab,
} from "@/redux-store/slices/dashboardTabsSlice";
import { motion } from "framer-motion";
import { Bot, Building2 } from "lucide-react";
import PartsKpiCharts from "../PartsKpiCharts";
import CPOTC from "./CPOTC";
const PARTS_DASHBOARD_TAB_KEY = "adminDashboard";

const PartsnSales = () => {
  const dispatch = useAppDispatch();

  const activeTab =
    useAppSelector(selectActiveTab(PARTS_DASHBOARD_TAB_KEY)) ?? "dashboards";

  return (
    <div>
      <div className='container px-2 py-2'>
        <Tabs
          value={activeTab}
          onValueChange={(v) =>
            dispatch(setActiveTab({ key: PARTS_DASHBOARD_TAB_KEY, value: v }))
          }
          className='w-full'
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className='sticky top-1 z-10 mb-0.1'
          >
            <TabsList className='inline-flex h-12 w-full md:w-auto bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md rounded-xl p-1 gap-1'>
              <TabsTrigger
                value='dashboards'
                className='flex items-center gap-2 px-5 rounded-lg text-sm font-medium text-gray-500 transition-all duration-200 hover:text-blue-700 hover:bg-blue-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md'
              >
                <Bot className='h-4 w-4' />
                <span>Parts Counts</span>
              </TabsTrigger>
              <TabsTrigger
                value='branch-queries'
                className='flex items-center gap-1.5 px-5 rounded-lg text-sm font-medium text-gray-500 transition-all duration-200 hover:text-gray-900 hover:bg-gray-50 data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md'
              >
                <Building2 className='h-4 w-4' />
                <span>CPOTC</span>
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value='dashboards' className='mt-2'>
            <PartsKpiCharts />
          </TabsContent>

          <TabsContent value='branch-queries' className='mt-2'>
            <CPOTC />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PartsnSales;
