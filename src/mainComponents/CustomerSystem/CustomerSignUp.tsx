import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, ShieldCheck, Loader2 } from "lucide-react";
import { auth } from "../../lib/firebase";
import { signInWithCustomToken } from "firebase/auth";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { addNotification } from "@/redux-store/slices/uiSlice";
import {
  clearError,
  loginSuccess,
  registrationStarted,
  selectCustomerAuth,
} from "@/redux-store/slices/customer/customerAuthSlice";
import {
  selectAuth,
  selectIsBranchAdmin,
  setError,
} from "@/redux-store/slices/authSlice";
import NotFoundPage from "../NotFoundPage";
import { useRegisterCustomerByBranchAdminMutation } from "@/redux-store/services/customer/customerLoginApi";

export interface CustomerSignUpProps {
  onSignUpSuccess?: () => void;
}

const CustomerSignUp: React.FC<CustomerSignUpProps> = ({ onSignUpSuccess }) => {
  // ── All hooks MUST be called before any conditional return ──────────
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { isAuthenticated } = useAppSelector(selectAuth);
  const isBranchAdmin = useAppSelector(selectIsBranchAdmin);
  const { error } = useAppSelector(selectCustomerAuth);
  const customerAuthState = useAppSelector(selectCustomerAuth);

  const [registerCustomer, { isLoading }] =
    useRegisterCustomerByBranchAdminMutation();

  const [phoneNumber, setPhoneNumber] = useState("");

  // Navigate when customer auth completes
  useEffect(() => {
    if (customerAuthState.isAuthenticated && customerAuthState.customer) {
      const timer = setTimeout(() => {
        navigate("/customer/first-dash", { replace: true });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [customerAuthState.isAuthenticated, customerAuthState.customer, navigate]);

  // Clear error on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // ── Access gate — rendered AFTER all hooks ─────────────────────────
  if (!isAuthenticated || !isBranchAdmin) {
    return <NotFoundPage />;
  }

  // ── Handlers ───────────────────────────────────────────────────────

  const formatPhoneNumber = (value: string) =>
    value.replace(/\D/g, "").slice(0, 10);

  const handleRegister = async () => {
    if (phoneNumber.length !== 10) {
      dispatch(
        addNotification({
          type: "error",
          message: "Please enter a valid 10-digit phone number",
        }),
      );
      return;
    }

    dispatch(registrationStarted());

    try {
      // Backend creates/finds the customer + a Firebase user for this phone
      // number (no SMS) and mints a custom token for it.
      const backendResponse = await registerCustomer({ phoneNumber }).unwrap();
      const { customToken, customer } = backendResponse.data;

      // Silently sign in as that customer in this browser using the custom
      // token — this is a real Firebase session, just without the customer
      // ever entering an SMS code.
      const result = await signInWithCustomToken(auth, customToken);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();

      dispatch(
        loginSuccess({
          customer: {
            id: customer._id,
            phoneNumber: customer.phoneNumber,
            firebaseUid: firebaseUser.uid,
            isVerified: true,
          },
          firebaseToken: idToken,
        }),
      );

      dispatch(
        addNotification({
          type: "success",
          message: "Customer registered! Redirecting...",
        }),
      );

      onSignUpSuccess?.();
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || err?.message || "Failed to register customer";
      dispatch(setError(errorMessage));
      dispatch(addNotification({ type: "error", message: errorMessage }));
    }
  };

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-md'
      >
        <Card className='shadow-xl border-0 bg-white/80 backdrop-blur-sm'>
          <CardHeader className='space-y-1 pb-6'>
            <div className='flex items-center justify-center mb-4'>
              <div className='w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center'>
                <ShieldCheck className='h-6 w-6 text-white' />
              </div>
            </div>
            <CardTitle className='text-2xl font-bold text-center text-gray-900'>
              Register Customer
            </CardTitle>
            <p className='text-center text-gray-600 text-sm'>
              Enter the customer's phone number to register — no OTP required
            </p>

            {error && (
              <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm'>
                {error}
              </div>
            )}
          </CardHeader>

          <CardContent className='space-y-6'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label
                  htmlFor='phone'
                  className='text-sm font-medium text-gray-700'
                >
                  Customer Phone Number
                </Label>
                <div className='relative'>
                  <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    id='phone'
                    type='tel'
                    placeholder='Enter Customer Mobile Number'
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(formatPhoneNumber(e.target.value))
                    }
                    className='pl-10 h-12 text-base'
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                onClick={handleRegister}
                disabled={phoneNumber.length !== 10 || isLoading}
                className='w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium'
              >
                {isLoading && <Loader2 className='h-4 w-4 animate-spin mr-2' />}
                Register Customer
              </Button>
            </div>

            <div className='text-center'>
              <p className='text-xs text-gray-500'>
                By continuing, you agree to our{" "}
                <a
                  href='#'
                  className='text-red-600 hover:text-red-700 underline'
                >
                  Terms of Service
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CustomerSignUp;
