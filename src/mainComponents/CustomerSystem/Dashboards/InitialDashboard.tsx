import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Bike, Settings, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CustomerDashHeader } from "@/mainComponents/Home/Header/CustomerDashHeader";

interface ActionItem {
  title: string;
  buttonText: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  description: string;
}

const InitialDashboard: React.FC = () => {
  const navigate = useNavigate();
  const onCreateProfile = () => {
    navigate("/customer-profile");
  };

  const onAddMotorcycle = () => {
    navigate("/customer-motor-info");
  };

  const onCreateService = () => {
    navigate("");
  };

  const onAddValueService = () => {
    navigate("");
  };

  const actionItems: ActionItem[] = [
    {
      title: "Create Customer Profile",
      buttonText: "Create",
      icon: User,
      onClick: onCreateProfile,
      description:
        "Set up a new customer profile with personal information and preferences",
    },
    {
      title: "Add Motorcycle Info",
      buttonText: "Add",
      icon: Bike,
      onClick: onAddMotorcycle,
      description:
        "Register motorcycle details, specifications, and maintenance history",
    },
    {
      title: "Services Info",
      buttonText: "Create",
      icon: Settings,
      onClick: onCreateService,
      description:
        "Schedule and manage motorcycle service appointments and maintenance",
    },
    {
      title: "Value Added Services",
      buttonText: "Add",
      icon: Plus,
      onClick: onAddValueService,
      description:
        "Explore additional services like insurance, extended warranty, and accessories",
    },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      <CustomerDashHeader />

      {/* Dashboard Content */}
      <div className='p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {actionItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className='border border-gray-300'>
                  <CardHeader className='pb-4'>
                    <div className='h-32 flex flex-col items-center justify-center space-y-3'>
                      <IconComponent className='h-8 w-8 text-gray-600' />
                      <h2 className='text-xl font-medium text-gray-900 text-center'>
                        {item.title}
                      </h2>
                    </div>
                  </CardHeader>
                  <CardContent className='pt-0'>
                    <div className='flex justify-center'>
                      <Button
                        variant='outline'
                        className='px-8 py-2 border-2 border-gray-800 text-gray-800 hover:bg-gray-50'
                        onClick={item.onClick}
                      >
                        {item.buttonText}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitialDashboard;
// If Success show complete icon or status kind of thing
