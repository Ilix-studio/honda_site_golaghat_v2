import React, { useState } from "react";
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
import { Trash2, Search, Building, UserPlus, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

// Redux imports
import { useAppDispatch } from "../../../hooks/redux";
import { addNotification } from "../../../redux-store/slices/uiSlice";
import {
  useGetAllBranchManagersQuery,
  useCreateBranchManagerMutation,
  useDeleteBranchManagerMutation,
} from "../../../redux-store/services/branchManagerApi";
import { useGetBranchesQuery } from "../../../redux-store/services/branchApi";

// Types
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

const BranchManager: React.FC = () => {
  const dispatch = useAppDispatch();

  // States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<BranchManager | null>(
    null
  );
  // const [showPassword, setShowPassword] = useState(false);

  // RTK Query hooks
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

  // Derived state
  const branchManagers = branchManagersResponse?.data || [];
  const branches = branchesData?.data || [];

  // Filtered branch managers based on search term
  const filteredBranchManagers = branchManagers.filter(
    (manager) =>
      manager.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.branch?.branchName
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Handle create branch manager
  const handleCreateBranchManager = async () => {
    if (!selectedBranch) {
      dispatch(
        addNotification({
          type: "error",
          message: "Please select a branch",
        })
      );
      return;
    }

    try {
      const response = await createBranchManager({
        branch: selectedBranch,
      }).unwrap();

      dispatch(
        addNotification({
          type: "success",
          message: "Branch manager created successfully",
        })
      );

      // Show the credentials in a toast
      toast.success(
        "Branch Manager Created! ID: " +
          response.data.applicationId +
          ", Password: " +
          response.data.password +
          " (save these credentials - they won't be shown again)",
        {
          duration: 60000, // 1 minute
        }
      );

      // Reset the form and close dialog
      setSelectedBranch("");
      setIsDialogOpen(false);
      refetchBranchManagers();
    } catch (error: any) {
      console.error("Error creating branch manager:", error);
      dispatch(
        addNotification({
          type: "error",
          message: error.data?.message || "Failed to create branch manager",
        })
      );
    }
  };

  // Handle delete branch manager
  const handleDeleteBranchManager = async (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this branch manager?")
    ) {
      try {
        await deleteBranchManager(id).unwrap();
        dispatch(
          addNotification({
            type: "success",
            message: "Branch manager deleted successfully",
          })
        );
        toast.success("Branch manager deleted successfully");
        refetchBranchManagers();
      } catch (error: any) {
        console.error("Error deleting branch manager:", error);
        dispatch(
          addNotification({
            type: "error",
            message: error.data?.message || "Failed to delete branch manager",
          })
        );
        toast.error(error.data?.message || "Failed to delete branch manager");
      }
    }
  };

  // Handle opening credentials modal
  const handleViewCredentials = (manager: BranchManager) => {
    setSelectedManager(manager);
    setIsCredentialsModalOpen(true);
  };

  // Toggle password visibility
  // const togglePasswordVisibility = () => {
  //   setShowPassword(!showPassword);
  // };

  return (
    <>
      <div className='container py-6'>
        <Card className='shadow-md'>
          <CardHeader className='bg-muted/50'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
              <div>
                <CardTitle className='text-2xl flex items-center gap-2'>
                  <Building className='h-6 w-6' />
                  Branch Manager Administration
                </CardTitle>
                <CardDescription>
                  Create and manage branch manager credentials
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className='gap-1'>
                    <UserPlus className='h-4 w-4' />
                    New Branch Manager
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Branch Manager</DialogTitle>
                    <DialogDescription>
                      Create login credentials for a new branch manager. The
                      system will generate an Application ID and Password.
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
                      {isCreating ? "Creating..." : "Create Branch Manager"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent className='p-6'>
            <div className='space-y-6'>
              <div className='flex items-center gap-2'>
                <div className='relative flex-1'>
                  <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    type='search'
                    placeholder='Search branch managers...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-8'
                  />
                </div>
              </div>

              {branchManagersLoading ? (
                <div className='text-center py-8 text-muted-foreground'>
                  Loading branch managers...
                </div>
              ) : filteredBranchManagers.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  {searchTerm
                    ? "No branch managers found matching your search"
                    : "No branch managers available. Create a branch manager to get started."}
                </div>
              ) : (
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Application ID</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBranchManagers.map((manager) => (
                        <TableRow key={manager._id}>
                          <TableCell className='font-medium'>
                            {manager.applicationId}
                          </TableCell>
                          <TableCell>
                            {manager.branch?.address || "Unknown"}
                          </TableCell>
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
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => handleViewCredentials(manager)}
                            >
                              <ExternalLink className='h-4 w-4' />
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

        {/* Credentials Modal */}
        <Dialog
          open={isCredentialsModalOpen}
          onOpenChange={setIsCredentialsModalOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Branch Manager Credentials</DialogTitle>
              <DialogDescription>
                Login credentials for the selected branch manager.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 py-2'>
              <div className='space-y-2'>
                <Label>Application ID</Label>
                <div className='flex items-center gap-2'>
                  <Input
                    value={selectedManager?.applicationId || ""}
                    readOnly
                    className='font-mono'
                  />
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => {
                      navigator.clipboard.writeText(
                        selectedManager?.applicationId || ""
                      );
                      toast.success("Application ID copied to clipboard");
                    }}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <rect x='9' y='9' width='13' height='13' rx='2' ry='2' />
                      <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' />
                    </svg>
                  </Button>
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Password</Label>
                <div className='p-3 bg-gray-100 rounded-md text-center'>
                  <p className='text-sm text-amber-600'>
                    For security reasons, passwords are only shown once when a
                    branch manager is created. If the password is lost, you'll
                    need to delete and recreate the branch manager.
                  </p>
                  <Button
                    variant='outline'
                    className='mt-2'
                    onClick={() => {
                      // Close this dialog
                      setIsCredentialsModalOpen(false);

                      // Confirm before deleting
                      if (
                        window.confirm(
                          `Are you sure you want to delete and recreate this branch manager? This will invalidate any current login sessions.`
                        )
                      ) {
                        // Delete first
                        selectedManager &&
                          handleDeleteBranchManager(selectedManager._id);

                        // Then open create dialog with the same branch pre-selected
                        if (selectedManager?.branch?._id) {
                          setSelectedBranch(selectedManager.branch._id);
                          setTimeout(() => {
                            setIsDialogOpen(true);
                          }, 300);
                        }
                      }
                    }}
                  >
                    Delete & Recreate Manager
                  </Button>
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Branch</Label>
                <Input
                  value={selectedManager?.branch?.branchName || ""}
                  readOnly
                />
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setIsCredentialsModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default BranchManager;
