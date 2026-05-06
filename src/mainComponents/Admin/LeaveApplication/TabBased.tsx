import { useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Redux
import { useAppSelector } from "../../../hooks/redux";
import { selectAuth } from "../../../redux-store/slices/authSlice";

// Import the new components

import LeaveStatus from "./LeaveStatus";
import ListLeave from "./ListLeave";

const TabBased = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector(selectAuth);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/superlogin");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-red-950'>
        <div className='flex flex-col items-center gap-4'>
          <div className='relative'>
            <div className='animate-spin h-10 w-10 border-[3px] border-red-500 rounded-full border-t-transparent' />
            <div className='absolute inset-0 animate-ping h-10 w-10 border border-red-500/20 rounded-full' />
          </div>
          <p className='text-gray-400 text-sm tracking-wide'>
            Authenticating...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Hero Banner */}
      <div className='relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-red-950'>
        {/* Background pattern */}
        <div className='absolute inset-0 opacity-[0.04]'>
          <div
            className='absolute inset-0'
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        {/* Bottom edge fade */}
        <div className='absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent' />
      </div>

      {/* Main Content */}
      <div className='container px-4 py-8'>
        <Tabs defaultValue='branch-queries' className='w-full'>
          <TabsList className='inline-flex h-12 w-full md:w-auto bg-white border border-gray-200 shadow-sm rounded-xl p-1 gap-1'>
            <TabsTrigger
              value='branch-queries'
              className='flex items-center gap-2 px-5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md'
            >
              <Building2 className='h-4 w-4' />
              <span>All Applications</span>
            </TabsTrigger>
            <TabsTrigger
              value='customer-queries'
              className='flex items-center gap-2 px-5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md'
            >
              <MessageSquare className='h-4 w-4' />
              <span>Approval List</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='branch-queries' className='mt-6'>
            <Card className='border border-gray-200 shadow-sm rounded-2xl overflow-hidden'>
              <CardContent className='p-6'>
                <LeaveStatus />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='customer-queries' className='mt-6'>
            <Card className='border border-gray-200 shadow-sm rounded-2xl overflow-hidden'>
              <CardContent className='p-6'>
                <ListLeave />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TabBased;
