import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Eye, EyeOff, Loader2, LifeBuoy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginDeveloperMutation } from "@/redux-store/services/adminApi";
import { useAuthScreen } from "@/hooks/useAuthScreen";
import { getApiErrorMessage } from "@/lib/apiError";

/**
 * Developer sign-in. Email-based rather than phone-based, so it does not reuse
 * the shared RoleLoginForm (which is built around phone + OTP for the branch
 * roles) — Developer is a project-wide technical account, like Super-Admin.
 */
export default function LoginDeveloper() {
  const navigate = useNavigate();
  useAuthScreen();
  const [loginDeveloper, { isLoading }] = useLoginDeveloperMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await loginDeveloper({ email, password }).unwrap();
      if (result.success) navigate("/developer/dashboard", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Invalid credentials"));
    }
  };

  return (
    <div className='min-h-screen bg-gray-950 flex items-center justify-center px-4'>
      <Card className='w-full max-w-md border-gray-800 bg-gray-900'>
        <CardHeader className='space-y-3'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-violet-600 text-white'>
              <LifeBuoy className='h-5 w-5' />
            </div>
            <div>
              <CardTitle className='text-white text-lg'>
                Developer Login
              </CardTitle>
              <p className='text-sm text-gray-400'>
                Honda Dealership — Maintenance Portal
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-1.5'>
              <Label htmlFor='developer-email' className='text-gray-300'>
                Email
              </Label>
              <Input
                id='developer-email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='you@example.com'
                autoComplete='email'
                required
                className='bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='developer-password' className='text-gray-300'>
                Password
              </Label>
              <div className='relative'>
                <Input
                  id='developer-password'
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete='current-password'
                  required
                  className='bg-gray-800 border-gray-700 text-white pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200'
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className='flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400'>
                <AlertCircle className='h-4 w-4 mt-0.5 shrink-0' />
                {error}
              </div>
            )}

            <Button
              type='submit'
              disabled={isLoading || !email || !password}
              className='w-full bg-violet-600 hover:bg-violet-700'
            >
              {isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' /> Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className='mt-5 pt-4 border-t border-gray-800 space-y-1.5'>
            <Link
              to='/admin/login'
              className='block text-xs text-gray-400 hover:text-gray-200'
            >
              Sign in as Super Admin
            </Link>
            <Link
              to='/'
              className='block text-xs text-gray-400 hover:text-gray-200'
            >
              Go to HomePage
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
