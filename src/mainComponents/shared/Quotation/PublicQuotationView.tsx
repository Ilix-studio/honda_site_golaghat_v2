// mainComponents/shared/Quotation/PublicQuotationView.tsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Bike as BikeIcon, FileDown, Loader2, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import companyLogoUrl from "@/assets/logo.png";
import { useGetPublicQuotationQuery } from "@/redux-store/services/NewFeatures/quotationApi";
import { generateQuotationPdf } from "./generateQuotationPdf";

const fmtMoney = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const PublicQuotationView: React.FC = () => {
  const { quotationNo, token } = useParams<{ quotationNo: string; token: string }>();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data, isLoading, isError } = useGetPublicQuotationQuery(
    quotationNo && token ? { quotationNo, token } : ({} as any),
    { skip: !quotationNo || !token },
  );
  const quotation = data?.data;

  const handleDownload = async () => {
    if (!quotation) return;
    setIsGenerating(true);
    try {
      await generateQuotationPdf(quotation);
    } catch {
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex min-h-[60vh] items-center justify-center'>
        <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
      </div>
    );
  }

  if (isError || !quotation) {
    return (
      <div className='flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center'>
        <FileWarning className='h-10 w-10 text-gray-300' />
        <p className='text-lg font-semibold text-gray-800'>Quotation not found</p>
        <p className='max-w-sm text-sm text-gray-500'>
          This link may be incorrect or the quotation may have been removed. Please
          contact the dealership for a fresh quotation.
        </p>
      </div>
    );
  }

  const isVariation = quotation.pricingType === "variation" && !!quotation.variation;
  const onRoadPrice = isVariation
    ? quotation.variation!.onRoadPrice
    : quotation.exShowroomPrice + quotation.onRoadTax;

  const accessoriesTotal = quotation.accessories.reduce(
    (sum, a) => sum + a.amount * a.quantity,
    0,
  );
  const grandTotal =
    onRoadPrice +
    (quotation.insurance?.premium ?? 0) +
    quotation.vasSelections.reduce((sum, v) => sum + v.price, 0) +
    accessoriesTotal;

  const headingLines = (quotation.topHeading || "").split("\n").filter(Boolean);

  return (
    <div className='mx-auto max-w-2xl px-4 py-8'>
      <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
        {quotation.isExpired && (
          <div className='mb-4 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3'>
            <FileWarning className='h-4 w-4 shrink-0 text-amber-600 mt-0.5' />
            <div>
              <p className='text-sm font-semibold text-amber-800'>
                Price Increase
              </p>
              <p className='text-xs text-amber-700'>
                {quotation.expiredReason ||
                  "Prices have increased since this quotation was issued."}{" "}
                Please contact the dealership for updated pricing.
              </p>
            </div>
          </div>
        )}

        {/* Logo + date */}
        <div className='mb-4 flex items-start justify-between'>
          <img src={companyLogoUrl} alt='Tsangpool Honda' className='h-12 w-auto' />
          <div className='text-right'>
            <p className='text-xs text-gray-500'>Date</p>
            <p className='text-sm font-semibold text-gray-900'>
              {fmtDate(quotation.createdAt)}
            </p>
          </div>
        </div>

        {/* Heading */}
        <div className='mb-4 border-b-2 border-red-600 pb-3 text-center'>
          {headingLines.map((line, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "text-lg font-bold text-gray-900"
                  : "text-xs text-gray-500"
              }
            >
              {line}
            </p>
          ))}
        </div>

        {/* Title row */}
        <div className='mb-4 flex items-center justify-between'>
          <p className='text-base font-bold text-gray-900'>QUOTATION</p>
          <p className='font-mono text-sm font-bold text-red-600'>
            Quotation No: {quotation.quotationNo}
          </p>
        </div>

        {/* To */}
        <div className='mb-4 rounded-xl bg-gray-50 p-3'>
          <p className='text-[11px] font-medium uppercase text-gray-500'>To</p>
          <p className='text-sm font-semibold text-gray-900'>{quotation.to.name}</p>
          <p className='text-sm text-gray-700'>{quotation.to.phone}</p>
          <p className='text-sm text-gray-700'>{quotation.to.addressLine1}</p>
          {quotation.to.addressLine2 && (
            <p className='text-sm text-gray-700'>{quotation.to.addressLine2}</p>
          )}
        </div>

        {/* Vehicle */}
        <div className='mb-4 flex items-center gap-3 rounded-xl border border-gray-200 p-3'>
          <div className='flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50 border border-gray-200'>
            {quotation.bikeSnapshot.image ? (
              <img
                src={quotation.bikeSnapshot.image.src}
                alt={quotation.bikeSnapshot.image.alt}
                className='h-full w-full object-cover'
              />
            ) : (
              <BikeIcon className='h-6 w-6 text-gray-300' />
            )}
          </div>
          <div>
            <p className='font-semibold text-gray-900'>
              {quotation.bikeSnapshot.modelName}
            </p>
            <p className='text-xs capitalize text-gray-500'>
              {quotation.bikeSnapshot.category}
            </p>
          </div>
        </div>

        {/* Pricing */}
        <div className='mb-4 overflow-hidden rounded-xl border border-gray-200'>
          {isVariation ? (
            <div className='flex justify-between border-b border-gray-100 px-3 py-2 text-sm'>
              <span className='text-gray-600'>Variation — {quotation.variation!.label}</span>
              <span className='font-semibold text-gray-900'>
                {fmtMoney(quotation.variation!.price)}
              </span>
            </div>
          ) : (
            <>
              <div className='flex justify-between border-b border-gray-100 px-3 py-2 text-sm'>
                <span className='text-gray-600'>Ex-Showroom Price</span>
                <span className='font-semibold text-gray-900'>
                  {fmtMoney(quotation.exShowroomPrice)}
                </span>
              </div>
              <div className='flex justify-between border-b border-gray-100 px-3 py-2 text-sm'>
                <span className='text-gray-600'>On-Road Tax</span>
                <span className='font-semibold text-gray-900'>
                  {fmtMoney(quotation.onRoadTax)}
                </span>
              </div>
            </>
          )}
          <div className='flex justify-between border-b border-gray-100 bg-gray-50 px-3 py-2 text-sm'>
            <span className='font-medium text-gray-900'>On-Road Price</span>
            <span className='font-bold text-gray-900'>{fmtMoney(onRoadPrice)}</span>
          </div>
          {quotation.insurance?.premium ? (
            <div className='flex justify-between border-b border-gray-100 px-3 py-2 text-sm'>
              <span className='text-gray-600'>
                Insurance{quotation.insurance.provider ? ` (${quotation.insurance.provider})` : ""}
              </span>
              <span className='font-semibold text-gray-900'>
                {fmtMoney(quotation.insurance.premium)}
              </span>
            </div>
          ) : null}
          {quotation.vasSelections.map((vas) => (
            <div
              key={vas.vas}
              className='flex justify-between border-b border-gray-100 px-3 py-2 text-sm'
            >
              <span className='text-gray-600'>{vas.serviceName}</span>
              <span className='font-semibold text-gray-900'>{fmtMoney(vas.price)}</span>
            </div>
          ))}
          {quotation.accessories.length > 0 && (
            <div className='flex justify-between border-b border-gray-100 px-3 py-2 text-sm'>
              <span className='text-gray-600'>Accessories</span>
              <span className='font-semibold text-gray-900'>
                {fmtMoney(accessoriesTotal)}
              </span>
            </div>
          )}
          <div className='flex justify-between bg-red-600 px-3 py-3 text-sm text-white'>
            <span className='font-medium'>TOTAL</span>
            <span className='text-base font-bold'>{fmtMoney(grandTotal)}</span>
          </div>
        </div>

        {/* Accessories detail table */}
        {quotation.accessories.length > 0 && (
          <div className='mb-4'>
            <p className='mb-1.5 text-xs font-semibold uppercase text-gray-500'>
              Accessories
            </p>
            <div className='overflow-hidden rounded-xl border border-gray-200'>
              {quotation.accessories.map((a, i) => (
                <div
                  key={i}
                  className='flex items-center justify-between border-b border-gray-100 px-3 py-2 text-sm last:border-b-0'
                >
                  <span className='text-gray-700'>{a.name}</span>
                  <span className='text-gray-500'>Qty {a.quantity}</span>
                  <span className='font-medium text-gray-900'>
                    {fmtMoney(a.amount * a.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bank details */}
        <div className='mb-4'>
          <div className='mb-1.5 flex items-center justify-between'>
            <p className='text-xs font-semibold uppercase text-gray-500'>Bank Details</p>
            <CopyButton
              text={quotation.bankDetails}
              label='Copy'
              successMessage='Bank details copied'
            />
          </div>
          <pre className='whitespace-pre-wrap rounded-xl bg-gray-50 p-3 font-mono text-xs text-gray-700'>
            {quotation.bankDetails}
          </pre>
        </div>

        {/* Terms & conditions */}
        <div className='mb-6'>
          <p className='mb-1.5 text-xs font-semibold uppercase text-gray-500'>
            Terms &amp; Conditions
          </p>
          <p className='whitespace-pre-wrap text-xs leading-relaxed text-gray-500'>
            {quotation.termsAndConditions}
          </p>
        </div>

        {/* Signature space */}
        <div className='mb-6 flex justify-end'>
          <div className='w-40 border-t border-gray-400 pt-1 text-center text-xs text-gray-500'>
            Authorized Signature
          </div>
        </div>

        <Button
          type='button'
          onClick={handleDownload}
          disabled={isGenerating}
          className='w-full bg-red-600 hover:bg-red-700'
        >
          {isGenerating ? (
            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
          ) : (
            <FileDown className='h-4 w-4 mr-2' />
          )}
          Download PDF
        </Button>
      </div>
    </div>
  );
};

export default PublicQuotationView;
