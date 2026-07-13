import { useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User as UserIcon,
  Mail,
  Phone,
  Droplet,
  ShieldCheck,
  QrCode,
  MapPin,
  CalendarDays,
  KeyRound,
  Pencil,
} from "lucide-react";
import ProfileUpdate from "./ProfileUpdate";

import { useAppSelector } from "@/hooks/redux";
import { selectUser } from "@/redux-store/slices/authSlice";
import { useGetLeaveBalanceQuery } from "@/redux-store/services/NewFeatures/leaveApi";
import { useGetMeQuery } from "@/redux-store/services/adminApi";

interface FieldProps {
  icon: React.ElementType;
  label: string;
  value?: React.ReactNode;
}

const Field = ({ icon: Icon, label, value }: FieldProps) => (
  <div className="flex items-start gap-4 py-5">
    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gray-100 shrink-0">
      <Icon className="w-5 h-5 text-gray-600" />
    </div>
    <div className="min-w-0 space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      {value === undefined || value === "" || value === null ? (
        <p className="text-sm text-gray-400 italic">Not set</p>
      ) : (
        <p className="text-sm font-medium text-gray-900 break-words">{value}</p>
      )}
    </div>
  </div>
);

const initials = (name?: string) =>
  (name || "")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

export default function ProfileView() {
  const [editOpen, setEditOpen] = useState(false);

  // Identity + extras from the merged profile endpoint; Redux user is a
  // fallback for name/role while /me is loading.
  const reduxUser = useAppSelector(selectUser);
  const { data: meData } = useGetMeQuery();
  const user = meData?.data ?? reduxUser;

  // Leave balance (staff / branch / service / part admins). Super-Admins have
  // no balance — the query simply returns nothing and we fall back to "—".
  const { data: leaveData } = useGetLeaveBalanceQuery();
  const balance = leaveData?.data?.balance;
  const totalLeaveRemaining = balance
    ? balance.Sick.remaining + balance.Casual.remaining
    : undefined;

  const me = meData?.data;

  return (
    <div className="h-[80vh] overflow-y-auto bg-gray-50">
      <div className="container max-w-3xl px-4 py-8">
        <Card className="border border-gray-200 shadow-sm overflow-hidden">
          {/* Hero */}
          <CardHeader className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/15 text-xl font-black">
                  {initials(user?.name)}
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">
                    {user?.name || "—"}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge className="bg-red-600 hover:bg-red-600 text-white border-0">
                      {user?.role || "—"}
                    </Badge>
                    {user?.branch?.branchName && (
                      <span className="text-xs text-gray-300">
                        {user.branch.branchName}
                      </span>
                    )}
                    {user?.position && (
                      <span className="text-xs text-gray-300">
                        · {user.position}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="w-4 h-4" />
                  Edit Profile
                </Button>
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() =>
                    toast("Password reset is coming soon.", { icon: "🔒" })
                  }
                >
                  <KeyRound className="w-4 h-4" />
                  Reset Password
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2 divide-y sm:divide-y-0 divide-gray-100">
              <Field icon={UserIcon} label="Name" value={user?.name} />
              <Field icon={Mail} label="Email" value={user?.email} />
              <Field
                icon={Phone}
                label="Phone Number"
                value={user?.phoneNumber}
              />
              <Field
                icon={Droplet}
                label="Blood Group"
                value={me?.bloodGroup}
              />
              <Field
                icon={ShieldCheck}
                label="Life Insurance"
                value={me?.lifeInsurance}
              />
              <Field
                icon={QrCode}
                label="Scanfleet Safety Sticker"
                value={me?.scanfleetStickerId}
              />
              <Field icon={MapPin} label="Address" value={me?.address} />
              <Field
                icon={CalendarDays}
                label="Total Leave Available"
                value={
                  totalLeaveRemaining === undefined ? (
                    "—"
                  ) : (
                    <>
                      {totalLeaveRemaining} days
                      <span className="text-gray-400 font-normal">
                        {" "}
                        (Sick {balance?.Sick.remaining} · Casual{" "}
                        {balance?.Casual.remaining})
                      </span>
                    </>
                  )
                }
              />
            </div>

            <Separator className="my-4" />
            <p className="text-xs text-gray-400">
              Fields shown as “Not set” haven’t been added to your profile yet.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Edit profile dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <ProfileUpdate
            onSaved={() => setEditOpen(false)}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
