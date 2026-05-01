// mainComponents/Admin/LoginBranchManager.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowLeft, Eye, EyeOff, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Redux
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { useLoginBranchManagerMutation } from "../../../redux-store/services/branchManagerApi";
import { selectBranchAuth } from "../../../redux-store/slices/branchAuthSlice";
import { addNotification } from "../../../redux-store/slices/uiSlice";

const LoginBranchManager = () => {
  const [applicationId, setApplicationId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector(selectBranchAuth);

  const [loginBranchManager, { isLoading }] = useLoginBranchManagerMutation();

  // Redirect if already authenticated as branch manager
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/manager/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!applicationId || !password) {
      setErrorMessage("Please enter both application ID and password");
      return;
    }

    try {
      const result = await loginBranchManager({
        applicationId,
        password,
      }).unwrap();

      if (result.success) {
        // branchManagerApi.onQueryStarted already dispatches branchLoginSuccess
        dispatch(
          addNotification({
            type: "success",
            message: "Logged in successfully as Branch Admin",
          }),
        );

        setTimeout(() => {
          navigate("/manager/dashboard");
        }, 100);
      } else {
        setErrorMessage(result.message || "Login failed");
      }
    } catch (err: any) {
      const errorMsg = err?.data?.message || "Login failed. Please try again.";
      setErrorMessage(errorMsg);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-red-950 p-4'>
      <div className='w-full max-w-md'>
        <div className='mb-6'>
          <Link
            to='/'
            className='inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm'
          >
            <ArrowLeft className='h-4 w-4' />
            Back to Home
          </Link>
        </div>

        <div className='bg-white rounded-2xl shadow-2xl p-8'>
          <div className='text-center mb-8'>
            <div className='inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white mb-4 shadow-lg'>
              <LogIn className='h-7 w-7' />
            </div>
            <h1 className='text-2xl font-bold text-gray-900'>Branch Manager</h1>
            <p className='text-sm text-gray-500 mt-1'>
              Sign in with your application credentials
            </p>
          </div>

          {errorMessage && (
            <div className='flex items-center gap-2 p-3 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm'>
              <AlertCircle className='h-4 w-4 flex-shrink-0' />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-5'>
            <div className='space-y-2'>
              <Label htmlFor='applicationId' className='text-sm font-medium'>
                Application ID
              </Label>
              <Input
                id='applicationId'
                type='text'
                placeholder='e.g. BM-XXXX-XXXX'
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                className='h-11'
                autoComplete='username'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password' className='text-sm font-medium'>
                Password
              </Label>
              <div className='relative'>
                <Input
                  id='password'
                  type={showPassword ? "text" : "password"}
                  placeholder='Enter your password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='h-11 pr-10'
                  autoComplete='current-password'
                />
                <button
                  type='button'
                  onClick={toggleShowPassword}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </button>
              </div>
            </div>

            <Button
              type='submit'
              disabled={isLoading}
              className='w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl'
            >
              {isLoading ? (
                <span className='flex items-center gap-2'>
                  <span className='h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginBranchManager;
