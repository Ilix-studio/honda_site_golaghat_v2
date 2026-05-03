import { useState } from "react";
import toast from "react-hot-toast";
import {
  Wrench,
  UserPlus,
  Search,
  Trash2,
  Copy,
  Mail,
  Phone,
  MapPin,
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { useAppDispatch } from "../../hooks/redux";
import { addNotification } from "../../redux-store/slices/uiSlice";
import {
  useGetAllServiceAdminsQuery,
  useCreateServiceAdminMutation,
  useDeleteServiceAdminMutation,
  type UserListItem,
} from "../../redux-store/services/adminApi";
import { useGetBranchesQuery } from "../../redux-store/services/branchApi";

// ─── Form State ──────────────────────────────────────────────────────────────

interface CreateServiceAdminForm {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  branch: string;
}

const INITIAL_FORM: CreateServiceAdminForm = {
  name: "",
  email: "",
  phoneNumber: "",
  address: "",
  branch: "",
};

// ─── Credentials shown after creation ────────────────────────────────────────

interface CreatedCredentials {
  applicationId: string;
  password: string;
  name: string;
  email: string;
  branch: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

const ServiceAdmins: React.FC = () => {
  const dispatch = useAppDispatch();

  // UI state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [credentials, setCredentials] = useState<CreatedCredentials | null>(
    null,
  );
  const [formData, setFormData] =
    useState<CreateServiceAdminForm>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof CreateServiceAdminForm, string>>
  >({});

  // RTK Query
  const { data: serviceAdminsResponse, isLoading: isLoadingList } =
    useGetAllServiceAdminsQuery();

  const { data: branchesData, isLoading: isLoadingBranches } =
    useGetBranchesQuery();

  const [createServiceAdmin, { isLoading: isCreating }] =
    useCreateServiceAdminMutation();

  const [deleteServiceAdmin, { isLoading: isDeleting }] =
    useDeleteServiceAdminMutation();

  // Derived
  const serviceAdmins = serviceAdminsResponse?.data ?? [];
  const branches = branchesData?.data ?? [];

  const filteredAdmins = serviceAdmins.filter((admin) => {
    const term = searchTerm.toLowerCase();
    return (
      admin.name.toLowerCase().includes(term) ||
      admin.applicationId.toLowerCase().includes(term) ||
      admin.email.toLowerCase().includes(term) ||
      admin.branch?.branchName?.toLowerCase().includes(term)
    );
  });

  // ─── Form helpers ──────────────────────────────────────────────────────

  const updateField = (field: keyof CreateServiceAdminForm, value: string) => {
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
    const errors: Partial<Record<keyof CreateServiceAdminForm, string>> = {};

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
    if (!formData.branch) errors.branch = "Branch is required";

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
      const response = await createServiceAdmin({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        branch: formData.branch,
      }).unwrap();

      setCredentials({
        applicationId: response.data.applicationId,
        password: response.data.password,
        name: response.data.name,
        email: response.data.email,
        branch: response.data.branch,
      });

      dispatch(
        addNotification({
          type: "success",
          message: "Service Admin created. Credentials sent via email.",
        }),
      );

      resetForm();
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      const msg = error.data?.message || "Failed to create Service Admin";
      dispatch(addNotification({ type: "error", message: msg }));
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(`Delete Service Admin "${name}"? This cannot be undone.`)
    )
      return;

    try {
      await deleteServiceAdmin(id).unwrap();
      dispatch(
        addNotification({
          type: "success",
          message: "Service Admin deleted",
        }),
      );
      toast.success("Service Admin deleted");
    } catch (error: any) {
      const msg = error.data?.message || "Failed to delete Service Admin";
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
                <Wrench className='h-6 w-6' />
                Service Admin Management
              </CardTitle>
              <CardDescription>
                Create and manage Service Admin accounts across branches
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
                  New Service Admin
                </Button>
              </DialogTrigger>

              <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                  <DialogTitle>Create Service Admin</DialogTitle>
                  <DialogDescription>
                    Fill in the details. An Application ID and password will be
                    generated and sent to the provided email.
                  </DialogDescription>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                  {/* Name */}
                  <div className='space-y-1.5'>
                    <Label htmlFor='sa-name'>Full Name</Label>
                    <Input
                      id='sa-name'
                      placeholder='e.g. Ilix '
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
                    <Label htmlFor='sa-email'>Email</Label>
                    <Input
                      id='sa-email'
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
                    <Label htmlFor='sa-phone'>Phone Number</Label>
                    <Input
                      id='sa-phone'
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

                  {/* Address */}
                  <div className='space-y-1.5'>
                    <Label htmlFor='sa-address'>Address</Label>
                    <Input
                      id='sa-address'
                      placeholder='e.g. Main Road, Jorhat'
                      value={formData.address}
                      onChange={(e) => updateField("address", e.target.value)}
                    />
                    {formErrors.address && (
                      <p className='text-sm text-destructive'>
                        {formErrors.address}
                      </p>
                    )}
                  </div>

                  {/* Branch Select */}
                  <div className='space-y-1.5'>
                    <Label>Assign Branch</Label>
                    <Select
                      value={formData.branch}
                      onValueChange={(val) => updateField("branch", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select a branch' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {isLoadingBranches ? (
                            <SelectItem value='loading' disabled>
                              Loading branches...
                            </SelectItem>
                          ) : branches.length === 0 ? (
                            <SelectItem value='none' disabled>
                              No branches available
                            </SelectItem>
                          ) : (
                            branches.map((branch) => (
                              <SelectItem key={branch._id} value={branch._id}>
                                {branch.branchName}
                              </SelectItem>
                            ))
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {formErrors.branch && (
                      <p className='text-sm text-destructive'>
                        {formErrors.branch}
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
                    {isCreating ? "Creating..." : "Create Service Admin"}
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
                placeholder='Search by name, application ID, email, or branch...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-8'
              />
            </div>

            {/* Table */}
            {isLoadingList ? (
              <div className='text-center py-8 text-muted-foreground'>
                Loading service admins...
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                {searchTerm
                  ? "No service admins match your search"
                  : "No service admins yet. Create one to get started."}
              </div>
            ) : (
              <div className='rounded-md border overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Application ID</TableHead>
                      <TableHead className='hidden md:table-cell'>
                        Email
                      </TableHead>
                      <TableHead className='hidden lg:table-cell'>
                        Phone
                      </TableHead>
                      <TableHead>Branch</TableHead>
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
                    {filteredAdmins.map((admin: UserListItem) => (
                      <TableRow key={admin._id}>
                        <TableCell className='font-medium'>
                          {admin.name}
                        </TableCell>
                        <TableCell className='font-mono text-sm'>
                          {admin.applicationId}
                        </TableCell>
                        <TableCell className='hidden md:table-cell'>
                          <span className='flex items-center gap-1 text-sm'>
                            <Mail className='h-3.5 w-3.5 text-muted-foreground' />
                            {admin.email}
                          </span>
                        </TableCell>
                        <TableCell className='hidden lg:table-cell'>
                          <span className='flex items-center gap-1 text-sm'>
                            <Phone className='h-3.5 w-3.5 text-muted-foreground' />
                            {admin.phoneNumber}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className='flex items-center gap-1 text-sm'>
                            <MapPin className='h-3.5 w-3.5 text-muted-foreground' />
                            {admin.branch?.branchName ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell className='hidden sm:table-cell'>
                          <Badge
                            variant={admin.isActive ? "default" : "secondary"}
                          >
                            {admin.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className='hidden md:table-cell text-sm text-muted-foreground'>
                          {new Date(admin.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className='text-right'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleDelete(admin._id, admin.name)}
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

      {/* ── Credentials Modal (shown after successful creation) ──────── */}
      <Dialog
        open={credentials !== null}
        onOpenChange={(open) => {
          if (!open) setCredentials(null);
        }}
      >
        <DialogContent className='sm:max-w-[480px]'>
          <DialogHeader>
            <DialogTitle>Service Admin Created</DialogTitle>
            <DialogDescription>
              Credentials have been sent to{" "}
              <span className='font-medium'>{credentials?.email}</span>. Save
              these now — the password will not be shown again.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-2'>
            {/* Name */}
            <div className='space-y-1.5'>
              <Label className='text-muted-foreground text-xs'>Name</Label>
              <p className='font-medium'>{credentials?.name}</p>
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

export default ServiceAdmins;
