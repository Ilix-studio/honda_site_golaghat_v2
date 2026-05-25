import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetJobCardCustomerQuery,
  useRequestConfirmationOtpMutation,
  useVerifyConfirmationOtpMutation,
  useConfirmViaButtonMutation,
} from "@/redux-store/services/ServiceM/jobCardApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle2,
  FileText,
  Wrench,
  Package,
  Scissors,
  ShieldCheck,
  KeyRound,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

const ITEM_ICON: Record<string, React.ReactNode> = {
  labour:    <Wrench className="w-3.5 h-3.5" />,
  part:      <Package className="w-3.5 h-3.5" />,
  accessory: <Scissors className="w-3.5 h-3.5" />,
  custom:    <FileText className="w-3.5 h-3.5" />,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomerFinalBillConfirm() {
  const navigate = useNavigate();
  const { jobCardId = "" } = useParams<{ jobCardId: string }>();

  const { data, isLoading, isError } = useGetJobCardCustomerQuery(jobCardId);

  const [requestOtp, { isLoading: isRequestingOtp }] =
    useRequestConfirmationOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] =
    useVerifyConfirmationOtpMutation();
  const [confirmButton, { isLoading: isConfirmingButton }] =
    useConfirmViaButtonMutation();

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
const [invoiceId, setInvoiceId] = useState("");
  const jobCard = data?.data;
  const activeItems = jobCard?.lineItems.filter((i) => !i.isRemoved) ?? [];

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleRequestOtp = async () => {
    try {
      await requestOtp(jobCardId).unwrap();
      setOtpSent(true);
      setOtpError("");
    } catch {
      setOtpError("Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError("Enter the 6-digit OTP.");
      return;
    }
    try {
      const res = await verifyOtp({ id: jobCardId, otp }).unwrap();
      setInvoiceNumber(res.data?.invoice?.invoiceNumber ?? "");
      setInvoiceId(res.data?.invoice?._id ?? "");
      setConfirmed(true);

    } catch (err: any) {
      setOtpError(err?.data?.message ?? "Invalid OTP.");
    }
  };

  const handleConfirmButton = async () => {
    try {
      const res = await confirmButton(jobCardId).unwrap();
      setInvoiceNumber(res.data?.invoice?.invoiceNumber ?? "");
      setInvoiceId(res.data?.invoice?._id ?? "");
      setConfirmed(true);
    } catch {
      setOtpError("Confirmation failed. Please try again.");
    }
  };

  // ── States ───────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-sm text-gray-400 animate-pulse">Loading final bill...</p>
      </div>
    );
  }

  if (isError || !jobCard) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-sm text-red-500">Unable to load bill. Please try again.</p>
      </div>
    );
  }

  if (jobCard.status !== "final_bill_sent") {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-sm text-gray-400">
          {["customer_confirmed", "invoice_generated", "closed"].includes(jobCard.status)
            ? "You have already confirmed this bill, do not pay extra bill other than this one."
            : "No final bill available at this time."}
        </p>
      </div>
    );
  }

  // ── Confirmed / Invoice generated ────────────────────────────────────────────

  if (confirmed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] gap-4 text-center px-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-50 border border-green-200">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Payment Confirmed</h2>
          <p className="text-sm text-gray-500 mt-1">
            Your invoice has been generated.
          </p>
          {invoiceNumber && (
            <p className="mt-2 font-mono text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-md inline-block">
              {invoiceNumber}
            </p>
          )}
        </div>
        <p className="text-xs text-gray-400 max-w-xs">
          The service team has been notified. Please collect your vehicle and
          settle payment at the counter.
        </p>
        <div className="flex gap-3 mt-2">
     {invoiceId && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => navigate(`/customer/invoice/${invoiceId}`)}
  >
    View Invoice
  </Button>
)}
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700"
            onClick={() => navigate("/customer/services")}
          >
            Back to Services
          </Button>
        </div>
      </div>
    );
  }

  // ── Main bill view ────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-red-600" />
          <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
            Final Bill
          </span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Confirm Your Bill</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Job Card{" "}
          <span className="font-mono text-gray-700">{jobCard.jobCardNumber}</span>{" "}
          · {jobCard.serviceType}
        </p>
      </div>

      {/* Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
        This is your final bill. Confirming means you approve all charges and
        are ready to pay at the counter.
      </div>

      {/* Line items */}
      <Card>
        <CardContent className="pt-4 pb-2 divide-y divide-gray-100">
          {activeItems.map((item, idx) => (
            <div key={idx} className="flex items-start justify-between py-3 gap-3">
              <div className="flex items-start gap-2 min-w-0">
                <span className="mt-0.5 text-gray-400">{ITEM_ICON[item.itemType]}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </p>
                  {item.description && (
                    <p className="text-xs text-gray-400">{item.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                    <span>×{item.quantity}</span>
                    <span>{formatCurrency(item.unitPrice)}</span>
                    {item.discount > 0 && (
                      <Badge variant="outline" className="text-[10px] text-green-600 border-green-200 px-1.5 py-0">
                        -{item.discount}%
                      </Badge>
                    )}
                    <span>GST {item.taxRate}%</span>
                  </div>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-900 shrink-0">
                {formatCurrency(item.lineTotal)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardContent className="pt-4 pb-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>{formatCurrency(jobCard.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>GST</span>
            <span>{formatCurrency(jobCard.taxTotal)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 border-t pt-2 mt-1">
            <span>Total Payable</span>
            <span className="text-red-600">{formatCurrency(jobCard.grandTotal)}</span>
          </div>
        </CardContent>
      </Card>

      {/* OTP section */}
      {otpSent && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-gray-500" />
            <p className="text-sm text-gray-700 font-medium">
              Enter the OTP sent to your registered number
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="6-digit OTP"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ""));
                setOtpError("");
              }}
              className="font-mono tracking-widest text-center text-lg w-44"
            />
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleVerifyOtp}
              disabled={isVerifying || otp.length !== 6}
            >
              {isVerifying ? "Verifying..." : "Verify & Confirm"}
            </Button>
          </div>
          {otpError && <p className="text-xs text-red-500">{otpError}</p>}
          <button
            className="text-xs text-gray-400 underline"
            onClick={handleRequestOtp}
          >
            Resend OTP
          </button>
        </div>
      )}

      {/* Action buttons */}
      {!otpSent && (
        <div className="flex flex-col gap-3">
          <Button
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            onClick={handleRequestOtp}
            disabled={isRequestingOtp}
          >
            <KeyRound className="w-4 h-4 mr-2" />
            {isRequestingOtp ? "Sending OTP..." : "Confirm via OTP"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full">
                Confirm without OTP
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Bill</AlertDialogTitle>
                <AlertDialogDescription>
                  You're confirming{" "}
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(jobCard.grandTotal)}
                  </span>{" "}
                  and agreeing to pay at the counter. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleConfirmButton}
                  disabled={isConfirmingButton}
                >
                  {isConfirmingButton ? "Confirming..." : "Yes, Confirm"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}