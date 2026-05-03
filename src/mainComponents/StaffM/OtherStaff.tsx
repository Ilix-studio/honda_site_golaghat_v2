import { useState } from "react";
import toast from "react-hot-toast";
import {
  Users,
  UserPlus,
  Search,
  Trash2,
  Copy,
  Mail,
  Phone,
  MapPin,
  Briefcase,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { addNotification } from "../../redux-store/slices/uiSlice";
import { selectUserBranch } from "../../redux-store/slices/authSlice";
import {
  useCreateStaffMutation,
  useGetAllStaffQuery,
  useDeleteStaffMutation,
  type UserListItem,
} from "../../redux-store/services/adminApi";

// ─── Form State ──────────────────────────────────────────────────────────────

interface CreateStaffForm {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  position: string;
}

const INITIAL_FORM: CreateStaffForm = {
  name: "",
  email: "",
  phoneNumber: "",
  address: "",
  position: "",
};

// ─── Credentials shown after creation ────────────────────────────────────────

interface CreatedCredentials {
  applicationId: string;
  password: string;
  name: string;
  email: string;
  position: string;
  branch: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

const OtherStaff: React.FC = () => {
  const dispatch = useAppDispatch();
  const userBranch = useAppSelector(selectUserBranch);

  // UI state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [credentials, setCredentials] = useState<CreatedCredentials | null>(
    null,
  );
  const [formData, setFormData] = useState<CreateStaffForm>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof CreateStaffForm, string>>
  >({});

  // RTK Query — branch is auto-scoped on the backend for Branch-Admin
  const { data: staffResponse, isLoading: isLoadingList } =
    useGetAllStaffQuery();

  const [createStaff, { isLoading: isCreating }] = useCreateStaffMutation();
  const [deleteStaff, { isLoading: isDeleting }] = useDeleteStaffMutation();

  // Derived
  const staffList = staffResponse?.data ?? [];

  const filteredStaff = staffList.filter((staff) => {
    const term = searchTerm.toLowerCase();
    return (
      staff.name.toLowerCase().includes(term) ||
      staff.applicationId.toLowerCase().includes(term) ||
      staff.email.toLowerCase().includes(term) ||
      staff.position?.toLowerCase().includes(term) ||
      staff.branch?.branchName?.toLowerCase().includes(term)
    );
  });

  // ─── Form helpers ──────────────────────────────────────────────────────

  const updateField = (field: keyof CreateStaffForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CreateStaffForm, string>> = {};

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
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.position.trim()) errors.position = "Position is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setFormErrors({});
  };

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      const response = await createStaff({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        position: formData.position.trim(),
      }).unwrap();

      setCredentials({
        applicationId: response.data.applicationId,
        password: response.data.password,
        name: response.data.name,
        email: response.data.email,
        position: response.data.position ?? formData.position.trim(),
        branch: response.data.branch,
      });

      dispatch(
        addNotification({
          type: "success",
          message: "Staff member created. Credentials sent via email.",
        }),
      );

      resetForm();
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      const msg = error.data?.message || "Failed to create staff member";
      dispatch(addNotification({ type: "error", message: msg }));
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(`Delete staff member "${name}"? This cannot be undone.`)
    )
      return;

    try {
      await deleteStaff(id).unwrap();
      dispatch(
        addNotification({ type: "success", message: "Staff member deleted" }),
      );
      toast.success("Staff member deleted");
    } catch (error: any) {
      const msg = error.data?.message || "Failed to delete staff member";
      dispatch(addNotification({ type: "error", message: msg }));
      toast.error(msg);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className='container py-6 space-y-6'>
      {/* ── Main Card ─────────────────────────────────────────────────── */}
      <Card className='shadow-md'>
        <CardHeader className='bg-muted/50'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div>
              <CardTitle className='text-2xl flex items-center gap-2'>
                <Users className='h-6 w-6' />
                Staff Management
              </CardTitle>
              <CardDescription>
                Create and manage staff members for{" "}
                {userBranch?.branchName ?? "your branch"}
              </CardDescription>
            </div>

            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className='gap-1'>
                  <UserPlus className='h-4 w-4' />
                  Add Staff
                </Button>
              </DialogTrigger>

              <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                  <DialogTitle>Add Staff Member</DialogTitle>
                  <DialogDescription>
                    Staff will be assigned to{" "}
                    <span className='font-medium'>
                      {userBranch?.branchName ?? "your branch"}
                    </span>
                    . An Application ID and password will be generated and sent
                    to their email.
                  </DialogDescription>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                  {/* Name */}
                  <div className='space-y-1.5'>
                    <Label htmlFor='st-name'>Full Name</Label>
                    <Input
                      id='st-name'
                      placeholder='e.g. Ilix'
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                    />
                    {formErrors.name && (
                      <p className='text-sm text-destructive'>
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className='space-y-1.5'>
                    <Label htmlFor='st-email'>Email</Label>
                    <Input
                      id='st-email'
                      type='email'
                      placeholder='e.g. ilix@example.com'
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                    />
                    {formErrors.email && (
                      <p className='text-sm text-destructive'>
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className='space-y-1.5'>
                    <Label htmlFor='st-phone'>Phone Number</Label>
                    <Input
                      id='st-phone'
                      type='tel'
                      placeholder='e.g. 9876543210'
                      maxLength={10}
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        updateField(
                          "phoneNumber",
                          e.target.value.replace(/\D/g, ""),
                        )
                      }
                    />
                    {formErrors.phoneNumber && (
                      <p className='text-sm text-destructive'>
                        {formErrors.phoneNumber}
                      </p>
                    )}
                  </div>

                  {/* Position */}
                  <div className='space-y-1.5'>
                    <Label htmlFor='st-position'>Position</Label>
                    <Input
                      id='st-position'
                      placeholder='e.g. Sales Executive, Service Technician'
                      value={formData.position}
                      onChange={(e) => updateField("position", e.target.value)}
                    />
                    {formErrors.position && (
                      <p className='text-sm text-destructive'>
                        {formErrors.position}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className='space-y-1.5'>
                    <Label htmlFor='st-address'>Address</Label>
                    <Input
                      id='st-address'
                      placeholder='e.g. Ward No. 5, Golaghat'
                      value={formData.address}
                      onChange={(e) => updateField("address", e.target.value)}
                    />
                    {formErrors.address && (
                      <p className='text-sm text-destructive'>
                        {formErrors.address}
                      </p>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant='outline'
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={isCreating}>
                    {isCreating ? "Creating..." : "Add Staff"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className='p-6'>
          <div className='space-y-6'>
            {/* Search */}
            <div className='relative'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                type='search'
                placeholder='Search by name, application ID, email, or position...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-8'
              />
            </div>

            {/* Table */}
            {isLoadingList ? (
              <div className='text-center py-8 text-muted-foreground'>
                Loading staff members...
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                {searchTerm
                  ? "No staff members match your search"
                  : "No staff members yet. Add one to get started."}
              </div>
            ) : (
              <div className='rounded-md border overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Application ID</TableHead>
                      <TableHead className='hidden md:table-cell'>
                        Email
                      </TableHead>
                      <TableHead className='hidden lg:table-cell'>
                        Phone
                      </TableHead>
                      <TableHead className='hidden sm:table-cell'>
                        Branch
                      </TableHead>
                      <TableHead className='hidden sm:table-cell'>
                        Status
                      </TableHead>
                      <TableHead className='hidden md:table-cell'>
                        Created
                      </TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((staff: UserListItem) => (
                      <TableRow key={staff._id}>
                        <TableCell className='font-medium'>
                          {staff.name}
                        </TableCell>
                        <TableCell>
                          <span className='flex items-center gap-1 text-sm'>
                            <Briefcase className='h-3.5 w-3.5 text-muted-foreground' />
                            {staff.position ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell className='font-mono text-sm'>
                          {staff.applicationId}
                        </TableCell>
                        <TableCell className='hidden md:table-cell'>
                          <span className='flex items-center gap-1 text-sm'>
                            <Mail className='h-3.5 w-3.5 text-muted-foreground' />
                            {staff.email}
                          </span>
                        </TableCell>
                        <TableCell className='hidden lg:table-cell'>
                          <span className='flex items-center gap-1 text-sm'>
                            <Phone className='h-3.5 w-3.5 text-muted-foreground' />
                            {staff.phoneNumber}
                          </span>
                        </TableCell>
                        <TableCell className='hidden sm:table-cell'>
                          <span className='flex items-center gap-1 text-sm'>
                            <MapPin className='h-3.5 w-3.5 text-muted-foreground' />
                            {staff.branch?.branchName ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell className='hidden sm:table-cell'>
                          <Badge
                            variant={staff.isActive ? "default" : "secondary"}
                          >
                            {staff.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className='hidden md:table-cell text-sm text-muted-foreground'>
                          {new Date(staff.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className='text-right'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleDelete(staff._id, staff.name)}
                            disabled={isDeleting}
                            title='Delete'
                          >
                            <Trash2 className='h-4 w-4 text-destructive' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Credentials Modal ─────────────────────────────────────────── */}
      <Dialog
        open={credentials !== null}
        onOpenChange={(open) => {
          if (!open) setCredentials(null);
        }}
      >
        <DialogContent className='sm:max-w-[480px]'>
          <DialogHeader>
            <DialogTitle>Staff Member Created</DialogTitle>
            <DialogDescription>
              Credentials have been sent to{" "}
              <span className='font-medium'>{credentials?.email}</span>. Save
              these now — the password will not be shown again.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-2'>
            {/* Name + Position */}
            <div className='flex gap-6'>
              <div className='space-y-1.5 flex-1'>
                <Label className='text-muted-foreground text-xs'>Name</Label>
                <p className='font-medium'>{credentials?.name}</p>
              </div>
              <div className='space-y-1.5 flex-1'>
                <Label className='text-muted-foreground text-xs'>
                  Position
                </Label>
                <p className='font-medium'>{credentials?.position}</p>
              </div>
            </div>

            {/* Branch */}
            <div className='space-y-1.5'>
              <Label className='text-muted-foreground text-xs'>Branch</Label>
              <p className='font-medium'>{credentials?.branch}</p>
            </div>

            {/* Application ID */}
            <div className='space-y-1.5'>
              <Label className='text-muted-foreground text-xs'>
                Application ID
              </Label>
              <div className='flex items-center gap-2'>
                <Input
                  value={credentials?.applicationId ?? ""}
                  readOnly
                  className='font-mono'
                />
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() =>
                    copyToClipboard(
                      credentials?.applicationId ?? "",
                      "Application ID",
                    )
                  }
                >
                  <Copy className='h-4 w-4' />
                </Button>
              </div>
            </div>

            {/* Password */}
            <div className='space-y-1.5'>
              <Label className='text-muted-foreground text-xs'>Password</Label>
              <div className='flex items-center gap-2'>
                <Input
                  value={credentials?.password ?? ""}
                  readOnly
                  className='font-mono'
                />
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() =>
                    copyToClipboard(credentials?.password ?? "", "Password")
                  }
                >
                  <Copy className='h-4 w-4' />
                </Button>
              </div>
              <p className='text-xs text-amber-600'>
                This password is shown only once. It has also been emailed.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setCredentials(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OtherStaff;
