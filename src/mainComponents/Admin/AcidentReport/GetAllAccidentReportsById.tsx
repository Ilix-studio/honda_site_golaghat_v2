// mainComponents/Admin/AccidentReports/GetAllAccidentReportsById.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Shield,
  ShieldOff,
  Phone,
  Building2,
  FileText,
  Loader2,
  Save,
  FileDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import {
  AccidentReport,
  ReportStatus,
  useGetAccidentReportByIdQuery,
  useUpdateReportStatusMutation,
} from "@/redux-store/services/accidentReportApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<ReportStatus, { label: string; className: string }> =
  {
    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
    reviewed: {
      label: "Reviewed",
      className: "bg-blue-100 text-blue-700 border-blue-200",
    },
    closed: {
      label: "Closed",
      className: "bg-green-100 text-green-700 border-green-200",
    },
  };

const STATUS_RGB: Record<ReportStatus, readonly [number, number, number]> = {
  pending: [180, 120, 0],
  reviewed: [29, 78, 216],
  closed: [21, 128, 61],
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const fmtShort = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ─── PDF Generator ────────────────────────────────────────────────────────────

const generateReportPdf = async (report: AccidentReport) => {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const m = 18; // margin
  const cW = pageW - m * 2; // content width

  // To plain typed arrays:
  const RED: [number, number, number] = [220, 38, 38];
  const DARK: [number, number, number] = [17, 24, 39];
  const MID: [number, number, number] = [107, 114, 128];
  const BG: [number, number, number] = [249, 250, 251];
  const BORDER: [number, number, number] = [229, 231, 235];

  let y = 0;

  // ── Header band ────────────────────────────────────────────────────────────
  doc.setFillColor(...RED);
  doc.rect(0, 0, pageW, 28, "F");

  doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(255, 255, 255);
  doc.text("TSANGPOOL HONDA", m, 11);

  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(255, 200, 200);
  doc.text("Dealership Management System", m, 16.5);

  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(255, 255, 255);
  doc.text("ACCIDENT REPORT", pageW - m, 11, { align: "right" });

  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(255, 200, 200);
  doc.text(
    `Generated: ${fmtShort(new Date().toISOString())}`,
    pageW - m,
    16.5,
    { align: "right" }
  );

  y = 36;

  // ── Report ID + status pill ────────────────────────────────────────────────
  doc.setFillColor(...BG);
  doc.roundedRect(m, y, cW, 14, 2, 2, "F");
  doc.setDrawColor(...BORDER);
  doc.roundedRect(m, y, cW, 14, 2, 2, "S");

  doc
    .setFont("helvetica", "bold")
    .setFontSize(10)
    .setTextColor(...RED);
  doc.text(report.reportId, m + 5, y + 9);

  const statusLabel =
    report.status.charAt(0).toUpperCase() + report.status.slice(1);
  doc.setTextColor(...STATUS_RGB[report.status]);
  doc.text(`Status: ${statusLabel}`, pageW - m - 5, y + 9, { align: "right" });
  y += 22;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const sectionTitle = (title: string) => {
    doc
      .setFont("helvetica", "bold")
      .setFontSize(8)
      .setTextColor(...MID);
    doc.text(title.toUpperCase(), m, y);
    doc.setDrawColor(...RED).setLineWidth(0.4);
    doc.line(m, y + 1.5, m + 40, y + 1.5);
    y += 7;
  };

  const field = (label: string, value: string, halfW = false, xOff = 0) => {
    const x = m + xOff;
    const w = halfW ? cW / 2 - 4 : cW;
    doc.setFillColor(...BG);
    doc.roundedRect(x, y, w, 14, 1.5, 1.5, "F");
    doc.setDrawColor(...BORDER);
    doc.roundedRect(x, y, w, 14, 1.5, 1.5, "S");
    doc
      .setFont("helvetica", "normal")
      .setFontSize(7)
      .setTextColor(...MID);
    doc.text(label, x + 4, y + 5);
    doc
      .setFont("helvetica", "bold")
      .setFontSize(9)
      .setTextColor(...DARK);
    const lines = doc.splitTextToSize(value || "—", w - 8);
    doc.text(lines[0], x + 4, y + 10.5);
  };

  // ── Incident Details ───────────────────────────────────────────────────────
  sectionTitle("Incident Details");

  doc
    .setFont("helvetica", "bold")
    .setFontSize(11)
    .setTextColor(...DARK);
  doc.text(report.title, m, y);
  y += 8;

  field("Date of Accident", fmt(report.date), true, 0);
  field("Time", report.time, true, cW / 2 + 4);
  y += 17;

  // Location (variable height)
  const locLines = doc.splitTextToSize(report.location, cW - 8);
  const locH = Math.max(14, locLines.length * 5 + 8);
  doc.setFillColor(...BG);
  doc.roundedRect(m, y, cW, locH, 1.5, 1.5, "F");
  doc.setDrawColor(...BORDER);
  doc.roundedRect(m, y, cW, locH, 1.5, 1.5, "S");
  doc
    .setFont("helvetica", "normal")
    .setFontSize(7)
    .setTextColor(...MID);
  doc.text("Location", m + 4, y + 5);
  doc
    .setFont("helvetica", "bold")
    .setFontSize(9)
    .setTextColor(...DARK);
  doc.text(locLines, m + 4, y + 10.5);
  y += locH + 3;

  // Insurance
  const insRGB: [number, number, number] = report.isInsuranceAvailable
    ? [21, 128, 61]
    : [107, 114, 128];

  doc.setFillColor(...BG);
  doc.roundedRect(m, y, cW, 14, 1.5, 1.5, "F");
  doc.setDrawColor(...BORDER);
  doc.roundedRect(m, y, cW, 14, 1.5, 1.5, "S");
  doc
    .setFont("helvetica", "normal")
    .setFontSize(7)
    .setTextColor(...MID);
  doc.text("Insurance Availability", m + 4, y + 5);
  doc
    .setFont("helvetica", "bold")
    .setFontSize(9)
    .setTextColor(...insRGB);
  doc.text(
    report.isInsuranceAvailable ? "Available" : "Not Available",
    m + 4,
    y + 10.5
  );
  y += 20;

  // ── Customer & Branch ──────────────────────────────────────────────────────
  sectionTitle("Customer & Branch");

  const phone =
    report.customer && typeof report.customer === "object"
      ? (report.customer as { phoneNumber: string }).phoneNumber
      : "—";
  const bName =
    report.branch && typeof report.branch === "object"
      ? (report.branch as { branchName: string; address: string }).branchName
      : "—";
  const bAddr =
    report.branch && typeof report.branch === "object"
      ? (report.branch as { branchName: string; address: string }).address
      : "";

  field("Customer Phone", phone, true, 0);
  field("Branch", bName, true, cW / 2 + 4);
  y += 17;

  if (bAddr) {
    field("Branch Address", bAddr);
    y += 17;
  }

  // ── Admin Notes ────────────────────────────────────────────────────────────
  if (report.adminNotes) {
    y += 3;
    sectionTitle("Admin Notes");
    const noteLines = doc.splitTextToSize(report.adminNotes, cW - 8);
    const noteH = Math.max(16, noteLines.length * 5 + 10);
    doc.setFillColor(239, 246, 255); // blue-50
    doc.roundedRect(m, y, cW, noteH, 1.5, 1.5, "F");
    doc.setDrawColor(147, 197, 253); // blue-300
    doc.roundedRect(m, y, cW, noteH, 1.5, 1.5, "S");
    doc
      .setFont("helvetica", "normal")
      .setFontSize(9)
      .setTextColor(...DARK);
    doc.text(noteLines, m + 4, y + 8);
    y += noteH + 6;
  }

  // ── Review seal (centre page bottom) ──────────────────────────────────────
  const sealX = pageW / 2;
  const sealY = pageH - 52;

  doc.setDrawColor(...RED).setLineWidth(1.2);
  doc.circle(sealX, sealY, 18, "S");
  doc.setLineWidth(0.4);
  doc.circle(sealX, sealY, 15, "S");

  doc
    .setFont("helvetica", "bold")
    .setFontSize(6.5)
    .setTextColor(...RED);
  doc.text("TSANGPOOL", sealX, sealY - 4, { align: "center" });
  doc.setFontSize(5.5);
  doc.text("HONDA", sealX, sealY + 0.5, { align: "center" });

  // status inside seal
  doc.setFontSize(5).setTextColor(...STATUS_RGB[report.status]);
  doc.text(statusLabel.toUpperCase(), sealX, sealY + 5.5, { align: "center" });

  doc
    .setFont("helvetica", "normal")
    .setFontSize(4.5)
    .setTextColor(...MID);
  doc.text("· ACCIDENT REPORT REVIEW ·", sealX, sealY + 11.5, {
    align: "center",
  });

  // ── Footer band ────────────────────────────────────────────────────────────
  doc.setFillColor(...RED);
  doc.rect(0, pageH - 14, pageW, 14, "F");
  doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(255, 200, 200);
  doc.text("Tsangpool Honda Dealership · Golaghat, Assam", m, pageH - 5.5);
  doc.text(`Report ID: ${report.reportId}`, pageW - m, pageH - 5.5, {
    align: "right",
  });

  doc.save(`accident_report_${report.reportId}.pdf`);
};

// ─── Info Row ─────────────────────────────────────────────────────────────────

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div className='flex items-start gap-3 py-3 border-b border-gray-50 last:border-0'>
    <div className='w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5'>
      {icon}
    </div>
    <div className='min-w-0'>
      <p className='text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5'>
        {label}
      </p>
      <div className='text-sm text-gray-800 font-medium'>{value}</div>
    </div>
  </div>
);

const DetailSkeleton = () => (
  <div className='space-y-4'>
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className='h-16 bg-gray-100 rounded-xl animate-pulse' />
    ))}
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const GetAllAccidentReportsById = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useGetAccidentReportByIdQuery(id ?? "", {
    skip: !id,
  });
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateReportStatusMutation();

  const report = data?.data;

  const [editStatus, setEditStatus] = useState<ReportStatus | "">("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Seed local state on first data arrival
  if (report && editStatus === "" && !isDirty) {
    setEditStatus(report.status);
    setAdminNotes(report.adminNotes ?? "");
  }

  const handleSave = async () => {
    if (!id || !editStatus) return;
    try {
      await updateStatus({
        id,
        status: editStatus as ReportStatus,
        adminNotes,
      }).unwrap();
      toast.success("Report updated");
      setIsDirty(false);
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDownloadPdf = async () => {
    if (!report) return;
    setIsGeneratingPdf(true);
    try {
      await generateReportPdf(report);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Failed to generate PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const customerPhone =
    report?.customer && typeof report.customer === "object"
      ? (report.customer as { phoneNumber: string }).phoneNumber
      : "—";
  const branchName =
    report?.branch && typeof report.branch === "object"
      ? (report.branch as { branchName: string; address: string }).branchName
      : "—";
  const branchAddress =
    report?.branch && typeof report.branch === "object"
      ? (report.branch as { branchName: string; address: string }).address
      : "";

  return (
    <div className='p-6 max-w-3xl mx-auto space-y-5'>
      {/* Top bar */}
      <div className='flex items-center justify-between'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => navigate(-1)}
          className='pl-0 text-gray-500 hover:text-gray-800'
        >
          <ArrowLeft className='h-4 w-4 mr-1' />
          Back
        </Button>

        {report && (
          <Button
            variant='outline'
            size='sm'
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className='border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className='h-4 w-4 mr-1.5 animate-spin' />
                Generating...
              </>
            ) : (
              <>
                <FileDown className='h-4 w-4 mr-1.5' />
                Download PDF
              </>
            )}
          </Button>
        )}
      </div>

      {error && (
        <div className='flex flex-col items-center py-20 text-gray-400'>
          <AlertTriangle className='h-8 w-8 mb-2 text-red-400' />
          <p className='text-sm'>Report not found</p>
        </div>
      )}

      {isLoading && <DetailSkeleton />}

      {report && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className='space-y-5'
        >
          {/* Title card */}
          <Card className='border-gray-100'>
            <CardContent className='p-5'>
              <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-3'>
                <div className='flex items-start gap-3'>
                  <div className='w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0'>
                    <AlertTriangle className='h-5 w-5 text-red-600' />
                  </div>
                  <div>
                    <p className='font-mono text-xs text-red-500 font-semibold mb-0.5'>
                      {report.reportId}
                    </p>
                    <h1 className='text-lg font-bold text-gray-900'>
                      {report.title}
                    </h1>
                    <p className='text-xs text-gray-400 mt-0.5'>
                      Submitted on {fmt(report.createdAt)}
                    </p>
                  </div>
                </div>
                <Badge
                  variant='outline'
                  className={`text-xs self-start ${
                    STATUS_BADGE[report.status].className
                  }`}
                >
                  {STATUS_BADGE[report.status].label}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Details grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
            <Card className='border-gray-100'>
              <CardHeader className='pb-1 px-5 pt-4'>
                <CardTitle className='text-sm font-semibold text-gray-600 uppercase tracking-wide'>
                  Incident Details
                </CardTitle>
              </CardHeader>
              <CardContent className='px-5 pb-4'>
                <InfoRow
                  icon={<Calendar className='h-4 w-4 text-gray-400' />}
                  label='Date'
                  value={fmt(report.date)}
                />
                <InfoRow
                  icon={<Clock className='h-4 w-4 text-gray-400' />}
                  label='Time'
                  value={report.time}
                />
                <InfoRow
                  icon={<MapPin className='h-4 w-4 text-gray-400' />}
                  label='Location'
                  value={report.location}
                />
                <InfoRow
                  icon={
                    report.isInsuranceAvailable ? (
                      <Shield className='h-4 w-4 text-green-500' />
                    ) : (
                      <ShieldOff className='h-4 w-4 text-gray-400' />
                    )
                  }
                  label='Insurance'
                  value={
                    <span
                      className={
                        report.isInsuranceAvailable
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      {report.isInsuranceAvailable
                        ? "Available"
                        : "Not available"}
                    </span>
                  }
                />
              </CardContent>
            </Card>

            <Card className='border-gray-100'>
              <CardHeader className='pb-1 px-5 pt-4'>
                <CardTitle className='text-sm font-semibold text-gray-600 uppercase tracking-wide'>
                  Customer & Branch
                </CardTitle>
              </CardHeader>
              <CardContent className='px-5 pb-4'>
                <InfoRow
                  icon={<Phone className='h-4 w-4 text-gray-400' />}
                  label='Customer Phone'
                  value={customerPhone}
                />
                <InfoRow
                  icon={<Building2 className='h-4 w-4 text-gray-400' />}
                  label='Branch'
                  value={
                    <span>
                      {branchName}
                      {branchAddress && (
                        <span className='block text-xs text-gray-400 font-normal mt-0.5'>
                          {branchAddress}
                        </span>
                      )}
                    </span>
                  }
                />
              </CardContent>
            </Card>
          </div>

          {/* Admin Actions */}
          <Card className='border-gray-100'>
            <CardHeader className='pb-1 px-5 pt-4'>
              <CardTitle className='text-sm font-semibold text-gray-600 uppercase tracking-wide'>
                Admin Actions
              </CardTitle>
            </CardHeader>
            <CardContent className='px-5 pb-5 space-y-4'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold text-gray-600'>
                  Update Status
                </Label>
                <Select
                  value={editStatus}
                  onValueChange={(v) => {
                    setEditStatus(v as ReportStatus);
                    setIsDirty(true);
                  }}
                >
                  <SelectTrigger className='text-sm'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='pending'>Pending</SelectItem>
                    <SelectItem value='reviewed'>Reviewed</SelectItem>
                    <SelectItem value='closed'>Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold text-gray-600'>
                  <span className='flex items-center gap-1.5'>
                    <FileText className='h-3.5 w-3.5' />
                    Admin Notes
                  </span>
                </Label>
                <Textarea
                  rows={3}
                  value={adminNotes}
                  placeholder='Add internal notes about this report...'
                  maxLength={1000}
                  onChange={(e) => {
                    setAdminNotes(e.target.value);
                    setIsDirty(true);
                  }}
                  className='text-sm resize-none'
                />
                <p className='text-right text-xs text-gray-400'>
                  {adminNotes.length}/1000
                </p>
              </div>

              <Button
                onClick={handleSave}
                disabled={isUpdating || !isDirty}
                className='w-full bg-red-600 hover:bg-red-700 text-white'
              >
                {isUpdating ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className='h-4 w-4 mr-2' />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default GetAllAccidentReportsById;
