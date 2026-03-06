import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  User,
  Bike,
  Check,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  resetSetupProgress,
  selectSetupProgress,
  selectCompletedTasks,
  setProfileCompleted,
  setVehicleCompleted,
  setSelectVASCompleted,
} from "@/redux-store/slices/setupProgressSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useGetCustomerProfileQuery } from "@/redux-store/services/customer/customerApi";
import { useGetMyVehiclesQuery } from "@/redux-store/services/customer/customerVehicleApi";
import { selectCustomerAuth } from "@/redux-store/slices/customer/customerAuthSlice";

interface ActionItem {
  id: string;
  title: string;
  buttonText: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  description: string;
  completed?: boolean;
  accent: string;
}

const InitialDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { customer: isAuthenticated } = useAppSelector(selectCustomerAuth);
  const setupProgress = useAppSelector(selectSetupProgress);
  const completedTasks = useAppSelector(selectCompletedTasks);

  const {
    data: profileData,
    isSuccess: profileLoaded,
    isError: profileError,
  } = useGetCustomerProfileQuery(undefined, { skip: !isAuthenticated });

  const { data: vehicleData, isSuccess: vehiclesLoaded } =
    useGetMyVehiclesQuery(undefined, { skip: !isAuthenticated });

  useEffect(() => {
    if (profileLoaded) dispatch(setProfileCompleted(!!profileData?.data));
    if (profileError) dispatch(setProfileCompleted(false));
  }, [profileLoaded, profileError, profileData, dispatch]);

  useEffect(() => {
    if (vehiclesLoaded) {
      dispatch(
        setVehicleCompleted(
          Array.isArray(vehicleData?.data) && vehicleData.data.length > 0
        )
      );
    }
  }, [vehiclesLoaded, vehicleData, dispatch]);

  useEffect(() => {
    if (vehiclesLoaded && vehicleData?.data) {
      const hasActiveVAS =
        Array.isArray(vehicleData.data) &&
        vehicleData.data.some((v: any) =>
          v.activeValueAddedServices?.some((s: any) => s.isActive)
        );
      dispatch(setSelectVASCompleted(hasActiveVAS));
    }
  }, [vehiclesLoaded, vehicleData, dispatch]);

  useEffect(() => {
    if (location.state?.profileCompleted) {
      dispatch(setProfileCompleted(true));
      navigate("/customer/initialize", { replace: true });
    }
  }, [location.state, navigate, dispatch]);

  const handleItemClick = (itemId: string, originalOnClick: () => void) => {
    if (itemId === "vehicle") dispatch(setVehicleCompleted(true));
    if (itemId === "add-VAS") dispatch(setSelectVASCompleted(true));
    originalOnClick();
  };

  const actionItems: ActionItem[] = [
    {
      id: "profile",
      title: "Create Profile",
      buttonText: "Get Started",
      icon: User,
      onClick: () => navigate("/customer/profile/create"),
      description: "Set up your personal information and preferences",
      completed: setupProgress.profile,
      accent: "#3b82f6",
    },
    {
      id: "vehicle",
      title: "Add Vehicle",
      buttonText: "Add Now",
      icon: Bike,
      onClick: () => navigate("/customer/select/stock"),
      description: "Register your motorcycle details and specifications",
      completed: setupProgress.vehicle,
      accent: "#f97316",
    },
    {
      id: "add-VAS",
      title: "Select VAS",
      buttonText: "Choose Services",
      icon: Check,
      onClick: () => navigate("/customer/services/vas"),
      description: "Unlock Value Added Services for your vehicle",
      completed: setupProgress.selectVAS,
      accent: "#10b981",
    },
  ];

  const totalTasks = actionItems.length;
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);
  const allDone = completedTasks === totalTasks;

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='px-4 sm:px-6 py-8 max-w-3xl mx-auto space-y-6'>
        {/* Progress header card */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className='relative overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm p-6'
        >
          {/* background accent */}
          <div
            className='absolute inset-0 opacity-[0.03] pointer-events-none'
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 1px,transparent 20px),repeating-linear-gradient(90deg,#000 0,#000 1px,transparent 1px,transparent 20px)",
            }}
          />

          <div className='relative flex items-start justify-between gap-4 mb-5'>
            <div>
              <h2 className='text-base font-black text-gray-900 uppercase tracking-widest'>
                Setup Progress
              </h2>
              <p className='text-xs text-gray-400 mt-0.5'>
                Complete all steps to activate your account
              </p>
            </div>
            <div className='flex items-center gap-2 shrink-0'>
              {setupProgress.profile ? (
                <span className='flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full'>
                  <CheckCircle className='w-3.5 h-3.5' /> Profile Complete
                </span>
              ) : (
                <span className='flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full'>
                  <AlertCircle className='w-3.5 h-3.5' /> Profile Pending
                </span>
              )}
            </div>
          </div>

          {/* progress bar */}
          <div className='relative'>
            <div className='flex justify-between text-xs text-gray-400 mb-1.5'>
              <span>
                {completedTasks} of {totalTasks} steps
              </span>
              <span className='font-bold text-gray-700'>
                {progressPercent}%
              </span>
            </div>
            <div className='w-full bg-gray-100 rounded-full h-2 overflow-hidden'>
              <motion.div
                className='h-full rounded-full bg-gradient-to-r from-blue-500 via-orange-400 to-emerald-500'
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              />
            </div>

            {/* step markers */}
            <div className='flex justify-between mt-2'>
              {actionItems.map((item) => (
                <div key={item.id} className='flex items-center gap-1'>
                  <div
                    className='w-2 h-2 rounded-full transition-colors duration-300'
                    style={{
                      background: item.completed ? item.accent : "#e5e7eb",
                    }}
                  />
                  <span className='text-[10px] text-gray-400 hidden sm:inline'>
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Step cards */}
        <div className='space-y-3'>
          {actionItems.map((item, index) => {
            const Icon = item.icon;
            const done = item.completed;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.1 + index * 0.08,
                  duration: 0.35,
                  ease: "easeOut",
                }}
                className={`relative overflow-hidden flex items-center gap-4 bg-white border rounded-2xl p-4 transition-all duration-200 ${
                  done
                    ? "border-gray-100 opacity-75"
                    : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                }`}
              >
                {/* left accent bar */}
                <div
                  className='absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl'
                  style={{ background: done ? "#d1fae5" : item.accent }}
                />

                {/* step number / icon */}
                <div
                  className='w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ml-2'
                  style={{ background: done ? "#f0fdf4" : `${item.accent}15` }}
                >
                  {done ? (
                    <CheckCircle className='w-5 h-5 text-emerald-500' />
                  ) : (
                    <Icon className='w-5 h-5' />
                  )}
                </div>

                {/* text */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <p
                      className={`font-bold text-sm ${
                        done ? "text-gray-400 line-through" : "text-gray-900"
                      }`}
                    >
                      {item.title}
                    </p>
                    {done && (
                      <span className='text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full'>
                        Done
                      </span>
                    )}
                  </div>
                  <p className='text-xs text-gray-400 mt-0.5'>
                    {item.description}
                  </p>
                </div>

                {/* action */}
                <div className='shrink-0'>
                  {done ? (
                    <div className='w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center'>
                      <Check className='w-4 h-4 text-emerald-500' />
                    </div>
                  ) : (
                    <Button
                      size='sm'
                      onClick={() => handleItemClick(item.id, item.onClick)}
                      className='rounded-xl h-8 px-3 text-xs font-semibold text-white border-0'
                      style={{ background: item.accent }}
                    >
                      {item.buttonText}
                      <ArrowRight className='w-3 h-3 ml-1' />
                    </Button>
                  )}
                </div>

                {/* dev reset */}
                {process.env.NODE_ENV === "development" && (
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => dispatch(resetSetupProgress())}
                    className='absolute bottom-1 right-1 text-[10px] h-5 px-1.5 opacity-30 hover:opacity-100'
                  >
                    reset
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* All done CTA */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className='relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white'
            >
              <div
                className='absolute inset-0 opacity-10 pointer-events-none'
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 12px)",
                }}
              />
              <div className='relative'>
                <div className='flex items-center gap-2 mb-1'>
                  <CheckCircle className='w-5 h-5' />
                  <h3 className='font-black text-sm uppercase tracking-widest'>
                    All Set!
                  </h3>
                </div>
                <p className='text-sm text-emerald-100 mb-4'>
                  Your account is fully configured. What would you like to do
                  next?
                </p>
                <div className='flex flex-wrap gap-2'>
                  <Button
                    size='sm'
                    onClick={() =>
                      navigate("/customer/select/stock", { replace: true })
                    }
                    className='rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 text-xs font-bold h-9'
                  >
                    <Plus className='w-3.5 h-3.5 mr-1.5' />
                    Add Another Vehicle
                  </Button>
                  <Button
                    size='sm'
                    onClick={() =>
                      navigate("/customer/first-dash", { replace: true })
                    }
                    className='rounded-xl bg-emerald-400 hover:bg-emerald-300 text-white text-xs font-bold h-9 border-0'
                  >
                    Go to Dashboard
                    <ArrowRight className='w-3.5 h-3.5 ml-1.5' />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InitialDashboard;
