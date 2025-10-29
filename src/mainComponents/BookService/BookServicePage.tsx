import React, { useEffect } from "react";

import { BookServiceForm } from "./BookServiceForm";
import { useAppSelector } from "@/hooks/redux";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { selectCustomerAuth } from "@/redux-store/slices/customer/customerAuthSlice";

const BookServicePage: React.FC = () => {
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
    <main className='min-h-screen'>
      <div className='pt-24 pb-20 bg-gray-50'>
        <div className='container px-4 md:px-6'>
          <BookServiceForm />
        </div>
      </div>
    </main>
  );
};

export default BookServicePage;
