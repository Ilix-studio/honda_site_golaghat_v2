// import StockInvestmentKpiCharts from "./StockInvestmentKpiCharts";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";

import {
  selectActiveTab,
  setActiveTab,
} from "@/redux-store/slices/dashboardTabsSlice";
import { Bitcoin, Equal } from "lucide-react";
import StockInvestmentKpiCharts from "./StockInvestmentKpiCharts";
import { ManualAssignDashboard } from "./KPIDashs/AssignSystem";

const ADMIN_DASHBOARD_STOCK_INFO_KEY = "Invest_dashboards";

export default function StockInvestmentDashboard() {
  const dispatch = useAppDispatch();
  const activeTab =
    useAppSelector(selectActiveTab(ADMIN_DASHBOARD_STOCK_INFO_KEY)) ??
    "Invest_dashboards";
  return (
    // <div className='space-y-6'>
    //   <StockInvestmentKpiCharts />
    // </div>

    <div className='container px-2 py-2'>
      <Tabs
        value={activeTab}
        onValueChange={(v) =>
          dispatch(
            setActiveTab({ key: ADMIN_DASHBOARD_STOCK_INFO_KEY, value: v }),
          )
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
              value='Invest_dashboards'
              className='flex items-center gap-2 px-5 rounded-lg text-sm font-medium text-gray-500 transition-all duration-200 hover:text-blue-700 hover:bg-blue-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md'
            >
              <Bitcoin className='h-4 w-4' />
              <span>Investment</span>
            </TabsTrigger>
            <TabsTrigger
              value='Assign-Dashboards'
              className='flex items-center gap-1.5 px-5 rounded-lg text-sm font-medium text-gray-500 transition-all duration-200 hover:text-gray-900 hover:bg-gray-50 data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md'
            >
              <Equal className='h-4 w-4' />
              <span>Assign Info</span>
            </TabsTrigger>
          </TabsList>
        </motion.div>
        <TabsContent value='Invest_dashboards' className='mt-2'>
          <Card
            size='sm'
            className='border border-gray-200 shadow-sm rounded-2xl overflow-hidden'
          >
            <CardHeader className='bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-4 py-3'>
              <div className='flex items-center gap-3'>
                <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-blue-600 text-white shadow-sm'>
                  <Bitcoin className='h-5 w-5' />
                </div>
                <div>
                  <CardTitle className='text-lg font-semibold text-gray-900'>
                    Dashboards
                  </CardTitle>
                  <CardDescription className='text-gray-500 mt-0.5'>
                    Dashboard KPIs across branches
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='p-2'>
              <StockInvestmentKpiCharts />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='Assign-Dashboards' className='mt-2'>
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
                    Branch Management & Analytics
                  </CardTitle>
                  <CardDescription className='text-gray-500 mt-0.5'>
                    Monitor branch performance, managers, and operations
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='p-2'>
              <ManualAssignDashboard />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
