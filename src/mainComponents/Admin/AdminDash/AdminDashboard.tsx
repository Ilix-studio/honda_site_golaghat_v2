import { useEffect } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Redux
import { useAppSelector } from "../../../hooks/redux";
import { selectAuth } from "../../../redux-store/slices/authSlice";

import AdminHeader from "../../Home/Header/AdminHeader";

// Import the new components
import CustomerQueries from "./CustomerQueries";
import BranchQueries from "./BranchQueries";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector(selectAuth);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/superlogin");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin h-8 w-8 border-4 border-red-600 rounded-full border-t-transparent'></div>
      </div>
    );
  }

  return (
    <>
      <AdminHeader />
      <div className='min-h-screen bg-gray-50'>
        <div className='container px-4 py-8'>
          {user && <p className='text-gray-600'>Welcome back, {user?.name}</p>}
          <p>Here you can manage your Honda dealership</p>

          {/* Tabs Section */}
          <div className='my-8'>
            <Tabs defaultValue='branch-queries' className='w-full'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger
                  value='branch-queries'
                  className='flex items-center gap-2'
                >
                  <Building2 className='h-4 w-4' />
                  Branch Queries
                </TabsTrigger>
                <TabsTrigger
                  value='customer-queries'
                  className='flex items-center gap-2'
                >
                  <MessageSquare className='h-4 w-4' />
                  Customer Queries
                </TabsTrigger>
              </TabsList>

              <TabsContent value='branch-queries' className='mt-6'>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <Building2 className='h-5 w-5' />
                      Branch Management & Analytics
                    </CardTitle>
                    <CardDescription>
                      Monitor branch performance, managers, and operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BranchQueries />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='customer-queries' className='mt-6'>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <MessageSquare className='h-5 w-5' />
                      Customer Analytics & Services
                    </CardTitle>
                    <CardDescription>
                      Track customer engagement, services, and support metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CustomerQueries />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
