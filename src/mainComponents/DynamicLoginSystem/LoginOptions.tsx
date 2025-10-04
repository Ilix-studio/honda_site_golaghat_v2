// // Example: SuperAdminLogin.tsx
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { setAuthToken } from "@/lib/authUtils";

// export default function SuperAdminLogin() {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const response = await fetch("/api/adminLogin/super-ad-login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Login failed");
//       }

//       // Save token using utility function (this will trigger authChange event)
//       setAuthToken(data.data.token);

//       // Navigate to dynamic login page
//       navigate("/dynamic-login");
//     } catch (err: any) {
//       setError(err.message || "An error occurred during login");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className='min-h-screen bg-black flex items-center justify-center'>
//       <div className='max-w-md w-full bg-gray-900 rounded-xl p-8 border border-red-500/20'>
//         <h2 className='text-2xl font-bold text-white mb-6'>
//           Super Admin Login
//         </h2>

//         {error && (
//           <div className='bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4'>
//             <p className='text-red-400 text-sm'>{error}</p>
//           </div>
//         )}

//         <form onSubmit={handleLogin} className='space-y-4'>
//           <div>
//             <label className='block text-gray-400 text-sm mb-2'>Email</label>
//             <input
//               type='email'
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className='w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none'
//               required
//             />
//           </div>

//           <div>
//             <label className='block text-gray-400 text-sm mb-2'>Password</label>
//             <input
//               type='password'
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className='w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none'
//               required
//             />
//           </div>

//           <Button
//             type='submit'
//             disabled={loading}
//             className='w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white'
//           >
//             {loading ? "Logging in..." : "Login"}
//           </Button>
//         </form>
//       </div>
//     </div>
//   );
// }

// // Example: BranchManagerLogin.tsx
// export function BranchManagerLogin() {
//   const navigate = useNavigate();
//   const [applicationId, setApplicationId] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const response = await fetch("/api/adminLogin/branchM-login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ applicationId, password }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Login failed");
//       }

//       // Save token using utility function
//       setAuthToken(data.data.token);

//       // Navigate to dynamic login page
//       navigate("/dynamic-login");
//     } catch (err: any) {
//       setError(err.message || "An error occurred during login");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className='min-h-screen bg-black flex items-center justify-center'>
//       <div className='max-w-md w-full bg-gray-900 rounded-xl p-8 border border-blue-500/20'>
//         <h2 className='text-2xl font-bold text-white mb-6'>
//           Branch Manager Login
//         </h2>

//         {error && (
//           <div className='bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4'>
//             <p className='text-red-400 text-sm'>{error}</p>
//           </div>
//         )}

//         <form onSubmit={handleLogin} className='space-y-4'>
//           <div>
//             <label className='block text-gray-400 text-sm mb-2'>
//               Application ID
//             </label>
//             <input
//               type='text'
//               value={applicationId}
//               onChange={(e) => setApplicationId(e.target.value)}
//               className='w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none'
//               required
//             />
//           </div>

//           <div>
//             <label className='block text-gray-400 text-sm mb-2'>Password</label>
//             <input
//               type='password'
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className='w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none'
//               required
//             />
//           </div>

//           <Button
//             type='submit'
//             disabled={loading}
//             className='w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white'
//           >
//             {loading ? "Logging in..." : "Login"}
//           </Button>
//         </form>
//       </div>
//     </div>
//   );
// }

// // Example: CustomerLogin.tsx (Firebase)
// // export function CustomerLogin() {
// //   const navigate = useNavigate();
// //   const [phoneNumber, setPhoneNumber] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState("");

// //   const handleLogin = async (firebaseToken: string) => {
// //     setLoading(true);
// //     setError("");

// //     try {
// //       const response = await fetch("/api/customer/login", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${firebaseToken}`,
// //         },
// //       });

// //       const data = await response.json();

// //       if (!response.ok) {
// //         throw new Error(data.message || "Login failed");
// //       }

// //       // Save token using utility function
// //       setAuthToken(data.data.token);

// //       // Navigate to dynamic login page
// //       navigate("/dynamic-login");
// //     } catch (err: any) {
// //       setError(err.message || "An error occurred during login");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Your Firebase OTP logic here
// //   // After successful OTP verification, call handleLogin with Firebase token

// //   return (
// //     <div className='min-h-screen bg-black flex items-center justify-center'>
// //       <div className='max-w-md w-full bg-gray-900 rounded-xl p-8 border border-green-500/20'>
// //         <h2 className='text-2xl font-bold text-white mb-6'>Customer Login</h2>

// //         {error && (
// //           <div className='bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4'>
// //             <p className='text-red-400 text-sm'>{error}</p>
// //           </div>
// //         )}

// //         {/* Your Firebase phone authentication UI here */}
// //         <div className='space-y-4'>
// //           <div>
// //             <label className='block text-gray-400 text-sm mb-2'>
// //               Phone Number
// //             </label>
// //             <input
// //               type='tel'
// //               value={phoneNumber}
// //               onChange={(e) => setPhoneNumber(e.target.value)}
// //               className='w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none'
// //               placeholder='+91 9876543210'
// //               required
// //             />
// //           </div>
// //           handleLogin()
// //           <Button
// //             type='button'

// //             disabled={loading}
// //             className='w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white'
// //           >
// //             {loading ? "Processing..." : "Send OTP"}
// //           </Button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
