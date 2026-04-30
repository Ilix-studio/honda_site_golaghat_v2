import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CustomerBikeInfo } from "../CustomerBikeInfo";
import { useAppSelector } from "@/hooks/redux";
import { selectCustomerAuth } from "@/redux-store/slices/customer/customerAuthSlice";
import { Loader2, Bike, Sparkles } from "lucide-react";
// import { TokenDebugger } from "@/lib/TokenDebugger";
import CustomerProfileInto from "../CustomerProfileInto";
import { motion } from "framer-motion";
import CustomerActiveServices from "./CustomerActiveServices";

export default function CustomerMainDash() {
  const navigate = useNavigate();
  const { customer, isAuthenticated, firebaseToken } =
    useAppSelector(selectCustomerAuth);

  useEffect(() => {
    if (!isAuthenticated || !customer || !firebaseToken) {
      navigate("/customer/login", { replace: true });
    }
  }, [isAuthenticated, customer, firebaseToken, navigate]);

  if (!isAuthenticated || !customer) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='flex flex-col items-center gap-3'>
          <div className='w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center'>
            <Loader2 className='w-5 h-5 animate-spin text-red-500' />
          </div>
          <p className='text-sm font-medium text-gray-500'>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const displayName = customer.firstName
    ? `${customer.firstName}${customer.lastName ? ` ${customer.lastName}` : ""}`
    : customer.phoneNumber;

  return (
    <div className='min-h-screen bg-gray-50'>
      <main className='max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6'>
        {/* ── Hero welcome banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className='relative overflow-hidden rounded-2xl bg-gray-950 px-6 py-6'
        >
          {/* diagonal stripe texture */}
          <div
            className='absolute inset-0 opacity-[0.04] pointer-events-none'
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 14px)",
            }}
          />
          {/* red glow blob */}
          <div className='absolute -top-8 -right-8 w-48 h-48 rounded-full bg-red-600/20 blur-3xl pointer-events-none' />

          <div className='relative flex items-center justify-between gap-4'>
            <div>
              <div className='flex items-center gap-2 mb-1'>
                <Sparkles className='w-3.5 h-3.5 text-red-400' />
                <span className='text-[11px] font-semibold text-red-400 uppercase tracking-widest'>
                  Owner Dashboard
                </span>
              </div>
              <h1 className='text-xl font-black text-white leading-tight'>
                Welcome back, {displayName}
              </h1>
              <p className='text-sm text-gray-400 mt-1'>
                Here's your motorcycle information and service details.
              </p>
            </div>

            <div className='shrink-0 w-14 h-14 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center'>
              <Bike className='w-6 h-6 text-red-400' />
            </div>
          </div>
        </motion.div>

        {/* ── Profile section ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <CustomerProfileInto />
        </motion.div>

        {/* ── Bike info section ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.4 }}
        >
          <CustomerBikeInfo />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.4 }}
        >
          <CustomerActiveServices />
        </motion.div>

        {/* ── Dev token debugger ── */}
        {process.env.NODE_ENV === "development" && (
          <div className='opacity-50 hover:opacity-100 transition-opacity'>
            {/* <TokenDebugger /> */}
          </div>
        )}
      </main>
    </div>
  );
}
