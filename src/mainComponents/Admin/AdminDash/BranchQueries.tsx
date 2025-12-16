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
  SplinePointer,
} from "lucide-react";
import { useGetBranchesQuery } from "@/redux-store/services/branchApi";
import { useGetAllBranchManagersQuery } from "@/redux-store/services/branchManagerApi";

import { CardDescription } from "@/components/ui/card";

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
      value: "1",
      icon: User,
      loading: false,
      description: "Total Customers",
      action: { label: "Open Sign-up form", href: "/admin/customers/signup" },
    },
    {
      title: "Branches",
      value: branchesData?.count || 0,
      icon: Building2,
      loading: branchesLoading,
      description: "Service locations",
      action: { label: "Add Branches", href: "/admin/branches/add" },
    },
    {
      title: "Branch Managers",
      value: branchManagersData?.count || 0,
      icon: Users,
      loading: managersLoading,
      description: "Active managers",
      action: { label: "Add Manager", href: "/admin/branches/managers" },
    },

    {
      title: "Add Value-Added Services",
      icon: TrendingUp,
      loading: false,
      description: "Add VAS to vehicles",
      action: { label: "Open VAS Form", href: "/admin/forms/vas" },
    },

    {
      title: "Stock-Queries",
      icon: TrendingUp,
      loading: false,
      description: "Total Vehicles in this Branch",
      action: { label: "Open Form", href: "/admin/forms/select" },
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
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className='border-l-6 border-gray-500'>
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
            <Link to='/admin/branches/view'>
              <Button className='w-full justify-start' variant='outline'>
                <Building2 className='h-4 w-4 mr-2' />
                View All Branches
              </Button>
            </Link>

            <Link to='/view/stock-concept'>
              <Button className='w-full justify-start' variant='outline'>
                <SplinePointer className='h-4 w-4 mr-2' />
                View All Stock Bikes
              </Button>
            </Link>

            <Link to='/admin/view/vas'>
              <Button className='w-full justify-start' variant='outline'>
                <Cog className='h-4 w-4 mr-2' />
                View Value Added Services
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visitor Analytics</CardTitle>
          </CardHeader>

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
