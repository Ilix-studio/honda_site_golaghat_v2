import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllApplicationsTab } from "./AllApplicationsTab";
import { WithBikesTab } from "./WithBikesTab";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  selectActiveTab,
  setActiveTab,
} from "@/redux-store/slices/dashboardTabsSlice";

const FINANCE_QUERIES_TAB_KEY = "financeQueries";

const FinanceQueries = () => {
  const dispatch = useAppDispatch();
  const activeTab =
    useAppSelector(selectActiveTab(FINANCE_QUERIES_TAB_KEY)) ??
    "all-applications";

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='p-6 space-y-6'>
        <div>
          <h2 className='text-2xl font-semibold tracking-tight'>
            Finance Queries
          </h2>
          <p className='text-sm text-muted-foreground mt-1'>
            Manage all finance applications and bike-specific enquiries.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) =>
            dispatch(setActiveTab({ key: FINANCE_QUERIES_TAB_KEY, value: v }))
          }
        >
          <TabsList>
            <TabsTrigger value='all-applications'>All Applications</TabsTrigger>
            <TabsTrigger value='with-bikes'>Bike Enquiries</TabsTrigger>
          </TabsList>

          <TabsContent value='all-applications' className='mt-4'>
            <Card size='sm'>
              <CardHeader>
                <CardTitle className='text-base'>
                  Finance Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AllApplicationsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='with-bikes' className='mt-4'>
            <Card size='sm'>
              <CardHeader>
                <CardTitle className='text-base'>
                  Applications with Bike Enquiry
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WithBikesTab />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FinanceQueries;
