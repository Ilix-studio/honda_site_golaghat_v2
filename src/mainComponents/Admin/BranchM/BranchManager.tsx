import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Trash2, Search, Building, UserPlus, Copy } from "lucide-react";
import toast from "react-hot-toast";

import { useAppDispatch } from "../../../hooks/redux";
import { addNotification } from "../../../redux-store/slices/uiSlice";
import {
  useGetAllBranchManagersQuery,
  useCreateBranchManagerMutation,
  useDeleteBranchManagerMutation,
} from "../../../redux-store/services/branchManagerApi";
import { useGetBranchesQuery } from "../../../redux-store/services/branchApi";

interface BranchManager {
  _id: string;
  applicationId: string;
  branch: {
    _id: string;
    branchName: string;
    address: string;
  };
  createdAt: string;
}

interface NewCredentials {
  applicationId: string;
  password: string;
  branchName: string;
  expiresAt: number;
}

const CREDENTIAL_TTL_MS = 5 * 60 * 1000; // 5 minutes

const CopyField: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className='space-y-1'>
    <p className='text-xs text-amber-700 font-medium'>{label}</p>
    <div className='flex items-center gap-2'>
      <input
        readOnly
        value={value}
        className='flex-1 font-mono text-sm bg-white border border-amber-200 rounded-lg px-3 py-1.5 outline-none'
      />
      <button
        onClick={() => {
          navigator.clipboard.writeText(value);
          toast.success(`${label} copied`);
        }}
        className='p-1.5 rounded-lg border border-amber-200 bg-white hover:bg-amber-50 text-amber-700 transition-colors'
      >
        <Copy className='w-3.5 h-3.5' />
      </button>
    </div>
  </div>
);

const BranchManager: React.FC = () => {
  const dispatch = useAppDispatch();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [newCredentials, setNewCredentials] = useState<NewCredentials | null>(
    null,
  );
  const [timeLeft, setTimeLeft] = useState(0);

  const {
    data: branchManagersResponse,
    isLoading: branchManagersLoading,
    refetch: refetchBranchManagers,
  } = useGetAllBranchManagersQuery();

  const { data: branchesData, isLoading: branchesLoading } =
    useGetBranchesQuery();

  const [createBranchManager, { isLoading: isCreating }] =
    useCreateBranchManagerMutation();
  const [deleteBranchManager, { isLoading: isDeleting }] =
    useDeleteBranchManagerMutation();

  const branchManagers = branchManagersResponse?.data || [];
  const branches = branchesData?.data || [];

  const filteredBranchManagers = branchManagers.filter(
    (manager) =>
      manager.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.branch?.branchName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  // Countdown timer — clears credentials when TTL expires
  useEffect(() => {
    if (!newCredentials) return;

    setTimeLeft(Math.ceil(CREDENTIAL_TTL_MS / 1000));

    const interval = setInterval(() => {
      const remaining = Math.ceil(
        (newCredentials.expiresAt - Date.now()) / 1000,
      );
      if (remaining <= 0) {
        setNewCredentials(null);
        clearInterval(interval);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [newCredentials]);

  const handleCreateBranchManager = async () => {
    if (!selectedBranch) {
      dispatch(
        addNotification({ type: "error", message: "Please select a branch" }),
      );
      return;
    }

    try {
      const response = await createBranchManager({
        branch: selectedBranch,
      }).unwrap();

      const branchName =
        branches.find((b) => b._id === selectedBranch)?.branchName ?? "";

      setNewCredentials({
        applicationId: response.data.applicationId,
        password: response.data.password,
        branchName,
        expiresAt: Date.now() + CREDENTIAL_TTL_MS,
      });

      dispatch(
        addNotification({
          type: "success",
          message: "Branch admin created successfully",
        }),
      );

      setSelectedBranch("");
      setIsDialogOpen(false);
      refetchBranchManagers();
    } catch (error: any) {
      dispatch(
        addNotification({
          type: "error",
          message: error.data?.message || "Failed to create branch admin",
        }),
      );
    }
  };

  const handleDeleteBranchManager = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this branch admin?"))
      return;

    try {
      await deleteBranchManager(id).unwrap();
      dispatch(
        addNotification({
          type: "success",
          message: "Branch admin deleted successfully",
        }),
      );
      toast.success("Branch admin deleted successfully");
      refetchBranchManagers();
    } catch (error: any) {
      dispatch(
        addNotification({
          type: "error",
          message: error.data?.message || "Failed to delete branch admin",
        }),
      );
      toast.error(error.data?.message || "Failed to delete branch admin");
    }
  };

  return (
    <div className='container py-6'>
      <Card className='shadow-md'>
        <CardHeader className='bg-muted/50'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div>
              <CardTitle className='text-2xl flex items-center gap-2'>
                <Building className='h-6 w-6' />
                Branch Admin Administration
              </CardTitle>
              <CardDescription>
                Create and manage branch admin credentials
              </CardDescription>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className='gap-1'>
                  <UserPlus className='h-4 w-4' />
                  New Branch Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Branch Admin</DialogTitle>
                  <DialogDescription>
                    Create login credentials for a new branch admin. The system
                    will generate an Application ID and Password.
                  </DialogDescription>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='branch'>Select Branch</Label>
                    <Select
                      value={selectedBranch}
                      onValueChange={setSelectedBranch}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select a branch' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {branchesLoading ? (
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
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant='outline'
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateBranchManager}
                    disabled={!selectedBranch || isCreating}
                  >
                    {isCreating ? "Creating..." : "Create Branch Admin"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className='p-6'>
          <div className='space-y-6'>
            {/* New credentials banner — visible for 5 minutes after creation */}
            {newCredentials && (
              <div className='rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm font-semibold text-amber-800'>
                    ⚠ Save these credentials now — disappears in {timeLeft}s
                  </p>
                  <button
                    onClick={() => setNewCredentials(null)}
                    className='text-amber-600 hover:text-amber-800 text-xs font-medium'
                  >
                    Dismiss
                  </button>
                </div>
                <CopyField
                  label='Application ID'
                  value={newCredentials.applicationId}
                />
                <CopyField label='Password' value={newCredentials.password} />
                <CopyField label='Branch' value={newCredentials.branchName} />
              </div>
            )}

            {/* Search */}
            <div className='flex items-center gap-2'>
              <div className='relative flex-1'>
                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  type='search'
                  placeholder='Search branch admins...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-8'
                />
              </div>
            </div>

            {/* Table */}
            {branchManagersLoading ? (
              <div className='text-center py-8 text-muted-foreground'>
                Loading branch admins...
              </div>
            ) : filteredBranchManagers.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                {searchTerm
                  ? "No branch admins found matching your search"
                  : "No branch admins available. Create a branch admin to get started."}
              </div>
            ) : (
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBranchManagers.map((manager) => (
                      <TableRow key={manager._id}>
                        <TableCell className='font-medium font-mono'>
                          {manager.applicationId}
                        </TableCell>
                        <TableCell>
                          {manager.branch?.branchName || "—"}
                        </TableCell>
                        <TableCell>{manager.branch?.address || "—"}</TableCell>
                        <TableCell>
                          {new Date(manager.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className='text-right'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() =>
                              handleDeleteBranchManager(manager._id)
                            }
                            disabled={isDeleting}
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
    </div>
  );
};

export default BranchManager;
