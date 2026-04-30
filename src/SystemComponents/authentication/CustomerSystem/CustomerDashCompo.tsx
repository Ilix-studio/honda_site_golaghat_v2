import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Wrench,
  Bell,
  Phone,
  MessageSquare,
} from "lucide-react";

export function CustomerDashCompo() {
  const upcomingServices = [
    {
      type: "Regular Service",
      dueDate: "2024-09-15",
      mileage: "5,000 km",
      status: "upcoming",
    },
    {
      type: "Insurance Renewal",
      dueDate: "2024-10-20",
      status: "pending",
    },
  ];

  const recentActivity = [
    {
      activity: "Service Completed",
      date: "2024-07-10",
      details: "Regular maintenance service",
    },
    {
      activity: "Insurance Updated",
      date: "2024-06-15",
      details: "Policy renewed for 1 year",
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <Button className='w-full bg-red-600 hover:bg-red-700'>
            <Calendar className='w-4 h-4 mr-2' />
            Book Service
          </Button>
          <Button variant='outline' className='w-full bg-transparent'>
            <Phone className='w-4 h-4 mr-2' />
            Contact Support
          </Button>
          <Button variant='outline' className='w-full bg-transparent'>
            <MessageSquare className='w-4 h-4 mr-2' />
            Chat with Expert
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Services */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center text-lg'>
            <Wrench className='w-5 h-5 mr-2 text-red-600' />
            Upcoming Services
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {upcomingServices.map((service, index) => (
            <div key={index} className='border-l-4 border-red-200 pl-4 py-2'>
              <div className='flex items-center justify-between mb-1'>
                <h4 className='font-semibold text-gray-900'>{service.type}</h4>
                <Badge
                  variant={
                    service.status === "upcoming" ? "default" : "secondary"
                  }
                >
                  {service.status}
                </Badge>
              </div>
              <p className='text-sm text-gray-600 flex items-center'>
                <Calendar className='w-4 h-4 mr-1' />
                {new Date(service.dueDate).toLocaleDateString("en-IN")}
              </p>
              {service.mileage && (
                <p className='text-sm text-gray-600'>{service.mileage}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center text-lg'>
            <Clock className='w-5 h-5 mr-2 text-red-600' />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {recentActivity.map((activity, index) => (
            <div
              key={index}
              className='border-b border-gray-100 last:border-b-0 pb-3 last:pb-0'
            >
              <h4 className='font-semibold text-gray-900'>
                {activity.activity}
              </h4>
              <p className='text-sm text-gray-600'>{activity.details}</p>
              <p className='text-xs text-gray-500 mt-1'>
                {new Date(activity.date).toLocaleDateString("en-IN")}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center text-lg'>
            <Bell className='w-5 h-5 mr-2 text-red-600' />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
            <p className='text-sm text-yellow-800'>
              <strong>Reminder:</strong> Your next service is due in 15 days.
              Book now to avoid any inconvenience.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
