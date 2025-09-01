import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Phone, ShieldCheck, Loader2, ArrowRight, User } from "lucide-react";
import { auth } from "../../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// Redux imports
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

import { addNotification } from "@/redux-store/slices/uiSlice";
import {
  clearError,
  otpVerified,
  profileCompleted,
  registrationStarted,
  selectCustomerAuth,
} from "@/redux-store/slices/customer/customerAuthSlice";
import {
  useCreateProfileMutation,
  useRegisterCustomerMutation,
  useResendOTPMutation,
  useVerifyOTPMutation,
} from "@/redux-store/services/customer/customerApi";
import { setError } from "@/redux-store/slices/authSlice";

interface CustomerSignUpProps {
  onSignUpSuccess?: () => void;
}

// Extend window type for recaptcha
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

const CustomerSignUp: React.FC<CustomerSignUpProps> = ({ onSignUpSuccess }) => {
  const dispatch = useAppDispatch();
  const { error } = useAppSelector(selectCustomerAuth);

  // RTK Query mutations
  const [registerCustomer] = useRegisterCustomerMutation();
  const [verifyOTP] = useVerifyOTPMutation();
  const [resendOTP] = useResendOTPMutation();
  const [createProfile] = useCreateProfileMutation();

  // Component state
  const [step, setStep] = useState<"phone" | "otp" | "details">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // OTP Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Clear errors when step changes
  useEffect(() => {
    dispatch(clearError());
  }, [step, dispatch]);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.slice(0, 10);
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {},
        }
      );
    }
  };

  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) return;

    setIsLoading(true);
    dispatch(registrationStarted());

    try {
      // Register customer in backend
      await registerCustomer({ phoneNumber }).unwrap();

      // Setup Firebase and send OTP
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const formatNumber = `+91${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(
        auth,
        formatNumber,
        appVerifier
      );

      setConfirmationResult(confirmation);
      setStep("otp");
      setOtpTimer(60);

      dispatch(
        addNotification({
          type: "success",
          message: "OTP sent successfully!",
        })
      );
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Failed to send OTP";
      dispatch(setError(errorMessage));
      dispatch(
        addNotification({
          type: "error",
          message: errorMessage,
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6 || !confirmationResult) return;

    setIsLoading(true);

    try {
      // Verify OTP with Firebase
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();

      // Verify OTP with backend
      const response = await verifyOTP({
        phoneNumber,
        idToken,
      }).unwrap();

      dispatch(
        otpVerified({
          customer: response.data.customer!,
          firebaseToken: idToken,
          needsProfile: response.data.needsProfile || false,
        })
      );

      if (response.data.needsProfile) {
        setStep("details");
        dispatch(
          addNotification({
            type: "info",
            message: "Please complete your profile",
          })
        );
      } else {
        dispatch(
          addNotification({
            type: "success",
            message: "Login successful!",
          })
        );
        onSignUpSuccess?.();
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Invalid OTP";
      dispatch(setError(errorMessage));
      dispatch(
        addNotification({
          type: "error",
          message: errorMessage,
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOTP({ phoneNumber }).unwrap();
      setOtpTimer(60);

      dispatch(
        addNotification({
          type: "success",
          message: "OTP resent successfully!",
        })
      );
    } catch (error: any) {
      dispatch(
        addNotification({
          type: "error",
          message: error?.data?.message || "Failed to resend OTP",
        })
      );
    }
  };

  const handleCompleteRegistration = async () => {
    if (!name.trim()) return;

    setIsLoading(true);

    try {
      // Split name into first and last name
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || firstName;

      const profileData = {
        firstName,
        lastName,
        email: email.trim() || undefined,
        village: address.trim() || "Not specified",
        postOffice: "Not specified",
        policeStation: "Not specified",
        district: "Not specified",
        state: "Not specified",
      };

      const response = await createProfile(profileData).unwrap();

      dispatch(profileCompleted(response.data.customer!));
      dispatch(
        addNotification({
          type: "success",
          message: "Profile completed successfully!",
        })
      );

      onSignUpSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Failed to create profile";
      dispatch(setError(errorMessage));
      dispatch(
        addNotification({
          type: "error",
          message: errorMessage,
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4'>
      <div id='recaptcha-container'></div>

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
                {step === "details" ? (
                  <User className='h-6 w-6 text-white' />
                ) : (
                  <ShieldCheck className='h-6 w-6 text-white' />
                )}
              </div>
            </div>
            <CardTitle className='text-2xl font-bold text-center text-gray-900'>
              {step === "phone" && "Welcome"}
              {step === "otp" && "Verify OTP"}
              {step === "details" && "Complete Setup"}
            </CardTitle>
            <p className='text-center text-gray-600 text-sm'>
              {step === "phone" && "Sign up or sign in to continue"}
              {step === "otp" && "Enter the code sent to your phone"}
              {step === "details" && "Tell us a bit about yourself"}
            </p>

            {/* Error Display */}
            {error && (
              <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm'>
                {error}
              </div>
            )}
          </CardHeader>

          <CardContent className='space-y-6'>
            {/* Phone Number Step */}
            {step === "phone" && (
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='phone'
                    className='text-sm font-medium text-gray-700'
                  >
                    Phone Number
                  </Label>
                  <div className='relative'>
                    <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <Input
                      id='phone'
                      type='tel'
                      placeholder='Enter Mobile Number'
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
                  onClick={handleSendOtp}
                  disabled={phoneNumber.length !== 10 || isLoading}
                  className='w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium'
                >
                  {isLoading ? (
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  ) : (
                    <ArrowRight className='h-4 w-4 mr-2' />
                  )}
                  Send OTP
                </Button>
              </div>
            )}

            {/* OTP Verification Step */}
            {step === "otp" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className='space-y-4'
              >
                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-gray-700'>
                    Enter OTP
                  </Label>
                  <div className='flex justify-center'>
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className='text-xs text-gray-500 text-center'>
                    OTP sent to +91 {phoneNumber}
                  </p>
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  disabled={otp.length !== 6 || isLoading}
                  className='w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium'
                >
                  {isLoading ? (
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  ) : null}
                  Verify & Continue
                </Button>

                <div className='flex items-center justify-between text-sm'>
                  <button
                    onClick={() => {
                      setStep("phone");
                      setOtp("");
                      setOtpTimer(0);
                    }}
                    className='text-red-600 hover:text-red-700 font-medium'
                  >
                    Change Number
                  </button>
                  {otpTimer > 0 ? (
                    <span className='text-gray-500'>Resend in {otpTimer}s</span>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      className='text-red-600 hover:text-red-700 font-medium'
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* User Details Step */}
            {step === "details" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className='space-y-4'
              >
                <div className='space-y-2'>
                  <Label
                    htmlFor='name'
                    className='text-sm font-medium text-gray-700'
                  >
                    Full Name *
                  </Label>
                  <Input
                    id='name'
                    type='text'
                    placeholder='Enter your full name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className='h-12'
                    disabled={isLoading}
                  />
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='email'
                    className='text-sm font-medium text-gray-700'
                  >
                    Email (Optional)
                  </Label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='Enter your email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='h-12'
                    disabled={isLoading}
                  />
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='address'
                    className='text-sm font-medium text-gray-700'
                  >
                    Address (Optional)
                  </Label>
                  <Input
                    id='address'
                    type='text'
                    placeholder='Enter your address'
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className='h-12'
                    disabled={isLoading}
                  />
                </div>

                <Button
                  onClick={handleCompleteRegistration}
                  disabled={!name.trim() || isLoading}
                  className='w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium'
                >
                  {isLoading ? (
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  ) : null}
                  Complete Registration
                </Button>
              </motion.div>
            )}

            {/* Terms */}
            <div className='text-center'>
              <p className='text-xs text-gray-500'>
                By continuing, you agree to our{" "}
                <a
                  href='#'
                  className='text-red-600 hover:text-red-700 underline'
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href='#'
                  className='text-red-600 hover:text-red-700 underline'
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className='mt-6 text-center'
        >
          <p className='text-sm text-gray-600'>
            Need help?{" "}
            <a href='#' className='text-red-600 hover:text-red-700 font-medium'>
              Contact Support
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CustomerSignUp;
