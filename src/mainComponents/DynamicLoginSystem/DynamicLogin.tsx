// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import {
//   User,
//   Shield,
//   Building2,
//   ShoppingCart,
//   LogOut,
//   Settings,
//   FileText,
//   Users,
//   Phone,
//   Mail,
//   MapPin,
// } from "lucide-react";

// // Role types based on your backend
// type UserRole = "Super-Admin" | "Branch-Admin" | "Customer";

// interface UserData {
//   id: string;
//   role: UserRole;
//   name?: string;
//   email?: string;
//   applicationId?: string;
//   phoneNumber?: string;
//   branch?: {
//     name: string;
//     address: string;
//   };
//   profileCompleted?: boolean;
// }

// export default function DynamicLogin() {
//   const navigate = useNavigate();
//   const [userData, setUserData] = useState<UserData | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Get token from localStorage
//     const token = localStorage.getItem("authToken");

//     if (!token) {
//       // No token, redirect to login
//       navigate("/");
//       return;
//     }

//     // Decode token to get user data
//     // In production, you should verify this with your backend
//     try {
//       const payload = JSON.parse(atob(token.split(".")[1]));

//       // Fetch user data based on token
//       fetchUserData(token, payload.id);
//     } catch (error) {
//       console.error("Invalid token:", error);
//       localStorage.removeItem("authToken");
//       navigate("/");
//     }
//   }, [navigate]);

//   const fetchUserData = async (token: string, userId: string) => {
//     try {
//       // Call your API to get user data based on the role
//       // Replace with your actual API endpoints
//       const response = await fetch(`/api/user/profile`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         throw new Error("Failed to fetch user data");
//       }

//       const data = await response.json();

//       // Set user data with role from token
//       setUserData({
//         id: data.data.id || data.data._id,
//         role: data.data.role,
//         name: data.data.name,
//         email: data.data.email,
//         applicationId: data.data.applicationId,
//         phoneNumber: data.data.phoneNumber,
//         branch: data.data.branch,
//         profileCompleted: data.data.profileCompleted,
//       });
//     } catch (error) {
//       console.error("Error fetching user data:", error);
//       localStorage.removeItem("authToken");
//       navigate("/");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("authToken");
//     navigate("/");
//   };

//   if (loading) {
//     return (
//       <div className='min-h-screen bg-black flex items-center justify-center'>
//         <div className='text-center'>
//           <div className='w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
//           <p className='text-gray-400'>Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!userData) {
//     return null;
//   }

//   // Super Admin Dashboard
//   if (userData.role === "Super-Admin") {
//     return (
//       <div className='min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900'>
//         <div className='container mx-auto px-6 py-8'>
//           {/* Header */}
//           <div className='bg-black/50 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 mb-8'>
//             <div className='flex items-center justify-between'>
//               <div className='flex items-center gap-4'>
//                 <div className='w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center'>
//                   <Shield className='h-8 w-8 text-white' />
//                 </div>
//                 <div>
//                   <h1 className='text-2xl font-bold text-white'>
//                     {userData.name}
//                   </h1>
//                   <p className='text-red-400'>{userData.email}</p>
//                   <span className='inline-block mt-1 px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full font-medium'>
//                     Super Administrator
//                   </span>
//                 </div>
//               </div>
//               <Button
//                 onClick={handleLogout}
//                 variant='outline'
//                 className='border-red-500/50 text-red-400 hover:bg-red-500/10'
//               >
//                 <LogOut className='h-4 w-4 mr-2' />
//                 Logout
//               </Button>
//             </div>
//           </div>

//           {/* Quick Actions */}
//           <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
//             {[
//               {
//                 title: "Manage Branches",
//                 icon: Building2,
//                 description: "Create and manage branch locations",
//                 link: "/admin/branches",
//               },
//               {
//                 title: "Branch Managers",
//                 icon: Users,
//                 description: "Create and manage branch managers",
//                 link: "/admin/branch-managers",
//               },
//               {
//                 title: "All Customers",
//                 icon: ShoppingCart,
//                 description: "View and manage all customers",
//                 link: "/admin/customers",
//               },
//               {
//                 title: "Reports",
//                 icon: FileText,
//                 description: "View system reports and analytics",
//                 link: "/admin/reports",
//               },
//               {
//                 title: "Settings",
//                 icon: Settings,
//                 description: "System configuration and settings",
//                 link: "/admin/settings",
//               },
//             ].map((action, index) => (
//               <button
//                 key={index}
//                 onClick={() => navigate(action.link)}
//                 className='group bg-black/30 backdrop-blur-sm border border-gray-800 hover:border-red-500/50 rounded-xl p-6 transition-all duration-300 hover:scale-105 text-left'
//               >
//                 <div className='w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-colors'>
//                   <action.icon className='h-6 w-6 text-red-400' />
//                 </div>
//                 <h3 className='text-lg font-semibold text-white mb-2'>
//                   {action.title}
//                 </h3>
//                 <p className='text-sm text-gray-400'>{action.description}</p>
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Branch Manager Dashboard
//   if (userData.role === "Branch-Admin") {
//     return (
//       <div className='min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900'>
//         <div className='container mx-auto px-6 py-8'>
//           {/* Header */}
//           <div className='bg-black/50 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 mb-8'>
//             <div className='flex items-center justify-between'>
//               <div className='flex items-center gap-4'>
//                 <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center'>
//                   <Building2 className='h-8 w-8 text-white' />
//                 </div>
//                 <div>
//                   <h1 className='text-2xl font-bold text-white'>
//                     {userData.branch?.name}
//                   </h1>
//                   <p className='text-gray-400'>{userData.applicationId}</p>
//                   <p className='text-sm text-gray-500 mt-1'>
//                     <MapPin className='h-3 w-3 inline mr-1' />
//                     {userData.branch?.address}
//                   </p>
//                   <span className='inline-block mt-2 px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium'>
//                     Branch Manager
//                   </span>
//                 </div>
//               </div>
//               <Button
//                 onClick={handleLogout}
//                 variant='outline'
//                 className='border-red-500/50 text-red-400 hover:bg-red-500/10'
//               >
//                 <LogOut className='h-4 w-4 mr-2' />
//                 Logout
//               </Button>
//             </div>
//           </div>

//           {/* Quick Actions */}
//           <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
//             {[
//               {
//                 title: "Branch Customers",
//                 icon: Users,
//                 description: "Manage customers at your branch",
//                 link: "/branch/customers",
//               },
//               {
//                 title: "Services",
//                 icon: Settings,
//                 description: "Manage service appointments",
//                 link: "/branch/services",
//               },
//               {
//                 title: "Inventory",
//                 icon: FileText,
//                 description: "View and manage inventory",
//                 link: "/branch/inventory",
//               },
//               {
//                 title: "Reports",
//                 icon: FileText,
//                 description: "View branch reports",
//                 link: "/branch/reports",
//               },
//             ].map((action, index) => (
//               <button
//                 key={index}
//                 onClick={() => navigate(action.link)}
//                 className='group bg-black/30 backdrop-blur-sm border border-gray-800 hover:border-blue-500/50 rounded-xl p-6 transition-all duration-300 hover:scale-105 text-left'
//               >
//                 <div className='w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors'>
//                   <action.icon className='h-6 w-6 text-blue-400' />
//                 </div>
//                 <h3 className='text-lg font-semibold text-white mb-2'>
//                   {action.title}
//                 </h3>
//                 <p className='text-sm text-gray-400'>{action.description}</p>
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Customer Dashboard
//   return (
//     <div className='min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900'>
//       <div className='container mx-auto px-6 py-8'>
//         {/* Header */}
//         <div className='bg-black/50 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 mb-8'>
//           <div className='flex items-center justify-between'>
//             <div className='flex items-center gap-4'>
//               <div className='w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center'>
//                 <User className='h-8 w-8 text-white' />
//               </div>
//               <div>
//                 <h1 className='text-2xl font-bold text-white'>My Account</h1>
//                 <p className='text-gray-400 flex items-center gap-2'>
//                   <Phone className='h-4 w-4' />
//                   {userData.phoneNumber}
//                 </p>
//                 {userData.profileCompleted ? (
//                   <span className='inline-block mt-2 px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium'>
//                     Profile Complete
//                   </span>
//                 ) : (
//                   <span className='inline-block mt-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full font-medium'>
//                     Complete Your Profile
//                   </span>
//                 )}
//               </div>
//             </div>
//             <Button
//               onClick={handleLogout}
//               variant='outline'
//               className='border-red-500/50 text-red-400 hover:bg-red-500/10'
//             >
//               <LogOut className='h-4 w-4 mr-2' />
//               Logout
//             </Button>
//           </div>
//         </div>

//         {/* Profile Completion Alert */}
//         {!userData.profileCompleted && (
//           <div className='bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6'>
//             <p className='text-yellow-400 text-sm'>
//               Please complete your profile to access all features.
//             </p>
//             <Button
//               onClick={() => navigate("/customer-profile")}
//               className='mt-3 bg-yellow-500 hover:bg-yellow-600 text-black'
//               size='sm'
//             >
//               Complete Profile
//             </Button>
//           </div>
//         )}

//         {/* Quick Actions */}
//         <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
//           {[
//             {
//               title: "My Profile",
//               icon: User,
//               description: "View and edit your profile",
//               link: "/customer-profile",
//             },
//             {
//               title: "My Vehicles",
//               icon: ShoppingCart,
//               description: "Manage your motorcycles",
//               link: "/customer/vehicle-info",
//             },
//             {
//               title: "Services",
//               icon: Settings,
//               description: "Book and track services",
//               link: "/customer/services",
//             },
//             {
//               title: "Value Added Services",
//               icon: FileText,
//               description: "Explore additional services",
//               link: "/customer/vas",
//             },
//             {
//               title: "Contact Support",
//               icon: Mail,
//               description: "Get help from our team",
//               link: "/customer/support",
//             },
//           ].map((action, index) => (
//             <button
//               key={index}
//               onClick={() => navigate(action.link)}
//               className='group bg-black/30 backdrop-blur-sm border border-gray-800 hover:border-green-500/50 rounded-xl p-6 transition-all duration-300 hover:scale-105 text-left'
//             >
//               <div className='w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors'>
//                 <action.icon className='h-6 w-6 text-green-400' />
//               </div>
//               <h3 className='text-lg font-semibold text-white mb-2'>
//                 {action.title}
//               </h3>
//               <p className='text-sm text-gray-400'>{action.description}</p>
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
