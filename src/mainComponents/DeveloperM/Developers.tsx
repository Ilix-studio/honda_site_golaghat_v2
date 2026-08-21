import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Check,
  Copy,
  LifeBuoy,
  Loader2,
  Plus,
  Search,
  Trash2,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useCreateDeveloperMutation,
  useDeleteDeveloperMutation,
  useGetAllDevelopersQuery,
} from "@/redux-store/services/adminApi";
import { getApiErrorMessage } from "@/lib/apiError";

interface CreateDeveloperForm {
  name: string;
  email: string;
  phoneNumber: string;
}

const INITIAL_FORM: CreateDeveloperForm = {
  name: "",
  email: "",
  phoneNumber: "",
};

/** Credentials are shown once, after creation — the password is never stored. */
interface CreatedCredentials {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
}

/**
 * Super-Admin management of Developer accounts.
 *
 * Deliberately simpler than the Part-Admin/Service-Admin screens: a Developer
 * is project-wide, so there is no branch selector and no address field — the
 * create endpoint accepts name, email and phone only.
 */
export default function Developers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState<CreateDeveloperForm>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof CreateDeveloperForm, string>>
  >({});
  const [credentials, setCredentials] = useState<CreatedCredentials | null>(
    null,
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data, isLoading } = useGetAllDevelopersQuery();
  const [createDeveloper, { isLoading: isCreating }] =
    useCreateDeveloperMutation();
  const [deleteDeveloper, { isLoading: isDeleting }] =
    useDeleteDeveloperMutation();

  const developers = data?.data ?? [];

  const filtered = developers.filter((dev) => {
    const term = searchTerm.toLowerCase();
    return (
      dev.name.toLowerCase().includes(term) ||
      dev.email.toLowerCase().includes(term) ||
      dev.phoneNumber.toLowerCase().includes(term)
    );
  });

  const updateField = (field: keyof CreateDeveloperForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Mirrors the server-side validators on the Developer model, so obvious
  // mistakes are caught before the request rather than as a 400.
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CreateDeveloperForm, string>> = {};

    if (!formData.name.trim()) errors.name = "Name is required";

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (
      !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)
    ) {
      errors.email = "Invalid email format";
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Enter a valid 10-digit phone number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      const response = await createDeveloper({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim(),
      }).unwrap();

      // Surfaced immediately: the welcome email is best-effort and is skipped
      // entirely when SMTP is unconfigured, so this may be the only copy.
      setCredentials({
        name: response.data.name,
        email: response.data.email,
        phoneNumber: response.data.phoneNumber,
        password: response.data.password,
      });

      setFormData(INITIAL_FORM);
      setFormErrors({});
      setIsCreateOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to create Developer"));
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteDeveloper(pendingDelete.id).unwrap();
      toast.success(`${pendingDelete.name} removed`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete Developer"));
    } finally {
      setPendingDelete(null);
    }
  };

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6'>
        <div className='flex items-center justify-between gap-3 flex-wrap'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-violet-600 text-white'>
              <LifeBuoy className='h-5 w-5' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>Developers</h1>
              <p className='text-sm text-gray-500'>
                Project-wide maintenance accounts — not tied to a branch
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2 flex-wrap'>
            <Button variant='outline' asChild>
              <Link to='/admin/raise-maintenance-request'>
                <Wrench className='h-4 w-4 mr-2' />
                Raise Maintenance Request
              </Link>
            </Button>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className='bg-violet-600 hover:bg-violet-700'
            >
              <Plus className='h-4 w-4 mr-2' />
              Add Developer
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className='space-y-3'>
            <CardTitle className='text-base'>
              {isLoading
                ? "Developers"
                : `${developers.length} developer account(s)`}
            </CardTitle>
            <div className='relative max-w-md'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder='Search by name, email or phone...'
                aria-label='Search developers'
                className='pl-9'
              />
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className='flex items-center justify-center py-16'>
                <Loader2 className='h-5 w-5 animate-spin text-gray-400' />
              </div>
            ) : filtered.length === 0 ? (
              <p className='text-sm text-gray-400 py-8 text-center'>
                {searchTerm
                  ? `No developers match "${searchTerm}".`
                  : "No developer accounts yet. Add one to let them work the maintenance queue."}
              </p>
            ) : (
              <div className='space-y-3'>
                {filtered.map((dev) => (
                  <div
                    key={dev._id}
                    className='flex items-start justify-between gap-3 rounded-xl border border-gray-200 p-4 flex-wrap'
                  >
                    <div className='min-w-0'>
                      <div className='flex items-center gap-2 flex-wrap'>
                        <p className='font-semibold text-gray-900'>
                          {dev.name}
                        </p>
                        <Badge
                          variant='outline'
                          className={
                            dev.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-50 text-gray-500 border-gray-200"
                          }
                        >
                          {dev.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className='text-sm text-gray-500 mt-0.5'>
                        {dev.email} · {dev.phoneNumber}
                      </p>
                      <p className='text-xs text-gray-400 mt-1'>
                        Added{" "}
                        {new Date(dev.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                        {dev.createdBy?.name && ` by ${dev.createdBy.name}`}
                      </p>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={isDeleting}
                      onClick={() =>
                        setPendingDelete({ id: dev._id, name: dev.name })
                      }
                      className='text-red-600 border-red-200 hover:bg-red-50 shrink-0'
                    >
                      <Trash2 className='h-4 w-4 mr-1.5' />
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Create ─────────────────────────────────────────────────────── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Developer</DialogTitle>
            <DialogDescription>
              A password is generated automatically and emailed to them. No
              branch is needed — Developers work across every branch.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='space-y-1.5'>
              <Label htmlFor='dev-name'>Name *</Label>
              <Input
                id='dev-name'
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder='Full name'
              />
              {formErrors.name && (
                <p className='text-xs text-red-600'>{formErrors.name}</p>
              )}
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='dev-email'>Email *</Label>
              <Input
                id='dev-email'
                type='email'
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder='dev@example.com'
              />
              <p className='text-xs text-gray-400'>
                This is what they sign in with.
              </p>
              {formErrors.email && (
                <p className='text-xs text-red-600'>{formErrors.email}</p>
              )}
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='dev-phone'>Phone number *</Label>
              <Input
                id='dev-phone'
                value={formData.phoneNumber}
                onChange={(e) => updateField("phoneNumber", e.target.value)}
                placeholder='10-digit number'
                maxLength={10}
              />
              {formErrors.phoneNumber && (
                <p className='text-xs text-red-600'>{formErrors.phoneNumber}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsCreateOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className='bg-violet-600 hover:bg-violet-700'
            >
              {isCreating ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Creating...
                </>
              ) : (
                "Create Developer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Generated credentials (shown once) ─────────────────────────── */}
      <Dialog
        open={credentials !== null}
        onOpenChange={(open) => {
          if (!open) setCredentials(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Developer created</DialogTitle>
            <DialogDescription>
              Credentials were emailed to{" "}
              <span className='font-medium'>{credentials?.email}</span>. Save
              the password now — it is not stored and cannot be shown again.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3'>
            <div>
              <p className='text-xs text-gray-500'>Name</p>
              <p className='font-medium'>{credentials?.name}</p>
            </div>

            {(
              [
                { label: "Email", value: credentials?.email ?? "" },
                { label: "Password", value: credentials?.password ?? "" },
              ] as const
            ).map(({ label, value }) => (
              <div key={label}>
                <p className='text-xs text-gray-500 mb-1'>{label}</p>
                <div className='flex items-center gap-2'>
                  <Input readOnly value={value} className='font-mono text-sm' />
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => copy(label, value)}
                    aria-label={`Copy ${label}`}
                  >
                    {copiedField === label ? (
                      <Check className='h-4 w-4 text-emerald-600' />
                    ) : (
                      <Copy className='h-4 w-4' />
                    )}
                  </Button>
                </div>
              </div>
            ))}

            <p className='text-xs text-gray-400'>
              They sign in at <span className='font-mono'>/developer/login</span>
              .
            </p>
          </div>

          <DialogFooter>
            <Button onClick={() => setCredentials(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ────────────────────────────────────────── */}
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {pendingDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This removes the account permanently and they will no longer be
              able to sign in. Maintenance requests they handled are kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-red-600 hover:bg-red-700'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
