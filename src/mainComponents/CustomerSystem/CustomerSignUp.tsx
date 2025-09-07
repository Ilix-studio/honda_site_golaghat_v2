import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Add this import
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Phone, ShieldCheck, Loader2 } from "lucide-react";
import { auth } from "../../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
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
  selectIsAdmin,
  setError,
} from "@/redux-store/slices/authSlice";
import { useSelector } from "react-redux";
import NotFoundPage from "../NotFoundPage";

interface CustomerSignUpProps {
  onSignUpSuccess?: () => void;
}

const CustomerSignUp: React.FC<CustomerSignUpProps> = ({ onSignUpSuccess }) => {
  const { isAuthenticated } = useSelector(selectAuth);
  const isAdmin = useSelector(selectIsAdmin);

  // Check if user is authenticated admin
  if (!isAuthenticated || !isAdmin) {
    return <NotFoundPage />;
  }

  const dispatch = useAppDispatch();
  const navigate = useNavigate(); // Add navigation hook
  const { error } = useAppSelector(selectCustomerAuth);

  const recaptchaRef = useRef<any>(null);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // Initialize reCAPTCHA once on mount
  useEffect(() => {
    const initRecaptcha = () => {
      try {
        if (!recaptchaRef.current) {
          recaptchaRef.current = new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
              size: "invisible",
              callback: () => console.log("Recaptcha solved"),
              "expired-callback": () => console.warn("Recaptcha expired"),
            }
          );
        }
      } catch (error) {
        console.error("Recaptcha setup error:", error);
      }
    };

    initRecaptcha();

    return () => {
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }
    };
  }, []);

  // OTP Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  useEffect(() => {
    dispatch(clearError());
  }, [step, dispatch]);

  const formatPhoneNumber = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 10);
  };

  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) {
      dispatch(
        addNotification({
          type: "error",
          message: "Please enter a valid 10-digit phone number",
        })
      );
      return;
    }

    setIsLoading(true);
    dispatch(registrationStarted());

    try {
      if (!recaptchaRef.current) {
        throw new Error("Recaptcha not initialized");
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        `+91${phoneNumber}`,
        recaptchaRef.current
      );

      setConfirmationResult(confirmation);
      setStep("otp");
      setOtpTimer(60);

      dispatch(
        addNotification({
          type: "success",
          message: `OTP sent to +91${phoneNumber}`,
        })
      );
    } catch (error: any) {
      console.error("OTP sending error:", error);

      let errorMessage = "Failed to send OTP";
      if (error.code) {
        switch (error.code) {
          case "auth/invalid-phone-number":
            errorMessage = "Invalid phone number format";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many requests. Try again later";
            break;
          case "auth/quota-exceeded":
            errorMessage = "SMS quota exceeded. Try tomorrow";
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }

      dispatch(setError(errorMessage));
      dispatch(addNotification({ type: "error", message: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6 || !confirmationResult) return;

    setIsLoading(true);

    try {
      const result = await confirmationResult.confirm(otp);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();

      // Log the idToken for debugging
      console.log("Firebase ID Token:", idToken);

      // Save to store
      dispatch(
        loginSuccess({
          customer: {
            id: firebaseUser.uid,
            phoneNumber:
              firebaseUser.phoneNumber?.replace("+91", "") || phoneNumber,
            firebaseUid: firebaseUser.uid,
            isVerified: true,
          },
          firebaseToken: idToken,
        })
      );

      dispatch(
        addNotification({
          type: "success",
          message: "Login successful!",
        })
      );

      // Use setTimeout to ensure state is updated before navigation
      setTimeout(() => {
        navigate("/customer-initialize", { replace: true });
      }, 100);

      // Call the optional callback
      onSignUpSuccess?.();
    } catch (error: any) {
      console.error("OTP verification error:", error);
      let errorMessage = "Invalid OTP";

      // Handle specific Firebase errors
      if (error.code === "auth/invalid-verification-code") {
        errorMessage = "Invalid OTP. Please check the code.";
      } else if (error.code === "auth/code-expired") {
        errorMessage = "OTP has expired. Please request a new one.";
      }

      dispatch(setError(errorMessage));
      dispatch(addNotification({ type: "error", message: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtp("");
    setConfirmationResult(null); // Clear the expired confirmation result

    // Reset timer
    setOtpTimer(0);

    await handleSendOtp();
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
                <ShieldCheck className='h-6 w-6 text-white' />
              </div>
            </div>
            <CardTitle className='text-2xl font-bold text-center text-gray-900'>
              {step === "phone" ? "Welcome" : "Verify OTP"}
            </CardTitle>
            <p className='text-center text-gray-600 text-sm'>
              {step === "phone"
                ? "Sign up or sign in to continue"
                : "Enter the code sent to your phone"}
            </p>

            {error && (
              <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm'>
                {error}
              </div>
            )}
          </CardHeader>

          <CardContent className='space-y-6'>
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
                  {isLoading && (
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  )}
                  Send OTP
                </Button>
              </div>
            )}

            {step === "otp" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className='space-y-4'
              >
                <div className='text-center space-y-2'>
                  <p className='text-sm text-gray-600'>
                    We sent a verification code to
                  </p>
                  <p className='font-semibold text-gray-900'>
                    +91 {phoneNumber}
                  </p>
                </div>

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
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  disabled={otp.length !== 6 || isLoading}
                  className='w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium'
                >
                  {isLoading && (
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  )}
                  Verify OTP
                </Button>

                <div className='text-center'>
                  {otpTimer > 0 ? (
                    <p className='text-sm text-gray-600'>
                      Resend OTP in {otpTimer}s
                    </p>
                  ) : (
                    <Button
                      variant='ghost'
                      onClick={handleResendOtp}
                      className='text-red-600 hover:text-red-700 font-medium'
                    >
                      Resend OTP
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

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
