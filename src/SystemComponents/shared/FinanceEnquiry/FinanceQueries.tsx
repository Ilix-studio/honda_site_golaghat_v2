import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllApplicationsTab } from "./AllApplicationsTab";
import { WithBikesTab } from "./WithBikesTab";

const FinanceQueries = () => {
  return (
    <div className='p-6 space-y-6'>
      <div>
        <h2 className='text-2xl font-semibold tracking-tight'>
          Finance Queries
        </h2>
        <p className='text-sm text-muted-foreground mt-1'>
          Manage all finance applications and bike-specific enquiries.
        </p>
      </div>

      <Tabs defaultValue='all-applications'>
        <TabsList>
          <TabsTrigger value='all-applications'>All Applications</TabsTrigger>
          <TabsTrigger value='with-bikes'>Bike Enquiries</TabsTrigger>
        </TabsList>

        <TabsContent value='all-applications' className='mt-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Finance Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <AllApplicationsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='with-bikes' className='mt-4'>
          <Card>
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
  );
};

export default FinanceQueries;
