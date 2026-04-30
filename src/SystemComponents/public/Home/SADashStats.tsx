import { Card, CardContent } from "@/components/ui/card";
import { Car, Calendar, Users, DollarSign } from "lucide-react";

const stats = [
  {
    name: "Total Vehicles",
    value: "127",
    change: "+12%",
    changeType: "positive",
    icon: Car,
  },
  {
    name: "Pending Bookings",
    value: "23",
    change: "+5%",
    changeType: "positive",
    icon: Calendar,
  },
  {
    name: "Active Customers",
    value: "1,234",
    change: "+8%",
    changeType: "positive",
    icon: Users,
  },
  {
    name: "Monthly Revenue",
    value: "$284K",
    change: "+15%",
    changeType: "positive",
    icon: DollarSign,
  },
];

export function CustomerDashStats() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6'>
      {stats.map((stat) => (
        <Card key={stat.name}>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>{stat.name}</p>
                <p className='text-3xl font-bold text-gray-900'>{stat.value}</p>
                <p
                  className={`text-sm ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.change} from last month
                </p>
              </div>
              <div className='p-3 bg-red-100 rounded-full'>
                <stat.icon className='h-6 w-6 text-red-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
