import {
  Shield,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

import { motion } from "framer-motion";
import { useGetCustomerActiveServicesQuery } from "@/redux-store/services/BikeSystemApi2/VASApi";

// Backend populates serviceName + serviceType on the serviceId ref
interface PopulatedService {
  serviceId: { _id: string; serviceName: string; serviceType: string } | string;
  serviceName?: string;
  serviceType?: string;
  activatedDate: Date | string;
  expiryDate: Date | string;
  purchasePrice: number;
  coverageYears: number;
  isActive: boolean;
}

function getServiceName(service: PopulatedService): string {
  if (service.serviceName) return service.serviceName;
  if (typeof service.serviceId === "object")
    return service.serviceId.serviceName;
  return "Service";
}

function getServiceType(service: PopulatedService): string {
  if (service.serviceType) return service.serviceType;
  if (typeof service.serviceId === "object")
    return service.serviceId.serviceType;
  return "";
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDaysRemaining(expiryDate: Date | string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function CustomerActiveServices() {
  const { data, isLoading, isError } = useGetCustomerActiveServicesQuery();

  if (isLoading) {
    return (
      <div className='rounded-2xl border border-gray-100 bg-white p-6'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='w-8 h-8 rounded-xl bg-gray-100 animate-pulse' />
          <div className='h-4 w-40 rounded bg-gray-100 animate-pulse' />
        </div>
        <div className='space-y-3'>
          {[1, 2].map((i) => (
            <div key={i} className='h-20 rounded-xl bg-gray-50 animate-pulse' />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='rounded-2xl border border-red-100 bg-red-50 p-6 flex items-center gap-3'>
        <AlertCircle className='w-5 h-5 text-red-400 shrink-0' />
        <p className='text-sm text-red-600'>Failed to load active services.</p>
      </div>
    );
  }

  // Flatten: each vehicle can have multiple services
  const allEntries =
    data?.data?.flatMap((entry) =>
      entry.services.map((svc) => ({
        ...svc,
        vehicle: entry.vehicle,
      }))
    ) ?? [];

  const activeEntries = allEntries.filter((s) => s.isActive);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.24, duration: 0.4 }}
      className='rounded-2xl border border-gray-100 bg-white overflow-hidden'
    >
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-4 border-b border-gray-50'>
        <div className='flex items-center gap-2.5'>
          <div className='w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center'>
            <Shield className='w-4 h-4 text-red-500' />
          </div>
          <div>
            <h2 className='text-sm font-semibold text-gray-900'>
              Active Services
            </h2>
            <p className='text-[11px] text-gray-400'>
              Value-added protection plans
            </p>
          </div>
        </div>
        <span className='text-xs font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded-full'>
          {activeEntries.length} Active
        </span>
      </div>

      {/* Body */}
      <div className='p-4 space-y-3'>
        {activeEntries.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-10 text-center'>
            <div className='w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3'>
              <Shield className='w-5 h-5 text-gray-300' />
            </div>
            <p className='text-sm font-medium text-gray-500'>
              No active services
            </p>
            <p className='text-xs text-gray-400 mt-1'>
              Visit your nearest branch to activate a protection plan.
            </p>
          </div>
        ) : (
          activeEntries.map((entry, idx) => {
            const daysLeft = getDaysRemaining(entry.expiryDate);
            const isExpiringSoon = daysLeft <= 30 && daysLeft > 0;
            const isExpired = daysLeft <= 0;

            return (
              <div
                key={`${entry.vehicle._id}-${idx}`}
                className='flex items-start gap-4 rounded-xl bg-gray-50 px-4 py-3.5 hover:bg-gray-100 transition-colors'
              >
                {/* Status icon */}
                <div className='mt-0.5 shrink-0'>
                  {isExpired ? (
                    <AlertCircle className='w-4.5 h-4.5 text-red-400' />
                  ) : isExpiringSoon ? (
                    <Clock className='w-4.5 h-4.5 text-amber-400' />
                  ) : (
                    <CheckCircle2 className='w-4.5 h-4.5 text-emerald-500' />
                  )}
                </div>

                {/* Info */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between gap-2'>
                    <p className='text-sm font-semibold text-gray-900 truncate'>
                      {getServiceName(entry)}
                    </p>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                        isExpired
                          ? "bg-red-100 text-red-600"
                          : isExpiringSoon
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {isExpired
                        ? "Expired"
                        : isExpiringSoon
                        ? `${daysLeft}d left`
                        : "Active"}
                    </span>
                  </div>

                  {/* Vehicle plate */}
                  <p className='text-[11px] text-gray-400 mt-0.5'>
                    {entry.vehicle.numberPlate ?? entry.vehicle.modelName}
                    {getServiceType(entry) && <> · {getServiceType(entry)}</>}
                  </p>

                  {/* Dates + price */}
                  <div className='flex items-center gap-4 mt-2'>
                    <span className='text-[11px] text-gray-500'>
                      Activated: {formatDate(entry.activatedDate)}
                    </span>
                    <span className='text-[11px] text-gray-500'>
                      Expires: {formatDate(entry.expiryDate)}
                    </span>
                    <span className='text-[11px] font-semibold text-gray-700 ml-auto'>
                      ₹{entry.purchasePrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <ChevronRight className='w-4 h-4 text-gray-300 shrink-0 mt-1' />
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
