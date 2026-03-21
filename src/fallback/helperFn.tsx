import { Zap, Star, Fuel, Palette, Settings2 } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

import { Link } from "react-router-dom";
import { Bike } from "./bike.types";
import { useEffect, useState } from "react";
import { MOCK_BIKES } from "./mock.data";

export function getPrimaryImage(bike: Bike): string {
  const primary = bike.images?.find((i) => i.isPrimary) ?? bike.images?.[0];
  return primary?.url ?? "https://placehold.co/280x144/f5f5f5/ccc?text=Honda";
}

export function formatPrice(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export const Skeleton = ({ className = "" }: { className?: string }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] rounded ${className}`}
  />
);

export const CardSkeleton = () => (
  <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm'>
    <Skeleton className='w-full h-48 mb-4 rounded-md' />
    <div className='space-y-3'>
      <Skeleton className='h-6 w-3/4' />
      <Skeleton className='h-4 w-full' />
      <Skeleton className='h-4 w-full' />
      <Skeleton className='h-4 w-2/3' />
    </div>
  </div>
);

// ─── BikeCard ─────────────────────────────────────────────────────────────────

export function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className='flex items-center gap-1.5'>
      <span className='text-blue-500 shrink-0'>{icon}</span>
      <div>
        <p className='text-[10px] text-gray-400 dark:text-gray-500 leading-none'>
          {label}
        </p>
        <p className='text-xs font-semibold text-gray-800 dark:text-gray-200 leading-snug'>
          {value}
        </p>
      </div>
    </div>
  );
}

export function ColorDots({ colors }: { colors: string[] }) {
  return (
    <div className='flex items-center gap-1'>
      {colors.slice(0, 4).map((c) => (
        <span
          key={c}
          title={c}
          className='w-3 h-3 rounded-full border border-gray-200 bg-gray-300 inline-block'
        />
      ))}
      {colors.length > 4 && (
        <span className='text-[10px] text-gray-400'>+{colors.length - 4}</span>
      )}
    </div>
  );
}

export function BikeCard({
  bike,
  listView = false,
}: {
  bike: Bike;
  listView?: boolean;
}) {
  const imgSrc = getPrimaryImage(bike);
  const price = formatPrice(bike.priceBreakdown.onRoad);
  const isEV = bike.fuelNorms === "Electric";
  const visibleFeatures = bike.features.slice(0, 2);
  const extraFeatures = bike.features.length - 2;

  if (listView) {
    return (
      <div className='flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow'>
        <div className='relative w-32 h-20 shrink-0 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center'>
          <img
            src={imgSrc}
            alt={bike.modelName}
            className='max-h-full max-w-full object-contain p-1'
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/128x80/f5f5f5/ccc?text=Honda";
            }}
          />
          {bike.isNewModel && (
            <span className='absolute top-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white'>
              New
            </span>
          )}
        </div>
        <div className='flex-1 min-w-0'>
          <div className='flex items-baseline justify-between gap-2'>
            <h3 className='font-bold text-gray-900 dark:text-gray-100 truncate'>
              {bike.modelName}
            </h3>
            <span className='text-red-600 font-bold text-sm whitespace-nowrap'>
              {price}
            </span>
          </div>
          <p className='text-xs text-gray-400 mb-1'>
            {capitalize(bike.category)} · {bike.year} · {bike.transmission}
          </p>
          <div className='flex flex-wrap gap-1'>
            {visibleFeatures.map((f) => (
              <span
                key={f}
                className='text-[10px] border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5 text-gray-600 dark:text-gray-400'
              >
                {f}
              </span>
            ))}
          </div>
        </div>
        <div className='flex flex-col items-end gap-2 shrink-0'>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isEV ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}
          >
            {bike.fuelNorms}
          </span>
          <Link to={`/bikes/${bike._id}`}>
            <button className='bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors'>
              View Details
            </button>
          </Link>
          <p className='text-[10px] text-green-600 font-medium'>
            ✓ In Stock ({bike.stockAvailable})
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full'>
      {/* Image */}
      <div className='relative bg-gray-50 dark:bg-gray-900 h-44 flex items-center justify-center px-4'>
        {bike.isNewModel && (
          <span className='absolute top-3 right-3 z-10 text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white'>
            New
          </span>
        )}
        {bike.isE20Efficiency && (
          <span
            className={`absolute ${bike.isNewModel ? "top-10" : "top-3"} right-3 z-10 text-[10px] font-bold px-2 py-0.5 rounded bg-green-600 text-white`}
          >
            E20
          </span>
        )}
        <img
          src={imgSrc}
          alt={bike.modelName}
          className='max-h-36 max-w-full object-contain'
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/280x144/f5f5f5/ccc?text=Honda";
          }}
        />
      </div>

      {/* Body */}
      <div className='p-4 flex flex-col flex-1'>
        <div className='flex items-start justify-between gap-2 mb-1'>
          <h3 className='font-extrabold text-gray-900 dark:text-gray-100 text-base leading-tight'>
            {bike.modelName}
          </h3>
          <div className='text-right shrink-0'>
            <p className='text-red-600 font-bold text-sm leading-none'>
              {price}
            </p>
            <p className='text-[10px] text-gray-400 mt-0.5'>On-Road Price</p>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-x-3 gap-y-2.5 mb-3'>
          <StatItem
            icon={<Zap size={12} />}
            label='Engine'
            value={
              isEV
                ? (bike.keySpecifications.mileage ?? "Electric")
                : bike.engineSize
            }
          />
          <StatItem
            icon={<Star size={12} />}
            label='Power'
            value={`${bike.power} HP`}
          />
          <StatItem
            icon={<Fuel size={12} />}
            label='Fuel Norms'
            value={bike.fuelNorms}
          />
          <StatItem
            icon={<Palette size={12} />}
            label='Colors'
            value={String(bike.colors.length)}
          />
        </div>

        <div className='flex items-center gap-2 mb-3'>
          <Settings2 size={11} className='text-gray-300' />
          <ColorDots colors={bike.colors} />
          <span className='text-[10px] text-gray-400 ml-auto'>
            {bike.transmission}
          </span>
        </div>

        <div className='flex flex-wrap gap-1 mb-3'>
          {visibleFeatures.map((f) => (
            <span
              key={f}
              className='text-[10px] border border-gray-200 dark:border-gray-600 rounded-md px-2 py-0.5 text-gray-600 dark:text-gray-400'
            >
              {f}
            </span>
          ))}
          {extraFeatures > 0 && (
            <span className='text-[10px] border border-gray-200 dark:border-gray-600 rounded-md px-2 py-0.5 text-gray-500'>
              +{extraFeatures} more
            </span>
          )}
        </div>

        {bike.variants.length > 1 && (
          <p className='text-[10px] text-blue-500 mb-3'>
            {bike.variants.length} variants · from{" "}
            {formatPrice(
              Math.min(...bike.variants.map((v) => v.onRoadPrice ?? v.price)),
            )}
          </p>
        )}

        <div className='flex gap-2 mt-auto'>
          <Link to='' className='flex-1'>
            <button
              disabled
              className='w-full bg-gray-400 text-white text-xs font-bold py-2 rounded-lg transition-colors cursor-not-allowed opacity-60'
            >
              View Details
            </button>
          </Link>
          <button
            disabled
            className='flex-1 border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-xs font-semibold py-2 rounded-lg transition-colors cursor-not-allowed opacity-60'
          >
            Compare
          </button>
        </div>

        <p className='text-[11px] text-green-600 font-medium text-center mt-2'>
          ✓ In Stock ({bike.stockAvailable} available)
        </p>
      </div>
    </div>
  );
}

// ─── RTK Query hook type (matches your bikeApi shape) ────────────────────────

interface BikesQueryResult {
  data?: { bikes: Bike[] };
}

interface BikesQueryState {
  data?: BikesQueryResult["data"];
  isLoading: boolean;
  error?: unknown;
  refetch: () => void;
}

// Lazy import: use your real hook in production, fall back to mock otherwise
export let useGetBikesQueryReal:
  | ((params: Record<string, unknown>) => BikesQueryState)
  | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  useGetBikesQueryReal =
    require("../../redux-store/services/BikeSystemApi/bikeApi").useGetBikesQuery;
} catch {
  useGetBikesQueryReal = null;
}

// ─── Mock hook (used when RTK Query is unavailable / API fails) ───────────────

export function useMockBikesQuery(params: {
  mainCategory?: "bike" | "scooter";
  limit?: number;
}) {
  const [state, setState] = useState<{
    data?: { bikes: Bike[] };
    isLoading: boolean;
    error?: unknown;
  }>({
    data: undefined,
    isLoading: true,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      let filtered = MOCK_BIKES.filter((b) => b.isActive);
      if (params.mainCategory)
        filtered = filtered.filter(
          (b) => b.mainCategory === params.mainCategory,
        );
      if (params.limit) filtered = filtered.slice(0, params.limit);
      setState({ data: { bikes: filtered }, isLoading: false });
    }, 600); // simulate network delay
    return () => clearTimeout(timer);
  }, [params.mainCategory, params.limit]);

  return { ...state, refetch: () => {} };
}
