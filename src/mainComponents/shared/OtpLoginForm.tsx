import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useOtpLoginMutation } from "@/redux-store/services/adminApi";
import { useAdminPhoneValidation } from "@/hooks/useAdminPhoneValidation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Phone,
  ShieldCheck,
  XCircle,
} from "lucide-react";

export interface OtpLoginFormProps {
  /** Where to navigate on a successful OTP login. */
  redirectPath: string;
  /** Matches the surrounding page's theme — the 4 role portals are dark, Super-Admin's is light. */
  variant?: "dark" | "light";
}

const OtpLoginForm: React.FC<OtpLoginFormProps> = ({
  redirectPath,
  variant = "dark",
}) => {
  const navigate = useNavigate();
  const [otpLogin, { isLoading: isVerifying }] = useOtpLoginMutation();
  const { phoneNumber, validationState, handlePhoneChange, isOtpButtonDisabled } =
    useAdminPhoneValidation();

  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpTimer, setOtpTimer] = useState(0);

  const containerId = "admin-otp-recaptcha-container";

  useEffect(() => {
    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(auth, containerId, {
          size: "invisible",
        });
      }
    } catch (err) {
      console.error("Recaptcha setup error:", err);
    }

    return () => {
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleSendOtp = async () => {
    setError(null);
    if (!recaptchaRef.current) {
      setError("Verification not ready. Please refresh and try again.");
      return;
    }

    setIsSending(true);
    try {
      const confirmation = await signInWithPhoneNumber(
        auth,
        `+91${phoneNumber}`,
        recaptchaRef.current,
      );
      setConfirmationResult(confirmation);
      setStep("otp");
      setOtpTimer(60);
    } catch (err: any) {
      let message = "Failed to send OTP";
      switch (err.code) {
        case "auth/invalid-phone-number":
          message = "Invalid phone number format";
          break;
        case "auth/too-many-requests":
          message = "Too many requests. Try again later";
          break;
        case "auth/quota-exceeded":
          message = "SMS quota exceeded. Try tomorrow";
          break;
        default:
          message = err.message || message;
      }
      setError(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6 || !confirmationResult) return;
    setError(null);

    try {
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      const response = await otpLogin({ idToken }).unwrap();
      if (response.success) {
        navigate(redirectPath, { replace: true });
      }
    } catch (err: any) {
      let message = err?.data?.message || "Invalid OTP";
      if (err.code === "auth/invalid-verification-code") {
        message = "Invalid OTP. Please check the code.";
      } else if (err.code === "auth/code-expired") {
        message = "OTP has expired. Please request a new one.";
      }
      setError(message);
    }
  };

  const handleChangeNumber = () => {
    setStep("phone");
    setOtp("");
    setConfirmationResult(null);
    setError(null);
  };

  const isDark = variant === "dark";
  const labelClass = isDark ? "text-gray-300 text-sm" : "text-sm font-medium text-gray-700";
  const inputClass = isDark
    ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 pl-10"
    : "pl-10 focus:border-red-500 focus:ring-red-200";
  const mutedTextClass = isDark ? "text-gray-400" : "text-gray-600";
  const buttonClass = "w-full bg-red-600 hover:bg-red-700 text-white font-medium";

  return (
    <div className='space-y-4'>
      <div id={containerId}></div>

      {step === "phone" ? (
        <>
          <div className='space-y-1.5'>
            <Label htmlFor='otp-phone' className={labelClass}>
              Phone Number
            </Label>
            <div className='relative'>
              <Phone className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
              <Input
                id='otp-phone'
                type='text'
                inputMode='numeric'
                maxLength={10}
                placeholder='e.g. 8880000000'
                value={phoneNumber}
                onChange={handlePhoneChange}
                className={inputClass}
              />
              <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                {validationState.isChecking && (
                  <Loader2 className='h-4 w-4 animate-spin text-blue-500' />
                )}
                {!validationState.isChecking && validationState.exists && (
                  <CheckCircle className='h-4 w-4 text-green-500' />
                )}
                {!validationState.isChecking &&
                  phoneNumber.length === 10 &&
                  !validationState.exists && (
                    <XCircle className='h-4 w-4 text-red-500' />
                  )}
              </div>
            </div>
            {validationState.message && (
              <p
                className={`text-xs ${
                  validationState.exists ? "text-green-500" : "text-orange-500"
                }`}
              >
                {validationState.message}
              </p>
            )}
            {validationState.error && (
              <p className='text-xs text-red-500'>{validationState.error}</p>
            )}
          </div>

          {error && (
            <div className='flex items-center gap-2 text-red-400 text-sm bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2'>
              <AlertCircle className='w-4 h-4 shrink-0' />
              <span>{error}</span>
            </div>
          )}

          <Button
            type='button'
            onClick={handleSendOtp}
            disabled={isOtpButtonDisabled || isSending}
            className={buttonClass}
          >
            {isSending ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Sending OTP...
              </>
            ) : (
              <>
                <ShieldCheck className='w-4 h-4 mr-2' />
                Send OTP
              </>
            )}
          </Button>
        </>
      ) : (
        <>
          <p className={`text-sm text-center ${mutedTextClass}`}>
            Enter the 6-digit code sent to +91 {phoneNumber}
          </p>

          <div className='flex justify-center'>
            <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={isVerifying}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && (
            <div className='flex items-center gap-2 text-red-400 text-sm bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2'>
              <AlertCircle className='w-4 h-4 shrink-0' />
              <span>{error}</span>
            </div>
          )}

          <Button
            type='button'
            onClick={handleVerifyOtp}
            disabled={otp.length !== 6 || isVerifying}
            className={buttonClass}
          >
            {isVerifying ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Verifying...
              </>
            ) : (
              "Verify & Login"
            )}
          </Button>

          <div className={`text-center space-y-2 text-sm ${mutedTextClass}`}>
            {otpTimer > 0 ? (
              <p>
                Resend OTP in <span className='font-semibold text-red-500'>{otpTimer}s</span>
              </p>
            ) : (
              <Button
                type='button'
                variant='ghost'
                onClick={handleChangeNumber}
                disabled={isVerifying}
                className='text-red-500 hover:text-red-600'
              >
                Resend OTP
              </Button>
            )}
            <button
              type='button'
              onClick={handleChangeNumber}
              disabled={isVerifying}
              className='underline hover:no-underline'
            >
              Change Number
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default OtpLoginForm;
