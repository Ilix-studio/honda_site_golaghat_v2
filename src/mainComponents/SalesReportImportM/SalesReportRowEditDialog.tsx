import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useUpdateSalesReportRowMutation,
  type SalesReportRow,
} from "@/redux-store/services/salesReportApi";

interface Props {
  row: SalesReportRow | null;
  onClose: () => void;
}

/** ISO timestamp → yyyy-mm-dd for <input type="date"> (UTC, matching how dates are stored). */
const toDateInput = (iso?: string) => (iso ? iso.slice(0, 10) : "");

const SalesReportRowEditDialog = ({ row, onClose }: Props) => {
  const [form, setForm] = useState({
    saleDate: "",
    customerName: "",
    customerMobile: "",
    location: "",
    engineNo: "",
    modelName: "",
    colour: "",
    ew: "",
    amc: "",
    rsa: "",
    joyClub: "",
    finance: "",
    executive: "",
    status: "",
    totalPayment: "",
  });
  const [updateRow, { isLoading }] = useUpdateSalesReportRowMutation();

  useEffect(() => {
    if (!row) return;
    setForm({
      saleDate: toDateInput(row.saleDate),
      customerName: [row.customerFirstName, row.customerLastName]
        .filter(Boolean)
        .join(" "),
      customerMobile: row.customerMobile ?? "",
      location: row.location ?? "",
      engineNo: row.engineNo ?? "",
      modelName: row.modelName ?? "",
      colour: row.colour ?? "",
      ew: row.ew ?? "",
      amc: row.amc ?? "",
      rsa: row.rsa ?? "",
      joyClub: row.joyClub ?? "",
      finance: row.finance ?? "",
      executive: row.executive ?? "",
      status: row.status ?? "",
      totalPayment: String(row.totalPayment ?? ""),
    });
  }, [row]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    if (!row) return;
    if (!form.saleDate) {
      toast.error("Date is required");
      return;
    }
    try {
      await updateRow({
        id: row._id,
        body: {
          ...form,
          totalPayment: form.totalPayment === "" ? undefined : Number(form.totalPayment),
        },
      }).unwrap();
      toast.success("Record updated");
      onClose();
    } catch (err) {
      const msg = (err as { data?: { message?: string } })?.data?.message;
      toast.error(msg || "Failed to update record");
    }
  };

  return (
    <Dialog open={!!row} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-lg max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Edit record</DialogTitle>
          <DialogDescription>
            Frame No <span className='font-mono'>{row?.frameNo}</span> can't be
            changed. Edits update this report row only — linked stock and
            customer records are not changed.
          </DialogDescription>
        </DialogHeader>

        <div className='grid grid-cols-2 gap-3'>
          <div className='col-span-2 space-y-1.5'>
            <Label htmlFor='sr-date'>
              Date <span className='text-red-600'>*</span>
            </Label>
            <Input id='sr-date' type='date' required value={form.saleDate} onChange={set("saleDate")} />
          </div>
          <div className='col-span-2 space-y-1.5'>
            <Label htmlFor='sr-name'>Customer Name</Label>
            <Input id='sr-name' value={form.customerName} onChange={set("customerName")} />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='sr-mobile'>Phone No.</Label>
            <Input id='sr-mobile' inputMode='numeric' value={form.customerMobile} onChange={set("customerMobile")} />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='sr-location'>Location</Label>
            <Input id='sr-location' value={form.location} onChange={set("location")} />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='sr-engine'>Engine No</Label>
            <Input id='sr-engine' className='font-mono' value={form.engineNo} onChange={set("engineNo")} />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='sr-model'>Model Name</Label>
            <Input id='sr-model' value={form.modelName} onChange={set("modelName")} />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='sr-colour'>Colour</Label>
            <Input id='sr-colour' value={form.colour} onChange={set("colour")} />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='sr-status'>Status</Label>
            <Input id='sr-status' value={form.status} onChange={set("status")} />
          </div>
          <div className='col-span-2 grid grid-cols-4 gap-3'>
            {(
              [
                ["ew", "EW"],
                ["amc", "AMC"],
                ["rsa", "RSA"],
                ["joyClub", "Joy Club"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className='space-y-1.5'>
                <Label htmlFor={`sr-${key}`}>{label}</Label>
                <Input id={`sr-${key}`} inputMode='numeric' placeholder='1 / 0' value={form[key]} onChange={set(key)} />
              </div>
            ))}
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='sr-finance'>Finance</Label>
            <Input id='sr-finance' value={form.finance} onChange={set("finance")} />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='sr-executive'>Executive</Label>
            <Input id='sr-executive' value={form.executive} onChange={set("executive")} />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='sr-pay'>Total Payment</Label>
            <Input id='sr-pay' type='number' min={0} value={form.totalPayment} onChange={set("totalPayment")} />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SalesReportRowEditDialog;
