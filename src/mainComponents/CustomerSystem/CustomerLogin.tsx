import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ShieldCheck, Loader2 } from "lucide-react";
import { auth } from "../../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { addNotification } from "@/redux-store/slices/uiSlice";
import {
  clearError,
  loginSuccess,
  selectCustomerAuth,
} from "@/redux-store/slices/customer/customerAuthSlice";
import { setError } from "@/redux-store/slices/authSlice";
import { useSaveAuthDataMutation } from "@/redux-store/services/customer/customerLoginApi";
import PhoneNumberValidation from "./PhoneNoValidation";

export interface CustomerLoginProps {
  onLoginSuccess?: () => void;
}

const CustomerLogin: React.FC<CustomerLoginProps> = ({ onLoginSuccess }) => {
  const [saveAuthData] = useSaveAuthDataMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { error } = useAppSelector(selectCustomerAuth);

  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
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

  // Modified to accept validated phone number from PhoneNumberValidation component
  const handleSendOtp = async (validatedPhoneNumber: string) => {
    setPhoneNumber(validatedPhoneNumber);
    setIsLoading(true);

    try {
      if (!recaptchaRef.current) {
        throw new Error("Recaptcha not initialized");
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        `+91${validatedPhoneNumber}`,
        recaptchaRef.current
      );

      setConfirmationResult(confirmation);
      setStep("otp");
      setOtpTimer(60);

      dispatch(
        addNotification({
          type: "success",
          message: `OTP sent to +91${validatedPhoneNumber}`,
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

      // Save to backend
      const backendResponse = await saveAuthData({
        phoneNumber:
          firebaseUser.phoneNumber?.replace("+91", "") || phoneNumber,
        firebaseUid: firebaseUser.uid,
      }).unwrap();

      // Log the idToken for debugging
      console.log("Firebase ID Token:", idToken);

      // Save to store
      dispatch(
        loginSuccess({
          customer: {
            id: backendResponse.data.customer._id,
            phoneNumber: backendResponse.data.customer.phoneNumber,
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

      // Navigate to customer dashboard
      setTimeout(() => {
        navigate("/customer/dashboard", { replace: true });
      }, 100);

      // Call the optional callback
      onLoginSuccess?.();
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
    setConfirmationResult(null);
    setOtpTimer(0);
    setStep("phone"); // Go back to phone step for re-validation
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
        <Card className='shadow-xl border-1 bg-white/1 backdrop-blur-sm'>
          <CardHeader className='space-y-1 pb-6'>
            <div className='flex items-center justify-center mb-4'>
              <div className='w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center'>
                <ShieldCheck className='h-6 w-6 text-white' />
              </div>
            </div>
            <CardTitle className='text-2xl font-bold text-center text-gray-900'>
              {step === "phone" ? "Customer Login" : "Verify OTP"}
            </CardTitle>
            <p className='text-center text-gray-600 text-sm'>
              {step === "phone"
                ? "Enter your registered phone number to continue"
                : `Enter the 6-digit code sent to +91${phoneNumber}`}
            </p>
          </CardHeader>

          <CardContent className='space-y-4'>
            {step === "phone" ? (
              <PhoneNumberValidation
                onSendOtp={handleSendOtp}
                isLoading={isLoading}
              />
            ) : (
              <>
                <div className='space-y-4'>
                  <div className='text-center space-y-2'>
                    <p className='text-sm text-gray-600'>
                      We sent a verification code to
                    </p>
                    <p className='font-semibold text-gray-900'>
                      +91 {phoneNumber}
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-sm font-medium'>Enter OTP</Label>
                    <div className='flex justify-center'>
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={(value) => setOtp(value)}
                        disabled={isLoading}
                      >
                        <InputOTPGroup>
                          {[0, 1, 2, 3, 4, 5].map((index) => (
                            <InputOTPSlot key={index} index={index} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='p-3 bg-red-50 border border-red-200 rounded-lg'
                    >
                      <p className='text-sm text-red-600'>{error}</p>
                    </motion.div>
                  )}

                  <Button
                    onClick={handleVerifyOtp}
                    disabled={otp.length !== 6 || isLoading}
                    className='w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium'
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Verifying...
                      </>
                    ) : (
                      "Verify & Login"
                    )}
                  </Button>

                  <div className='text-center space-y-2'>
                    {otpTimer > 0 ? (
                      <p className='text-sm text-gray-600'>
                        Resend OTP in{" "}
                        <span className='font-semibold text-red-600'>
                          {otpTimer}s
                        </span>
                      </p>
                    ) : (
                      <Button
                        variant='ghost'
                        onClick={handleResendOtp}
                        disabled={isLoading}
                        className='text-red-600 hover:text-red-700 hover:bg-red-50'
                      >
                        Resend OTP
                      </Button>
                    )}

                    <Button
                      variant='ghost'
                      onClick={() => {
                        setStep("phone");
                        setOtp("");
                        setConfirmationResult(null);
                        dispatch(clearError());
                      }}
                      disabled={isLoading}
                      className='text-gray-600 hover:text-gray-700'
                    >
                      Change Number
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Link to='/'>
          <p className='text-center text-xs text-gray-500 mt-6'>
            Back to Homepage
          </p>
        </Link>
      </motion.div>
    </div>
  );
};

export default CustomerLogin;
