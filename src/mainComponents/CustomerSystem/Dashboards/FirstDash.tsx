import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bike,
  Tag,
  UserPlus,
  AlertCircle,
  Shield,
  ChevronRight,
  List,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetMyVehiclesQuery } from "@/redux-store/services/customer/customerVehicleApi";
import { IPopulatedCustomerVehicle } from "@/types/superAd_Cu.types";

// ─── Vehicle Card ─────────────────────────────────────────────────────────────
function VehicleCard({
  vehicle,
  index,
}: {
  vehicle: IPopulatedCustomerVehicle;
  index: number;
}) {
  const navigate = useNavigate();
  const stock = vehicle.stockConcept;
  const modelName = stock?.modelName ?? "Unknown Model";
  const category = stock?.category ?? "—";
  const color = stock?.color ?? "—";
  const variant = stock?.variant ?? "";
  const year = stock?.yearOfManufacture ?? "—";
  const vasCount =
    vehicle.activeValueAddedServices?.filter((s) => s.isActive).length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: "easeOut" }}
      onClick={() => navigate(`/customer/vehicle/${vehicle._id}`)}
      className='group relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer hover:border-red-200 hover:shadow-md transition-all duration-200'
    >
      {/* accent bar */}
      <div className='absolute top-0 left-0 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-300 rounded-t-2xl' />

      <div className='flex items-center gap-3'>
        <div className='w-11 h-11 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center shrink-0'>
          <Bike className='w-5 h-5 text-red-500' />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='font-bold text-gray-900 text-sm truncate group-hover:text-red-600 transition-colors'>
            {modelName}
          </p>
          <p className='text-xs text-gray-400 truncate mt-0.5'>
            {category} · {color}
            {variant ? ` · ${variant}` : ""} · {year}
          </p>
        </div>
        <ChevronRight className='w-4 h-4 text-gray-300 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all shrink-0' />
      </div>

      <div className='mt-3 flex flex-wrap gap-1.5'>
        {vehicle.numberPlate && (
          <span className='bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 rounded-lg font-mono tracking-wide'>
            {vehicle.numberPlate}
          </span>
        )}
        {vehicle.insurance && (
          <span className='bg-blue-50 text-blue-600 text-[11px] px-2 py-0.5 rounded-lg font-semibold flex items-center gap-1'>
            <Shield className='w-2.5 h-2.5' /> Insured
          </span>
        )}
        {vasCount > 0 && (
          <span className='bg-green-50 text-green-700 text-[11px] px-2 py-0.5 rounded-lg font-semibold'>
            {vasCount} VAS Active
          </span>
        )}
        {vehicle.isPaid && (
          <span className='bg-emerald-50 text-emerald-700 text-[11px] px-2 py-0.5 rounded-lg font-semibold'>
            Paid
          </span>
        )}
        {vehicle.isFinance && (
          <span className='bg-amber-50 text-amber-700 text-[11px] px-2 py-0.5 rounded-lg font-semibold'>
            Finance
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Action Card ──────────────────────────────────────────────────────────────
function ActionCard({
  icon: Icon,
  label,
  description,
  to,
  accent,
  index,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  to: string;
  accent: string;
  index: number;
}) {
  const navigate = useNavigate();
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: "easeOut" }}
      onClick={() => navigate(to)}
      className='group w-full relative overflow-hidden flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-md transition-all duration-200 text-left'
    >
      {/* hover fill */}
      <div
        className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300'
        style={{ background: `${accent}06` }}
      />

      <div
        className='relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0'
        style={{ background: `${accent}15` }}
      >
        <Icon className='w-5 h-5' style={{ color: accent }} />
      </div>

      <div className='relative flex-1 min-w-0'>
        <p className='font-bold text-gray-900 text-sm group-hover:text-gray-700 transition-colors'>
          {label}
        </p>
        <p className='text-xs text-gray-400 mt-0.5 leading-relaxed'>
          {description}
        </p>
      </div>

      <ArrowRight className='relative w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all shrink-0' />
    </motion.button>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const VehicleSkeleton = () => (
  <div className='space-y-3'>
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className='bg-white border border-gray-100 rounded-2xl p-4 animate-pulse'
      >
        <div className='flex items-center gap-3'>
          <div className='w-11 h-11 rounded-xl bg-gray-100 shrink-0' />
          <div className='flex-1 space-y-2'>
            <div className='h-3.5 bg-gray-100 rounded-lg w-3/4' />
            <div className='h-3 bg-gray-100 rounded-lg w-1/2' />
          </div>
        </div>
        <div className='mt-3 flex gap-2'>
          <div className='h-5 w-20 bg-gray-100 rounded-lg' />
          <div className='h-5 w-16 bg-gray-100 rounded-lg' />
        </div>
      </div>
    ))}
  </div>
);

// ─── Constants ────────────────────────────────────────────────────────────────
const ACTION_CARDS = [
  {
    icon: UserPlus,
    label: "Initialize with New Vehicle",
    description: "Update customer details with a newly assigned vehicle",
    to: "/customer/initialize",
    accent: "#3b82f6",
  },
  {
    icon: Tag,
    label: "Attach Safety Stickers",
    description: "Assign Scanfleet safety stickers to a vehicle",
    to: "/customer/attach-stickers",
    accent: "#8b5cf6",
  },
] as const;

// ─── Tab Button ───────────────────────────────────────────────────────────────
function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex-1 py-2.5 text-xs font-semibold text-center transition-colors ${
        active ? "text-red-600" : "text-gray-400 hover:text-gray-600"
      }`}
    >
      {children}
      {active && (
        <motion.div
          layoutId='tab-indicator'
          className='absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 rounded-full'
        />
      )}
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
type Tab = "vehicles" | "actions";

export default function FirstDash() {
  const [activeTab, setActiveTab] = useState<Tab>("vehicles");
  const { data, isFetching, isError } = useGetMyVehiclesQuery();

  const vehicles = data?.data ?? [];
  const hasVehicles = !isFetching && vehicles.length > 0;
  const noVehicles = !isFetching && vehicles.length === 0;
  const effectiveTab: Tab = noVehicles ? "actions" : activeTab;

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='px-4 sm:px-6 py-6 max-w-4xl mx-auto space-y-5'>
        {/* Alerts */}
        <AnimatePresence>
          {isError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className='flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-2xl p-3.5 text-sm text-red-700'
            >
              <AlertCircle className='w-4 h-4 shrink-0' />
              Failed to fetch vehicles. Please try again.
            </motion.div>
          )}
          {noVehicles && !isError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className='flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-sm text-amber-800'
            >
              <AlertCircle className='w-4 h-4 shrink-0' />
              No active vehicles found. Use the actions below to get started.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab bar */}
        <div className='bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden'>
          {/* tabs header */}
          <div className='flex border-b border-gray-100 px-2'>
            {hasVehicles && (
              <TabBtn
                active={effectiveTab === "vehicles"}
                onClick={() => setActiveTab("vehicles")}
              >
                Vehicles
                <span className='ml-1.5 px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold'>
                  {vehicles.length}
                </span>
              </TabBtn>
            )}
            <TabBtn
              active={effectiveTab === "actions"}
              onClick={() => setActiveTab("actions")}
            >
              Actions
            </TabBtn>
          </div>

          {/* tab content */}
          <div className='p-4'>
            <AnimatePresence mode='wait'>
              {effectiveTab === "vehicles" && (
                <motion.div
                  key='vehicles'
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2 }}
                  className='grid grid-cols-1 md:grid-cols-2 gap-4'
                >
                  {/* vehicle list */}
                  <div className='space-y-3'>
                    {isFetching && <VehicleSkeleton />}
                    {!isFetching &&
                      vehicles.map((vehicle, i) => (
                        <VehicleCard
                          key={vehicle._id}
                          vehicle={vehicle}
                          index={i}
                        />
                      ))}
                    {!isFetching && vehicles.length === 0 && (
                      <div className='flex flex-col items-center justify-center py-16 text-center text-gray-400'>
                        <List className='w-8 h-8 mb-2 opacity-30' />
                        <p className='text-xs'>No vehicles found</p>
                      </div>
                    )}
                  </div>

                  {/* action cards alongside */}
                  <div className='flex flex-col gap-3'>
                    {ACTION_CARDS.map((card, i) => (
                      <ActionCard key={card.to} {...card} index={i} />
                    ))}
                  </div>
                </motion.div>
              )}

              {effectiveTab === "actions" && (
                <motion.div
                  key='actions'
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  className='grid grid-cols-1 md:grid-cols-2 gap-3'
                >
                  {ACTION_CARDS.map((card, i) => (
                    <ActionCard key={card.to} {...card} index={i} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
