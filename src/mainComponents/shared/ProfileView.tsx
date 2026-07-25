import { useState } from "react";
import toast from "react-hot-toast";
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
  Shield,
  Grid3x3,
  MapPin,
  CalendarDays,
  KeyRound,
  Pencil,
  Info,
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

const Field = ({ icon: Icon, label, value }: FieldProps) => {
  const isEmpty = value === undefined || value === "" || value === null;
  return (
    <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
      <div
        style={{
          width: "40px",
          height: "40px",
          flexShrink: 0,
          borderRadius: "11px",
          background: "oklch(0.96 0.006 258)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "oklch(0.42 0.015 258)",
        }}
      >
        <Icon size={18} strokeWidth={2} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "oklch(0.6 0.01 258)",
            marginBottom: "3px",
          }}
        >
          {label}
        </div>
        {isEmpty ? (
          <div
            style={{
              fontSize: "14.5px",
              fontWeight: 500,
              color: "oklch(0.6 0.008 258)",
              fontStyle: "italic",
            }}
          >
            Not set
          </div>
        ) : (
          <div
            style={{
              fontSize: "15px",
              fontWeight: 500,
              color: "oklch(0.2 0.01 258)",
              overflowWrap: "anywhere",
            }}
          >
            {value}
          </div>
        )}
      </div>
    </div>
  );
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontSize: "12px",
      fontWeight: 600,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "oklch(0.55 0.01 258)",
      marginBottom: "16px",
    }}
  >
    {children}
  </div>
);

const fieldGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "20px 28px",
};

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
    <div className='min-h-screen'>
      <div className='max-w-4xl mx-auto py-8 px-4'>
        <div
          style={{
            minHeight: "100%",
            padding: "56px 24px",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "800px",
              background: "#fff",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow:
                "0 1px 2px rgba(20,20,30,0.04), 0 12px 32px -12px rgba(20,20,30,0.18)",
              border: "1px solid oklch(0.92 0.005 260)",
            }}
          >
            {/* Header */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.22 0.018 258), oklch(0.16 0.02 258))",
                padding: "28px 36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    flexShrink: 0,
                    borderRadius: "14px",
                    background:
                      "linear-gradient(160deg, oklch(0.4 0.03 258), oklch(0.3 0.03 258))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "18px",
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                    border: "1px solid oklch(0.5 0.02 258 / 0.4)",
                  }}
                >
                  {initials(user?.name)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <h1
                      style={{
                        margin: 0,
                        fontSize: "21px",
                        fontWeight: 600,
                        color: "#fff",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {user?.name || "—"}
                    </h1>
                    {user?.role && (
                      <span
                        style={{
                          background: "oklch(0.58 0.19 25)",
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: 600,
                          letterSpacing: "0.03em",
                          textTransform: "uppercase",
                          padding: "3px 9px",
                          borderRadius: "999px",
                        }}
                      >
                        {user.role}
                      </span>
                    )}
                  </div>
                  {(user?.branch?.branchName || user?.position) && (
                    <div
                      style={{
                        marginTop: "5px",
                        fontSize: "13.5px",
                        color: "oklch(0.75 0.015 258)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <MapPin
                        size={13}
                        strokeWidth={2}
                        style={{ flexShrink: 0, opacity: 0.8 }}
                      />
                      <span>
                        {[user?.branch?.branchName, user?.position]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                <button
                  onClick={() => setEditOpen(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    background: "#fff",
                    color: "oklch(0.22 0.02 258)",
                    border: "none",
                    padding: "9px 16px",
                    borderRadius: "10px",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <Pencil size={14} strokeWidth={2} />
                  Edit Profile
                </button>
                <button
                  onClick={() =>
                    toast("Password reset is coming soon.", { icon: "🔒" })
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    background: "oklch(0.3 0.02 258 / 0.5)",
                    color: "#fff",
                    border: "1px solid oklch(0.5 0.02 258 / 0.5)",
                    padding: "9px 16px",
                    borderRadius: "10px",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <KeyRound size={14} strokeWidth={2} />
                  Reset Password
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "36px 36px 28px" }}>
              <SectionLabel>Contact Information</SectionLabel>
              <div style={{ ...fieldGridStyle, marginBottom: "32px" }}>
                <Field icon={UserIcon} label='Name' value={user?.name} />
                <Field icon={Mail} label='Email' value={user?.email} />
                <Field
                  icon={Phone}
                  label='Phone Number'
                  value={user?.phoneNumber}
                />
                <Field icon={MapPin} label='Address' value={me?.address} />
              </div>

              <div
                style={{
                  height: "1px",
                  background: "oklch(0.93 0.004 258)",
                  margin: "0 0 28px",
                }}
              />

              <SectionLabel>Benefits &amp; Safety</SectionLabel>
              <div style={{ ...fieldGridStyle, marginBottom: "28px" }}>
                <Field
                  icon={Droplet}
                  label='Blood Group'
                  value={me?.bloodGroup}
                />
                <Field
                  icon={Shield}
                  label='Life Insurance'
                  value={me?.lifeInsurance}
                />
                <Field
                  icon={Grid3x3}
                  label='Scanfleet Safety Sticker'
                  value={me?.scanfleetStickerId}
                />
                <Field
                  icon={CalendarDays}
                  label='Total Leave Available'
                  value={
                    totalLeaveRemaining === undefined ? (
                      "—"
                    ) : (
                      <>
                        {totalLeaveRemaining} days{" "}
                        <span
                          style={{
                            color: "oklch(0.55 0.008 258)",
                            fontWeight: 400,
                          }}
                        >
                          (Sick {balance?.Sick.remaining} · Casual{" "}
                          {balance?.Casual.remaining})
                        </span>
                      </>
                    )
                  }
                />
              </div>

              <div
                style={{
                  borderTop: "1px solid oklch(0.93 0.004 258)",
                  paddingTop: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                }}
              >
                <Info
                  size={13}
                  strokeWidth={2}
                  style={{ flexShrink: 0, color: "oklch(0.65 0.01 258)" }}
                />
                <span
                  style={{
                    fontSize: "12.5px",
                    color: "oklch(0.55 0.008 258)",
                  }}
                >
                  Fields shown as “Not set” haven’t been added to your profile
                  yet.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit profile dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className='sm:max-w-[480px]'>
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
    </div>
  );
}
