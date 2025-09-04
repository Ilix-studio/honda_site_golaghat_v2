// import React, { FormEvent, useEffect, useState, useTransition } from "react";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";

// import { auth } from "../../lib/firebase";

// import { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
// import { Loader2 } from "lucide-react";

// interface UserLoginProps {
//   onLogin?: (
//     credentials: { phone: string; otp: string } | { googleToken: string }
//   ) => void;
//   isLoading?: boolean;
// }

// const CustomerLogin: React.FC<UserLoginProps> = ({}) => {
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [otp, setOtp] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState();
//   const [resendCountdown, setResendCountdown] = useState(0);
//   const [recaptchaVerifier, setRecaptchaVerifier] =
//     useState<RecaptchaVerifier | null>(null);
//   const [confirmationResult, setConfirmationResult] =
//     useState<ConfirmationResult | null>(null);
//   const [isPending, startTransition] = useTransition();

//   useEffect(() => {
//     let timer: NodeJS.Timeout;
//     if (resendCountdown > 0) {
//       timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
//     }
//     return () => clearTimeout(timer);
//   }, [resendCountdown]);

//   useEffect(() => {
//     const recaptchaVerifier = new RecaptchaVerifier(
//       auth,
//       "recaptcha-container",
//       {
//         size: "invisible",
//       }
//     );
//     setRecaptchaVerifier(recaptchaVerifier);
//     return () => {
//       recaptchaVerifier.clear();
//     };
//   }, [auth]);

//   const requestOtp = async (e?: FormEvent<HTMLFormElement>) => {
//     e?.preventDefault();
//     setResendCountdown(60);

//     startTransition(async () => {
//       setError("");
//       if (!recaptchaVerifier) {
//         setError("RecaptchaVerifier is not initialized.");
//       }
//       try {
//         const confirmationResult = await signInWithPhoneNumber(
//           auth,
//           phoneNumber,
//           recaptchaVerifier
//         );
//         setConfirmationResult(confirmationResult);
//         setSuccess("OTP sent successfully.");
//       } catch (err: any) {
//         console.log(error);
//         setResendCountdown(0);
//         if (err.code === "auth/invalid-phone-number") {
//           setError("Invalid phone number. Please check the number.");
//         } else if (err.code === "auth/too-many-requests") {
//           setError("Too many requests. Please try again later.");
//         } else {
//           setError("Failed to send OTP. Please try again.");
//         }
//       }
//     });
//   };

//   return (
//     <>
//       <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4'>
//         {!confirmationResult && (
//           <form onSubmit={requestOtp}>
//             <Input
//               className='text-black'
//               type='tel'
//               value={phoneNumber}
//               onChange={(e) => setPhoneNumber(e.target.value)}
//             />
//             <p className='text-xs text-gray-400 mt-2'>
//               TsangPool Honda OTP Verification
//             </p>
//           </form>
//         )}
//         <Button
//           disabled={!phoneNumber || isPending || resendCountdown > 0}
//           onClick={() => requestOtp()}
//           className='mt-5'
//         >
//           {resendCountdown > 0
//             ? `Resend OTP in ${resendCountdown}`
//             : isPending
//             ? "Sending OTP"
//             : "Send OTP"}
//         </Button>

//         <div className='p-10 text-center'>
//           {error && <p className='text-red-500'>{error}</p>}
//           {success && <p className='text-green-500'>{success}</p>}
//         </div>

//         {isPending && <Loader2 />}
//         <div id='recaptcha-container' />
//       </div>
//     </>
//   );
// };

// export default CustomerLogin;
