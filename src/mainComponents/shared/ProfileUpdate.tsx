import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import {
  useGetMeQuery,
  useUpdateMeMutation,
  type UpdateMyProfileRequest,
} from "@/redux-store/services/adminApi";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const EMPTY: UpdateMyProfileRequest = {
  bloodGroup: "",
  lifeInsurance: "",
  scanfleetStickerId: "",
  address: "",
  phoneNumber: "",
};

/**
 * Shared profile-update form. Prefills from the current `/api/users/me`
 * profile and submits the editable fields via `useUpdateMeMutation`.
 * Embeddable in a dialog or used as a standalone page section.
 */
export default function ProfileUpdate({
  onSaved,
  onCancel,
}: {
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const { data } = useGetMeQuery();
  const [updateMe, { isLoading }] = useUpdateMeMutation();
  const me = data?.data;

  const [form, setForm] = useState<UpdateMyProfileRequest>(EMPTY);

  // Prefill once the profile is available.
  useEffect(() => {
    if (me) {
      setForm({
        bloodGroup: me.bloodGroup ?? "",
        lifeInsurance: me.lifeInsurance ?? "",
        scanfleetStickerId: me.scanfleetStickerId ?? "",
        address: me.address ?? "",
        phoneNumber: me.phoneNumber ?? "",
      });
    }
  }, [me]);

  const set = (key: keyof UpdateMyProfileRequest, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.phoneNumber && !/^[6-9]\d{9}$/.test(form.phoneNumber)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      await updateMe(form).unwrap();
      toast.success("Profile updated");
      onSaved?.();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="bloodGroup">Blood Group</Label>
        <Select
          value={form.bloodGroup || undefined}
          onValueChange={(v) => set("bloodGroup", v)}
        >
          <SelectTrigger id="bloodGroup">
            <SelectValue placeholder="Select blood group" />
          </SelectTrigger>
          <SelectContent>
            {BLOOD_GROUPS.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phoneNumber">Phone Number (used for OTP login)</Label>
        <Input
          id="phoneNumber"
          inputMode="numeric"
          maxLength={10}
          placeholder="10-digit mobile number"
          value={form.phoneNumber}
          onChange={(e) =>
            set("phoneNumber", e.target.value.replace(/\D/g, "").slice(0, 10))
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lifeInsurance">Life Insurance</Label>
        <Input
          id="lifeInsurance"
          placeholder="e.g. LIC policy no. / provider"
          value={form.lifeInsurance}
          onChange={(e) => set("lifeInsurance", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="scanfleetStickerId">Scanfleet Safety Sticker</Label>
        <Input
          id="scanfleetStickerId"
          placeholder="Sticker / token ID"
          value={form.scanfleetStickerId}
          onChange={(e) => set("scanfleetStickerId", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Address</Label>
        <textarea
          id="address"
          rows={3}
          maxLength={300}
          placeholder="Your address"
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="gap-2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
