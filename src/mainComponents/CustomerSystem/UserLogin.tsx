import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Phone, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserLoginProps {
  onLogin?: (
    credentials: { phone: string; otp: string } | { googleToken: string }
  ) => void;
  isLoading?: boolean;
}

const UserLogin: React.FC<UserLoginProps> = ({
  onLogin,
  isLoading = false,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");

  const [showOtp, setShowOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const navigate = useNavigate();

  const handleSendOtp = () => {
    if (phoneNumber.length >= 10) {
      setOtpSent(true);
      setShowOtp(true);
      setOtpTimer(30);

      // Countdown timer
      const timer = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };
  console.log(showOtp);

  const handleVerifyOtp = () => {
    if (otp.length === 6 && onLogin) {
      onLogin({ phone: phoneNumber, otp });
    }
  };

  const handleGoogleLogin = () => {
    if (onLogin) {
      // Simulate Google OAuth flow
      onLogin({ googleToken: "mock-google-token" });
    }
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{5})(\d{5})/, "$1 $2");
    }
    return cleaned.slice(0, 10).replace(/(\d{5})(\d{5})/, "$1 $2");
  };

  const takeToadminDash = () => {
    navigate("/admin/superlogin");
  };

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
              Welcome Back
            </CardTitle>
            <p className='text-center text-gray-600 text-sm'>
              Sign in to your account to continue
            </p>
          </CardHeader>

          <CardContent className='space-y-6'>
            {/* Phone Number & OTP Section */}
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
                    placeholder='Enter Register Mobile No.'
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(formatPhoneNumber(e.target.value))
                    }
                    className='pl-10 h-12 text-base'
                    disabled={otpSent || isLoading}
                  />
                </div>
              </div>

              {!otpSent ? (
                <Button
                  onClick={handleSendOtp}
                  disabled={phoneNumber.length < 10 || isLoading}
                  className='w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium transition-colors'
                >
                  {isLoading ? (
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  ) : (
                    <ArrowRight className='h-4 w-4 mr-2' />
                  )}
                  Send OTP
                </Button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className='space-y-4'
                >
                  <div className='space-y-2'>
                    <Label
                      htmlFor='otp'
                      className='text-sm font-medium text-gray-700'
                    >
                      Enter OTP
                    </Label>
                    <div className='relative'>
                      <Input
                        id='otp'
                        type='text'
                        placeholder='6-digit OTP'
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        className='text-center text-lg tracking-widest h-12'
                        maxLength={6}
                      />
                    </div>
                    <p className='text-xs text-gray-500 text-center'>
                      OTP sent to +91 {phoneNumber}
                    </p>
                  </div>

                  <Button
                    onClick={handleVerifyOtp}
                    disabled={otp.length !== 6 || isLoading}
                    className='w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium transition-colors'
                  >
                    {isLoading ? (
                      <Loader2 className='h-4 w-4 animate-spin mr-2' />
                    ) : null}
                    Verify & Sign In
                  </Button>

                  <div className='flex items-center justify-between text-sm'>
                    <button
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                        setShowOtp(false);
                        setOtpTimer(0);
                      }}
                      className='text-red-600 hover:text-red-700 font-medium'
                    >
                      Change Number
                    </button>
                    {otpTimer > 0 ? (
                      <span className='text-gray-500'>
                        Resend in {otpTimer}s
                      </span>
                    ) : (
                      <button
                        onClick={handleSendOtp}
                        className='text-red-600 hover:text-red-700 font-medium'
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Divider */}
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <Separator className='w-full' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-white px-2 text-gray-500 font-medium'>
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              variant='outline'
              className='w-full h-12 border-gray-300 hover:bg-gray-50 transition-colors'
            >
              <svg className='h-5 w-5 mr-3' viewBox='0 0 24 24'>
                <path
                  fill='#4285F4'
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                />
                <path
                  fill='#34A853'
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                />
                <path
                  fill='#FBBC05'
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                />
                <path
                  fill='#EA4335'
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                />
              </svg>
              Sign in with Google
            </Button>

            {/* Help Text */}
            <div className='text-center space-y-2'>
              <p className='text-xs text-gray-500'>
                By signing in, you agree to our{" "}
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

        {/* Additional Help */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className='mt-6 text-center'
        >
          <p className='text-sm text-gray-600'>
            Need help?{" "}
            <a href='#' className='text-red-600 hover:text-red-700 font-medium'>
              Contact Support
            </a>
          </p>
        </motion.div>
        <button
          className='mt-6 text-center text-white'
          onClick={takeToadminDash}
        >
          .
        </button>
      </motion.div>
    </div>
  );
};

export default UserLogin;
