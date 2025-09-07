// src/components/Admin/LoginSuperAdmin.tsx (Updated with Redux)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  LogIn,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Redux
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { useLoginAdminMutation } from "../../redux-store/services/adminApi";
import { selectAuth } from "../../redux-store/slices/authSlice";
import { addNotification } from "../../redux-store/slices/uiSlice";

const LoginSuperAdmin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessageSA, setErrorMessageSA] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, error } = useAppSelector(selectAuth);

  // Use the RTK Query mutation hook
  const [loginAdmin, { isLoading }] = useLoginAdminMutation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Clear error message when user starts typing
  useEffect(() => {
    if (errorMessageSA && (email || password)) {
      setErrorMessageSA("");
    }
  }, [email, password, errorMessageSA]);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessageSA("");

    // Basic validation
    if (!email || !password) {
      setErrorMessageSA("Please enter both email and password");
      return;
    }

    if (!email.includes("@")) {
      setErrorMessageSA("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setErrorMessageSA("Password must be at least 6 characters");
      return;
    }

    try {
      const result = await loginAdmin({ email, password }).unwrap();

      if (result.success) {
        dispatch(
          addNotification({
            type: "success",
            message: `Welcome back, ${result.data.name}!`,
          })
        );

        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem("honda_remember_email", email);
        } else {
          localStorage.removeItem("honda_remember_email");
        }

        navigate("/admin/dashboard");
      } else {
        setErrorMessageSA(result.message || "Login failed");
      }
    } catch (err: any) {
      const errorMsg = err?.data?.message || "Login failed. Please try again.";
      setErrorMessageSA(errorMsg);

      dispatch(
        addNotification({
          type: "error",
          message: errorMsg,
        })
      );
    }
  };

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("honda_remember_email");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-md'
      >
        <Card className='shadow-xl border-0'>
          <CardHeader className='text-center pb-8'>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className='mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4'
            >
              <Shield className='h-8 w-8 text-red-600' />
            </motion.div>
            <CardTitle className='text-2xl font-bold text-gray-900'>
              Super Admin Login
            </CardTitle>
            <CardDescription className='text-gray-600'>
              Access the administrative dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            {(errorMessageSA || error) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className='mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start gap-3'
              >
                <AlertCircle className='h-5 w-5 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='font-medium'>Login Failed</p>
                  <p className='text-sm'>{errorMessageSA || error}</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='space-y-2'>
                <Label
                  htmlFor='email'
                  className='text-sm font-medium text-gray-700'
                >
                  Email Address
                </Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='admin@hondamotors.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`transition-all duration-200 ${
                    errorMessageSA && !email
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                      : "focus:border-red-500 focus:ring-red-200"
                  }`}
                  disabled={isLoading}
                />
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='password'
                  className='text-sm font-medium text-gray-700'
                >
                  Password
                </Label>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? "text" : "password"}
                    placeholder='Enter your password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`pr-10 transition-all duration-200 ${
                      errorMessageSA && !password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "focus:border-red-500 focus:ring-red-200"
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type='button'
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                    onClick={toggleShowPassword}
                    tabIndex={-1}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <input
                    id='remember'
                    type='checkbox'
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className='h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded'
                    disabled={isLoading}
                  />
                  <Label htmlFor='remember' className='text-sm text-gray-600'>
                    Remember email
                  </Label>
                </div>

                <Link
                  to='/admin/forgot-password'
                  className='text-sm text-red-600 hover:text-red-500 transition-colors'
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type='submit'
                className='w-full bg-red-600 hover:bg-red-700 text-white py-2.5 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]'
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className='flex items-center justify-center gap-2'>
                    <svg
                      className='animate-spin h-4 w-4'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  <div className='flex items-center justify-center gap-2'>
                    <LogIn className='h-4 w-4' />
                    Sign In
                  </div>
                )}
              </Button>
            </form>

            <div className='mt-8 pt-6 border-t border-gray-200'>
              <div className='text-center space-y-4'>
                <Link
                  to='/admin/managerlogin'
                  className='inline-flex items-center text-sm font-medium text-gray-600 hover:text-red-600 transition-colors'
                >
                  Sign in as Branch Manager instead
                </Link>

                <Link
                  to='/'
                  className='inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors'
                >
                  <ArrowLeft className='mr-1 h-4 w-4' />
                  Back to Homepage
                </Link>
              </div>
            </div>

            {/* Development Helper */}
            {process.env.NODE_ENV === "development" && (
              <div className='mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200'>
                <p className='text-xs text-blue-600 font-medium mb-2'>
                  Development Helper:
                </p>
                <div className='text-xs text-blue-600 space-y-1'>
                  <p>Email: honda_golaghat@gmail.com</p>
                  <p>Password: admin123</p>
                  <button
                    type='button'
                    onClick={() => {
                      setEmail("honda_golaghat@gmail.com");
                      setPassword("admin123");
                    }}
                    className='text-blue-700 underline hover:no-underline'
                  >
                    Auto-fill credentials
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className='mt-8 text-center'
        >
          <p className='text-sm text-gray-500'>
            Need help? Contact{" "}
            <a
              href='mailto:support@hondamotors.com'
              className='text-red-600 hover:text-red-500 transition-colors'
            >
              support@hondamotors.com
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginSuperAdmin;
