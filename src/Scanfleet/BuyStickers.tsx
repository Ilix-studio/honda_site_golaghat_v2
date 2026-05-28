// mainComponents/Scanfleet/BuyStickers.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Shield,
  QrCode,
  Car,
  Hash,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronRight,
  Phone,
  User,
  MapPin,
} from "lucide-react";
import {
  useGetScanFleetProfileQuery,
  useActivateScanFleetTokenMutation,
  type ActivateTokenRequest,
  type ActivateTokenResponse,
} from "../redux-store/services/Scanfleet/scanfleetApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const VEHICLE_TYPES = [
  "Two Wheeler",
  "Three Wheeler",
  "Four Wheeler",
  "Heavy Vehicle",
];

const INPUT_CLS =
  "w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-[border-color,box-shadow] duration-150 disabled:opacity-50 disabled:cursor-not-allowed";

const SELECT_CLS =
  "w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 cursor-pointer transition-[border-color,box-shadow] duration-150 disabled:opacity-50 disabled:cursor-not-allowed";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProfileReviewCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | null | undefined;
  icon: React.ElementType;
}) {
  return (
    <div className='flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100'>
      <div className='w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm'>
        <Icon className='w-3.5 h-3.5 text-gray-500' />
      </div>
      <div className='min-w-0'>
        <p className='text-[10px] font-semibold text-gray-400 uppercase tracking-wide'>
          {label}
        </p>
        <p className='text-sm font-medium text-gray-900 truncate'>
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function SuccessState({
  data,
  onDone,
}: {
  data: {
    tokenId: string;
    qrId: string;
    maskedNumber: string;
    vehicleNumber: string;
    remainingDealerTokens: number;
  };
  onDone: () => void;
}) {
  return (
    <div className='flex flex-col items-center text-center py-6 px-4 space-y-5'>
      <div className='w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center'>
        <CheckCircle2 className='w-8 h-8 text-emerald-600' />
      </div>

      <div>
        <h3 className='text-lg font-bold text-gray-900'>
          ScanFleet Activated!
        </h3>
        <p className='text-sm text-gray-500 mt-1'>
          Your safety sticker is now active and linked to your vehicle.
        </p>
      </div>

      <div className='w-full space-y-2.5'>
        {[
          { label: "Token ID", value: data.tokenId },
          { label: "QR ID", value: data.qrId },
          { label: "Virtual Number", value: data.maskedNumber },
          { label: "Vehicle Number", value: data.vehicleNumber },
        ].map(({ label, value }) => (
          <div
            key={label}
            className='flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100'
          >
            <span className='text-xs text-gray-500 font-medium'>{label}</span>
            <span className='text-sm font-bold text-gray-900 font-mono'>
              {value}
            </span>
          </div>
        ))}

        <div className='flex items-center justify-between px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-100'>
          <span className='text-xs text-amber-700 font-medium'>
            Remaining Dealer Tokens
          </span>
          <span className='text-sm font-bold text-amber-700'>
            {data.remainingDealerTokens}
          </span>
        </div>
      </div>

      <button
        onClick={onDone}
        className='w-full h-10 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors'
      >
        Back to Dashboard
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BuyStickers() {
  const navigate = useNavigate();

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useGetScanFleetProfileQuery();

  const [activate, { isLoading: activating }] =
    useActivateScanFleetTokenMutation();

  const [form, setForm] = useState<ActivateTokenRequest>({
    attachCode: "",
    vehicleNumber: "",
    vehicleType: "",
    vehicleModel: "",
  });

  const [errors, setErrors] = useState<Partial<ActivateTokenRequest>>({});
  const [successData, setSuccessData] = useState<ActivateTokenResponse | null>(null);

  // Redirect if profile incomplete
  useEffect(() => {
    if (profile && !profile.profileCompleted) {
      toast.error("Complete your profile before activating ScanFleet.");
      navigate("/customer/profile/create");
    }
  }, [profile, navigate]);

  const validate = (): boolean => {
    const e: Partial<ActivateTokenRequest> = {};
    if (!form.attachCode.trim()) e.attachCode = "Attach code is required";
    if (!form.vehicleNumber.trim())
      e.vehicleNumber = "Vehicle number is required";
    if (!form.vehicleType) e.vehicleType = "Vehicle type is required";
    if (!form.vehicleModel.trim()) e.vehicleModel = "Vehicle model is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field: keyof ActivateTokenRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await activate({
        ...form,
        vehicleNumber: form.vehicleNumber.toUpperCase().trim(),
      }).unwrap();
      setSuccessData(result);
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Activation failed",
      );
    }
  };

  // ── Loading state ──
  if (profileLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='flex flex-col items-center gap-3'>
          <Loader2 className='w-8 h-8 text-red-600 animate-spin' />
          <p className='text-sm text-gray-500'>Loading your profile...</p>
        </div>
      </div>
    );
  }

  // ── Profile error state ──
  if (profileError || !profile) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
        <div className='flex flex-col items-center gap-3 text-center max-w-xs'>
          <div className='w-12 h-12 rounded-full bg-red-50 flex items-center justify-center'>
            <AlertCircle className='w-6 h-6 text-red-600' />
          </div>
          <p className='text-sm font-semibold text-gray-900'>
            Profile not found
          </p>
          <p className='text-xs text-gray-500'>
            Please complete your profile before activating ScanFleet.
          </p>
          <button
            onClick={() => navigate("/customer/profile/create")}
            className='h-9 px-5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors'
          >
            Complete Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-xl mx-auto px-4 py-6 space-y-5'>
        {/* Header */}
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0'>
            <Shield className='w-5 h-5 text-red-600' />
          </div>
          <div>
            <h1 className='text-lg font-bold text-gray-900'>
              Activate Safety Sticker
            </h1>
            <p className='text-xs text-gray-400 mt-0.5'>
              Link your ScanFleet QR sticker to your vehicle
            </p>
          </div>
        </div>

        {successData ? (
          <div className='rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden'>
            <SuccessState
              data={successData}
              onDone={() => navigate("/customer/dashboard")}
            />
          </div>
        ) : (
          <>
            {/* Profile review */}
            <div className='rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden'>
              <div className='flex items-center gap-2 px-5 py-4 border-b border-gray-100'>
                <div className='w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center'>
                  <User className='w-3.5 h-3.5 text-gray-500' />
                </div>
                <h2 className='text-sm font-bold text-gray-900'>
                  Linked Profile
                </h2>
                <span className='ml-auto flex items-center gap-1 text-[10px] font-semibold text-emerald-600'>
                  <span className='relative flex h-1.5 w-1.5'>
                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75' />
                    <span className='relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500' />
                  </span>
                  Verified
                </span>
              </div>

              <div className='p-4 grid grid-cols-2 gap-2.5'>
                <ProfileReviewCard
                  label='Name'
                  value={`${profile.firstName} ${profile.lastName}`}
                  icon={User}
                />
                <ProfileReviewCard
                  label='Phone'
                  value={profile.phoneNumber}
                  icon={Phone}
                />
                <ProfileReviewCard
                  label='Emergency Contact'
                  value={profile.familyNumber1}
                  icon={Phone}
                />
                <ProfileReviewCard
                  label='District'
                  value={profile.address.district}
                  icon={MapPin}
                />
              </div>
            </div>

            {/* Activation form */}
            <div className='rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden'>
              <div className='flex items-center gap-2 px-5 py-4 border-b border-gray-100'>
                <div className='w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center'>
                  <QrCode className='w-3.5 h-3.5 text-red-600' />
                </div>
                <h2 className='text-sm font-bold text-gray-900'>
                  Sticker Details
                </h2>
              </div>

              <form onSubmit={handleSubmit} className='p-4 space-y-4'>
                {/* Attach Code */}
                <div className='space-y-1.5'>
                  <label className='block text-xs font-semibold text-gray-700'>
                    Attach Code <span className='text-red-500'>*</span>
                  </label>
                  <div className='relative'>
                    <Hash className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                    <input
                      type='text'
                      placeholder='e.g. SF-XXXXXXXX'
                      value={form.attachCode}
                      onChange={(e) =>
                        handleChange("attachCode", e.target.value)
                      }
                      className={`${INPUT_CLS} pl-9 ${errors.attachCode ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                    />
                  </div>
                  {errors.attachCode && (
                    <p className='text-xs text-red-500'>{errors.attachCode}</p>
                  )}
                  <p className='text-[11px] text-gray-400'>
                    Found on the back of your ScanFleet sticker package.
                  </p>
                </div>

                {/* Vehicle Number */}
                <div className='space-y-1.5'>
                  <label className='block text-xs font-semibold text-gray-700'>
                    Vehicle Registration Number{" "}
                    <span className='text-red-500'>*</span>
                  </label>
                  <div className='relative'>
                    <Car className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                    <input
                      type='text'
                      placeholder='e.g. AS01AB1234'
                      value={form.vehicleNumber}
                      onChange={(e) =>
                        handleChange(
                          "vehicleNumber",
                          e.target.value.toUpperCase(),
                        )
                      }
                      className={`${INPUT_CLS} pl-9 uppercase ${errors.vehicleNumber ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                    />
                  </div>
                  {errors.vehicleNumber && (
                    <p className='text-xs text-red-500'>
                      {errors.vehicleNumber}
                    </p>
                  )}
                </div>

                {/* Vehicle Type */}
                <div className='space-y-1.5'>
                  <label className='block text-xs font-semibold text-gray-700'>
                    Vehicle Type <span className='text-red-500'>*</span>
                  </label>
                  <select
                    value={form.vehicleType}
                    onChange={(e) =>
                      handleChange("vehicleType", e.target.value)
                    }
                    className={`${SELECT_CLS} ${errors.vehicleType ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                  >
                    <option value='' disabled>
                      Select vehicle type
                    </option>
                    {VEHICLE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {errors.vehicleType && (
                    <p className='text-xs text-red-500'>{errors.vehicleType}</p>
                  )}
                </div>

                {/* Vehicle Model */}
                <div className='space-y-1.5'>
                  <label className='block text-xs font-semibold text-gray-700'>
                    Vehicle Model <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    placeholder='e.g. Honda Shine 125'
                    value={form.vehicleModel}
                    onChange={(e) =>
                      handleChange("vehicleModel", e.target.value)
                    }
                    className={`${INPUT_CLS} ${errors.vehicleModel ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                  />
                  {errors.vehicleModel && (
                    <p className='text-xs text-red-500'>
                      {errors.vehicleModel}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <div className='pt-2'>
                  <button
                    type='submit'
                    disabled={activating}
                    className='w-full h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
                  >
                    {activating ? (
                      <>
                        <Loader2 className='w-4 h-4 animate-spin' />
                        Activating...
                      </>
                    ) : (
                      <>
                        Activate ScanFleet
                        <ChevronRight className='w-4 h-4' />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Info footer */}
            <div className='flex items-start gap-2.5 p-4 rounded-xl bg-blue-50 border border-blue-100'>
              <Shield className='w-4 h-4 text-blue-600 shrink-0 mt-0.5' />
              <p className='text-xs text-blue-700 leading-relaxed'>
                Once activated, anyone who scans the QR sticker on your vehicle
                can reach your emergency contacts through a masked virtual
                number — your real number stays private.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
