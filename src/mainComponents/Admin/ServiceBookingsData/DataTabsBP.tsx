import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Cog, BookAudio } from "lucide-react";
import ServiceRevenueStats from "./ServiceRevenueStats";
import CustomerInvoices from "@/mainComponents/shared/CustomerInvoices";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  selectActiveTab,
  setActiveTab,
} from "@/redux-store/slices/dashboardTabsSlice";

const SERVICE_BOOKINGS_DATA_TAB_KEY = "serviceBookingsDataTabs";

const DataTabsBP = () => {
  const dispatch = useAppDispatch();
  const activeTab =
    useAppSelector(selectActiveTab(SERVICE_BOOKINGS_DATA_TAB_KEY)) ??
    "revenue-stats";

  return (
    <>
      <div className='min-h-screen bg-gray-50'>
        <div className='container px-4 py-8 overflow-y-auto'>
          <Tabs
            value={activeTab}
            onValueChange={(v) =>
              dispatch(
                setActiveTab({ key: SERVICE_BOOKINGS_DATA_TAB_KEY, value: v }),
              )
            }
            className='w-full'
          >
            <TabsList className='inline-flex h-12 w-full md:w-auto bg-white border border-gray-200 shadow-sm rounded-xl p-1 gap-1'>
              <TabsTrigger
                value='revenue-stats'
                className='flex items-center gap-2 px-5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md'
              >
                <Cog className='h-4 w-4' />
                <span>Service Revenue Stats</span>
              </TabsTrigger>
              <TabsTrigger
                value='invoice-data'
                className='flex items-center gap-2 px-5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md'
              >
                <BookAudio className='h-4 w-4' />
                <span>Customer Invoices</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value='revenue-stats' className='mt-6'>
              <Card className='border border-gray-200 shadow-sm rounded-2xl overflow-hidden'>
                <CardContent className='p-2'>
                  <ServiceRevenueStats />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='invoice-data' className='mt-6'>
              <Card className='border border-gray-200 shadow-sm rounded-2xl overflow-hidden'>
                <CardContent className='p-2'>
                  <CustomerInvoices />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default DataTabsBP;
