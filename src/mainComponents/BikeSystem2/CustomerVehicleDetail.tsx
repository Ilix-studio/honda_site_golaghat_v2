import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bike,
  Shield,
  Calendar,
  CreditCard,
  MapPin,
  Wrench,
  BadgeCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useGetCustomerVehicleByIdQuery } from "@/redux-store/services/customer/customerVehicleApi";

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
}) {
  if (!value || value === "—") return null;
  return (
    <div className='flex items-start gap-3 py-2.5'>
      {Icon && (
        <div className='w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5'>
          <Icon className='w-4 h-4 text-gray-500' />
        </div>
      )}
      <div className='min-w-0 flex-1'>
        <p className='text-xs text-gray-500 font-medium'>{label}</p>
        <p className='text-sm text-gray-900 mt-0.5'>{value}</p>
      </div>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className='bg-white border border-gray-200 rounded-lg p-5'>
      <h3 className='text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-100'>
        {title}
      </h3>
      <div className='divide-y divide-gray-50'>{children}</div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({
  label,
  active,
  colorClass,
}: {
  label: string;
  active: boolean;
  colorClass?: string;
}) {
  const base = active
    ? colorClass ?? "bg-green-50 text-green-700 border-green-200"
    : "bg-gray-50 text-gray-400 border-gray-200";
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border ${base}`}
    >
      {active && <BadgeCheck className='w-3 h-3' />}
      {label}
    </span>
  );
}

// ─── Format helpers ───────────────────────────────────────────────────────────

function formatDate(date?: string | Date): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount?: number): string {
  if (amount == null) return "—";
  return `₹${amount.toLocaleString("en-IN")}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomerVehicleDetail() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useGetCustomerVehicleByIdQuery(
    vehicleId!,
    {
      skip: !vehicleId,
    }
  );

  const vehicle = data?.data;
  const stock = vehicle?.stockConcept;

  // ── Loading ──
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='flex flex-col items-center gap-3 text-gray-500'>
          <Loader2 className='w-6 h-6 animate-spin' />
          <p className='text-sm'>Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (isError || !vehicle) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center px-6'>
        <div className='bg-white border border-red-200 rounded-lg p-6 max-w-sm w-full text-center'>
          <AlertCircle className='w-8 h-8 text-red-500 mx-auto mb-3' />
          <p className='text-sm text-red-700 font-medium mb-1'>
            Failed to load vehicle
          </p>
          <p className='text-xs text-gray-500 mb-4'>
            {(error as any)?.data?.message ??
              "Vehicle not found or access denied."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className='text-sm text-red-600 font-medium hover:underline'
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const modelName = stock?.modelName ?? "Unknown Model";
  const activeVAS = vehicle.activeValueAddedServices?.filter((s) => s.isActive);

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 sticky top-0 z-10'>
        <div className='max-w-3xl mx-auto px-4 py-3 flex items-center gap-3'>
          <button
            onClick={() => navigate(-1)}
            className='w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors'
          >
            <ArrowLeft className='w-4 h-4 text-gray-600' />
          </button>
          <div className='min-w-0 flex-1'>
            <h1 className='text-base font-semibold text-gray-900 truncate'>
              {modelName}
            </h1>
            {vehicle.numberPlate && (
              <p className='text-xs text-gray-500 font-mono'>
                {vehicle.numberPlate}
              </p>
            )}
          </div>
          <div className='w-9 h-9 rounded-full bg-red-50 flex items-center justify-center'>
            <Bike className='w-4 h-4 text-red-600' />
          </div>
        </div>
      </div>

      <div className='max-w-3xl mx-auto px-4 py-5 space-y-4'>
        {/* Status badges */}
        <div className='flex flex-wrap gap-2'>
          <StatusBadge label='Paid' active={vehicle.isPaid} />
          <StatusBadge
            label='Finance'
            active={vehicle.isFinance}
            colorClass='bg-amber-50 text-amber-700 border-amber-200'
          />
          <StatusBadge
            label='Insured'
            active={vehicle.insurance}
            colorClass='bg-blue-50 text-blue-700 border-blue-200'
          />
          <StatusBadge label='Active' active={vehicle.isActive} />
        </div>

        {/* Vehicle Info */}
        <Section title='Vehicle Information'>
          <InfoRow label='Model' value={modelName} icon={Bike} />
          <InfoRow label='Category' value={stock?.category} />
          <InfoRow label='Variant' value={stock?.variant} />
          <InfoRow label='Color' value={stock?.color} />
          <InfoRow
            label='Year of Manufacture'
            value={stock?.yearOfManufacture}
          />
          <InfoRow
            label='Engine CC'
            value={stock?.engineCC ? `${stock.engineCC} cc` : undefined}
          />
          <InfoRow label='Engine Number' value={stock?.engineNumber} />
          <InfoRow label='Chassis Number' value={stock?.chassisNumber} />
          <InfoRow label='Stock ID' value={stock?.stockId} />
        </Section>

        {/* Ownership */}
        <Section title='Ownership Details'>
          <InfoRow
            label='Number Plate'
            value={vehicle.numberPlate}
            icon={MapPin}
          />
          <InfoRow
            label='Registered Owner'
            value={vehicle.registeredOwnerName}
          />
          <InfoRow
            label='Registration Date'
            value={formatDate(vehicle.registrationDate)}
            icon={Calendar}
          />
          <InfoRow
            label='Purchase Date'
            value={formatDate(vehicle.purchaseDate)}
            icon={Calendar}
          />
          <InfoRow
            label='Payment Status'
            value={
              vehicle.isPaid
                ? "Paid"
                : vehicle.isFinance
                ? "Finance"
                : "Pending"
            }
            icon={CreditCard}
          />
        </Section>

        {/* RTO Info */}
        {vehicle.rtoInfo && (
          <Section title='RTO Information'>
            <InfoRow label='RTO Code' value={vehicle.rtoInfo.rtoCode} />
            <InfoRow label='RTO Name' value={vehicle.rtoInfo.rtoName} />
            <InfoRow label='RTO Address' value={vehicle.rtoInfo.rtoAddress} />
            <InfoRow label='State' value={vehicle.rtoInfo.state} />
          </Section>
        )}

        {/* Price Info */}
        {stock?.priceInfo && (
          <Section title='Price Information'>
            <InfoRow
              label='Ex-Showroom'
              value={formatCurrency(stock.priceInfo.exShowroomPrice)}
              icon={CreditCard}
            />
            <InfoRow
              label='Road Tax'
              value={formatCurrency(stock.priceInfo.roadTax)}
            />
            <InfoRow
              label='On-Road Price'
              value={formatCurrency(stock.priceInfo.onRoadPrice)}
            />
          </Section>
        )}

        {/* Service Status */}
        <Section title='Service Status'>
          <InfoRow
            label='Kilometers'
            value={
              vehicle.serviceStatus?.kilometers != null
                ? `${vehicle.serviceStatus.kilometers.toLocaleString()} km`
                : undefined
            }
            icon={Wrench}
          />
          <InfoRow
            label='Service History Count'
            value={vehicle.serviceStatus?.serviceHistory}
          />
          <InfoRow
            label='Last Service Date'
            value={formatDate(vehicle.serviceStatus?.lastServiceDate)}
          />
          <InfoRow
            label='Next Service Due'
            value={formatDate(vehicle.serviceStatus?.nextServiceDue)}
          />
        </Section>

        {/* Value Added Services */}
        {activeVAS && activeVAS.length > 0 && (
          <Section title='Value Added Services'>
            {activeVAS.map((vas, idx) => {
              // serviceId may be populated object or plain string
              const serviceName =
                typeof vas.serviceId === "object" &&
                vas.serviceId !== null &&
                "serviceName" in vas.serviceId
                  ? (vas.serviceId as any).serviceName
                  : `Service ${idx + 1}`;

              return (
                <div key={vas._id ?? idx} className='py-2.5'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Shield className='w-4 h-4 text-green-600' />
                      <p className='text-sm font-medium text-gray-900'>
                        {serviceName}
                      </p>
                    </div>
                    <span className='text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded'>
                      Active
                    </span>
                  </div>
                  <div className='ml-6 mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500'>
                    <span>Activated: {formatDate(vas.activatedDate)}</span>
                    <span>Expires: {formatDate(vas.expiryDate)}</span>
                    <span>Coverage: {vas.coverageYears} year(s)</span>
                    <span>Price: {formatCurrency(vas.purchasePrice)}</span>
                  </div>
                </div>
              );
            })}
          </Section>
        )}

        {/* Timestamps */}
        <div className='text-xs text-gray-400 text-center py-4 space-y-1'>
          <p>Created: {formatDate(vehicle.createdAt)}</p>
          <p>Last updated: {formatDate(vehicle.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}
