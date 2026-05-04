import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginBranchAdminMutation } from "@/redux-store/services/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";

const LoginBranchManager = () => {
  const navigate = useNavigate();
  const [loginBranchManager, { isLoading }] = useLoginBranchAdminMutation();

  const [form, setForm] = useState({ applicationId: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.applicationId.trim() || !form.password.trim()) {
      setError("Please provide both application ID and password.");
      return;
    }

    try {
      const result = await loginBranchManager(form).unwrap();
      if (result.success) {
        navigate("/manager/dashboard", { replace: true });
      }
    } catch (err: any) {
      setError(err?.data?.message || "Login failed. Check your credentials.");
    }
  };

  return (
    <>
      <section className='min-h-screen flex items-center justify-center bg-gray-950 px-4'>
        <div className='w-full max-w-md'>
          <div className='mb-6 text-center sm:mb-8 '>
            <h1 className='text-sm font-black text-white tracking-tight hidden sm:block'>
              Tsangpool Honda <span className='text-red-500'>Manager</span>
            </h1>
          </div>
          <Card className='w-full max-w-md bg-gray-900 border-gray-800'>
            <CardHeader className='space-y-1 pb-4'>
              <CardTitle className='text-xl font-semibold text-white'>
                Branch Manager Login
              </CardTitle>
              <p className='text-sm text-gray-400'>
                Honda Dealership — Branch Portal
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='space-y-1.5'>
                  <Label
                    htmlFor='applicationId'
                    className='text-gray-300 text-sm'
                  >
                    Application ID
                  </Label>
                  <Input
                    id='applicationId'
                    type='text'
                    autoComplete='username'
                    placeholder='e.g. BM-XXXX'
                    value={form.applicationId}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, applicationId: e.target.value }))
                    }
                    className='bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500'
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='password' className='text-gray-300 text-sm'>
                    Password
                  </Label>
                  <Input
                    id='password'
                    type='password'
                    autoComplete='current-password'
                    placeholder='Enter your password'
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, password: e.target.value }))
                    }
                    className='bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500'
                  />
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
                  className='w-full bg-red-600 hover:bg-red-700 text-white font-medium'
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
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
};

export default LoginBranchManager;
