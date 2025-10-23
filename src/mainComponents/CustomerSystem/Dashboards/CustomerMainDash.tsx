import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { CustomerBikeInfo } from "../CustomerBikeInfo";

import { useAppSelector } from "@/hooks/redux";
import { selectCustomerAuth } from "@/redux-store/slices/customer/customerAuthSlice";
import { Loader2 } from "lucide-react";
import { TokenDebugger } from "@/lib/TokenDebugger";
import { CustomerDashHeader } from "@/mainComponents/Home/Header/CustomerDashHeader";

export default function CustomerMainDash() {
  const navigate = useNavigate();
  const { customer, isAuthenticated, firebaseToken } =
    useAppSelector(selectCustomerAuth);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !customer || !firebaseToken) {
      navigate("/customer/login", { replace: true });
    }
  }, [isAuthenticated, customer, firebaseToken, navigate]);

  // Show loading while checking authentication
  if (!isAuthenticated || !customer) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-8 h-8 animate-spin text-blue-600 mx-auto mb-4' />
          <p className='text-gray-600'>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <CustomerDashHeader />
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Owner Dashboard
          </h1>
          <p className='text-gray-600'>
            Welcome back, {customer.phoneNumber}! Here's your motorcycle
            information and service details.
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-1 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2'>
            <CustomerBikeInfo />
            <TokenDebugger />
          </div>
        </div>
      </main>
    </div>
  );
}
