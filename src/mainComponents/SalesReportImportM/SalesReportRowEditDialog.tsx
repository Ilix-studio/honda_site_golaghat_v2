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
    modelName: "",
    customerFirstName: "",
    customerLastName: "",
    customerMobile: "",
    location: "",
    engineNo: "",
    totalPayment: "",
  });
  const [updateRow, { isLoading }] = useUpdateSalesReportRowMutation();

  useEffect(() => {
    if (!row) return;
    setForm({
      saleDate: toDateInput(row.saleDate),
      modelName: row.modelName ?? "",
      customerFirstName: row.customerFirstName ?? "",
      customerLastName: row.customerLastName ?? "",
      customerMobile: row.customerMobile ?? "",
      location: row.location ?? "",
      engineNo: row.engineNo ?? "",
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
      <DialogContent className='max-w-lg'>
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
            <Label htmlFor='sr-model'>Model Name</Label>
            <Input id='sr-model' value={form.modelName} onChange={set("modelName")} />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='sr-first'>Customer First Name</Label>
            <Input id='sr-first' value={form.customerFirstName} onChange={set("customerFirstName")} />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='sr-last'>Customer Last Name</Label>
            <Input id='sr-last' value={form.customerLastName} onChange={set("customerLastName")} />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='sr-mobile'>Contact Mobile</Label>
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
