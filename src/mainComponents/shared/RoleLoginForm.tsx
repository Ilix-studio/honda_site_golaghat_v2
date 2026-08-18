import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CompanyLogo from "@/mainComponents/CompanyLogo";
import OtpLoginForm from "@/mainComponents/shared/OtpLoginForm";
import { loginSchema, type LoginInput } from "@/zod/loginSchema";

export interface RoleLoginLink {
  to: string;
  label: string;
}

interface RoleLoginFormProps {
  brandRole: string;
  title: string;
  subtitle: string;
  redirectPath: string;
  accent?: "red" | "blue";
  theme?: "dark" | "light";
  links: RoleLoginLink[];
  isLoading: boolean;
  onPasswordLogin: (credentials: LoginInput) => Promise<void>;
}

const RoleLoginForm = ({
  brandRole,
  title,
  subtitle,
  redirectPath,
  accent = "red",
  theme = "dark",
  links,
  isLoading,
  onPasswordLogin,
}: RoleLoginFormProps) => {
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [form, setForm] = useState<LoginInput>({
    phoneNumber: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDark = theme === "dark";
  const accentClasses =
    accent === "blue"
      ? {
          active: "bg-blue-600",
          hover: "hover:bg-blue-700",
          focus: "focus:border-blue-500",
          brand: "text-blue-500",
        }
      : {
          active: "bg-red-600",
          hover: "hover:bg-red-700",
          focus: "focus:border-red-500",
          brand: "text-red-500",
        };
  const labelClass = isDark ? "text-gray-300 text-sm" : "text-gray-900 text-sm";
  const inputClass = isDark
    ? `bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 ${accentClasses.focus}`
    : `bg-white border-gray-700 text-black placeholder:text-gray-500 ${accentClasses.focus}`;
  const linkClass = isDark
    ? "flex items-center gap-2 text-gray-300 underline hover:text-white transition-colors"
    : "flex items-center gap-2 text-gray-900 underline transition-colors";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    try {
      await onPasswordLogin(parsed.data);
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      setError(
        apiError.data?.message || "Login failed. Check your credentials.",
      );
    }
  };

  return (
    <section
      className={`min-h-[100dvh] flex items-center justify-center px-4 py-8 ${isDark ? "bg-gray-950" : "bg-white"}`}
    >
      <div className='w-full max-w-md'>
        <div className='mb-6 text-center sm:mb-8'>
          <CompanyLogo />
          <h1
            className={`text-sm font-black tracking-tight hidden sm:block ${isDark ? "text-white" : "text-black"}`}
          >
            Tsangpool Honda{" "}
            <span className={accentClasses.brand}>{brandRole}</span>
          </h1>
        </div>
        <Card
          className={`w-full max-w-md border-gray-800 ${isDark ? "bg-gray-900" : ""}`}
        >
          <CardHeader className='space-y-1 pb-4'>
            <CardTitle
              className={`text-xl font-semibold ${isDark ? "text-white" : "text-black"}`}
            >
              {title}
            </CardTitle>
            <p
              className={`text-sm ${isDark ? "text-gray-400" : "text-gray-800"}`}
            >
              {subtitle}
            </p>
          </CardHeader>
          <CardContent>
            <div className='mb-4 grid grid-cols-2 gap-2 rounded-lg bg-gray-800 p-1'>
              {(["password", "otp"] as const).map((loginMode) => (
                <button
                  key={loginMode}
                  type='button'
                  onClick={() => setMode(loginMode)}
                  className={`rounded-md py-1.5 text-sm font-medium transition-colors ${mode === loginMode ? `${accentClasses.active} text-white` : "text-gray-400 hover:text-white"}`}
                >
                  {loginMode === "password" ? "Password" : "OTP"}
                </button>
              ))}
            </div>
            {mode === "otp" ? (
              <OtpLoginForm
                redirectPath={redirectPath}
                variant={isDark ? "dark" : "light"}
              />
            ) : (
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='space-y-1.5'>
                  <Label htmlFor='phoneNumber' className={labelClass}>
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
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        phoneNumber: event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10),
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='password' className={labelClass}>
                    Password
                  </Label>
                  <div className='relative'>
                    <Input
                      id='password'
                      type={showPassword ? "text" : "password"}
                      autoComplete='current-password'
                      placeholder='Enter your password'
                      value={form.password}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      onPaste={(event) => {
                        // Passwords copied from notes/chat apps often carry a
                        // trailing newline/space, which silently breaks login
                        // since the extra character isn't visible in the
                        // masked field. Trim only the pasted chunk, not the
                        // whole value, so a typed leading/trailing space is
                        // still possible.
                        event.preventDefault();
                        const pasted = event.clipboardData
                          .getData("text")
                          .trim();
                        const input = event.currentTarget;
                        const start = input.selectionStart ?? form.password.length;
                        const end = input.selectionEnd ?? form.password.length;
                        setForm((current) => ({
                          ...current,
                          password:
                            current.password.slice(0, start) +
                            pasted +
                            current.password.slice(end),
                        }));
                      }}
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword((visible) => !visible)}
                      tabIndex={-1}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className={`absolute right-2 top-1/2 -translate-y-1/2 transition-colors ${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-800"}`}
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
                  className={`w-full ${accentClasses.active} ${accentClasses.hover} text-white font-medium`}
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
        <div
          className={`flex flex-col gap-3 ${isDark ? "mt-4" : "p-4 text-sm text-gray-900 mt-4 bg-gray-100 border border-gray-200 rounded-lg"}`}
        >
          {links.map((link) => (
            <Link key={link.to} to={link.to} className={linkClass}>
              <ArrowLeft className='w-4 h-4' />
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoleLoginForm;
