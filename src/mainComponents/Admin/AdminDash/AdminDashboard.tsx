import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Bike, Building2, TrendingUp, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Redux
import { useAppSelector } from "../../../hooks/redux";

import { useGetBranchesQuery } from "../../../redux-store/services/branchApi";
import { useGetAllBranchManagersQuery } from "../../../redux-store/services/branchManagerApi";
import { selectAuth } from "../../../redux-store/slices/authSlice";

import AdminHeader from "../../Home/Header/AdminHeader";
import RecentMotocycles from "./RecentMotocycles";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector(selectAuth);

  // Fetch dashboard data

  const { data: branchesData, isLoading: branchesLoading } =
    useGetBranchesQuery();
  const { data: branchManagersData, isLoading: managersLoading } =
    useGetAllBranchManagersQuery();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/superlogin");
    }
  }, [isAuthenticated, navigate]);

  // Dashboard stats
  const stats = [
    {
      title: "Branches",
      value: branchesData?.count || 0,
      icon: Building2,
      loading: branchesLoading,
      description: "Service locations",
      action: { label: "Manage", href: "/admin/addbranch" },
    },
    {
      title: "Branch Managers",
      value: branchManagersData?.count || 0,
      icon: Users,
      loading: managersLoading,
      description: "Active managers",
      action: { label: "Add Manager", href: "/admin/managers" },
    },
    {
      title: "This Month",
      value: "₹2.5L",
      icon: TrendingUp,
      loading: false,
      description: "Sales revenue",
      action: { label: "View Report", href: "/admin/reports" },
    },
    {
      title: "Total Customer Join our web-services",
      value: "₹2.5L",
      icon: TrendingUp,
      loading: false,
      description: "Sales revenue",
      action: { label: "View Report", href: "/admin/reports" },
    },
    {
      title: "Service Request",
      value: "₹2.5L",
      icon: TrendingUp,
      loading: false,
      description: "Sales revenue",
      action: { label: "View Report", href: "/admin/reports" },
    },
    {
      title: "Accident Report",
      value: "₹2.5L",
      icon: TrendingUp,
      loading: false,
      description: "Sales revenue",
      action: { label: "View Report", href: "/admin/reports" },
    },
    {
      title: "Parts Ordered",
      value: "₹2.5L",
      icon: TrendingUp,
      loading: false,
      description: "Sales revenue",
      action: { label: "View Report", href: "/admin/reports" },
    },
    {
      title: "Value Added Service Sales",
      value: "₹2.5L",
      icon: TrendingUp,
      loading: false,
      description: "Sales revenue",
      action: { label: "View Report", href: "/admin/reports" },
    },
  ];

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
          <br />
          {/* Stats Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      {stat.title}
                    </CardTitle>
                    <stat.icon className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {stat.loading ? (
                        <div className='h-8 w-16 bg-gray-200 animate-pulse rounded'></div>
                      ) : (
                        stat.value
                      )}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {stat.description}
                    </p>
                    <Link to={stat.action.href}>
                      <Button variant='outline' size='sm' className='mt-3'>
                        <Plus className='h-3 w-3 mr-1' />
                        {stat.action.label}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className='space-y-2'>
                <Link to='/admin/addbikes'>
                  <Button className='w-full justify-start' variant='outline'>
                    <Bike className='h-4 w-4 mr-2' />
                    Add New Motorcycle
                  </Button>
                </Link>
                <Link to='/admin/addScooty'>
                  <Button className='w-full justify-start' variant='outline'>
                    <Bike className='h-4 w-4 mr-2' />
                    Add New Scooty
                  </Button>
                </Link>
                <Link to='/admin/addbranch'>
                  {" "}
                  {/* Add this new button */}
                  <Button className='w-full justify-start' variant='outline'>
                    <Building2 className='h-4 w-4 mr-2' />
                    Add New Branch
                  </Button>
                </Link>
                <Link to='/admin/managers'>
                  <Button className='w-full justify-start' variant='outline'>
                    <Users className='h-4 w-4 mr-2' />
                    Create Branch Manager
                  </Button>
                </Link>
                <Link to='/admin/branches'>
                  <Button className='w-full justify-start' variant='outline'>
                    <Building2 className='h-4 w-4 mr-2' />
                    Manage Branches
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                      <span className='text-sm'>New bike added</span>
                    </div>
                    <span className='text-xs text-muted-foreground'>
                      2 min ago
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                      <span className='text-sm'>Service booked</span>
                    </div>
                    <span className='text-xs text-muted-foreground'>
                      5 min ago
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                      <span className='text-sm'>Inventory updated</span>
                    </div>
                    <span className='text-xs text-muted-foreground'>
                      10 min ago
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <RecentMotocycles />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
