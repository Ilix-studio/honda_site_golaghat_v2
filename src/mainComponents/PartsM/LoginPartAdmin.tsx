import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLoginPartAdminMutation } from "@/redux-store/services/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthScreen } from "@/hooks/useAuthScreen";
import { loginSchema } from "@/zod/loginSchema";
import OtpLoginForm from "@/mainComponents/shared/OtpLoginForm";

function LoginPartAdmin() {
  const navigate = useNavigate();
  useAuthScreen();
  const [loginPartAdmin, { isLoading }] = useLoginPartAdminMutation();

  const [mode, setMode] = useState<"password" | "otp">("password");
  const [form, setForm] = useState({ phoneNumber: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    try {
      const result = await loginPartAdmin(parsed.data).unwrap();
      if (result.success) {
        navigate("/part-admin/dashboard", { replace: true });
      }
    } catch (err: any) {
      setError(err?.data?.message || "Login failed. Check your credentials.");
    }
  };

  return (
    <section className='min-h-[100dvh] flex items-center justify-center bg-gray-950 px-4 py-8'>
      <div className='w-full max-w-md'>
        <div className='mb-6 text-center sm:mb-8'>
          <h1 className='text-sm font-black text-white tracking-tight hidden sm:block'>
            Tsangpool Honda <span className='text-blue-500'>Parts Admin</span>
          </h1>
        </div>
        <Card className='w-full max-w-md bg-gray-900 border-gray-800'>
          <CardHeader className='space-y-1 pb-4'>
            <CardTitle className='text-xl font-semibold text-white'>
              Parts Admin Login
            </CardTitle>
            <p className='text-sm text-gray-400'>
              Honda Dealership — Parts Portal
            </p>
          </CardHeader>

          <CardContent>
            <div className='mb-4 grid grid-cols-2 gap-2 rounded-lg bg-gray-800 p-1'>
              <button
                type='button'
                onClick={() => setMode("password")}
                className={`rounded-md py-1.5 text-sm font-medium transition-colors ${
                  mode === "password"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Password
              </button>
              <button
                type='button'
                onClick={() => setMode("otp")}
                className={`rounded-md py-1.5 text-sm font-medium transition-colors ${
                  mode === "otp"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                OTP
              </button>
            </div>

            {mode === "otp" ? (
              <OtpLoginForm redirectPath='/part-admin/dashboard' variant='dark' />
            ) : (
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='space-y-1.5'>
                  <Label htmlFor='phoneNumber' className='text-gray-300 text-sm'>
                    Phone Number
                  </Label>
                  <Input
                    id='phoneNumber'
                    type='text'
                    inputMode='numeric'
                    maxLength={10}
                    autoComplete='username'
                    placeholder='e.g. 8880000000'
                    value={form.phoneNumber}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        phoneNumber: e.target.value.replace(/\D/g, "").slice(0, 10),
                      }))
                    }
                    className='bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500'
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='password' className='text-gray-300 text-sm'>
                    Password
                  </Label>
                  <div className='relative'>
                    <Input
                      id='password'
                      type={showPassword ? "text" : "password"}
                      autoComplete='current-password'
                      placeholder='Enter your password'
                      value={form.password}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, password: e.target.value }))
                      }
                      className='bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 pr-10'
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword((s) => !s)}
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors'
                    >
                      {showPassword ? (
                        <EyeOff className='w-4 h-4' />
                      ) : (
                        <Eye className='w-4 h-4' />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className='flex items-center gap-2 text-red-400 text-sm bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2'>
                    <AlertCircle className='w-4 h-4 shrink-0' />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type='submit'
                  disabled={isLoading}
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium'
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        <div className='flex flex-col gap-3 mt-4'>
          <Link to='/manager-login' className='flex text-gray-300 underline'>
            {" "}
            <ArrowLeft /> Sign in as Branch Admin
          </Link>

          <Link
            to='/service-admin/login'
            className='flex items-center gap-2 text-gray-300 underline hover:text-white transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
            Sign in as Service Admin
          </Link>
          <Link to='/staff/login' className='flex text-gray-300 underline'>
            {" "}
            <ArrowLeft /> Sign in as Staff Account
          </Link>
          <Link to='/' className='flex text-gray-300 underline'>
            <ArrowLeft /> Go to HomePage
          </Link>
        </div>
      </div>
    </section>
  );
}

export default LoginPartAdmin;
