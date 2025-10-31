import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Bike,
  Check,
  CheckCircle,
  AlertCircle,
  Tags,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";

interface ActionItem {
  id: string;
  title: string;
  buttonText: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  description: string;
  completed?: boolean;
}

const InitialDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Track completion status for each item
  const [completionStatus, setCompletionStatus] = useState<
    Record<string, boolean>
  >({
    profile: false,
    motorcycle: false,
    select_VAS: false,
    generate_tags: false,
  });

  // Check for profile completion from navigation state
  useEffect(() => {
    if (location.state?.profileCompleted) {
      setCompletionStatus((prev) => ({ ...prev, profile: true }));
      // Clear the navigation state
      navigate("/customer/dashboard/initial", { replace: true });
    }
  }, [location.state, navigate]);

  // Calculate overall progress
  const completedTasks = Object.values(completionStatus).filter(Boolean).length;
  const totalTasks = Object.keys(completionStatus).length;
  const isProfileCompleted = completionStatus.profile;

  const handleItemClick = (itemId: string, originalOnClick: () => void) => {
    // Mark as completed when clicked (except for profile which is handled via API)
    if (itemId !== "profile") {
      setCompletionStatus((prev) => ({ ...prev, [itemId]: true }));
    }
    originalOnClick();
  };

  const onCreateProfile = () => {
    navigate("/customer/profile/create");
  };

  const onAddMotorcycle = () => {
    navigate("/customer/vehicle/info");
  };
  const onGenerateTags = () => {
    navigate("/customer/tags/generate");
  };

  const onVAS = () => {
    navigate("/customer/services/vas");
  };

  const actionItems: ActionItem[] = [
    {
      id: "profile",
      title: "Create Customer Profile",
      buttonText: "Create",
      icon: User,
      onClick: onCreateProfile,
      description:
        "Set up a new customer profile with personal information and preferences",
      completed: completionStatus.profile,
    },
    {
      id: "vehicle",
      title: "Add Vehicle Info",
      buttonText: "Add",
      icon: Bike,
      onClick: onAddMotorcycle,
      description:
        "Register motorcycle details, specifications, and maintenance history",
      completed: completionStatus.motorcycle,
    },

    {
      id: "add-VAS",
      title: "Select VAS",
      buttonText: "Select",
      icon: Check,
      onClick: onVAS,
      description: "Unlock Value Added Services",
      completed: completionStatus.select_VAS,
    },

    {
      id: "generate-tags",
      title: "Generate Tags",
      buttonText: "Generate",
      icon: Tags,
      onClick: onGenerateTags,
      description: "Tsangphool Honda Safety Feature",
      completed: completionStatus.generate_tags,
    },
  ];

  return (
    <>
      <div className='min-h-screen bg-gray-50'>
        {/* Dashboard Content */}
        <div className='p-6'>
          <div className='max-w-7xl mx-auto'>
            {/* Progress Overview */}
            <div className='mb-8'>
              <div className='bg-white rounded-lg shadow-sm border p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                  Setup Progress
                </h2>
                <div className='flex items-center space-x-4'>
                  <div className='flex items-center space-x-2'>
                    {isProfileCompleted ? (
                      <CheckCircle className='h-5 w-5 text-green-500' />
                    ) : (
                      <AlertCircle className='h-5 w-5 text-yellow-500' />
                    )}
                    <span
                      className={`font-medium ${
                        isProfileCompleted
                          ? "text-green-700"
                          : "text-yellow-700"
                      }`}
                    >
                      Profile: {isProfileCompleted ? "Complete" : "Incomplete"}
                    </span>
                  </div>
                  <div className='text-gray-400'>•</div>
                  <div className='text-gray-600'>
                    {completedTasks} of {totalTasks} steps completed
                  </div>
                </div>

                {/* Progress Bar */}
                <div className='mt-4'>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                      style={{
                        width: `${(completedTasks / totalTasks) * 100}%`,
                      }}
                    />
                  </div>
                  <p className='text-sm text-gray-500 mt-2'>
                    {Math.round((completedTasks / totalTasks) * 100)}% Complete
                  </p>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {actionItems.map((item) => {
                const IconComponent = item.icon;
                const isCompleted = item.completed;

                return (
                  <Card
                    key={item.id}
                    className={`border transition-all duration-200 ${
                      isCompleted
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <CardHeader className='pb-3 relative'>
                      {/* Success indicator */}
                      {isCompleted && (
                        <div className='absolute top-4 right-4'>
                          <CheckCircle className='h-6 w-6 text-green-600' />
                        </div>
                      )}

                      <div className='h-24 flex flex-col items-center justify-center space-y-2'>
                        <IconComponent
                          className={`h-8 w-8 ${
                            isCompleted ? "text-green-600" : "text-gray-600"
                          }`}
                        />
                        <h2
                          className={`text-xl font-medium text-center ${
                            isCompleted ? "text-green-800" : "text-gray-900"
                          }`}
                        >
                          {item.title}
                        </h2>
                      </div>
                    </CardHeader>

                    <CardContent className='pt-0 space-y-4'>
                      {/* Description */}
                      <p
                        className={`text-sm text-center px-2 ${
                          isCompleted ? "text-green-700" : "text-gray-600"
                        }`}
                      >
                        {item.description}
                      </p>

                      {/* Button */}
                      <div className='flex justify-center'>
                        <Button
                          variant={isCompleted ? "default" : "outline"}
                          className={`px-8 py-2 transition-all ${
                            isCompleted
                              ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                              : "border-2 border-gray-800 text-gray-800 hover:bg-gray-50"
                          }`}
                          onClick={() => handleItemClick(item.id, item.onClick)}
                          disabled={isCompleted}
                        >
                          {isCompleted ? "Completed" : item.buttonText}
                        </Button>
                      </div>

                      {/* Status text */}
                      {isCompleted && (
                        <div className='text-center'>
                          <span className='text-sm text-green-700 font-medium'>
                            ✓ Task Completed
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InitialDashboard;
