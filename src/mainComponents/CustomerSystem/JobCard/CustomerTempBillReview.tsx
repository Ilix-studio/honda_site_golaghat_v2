import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetJobCardCustomerQuery,
  useCustomerReviewBillMutation,
} from "@/redux-store/services/ServiceM/jobCardApi";

import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

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
import { Wrench, Package, Scissors, FileText, CheckCircle2, Trash2 } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ITEM_TYPE_ICON: Record<string, React.ReactNode> = {
  labour:    <Wrench className="w-4 h-4" />,
  part:      <Package className="w-4 h-4" />,
  accessory: <Scissors className="w-4 h-4" />,
  custom:    <FileText className="w-4 h-4" />,
};

const ITEM_TYPE_COLOR: Record<string, string> = {
  labour:    "bg-blue-50 text-blue-700 border-blue-200",
  part:      "bg-orange-50 text-orange-700 border-orange-200",
  accessory: "bg-purple-50 text-purple-700 border-purple-200",
  custom:    "bg-gray-50 text-gray-700 border-gray-200",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CustomerTempBillReviewProps {
  jobCardId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomerTempBillReview({
  jobCardId,
}: CustomerTempBillReviewProps) {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetJobCardCustomerQuery(jobCardId);

  const [submitReview, { isLoading: isSubmitting }] =
    useCustomerReviewBillMutation();

  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [additionalRequests, setAdditionalRequests] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const jobCard = data?.data;

  // Only active (non-removed by SA) line items are shown to customer
  const activeItems =
    jobCard?.lineItems.filter((item) => !item.isRemoved) ?? [];

  const toggleRemove = (itemId: string) => {
    setRemovedIds((prev) => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  // Recompute totals client-side reflecting customer's removals
  const previewItems = activeItems.map((item) => ({
    ...item,
    markedForRemoval: removedIds.has(item._id?.toString() ?? ""),
  }));

  const previewGrandTotal = previewItems
    .filter((i) => !i.markedForRemoval)
    .reduce((sum, i) => sum + i.lineTotal, 0);

  const handleSubmit = async () => {
    try {
      await submitReview({
        id: jobCardId,
        body: {
          removedLineItemIds: Array.from(removedIds),
          additionalRequests: additionalRequests.trim(),
        },
      }).unwrap();
      setSubmitted(true);
    } catch {
      // Error handled by RTK Query — show toast if you have one
    }
  };

  // ── Loading / Error ──────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-gray-500 text-sm animate-pulse">Loading your bill...</p>
      </div>
    );
  }

  if (isError || !jobCard) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-red-500 text-sm">Unable to load bill. Please try again.</p>
      </div>
    );
  }

  if (jobCard.status !== "temp_bill_sent") {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-gray-500 text-sm">
          {jobCard.status === "customer_reviewed"
            ? "You've already submitted your review. The service team will proceed."
            : "No pending bill to review at this time."}
        </p>
      </div>
    );
  }

  // ── Success state ────────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center px-6">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
        <h2 className="text-lg font-semibold text-gray-900">Review Submitted</h2>
        <p className="text-sm text-gray-500">
          The service team has been notified. They'll proceed with the approved
          items.
        </p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => navigate("/customer/services")}
        >
          Back to Services
        </Button>
      </div>
    );
  }

  // ── Main view ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Review Your Bill</h1>
        <p className="text-sm text-gray-500 mt-1">
          Job Card{" "}
          <span className="font-mono text-gray-700">{jobCard.jobCardNumber}</span>{" "}
          · Service: {jobCard.serviceType}
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
        Review each item below. Uncheck any item you'd like to remove. Your
        requests will be sent back to the service team.
      </div>

      {/* Line Items */}
      <div className="space-y-3">
        {activeItems.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            No line items on this bill.
          </p>
        )}

        {activeItems.map((item) => {
          const itemId = item._id?.toString() ?? "";
          const isMarked = removedIds.has(itemId);

          return (
            <Card
              key={itemId}
              className={`transition-opacity ${isMarked ? "opacity-40" : "opacity-100"}`}
            >
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <Checkbox
                    id={itemId}
                    checked={!isMarked}
                    onCheckedChange={() => toggleRemove(itemId)}
                    className="mt-1 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                  />

                  {/* Item details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <label
                        htmlFor={itemId}
                        className="font-medium text-gray-900 text-sm cursor-pointer"
                      >
                        {item.name}
                      </label>
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${ITEM_TYPE_COLOR[item.itemType]}`}
                      >
                        {ITEM_TYPE_ICON[item.itemType]}
                        {item.itemType}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>Qty: {item.quantity}</span>
                      <span>Unit: {formatCurrency(item.unitPrice)}</span>
                      {item.discount > 0 && (
                        <span className="text-green-600">
                          -{item.discount}% off
                        </span>
                      )}
                      <span>GST: {item.taxRate}%</span>
                    </div>
                  </div>

                  {/* Line total */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(item.lineTotal)}
                    </p>
                    {isMarked && (
                      <span className="inline-flex items-center gap-1 text-xs text-red-500 mt-0.5">
                        <Trash2 className="w-3 h-3" />
                        Removing
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Totals preview */}
      <Card>
        <CardContent className="pt-4 pb-4 space-y-1">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Items removed</span>
            <span>{removedIds.size}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-gray-900 border-t pt-2 mt-2">
            <span>Estimated Total</span>
            <span className="text-red-600">{formatCurrency(previewGrandTotal)}</span>
          </div>
          <p className="text-xs text-gray-400">
            Final amount may change after service team review.
          </p>
        </CardContent>
      </Card>

      {/* Additional requests */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Additional Requests{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <Textarea
          placeholder="Any specific instructions or concerns for the service team..."
          value={additionalRequests}
          onChange={(e) => setAdditionalRequests(e.target.value)}
          maxLength={500}
          rows={3}
          className="resize-none text-sm"
        />
        <p className="text-xs text-gray-400 text-right">
          {additionalRequests.length}/500
        </p>
      </div>

      {/* Submit */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Review Submission</AlertDialogTitle>
            <AlertDialogDescription>
              {removedIds.size > 0
                ? `You're removing ${removedIds.size} item${removedIds.size > 1 ? "s" : ""} from the bill. The service team will proceed with the remaining items.`
                : "You're approving all items as listed. The service team will proceed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleSubmit}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}