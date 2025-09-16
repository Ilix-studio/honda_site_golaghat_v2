import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  TrendingUp,
  Plus,
  Building2,
  Users,
  User,
  Cog,
  Box,
  SplinePointer,
} from "lucide-react";
import { useGetBranchesQuery } from "@/redux-store/services/branchApi";
import { useGetAllBranchManagersQuery } from "@/redux-store/services/branchManagerApi";

import { CardDescription } from "@/components/ui/card";

import { Bike } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetVisitorStatsQuery } from "@/redux-store/services/visitorApi";
import RecentMotorcycles from "./RecentMotocycles";

const BranchQueries = () => {
  // Fetch dashboard data
  const { data: branchesData, isLoading: branchesLoading } =
    useGetBranchesQuery();
  const { data: branchManagersData, isLoading: managersLoading } =
    useGetAllBranchManagersQuery();
  const { data: visitorStatsData } = useGetVisitorStatsQuery();
  // Dashboard stats
  const stats = [
    {
      title: "Register Customer",
      value: "₹2.5L",
      icon: User,
      loading: false,
      description: "Total Customers",
      action: { label: "Open Sign-up form", href: "/admin/reports" },
    },
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
  ];
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  };

  return (
    <>
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
                Add New Bikes
              </Button>
            </Link>
            <Link to='/admin/addScooty'>
              <Button className='w-full justify-start' variant='outline'>
                <Bike className='h-4 w-4 mr-2' />
                Add New Scooty
              </Button>
            </Link>
            <Link to='/admin/addbranch'>
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
                <SplinePointer className='h-4 w-4 mr-2' />
                Manage Branches
              </Button>
            </Link>
            <Link to='/admin/service-packages'>
              <Button className='w-full justify-start' variant='outline'>
                <Box className='h-4 w-4 mr-2' />
                Add Service Packages
              </Button>
            </Link>
            <Link to='/admin'>
              <Button className='w-full justify-start' variant='outline'>
                <Cog className='h-4 w-4 mr-2' />
                Add Value Added Services
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity and Visitor Analytics</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <span className='text-sm'>New bike added</span>
                </div>
                <span className='text-xs text-muted-foreground'>2 min ago</span>
              </div>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                  <span className='text-sm'>Service booked</span>
                </div>
                <span className='text-xs text-muted-foreground'>5 min ago</span>
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
          {/* Visitor Analytics Section */}
          {visitorStatsData?.data && (
            <motion.div
              className='mb-8'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <CardHeader>
                <CardTitle className='flex items-center gap-2'></CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  <div className='text-center p-4 bg-orange-50 rounded-lg'>
                    <p className='text-2xl font-bold text-orange-900'>
                      {visitorStatsData.data.totalVisitors?.toLocaleString() ||
                        "0"}
                    </p>
                    <p className='text-orange-600 text-sm'>Total Visitors</p>
                  </div>
                  <div className='text-center p-4 bg-blue-50 rounded-lg'>
                    <p className='text-2xl font-bold text-blue-900'>
                      {visitorStatsData.data.todayVisitors}
                    </p>
                    <p className='text-blue-600 text-sm'>Today's Visitors</p>
                  </div>
                  <div className='text-center p-4 bg-green-50 rounded-lg'>
                    <p className='text-2xl font-bold text-green-900'>
                      {visitorStatsData.data.weeklyStats.thisWeek}
                    </p>
                    <p className='text-green-600 text-sm'>This Week</p>
                  </div>
                  <div className='text-center p-4 bg-purple-50 rounded-lg'>
                    <p
                      className={`text-2xl font-bold ${
                        visitorStatsData.data.weeklyStats.growth >= 0
                          ? "text-green-900"
                          : "text-red-900"
                      }`}
                    >
                      {visitorStatsData.data.weeklyStats.growth >= 0 ? "+" : ""}
                      {visitorStatsData.data.weeklyStats.growth}%
                    </p>
                    <p className='text-purple-600 text-sm'>Weekly Growth</p>
                  </div>
                </div>

                {visitorStatsData.data.lastVisit && (
                  <div className='mt-4 text-center text-sm text-gray-600'>
                    Last visitor:{" "}
                    {formatTimeAgo(visitorStatsData.data.lastVisit)}
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </Card>
      </div>
      <RecentMotorcycles />
    </>
  );
};

export default BranchQueries;
