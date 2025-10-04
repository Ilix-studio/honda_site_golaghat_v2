import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { TrendingUp, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const CustomerQueries = () => {
  // Dashboard stats
  const stats = [
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
  // Fetch dashboard data

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
            <Card className='border-l-4 border-black'>
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
    </>
  );
};

export default CustomerQueries;
